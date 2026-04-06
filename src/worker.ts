// ═══════════════════════════════════════════════════════════════
// cocapn-lite — Tabula Rasa Seed
// Minimal. Zero runtime deps. BYOK chat. Fork, customize, deploy.
// ═══════════════════════════════════════════════════════════════

import { loadBYOKConfig, saveBYOKConfig, PROVIDERS, getProvider, type BYOKConfig, type LLMMessage } from './lib/byok';

import { storePattern, findSimilar, getNeighborhood, crossRepoTransfer, listPatterns } from './lib/structural-memory.js';
import { exportPatterns, importPatterns, fleetSync } from './lib/cross-cocapn-bridge.js';

interface Env { COCAPNLITE_KV: KVNamespace; }

const ACCENT = '#3b82f6';
const SYSTEM_PROMPT = `You are a cocapn — a repo-native AI agent. You live in this repo. You remember every conversation. You grow smarter over time. Be helpful, direct, and genuine. Skip filler words. You have opinions.`;

const CSP = "default-src 'self'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'unsafe-inline' 'self'; connect-src *; img-src * data:; font-src *";

function html(body: string, title = 'Cocapn Lite') {
  return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,-apple-system,sans-serif;background:#fafafa;color:#1a1a1a;line-height:1.6}
a{color:${ACCENT};text-decoration:none}.btn{display:inline-block;padding:.65rem 1.5rem;background:${ACCENT};color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.95rem}
.container{max-width:720px;margin:0 auto;padding:2rem 1rem}</style></head><body>${body}</body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Health ──
    if (url.pathname === '/api/efficiency') return new Response(JSON.stringify({ totalCached: 0, totalHits: 0, cacheHitRate: 0, tokensSaved: 0, repo: 'cocapn-lite', timestamp: Date.now() }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (url.pathname === '/health') return new Response(JSON.stringify({ status: 'ok', vessel: 'cocapn-lite', ts: Date.now() }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  if (url.pathname === '/vessel.json') { try { const vj = await import('./vessel.json', { with: { type: 'json' } }); return new Response(JSON.stringify(vj.default || vj), { headers: { 'Content-Type': 'application/json' } }); } catch { return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); } }

    // ── Landing ──
    if (url.pathname === '/') return html(`<div class="container" style="text-align:center;padding-top:15vh">
<h1 style="font-size:2.5rem;margin-bottom:.5rem">⚓ Cocapn Lite</h1>
<p style="color:#666;font-size:1.15rem;max-width:480px;margin:0 auto 1.5rem">Start here. Fork this repo, bring your own AI key, and grow your own vessel — a repo-native AI agent that lives alongside your code.</p>
<div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem">
<a href="/setup" class="btn">Set Up</a><a href="/app" class="btn" style="background:#1a1a1a">Open App</a>
</div>
<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
<span style="padding:.2rem .6rem;background:#f0f0f0;border-radius:20px;font-size:.75rem;color:#555">Zero deps</span>
<span style="padding:.2rem .6rem;background:#f0f0f0;border-radius:20px;font-size:.75rem;color:#555">BYOK</span>
<span style="padding:.2rem .6rem;background:#f0f0f0;border-radius:20px;font-size:.75rem;color:#555">KV-backed</span>
<span style="padding:.2rem .6rem;background:#f0f0f0;border-radius:20px;font-size:.75rem;color:#555">SSE streaming</span>
</div>
<p style="margin-top:2rem;color:#999;font-size:.8rem"><a href="https://cocapn.ai">cocapn.ai</a> · <a href="https://github.com/Lucineer/cocapn-lite">GitHub</a></p>
</div>`, 'Cocapn Lite — Start Here');

    // ── Setup Wizard ──
    if (url.pathname === '/setup') return html(`<div class="container" style="padding-top:3vh">
<h1 style="color:${ACCENT};margin-bottom:.25rem">⚡ BYOK Setup</h1>
<p style="color:#888;margin-bottom:1.5rem">Choose your AI provider and paste your API key. It stays in your browser or encrypted in KV.</p>
<div id="providers" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.6rem;margin-bottom:1.25rem"></div>
<label style="font-size:.8rem;color:#888;text-transform:uppercase;letter-spacing:1px">API Key</label>
<div style="display:flex;gap:.5rem;margin-bottom:1rem"><input type="password" id="apiKey" placeholder="sk-..." autocomplete="off" style="flex:1;padding:.65rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.9rem">
<button onclick="toggleKey()" style="background:#f0f0f0;border:1px solid #ddd;padding:0 .75rem;border-radius:6px;cursor:pointer" id="toggleBtn">Show</button></div>
<label style="font-size:.8rem;color:#888;text-transform:uppercase;letter-spacing:1px">Model</label>
<select id="model" style="width:100%;padding:.65rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.9rem;margin-bottom:1.25rem"></select>
<label style="font-size:.8rem;color:#888;text-transform:uppercase;letter-spacing:1px">Custom Base URL <span style="color:#bbb">(optional)</span></label>
<input type="text" id="baseUrl" placeholder="https://..." style="width:100%;padding:.65rem .75rem;border:1px solid #ddd;border-radius:6px;font-size:.9rem;margin-bottom:1.5rem">
<button class="btn" onclick="save()" style="width:100%">Save & Start</button>
<div id="status" style="text-align:center;margin-top:.75rem;font-size:.85rem;min-height:1.2em"></div>
</div>
<script>
const P=${JSON.stringify(PROVIDERS)};let sel=null;
document.getElementById('providers').innerHTML=P.map(p=>'<button data-id="'+p.id+'" onclick="pick(\''+p.id+'\')" style="background:#fff;border:2px solid #eee;border-radius:8px;padding:.75rem;cursor:pointer;text-align:center;transition:border-color .2s"><div style="width:10px;height:10px;border-radius:50%;background:'+p.color+';margin:0 auto .4rem"></div><div style="font-weight:600;font-size:.85rem">'+p.name+'</div><div style="font-size:.7rem;color:#999">'+p.defaultModel+'</div></button>').join('');
function pick(id){sel=id;document.querySelectorAll('#providers button').forEach(b=>b.style.borderColor=b.dataset.id===id?P.find(p=>p.id===id).color:'#eee');const p=P.find(p=>p.id===id);document.getElementById('model').innerHTML=p.models.map(m=>'<option'+(m===p.defaultModel?' selected':'')+'>'+m+'</option>').join('');document.getElementById('baseUrl').placeholder=p.baseUrl;document.getElementById('apiKey').placeholder=id==='ollama'?'Not needed':'Paste your API key...';}
function toggleKey(){const i=document.getElementById('apiKey'),b=document.getElementById('toggleBtn');i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Show':'Hide';}
async function save(){if(!sel){document.getElementById('status').innerHTML='<span style="color:red">Select a provider</span>';return;}const k=document.getElementById('apiKey').value;if(!k&&sel!=='ollama'){document.getElementById('status').innerHTML='<span style="color:red">Enter an API key</span>';return;}const p=P.find(p=>p.id===sel);const c={providers:{[sel]:{baseUrl:document.getElementById('baseUrl').value||p.baseUrl,apiKey:k,model:document.getElementById('model').value}},activeProvider:sel,createdAt:Date.now(),updatedAt:Date.now()};localStorage.setItem('byok_config',JSON.stringify(c));document.cookie='byok_config='+encodeURIComponent(JSON.stringify(c))+';path=/;max-age=31536000;SameSite=Lax';try{await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)})}catch{}document.getElementById('status').innerHTML='<span style="color:green">Saved! Redirecting...</span>';setTimeout(()=>location.href='/app',600);}
</script>`, 'Cocapn Lite — Setup');

    // ── App ──
    if (url.pathname === '/app') return html(`<div style="display:flex;height:100vh;flex-direction:column">
<header style="padding:.6rem 1rem;text-align:center;border-bottom:1px solid #eee;color:${ACCENT};font-weight:700;font-size:.85rem;background:#fff">⚓ cocapn-lite</header>
<div id="msgs" style="flex:1;overflow-y:auto;padding:1rem;max-width:720px;margin:0 auto;width:100%"></div>
<div style="padding:.75rem 1rem;max-width:720px;margin:0 auto;width:100%;display:flex;gap:.5rem">
<input id="in" placeholder="Say something..." style="flex:1;padding:.65rem .75rem;border:1px solid #ddd;border-radius:8px;font-size:.9rem" autofocus>
<button class="btn" onclick="send()">Send</button>
</div></div>
<script>
const msgs=document.getElementById('msgs'),inp=document.getElementById('in');
let config=JSON.parse(localStorage.getItem('byok_config')||'null');
if(!config){document.getElementById('msgs').innerHTML='<p style="text-align:center;color:#999;padding:3rem"><a href="/setup">Set up your API key first →</a></p>';}
inp.onkeydown=e=>{if(e.key==='Enter')send()};
async function send(){const m=inp.value;if(!m)return;inp.value='';msgs.innerHTML+='<div style="background:#f0f0f0;padding:.65rem .75rem;border-radius:12px;max-width:80%;margin-left:auto;margin-bottom:.75rem;white-space:pre-wrap">'+m+'</div>';const div=document.createElement('div');div.style.cssText='background:#fff;border:1px solid #eee;padding:.65rem .75rem;border-radius:12px;max-width:80%;margin-bottom:.75rem;white-space:pre-wrap';div.textContent='';msgs.appendChild(div);const cfg=config.providers[config.activeProvider];const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m,provider:config.activeProvider,baseUrl:cfg.baseUrl,apiKey:cfg.apiKey,model:cfg.model})});const reader=r.body.getReader(),dec=new TextDecoder();let ai='';while(true){const{done,value}=await reader.read();if(done)break;for(const line of dec.decode(value).split('\\n')){if(line.startsWith('data: ')&&line!=='data: [DONE]'){try{const d=JSON.parse(line.slice(6));if(typeof d==='string')ai+=d;else if(d.error){ai=d.error}else if(d.content)ai+=d.content}catch{}}div.textContent=ai;msgs.scrollTop=msgs.scrollHeight;}}}
</script>`, 'Cocapn Lite');

    // ── Chat API (SSE) ──
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const body = await request.json() as { message: string; provider?: string; baseUrl?: string; apiKey?: string; model?: string; sessionId?: string };
      const { message, sessionId = 'default' } = body;
      const provider = body.provider || 'openai';
      const apiKey = body.apiKey || '';
      const model = body.model || getProvider(provider)?.defaultModel || 'gpt-4o-mini';
      const baseUrl = body.baseUrl || getProvider(provider)?.baseUrl || '';

      // Save user message
      const memKey = `mem:${sessionId}`;
      const history: any[] = (await env.COCAPNLITE_KV?.get(memKey, 'json')) || [];
      history.push({ role: 'user', content: message, ts: Date.now() });
      const context: LLMMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-20).map(m => ({ role: m.role, content: m.content }))];

      const stream = new ReadableStream({
        async start(ctrl) {
          const enc = new TextEncoder();
          let full = '';
          try {
            const chatUrl = provider === 'anthropic' ? `${baseUrl}/messages` : `${baseUrl}/chat/completions`;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            if (provider === 'anthropic') { headers['x-api-key'] = apiKey; headers['anthropic-version'] = '2023-06-01'; }

            let reqBody: any;
            if (provider === 'anthropic') {
              const sys = context.find(m => m.role === 'system')?.content || '';
              reqBody = { model, max_tokens: 2048, stream: true, system: sys, messages: context.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })) };
            } else {
              reqBody = { model, messages: context, stream: true, temperature: 0.7 };
            }

            const resp = await fetch(chatUrl, { method: 'POST', headers, body: JSON.stringify(reqBody) });
            if (!resp.ok) { ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ error: `LLM ${resp.status}` })}\n\n`)); ctrl.close(); return; }
            const reader = resp.body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              for (const line of new TextDecoder().decode(value).split('\n')) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                  try {
                    const d = JSON.parse(line.slice(6));
                    const content = d.choices?.[0]?.delta?.content || d.delta?.text || '';
                    if (content) { full += content; ctrl.enqueue(enc.encode(`data: ${JSON.stringify(content)}\n\n`)); }
                  } catch {}
                }
              }
            }
            history.push({ role: 'assistant', content: full, ts: Date.now() });
            if (history.length > 500) history.splice(0, history.length - 500);
            await env.COCAPNLITE_KV?.put(memKey, JSON.stringify(history));
          } catch (e: any) {
            ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ error: e.message })}\n\n`));
          }
          ctrl.enqueue(enc.encode('data: [DONE]\n\n'));
          ctrl.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', ...cors } });
    }

    // ── Config API ──
    if (url.pathname === '/api/config') {
      if (request.method === 'GET') {
        const config = await loadBYOKConfig(request, env);
        if (config) return new Response(JSON.stringify({ ...config, providers: Object.fromEntries(Object.entries(config.providers).map(([k, v]) => [k, { ...v, apiKey: '••••' }])) }), { headers: { ...cors, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ configured: false }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (request.method === 'POST') {
        const config: BYOKConfig = await request.json();
        await saveBYOKConfig(config, request, env);
        return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }

    // ── Memory API ──
    if (url.pathname === '/api/memory' && request.method === 'GET') {
      const sessionId = url.searchParams.get('session') || 'default';
      const history = (await env.COCAPNLITE_KV?.get(`mem:${sessionId}`, 'json')) || [];
      return new Response(JSON.stringify(history), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // ── Sessions API ──
    if (url.pathname === '/api/sessions' && request.method === 'GET') {
      const keys = await env.COCAPNLITE_KV?.list({ prefix: 'mem:' });
      return new Response(JSON.stringify(keys?.keys.map(k => k.name.replace('mem:', '')) || []), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    
    // ── Phase 4: Structural Memory Routes ──
    if (url.pathname === '/api/memory' && request.method === 'GET') {
      const source = url.searchParams.get('source') || undefined;
      const patterns = await listPatterns(env, source);
      return new Response(JSON.stringify(patterns), { headers: cors });
    }
    if (url.pathname === '/api/memory' && request.method === 'POST') {
      const body = await request.json();
      await storePattern(env, body);
      return new Response(JSON.stringify({ ok: true, id: body.id }), { headers: cors });
    }
    if (url.pathname === '/api/memory/similar') {
      const structure = url.searchParams.get('structure') || '';
      const threshold = parseFloat(url.searchParams.get('threshold') || '0.7');
      const similar = await findSimilar(env, structure, threshold);
      return new Response(JSON.stringify(similar), { headers: cors });
    }
    if (url.pathname === '/api/memory/transfer') {
      const fromRepo = url.searchParams.get('from') || '';
      const toRepo = url.searchParams.get('to') || '';
      const problem = url.searchParams.get('problem') || '';
      const transfers = await crossRepoTransfer(env, fromRepo, toRepo, problem);
      return new Response(JSON.stringify(transfers), { headers: cors });
    }
    if (url.pathname === '/api/memory/sync' && request.method === 'POST') {
      const body = await request.json();
      const repos = body.repos || [];
      const result = await fleetSync(env, repos);
      return new Response(JSON.stringify(result), { headers: cors });
    }
    return new Response('Not found', { status: 404, headers: cors });
  }
};
