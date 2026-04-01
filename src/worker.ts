// ═══════════════════════════════════════════════════════════════
// cocapn-lite — Tabula Rasa Seed
// Minimal. Pure Node.js built-ins only. Zero runtime deps.
// Fork. Add your LLM key. Deploy. Grow.
// ═══════════════════════════════════════════════════════════════

interface Env {
  MEMORY: KVNamespace;
  DEEPSEEK_API_KEY: string;
}

interface Memory {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts: number;
  tags?: string[];
}

const SYSTEM_PROMPT = `You are a cocapn — a repo-native AI agent. You live in this repo. You remember every conversation. You grow smarter over time. Be helpful, direct, and genuine. Skip filler words. You have opinions. You're not a chatbot — you're a deckhand who knows the ship.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Landing ──
    if (url.pathname === '/' && request.method === 'GET')
      return new Response(LANDING, { headers: { 'Content-Type': 'text/html' } });

    // ── App ──
    if (url.pathname === '/app' && request.method === 'GET')
      return new Response(APP_HTML, { headers: { 'Content-Type': 'text/html' } });

    // ── Chat (SSE) ──
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const { message, sessionId = 'default' } = await request.json();

      // Save user message
      const userMem: Memory = { id: crypto.randomUUID(), role: 'user', content: message, ts: Date.now() };
      const memKey = `mem:${sessionId}`;
      const history: Memory[] = (await env.MEMORY.get(memKey, 'json')) || [];
      history.push(userMem);

      // Build context: system + recent history (last 20 messages)
      const context = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-20).map(m => ({ role: m.role, content: m.content }))
      ];

      const stream = new ReadableStream({
        async start(ctrl) {
          const enc = new TextEncoder();
          let full = '';
          try {
            const resp = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
              body: JSON.stringify({ model: 'deepseek-chat', messages: context, stream: true, temperature: 0.7 })
            });
            const reader = resp.body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              for (const line of new TextDecoder().decode(value).split('\n')) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                  try { const d = JSON.parse(line.slice(6)); if (d.choices?.[0]?.delta?.content) { full += d.choices[0].delta.content; ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d.choices[0].delta.content)}\n\n`)); } } catch {}
                }
              }
            }
            // Save assistant response
            history.push({ id: crypto.randomUUID(), role: 'assistant', content: full, ts: Date.now() });
            if (history.length > 500) history.splice(0, history.length - 500);
            await env.MEMORY.put(memKey, JSON.stringify(history));
          } catch (e: any) {
            ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
          }
          ctrl.enqueue(enc.encode('data: [DONE]\n\n'));
          ctrl.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
    }

    // ── Memory ──
    if (url.pathname === '/api/memory' && request.method === 'GET') {
      const sessionId = url.searchParams.get('session') || 'default';
      const history = (await env.MEMORY.get(`mem:${sessionId}`, 'json')) || [];
      return new Response(JSON.stringify(history), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // ── Sessions ──
    if (url.pathname === '/api/sessions' && request.method === 'GET') {
      const keys = await env.MEMORY.list({ prefix: 'mem:' });
      return new Response(JSON.stringify(keys.keys.map(k => k.name.replace('mem:', ''))), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response('Not found', { status: 404, headers: cors });
  }
};

const LANDING = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>cocapn-lite</title>
<style>body{margin:0;font-family:system-ui;background:#0a0a0a;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}
h1{font-size:2.5rem;margin-bottom:1rem;color:#a855f7}p{color:#888;max-width:500px;line-height:1.6;margin:0 auto 2rem}
a{display:inline-block;padding:0.75rem 2rem;background:#a855f7;color:white;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.1rem}
.badge{display:inline-block;padding:0.2rem 0.6rem;background:#1a1a1a;border:1px solid #333;border-radius:20px;font-size:0.75rem;color:#a855f7;margin:0.2rem}
</style></head><body><div><h1>⚓ cocapn-lite</h1><p>Tabula rasa. Zero dependencies. Pure Node.js. Fork, add your key, deploy. Your repo-native AI seed.</p><a href="/app">Start</a><div style="margin-top:1rem"><span class="badge">Zero deps</span><span class="badge">~200 lines</span><span class="badge">KV-backed</span><span class="badge">SSE streaming</span></div></div></body></html>`;

const APP_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>cocapn-lite</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui;background:#0a0a0a;color:#e5e5e5;display:flex;height:100vh}
.chat{flex:1;display:flex;flex-direction;column;max-width:800px;margin:0 auto;width:100%;padding:1rem}
.messages{flex:1;overflow-y:auto;padding:1rem 0}.msg{margin-bottom:1rem;padding:0.75rem 1rem;border-radius:12px;max-width:85%;line-height:1.6;white-space:pre-wrap;word-wrap:break-word}
.msg.user{background:#1e1e2e;margin-left:auto}.msg.ai{background:#141414;border:1px solid #222}
.input{display:flex;gap:0.5rem;padding:1rem 0}.input input{flex:1;padding:0.75rem;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#e5e5e5;font-size:0.95rem}
.input button{padding:0.75rem 1.5rem;background:#a855f7;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:700}
.header{padding:0.75rem 1rem;text-align:center;border-bottom:1px solid #1a1a1a;color:#a855f7;font-weight:700;font-size:0.85rem}
</style></head><body><div class="chat"><div class="header">⚓ cocapn-lite — tabula rasa</div><div class="messages" id="msgs"></div><div class="input"><input id="in" placeholder="Say something..." autofocus><button onclick="send()">Send</button></div></div>
<script>
const msgs=document.getElementById('msgs'),in=document.getElementById('in');
in.onkeydown=e=>{if(e.key==='Enter')send()};
async function send(){const m=in.value;if(!m)return;in.value='';msgs.innerHTML+='<div class="msg user">'+m+'</div>';const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m})});const reader=r.body.getReader(),dec=new TextDecoder();let ai='';while(true){const{done,value}=await reader.read();if(done)break;for(const line of dec.decode(value).split('\\n')){if(line.startsWith('data: ')&&line!=='data: [DONE]'){try{const d=JSON.parse(line.slice(6));if(typeof d==='string')ai+=d;else if(d.error){ai=d.error}else if(d.content)ai+=d.content}catch{}}}msgs.lastElementChild&&msgs.lastElementChild.remove();msgs.innerHTML+='<div class="msg user">'+m+'</div><div class="msg ai">'+ai+'</div>';msgs.scrollTop=msgs.scrollHeight}}
</script></body></html>`;
