// Wonders Companion: static app + a tiny shared-game API.
// Each game room is one Durable Object, so all phones at the table see the same state.
//
//   POST /api/room                 {meta}            -> {code, ...state}   create a room
//   GET  /api/room/CODE                              -> state              read
//   PUT  /api/room/CODE/meta       {meta}            -> state              shared game data (players, wonders, battles)
//   PUT  /api/room/CODE/p/INDEX    {player}          -> state              one player's own data (city, score)
//
// state = {meta, players:{[index]:player}, v, t}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O, 1/I
const CODE_RE = /^[A-Z2-9]{4}$/;
const MAX_BODY = 200_000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

function newCode() {
  const b = crypto.getRandomValues(new Uint8Array(4));
  return [...b].map(x => CODE_CHARS[x % CODE_CHARS.length]).join('');
}

async function readBody(req) {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new Error('too large');
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('bad body');
  return data;
}

export class Room {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(req) {
    const url = new URL(req.url);
    const op = url.searchParams.get('op');
    let st = (await this.ctx.storage.get('s')) || null;
    if (req.method === 'GET') return st ? json(st) : json({ error: 'not found' }, 404);
    let body;
    try { body = await readBody(req); } catch (e) { return json({ error: 'bad request' }, 400); }
    if (op === 'init') {
      if (st) return json({ error: 'exists' }, 409);
      st = { meta: body.meta || {}, players: {}, v: 0 };
    } else {
      if (!st) return json({ error: 'not found' }, 404);
      if (op === 'meta') st.meta = body.meta || {};
      else if (op === 'p') {
        const i = url.searchParams.get('i');
        if (!/^\d{1,2}$/.test(i)) return json({ error: 'bad player' }, 400);
        st.players[i] = body.player || {};
      } else return json({ error: 'bad op' }, 400);
    }
    st.v++; st.t = Date.now();
    await this.ctx.storage.put('s', st);
    return json(st);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);

    const parts = url.pathname.split('/').filter(Boolean);   // ['api','room',CODE,...]
    if (parts[1] !== 'room') return json({ error: 'not found' }, 404);
    const room = code => env.ROOM.get(env.ROOM.idFromName(code));
    const forward = (code, op, extra = '') =>
      room(code).fetch(new Request(`https://room/?op=${op}${extra}`, { method: req.method, body: req.method === 'GET' ? undefined : req.body }));

    if (parts.length === 2 && req.method === 'POST') {
      for (let tries = 0; tries < 5; tries++) {
        const code = newCode();
        const res = await room(code).fetch(new Request('https://room/?op=init', { method: 'POST', body: await req.clone().text() }));
        if (res.status === 409) continue;
        const st = await res.json();
        return json({ code, ...st }, res.status);
      }
      return json({ error: 'try again' }, 503);
    }
    const code = (parts[2] || '').toUpperCase();
    if (!CODE_RE.test(code)) return json({ error: 'bad code' }, 400);
    if (parts.length === 3 && req.method === 'GET') return forward(code, 'get');
    if (parts.length === 4 && parts[3] === 'meta' && req.method === 'PUT') return forward(code, 'meta');
    if (parts.length === 5 && parts[3] === 'p' && req.method === 'PUT') return forward(code, 'p', `&i=${parts[4]}`);
    return json({ error: 'not found' }, 404);
  },
};
