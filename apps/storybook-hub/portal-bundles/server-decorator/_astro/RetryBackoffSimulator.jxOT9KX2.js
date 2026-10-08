import{r as e,t}from"./react.yIOJJ3r4.js";import{n,t as r}from"./jsx-runtime.JMAt2w8r.js";import{t as i}from"./circle-check-big.9kdwx5z9.js";import{t as a}from"./play.B2b6MpNN.js";import{t as o}from"./PolyglotCodeTabs.1K7Ixw4G.js";var s={name:`circle-x`,size:24,node:[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m15 9-6 6`,key:`1uzhvr`}],[`path`,{d:`m9 9 6 6`,key:`z0biqf`}]],aliases:[`x-circle`]};s.node;var c=n(s),l={name:`rotate-cw`,size:24,node:[[`path`,{d:`M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8`,key:`1p45f6`}],[`path`,{d:`M21 3v5h-5`,key:`1q7to0`}]]};l.node;var u=n(l),d=e(t(),1),f=r(),p=({maxAttempts:e=3,backoffMs:t=200,maxBackoffMs:n=2e3})=>{let[r,s]=(0,d.useState)(e),[l,p]=(0,d.useState)(t),[m,h]=(0,d.useState)(n),[g,_]=(0,d.useState)(`full`),[v,y]=(0,d.useState)(3),[b,x]=(0,d.useState)(!1),[S,C]=(0,d.useState)([]),[w,T]=(0,d.useState)(0),E=e=>{let t=Math.min(m,l*2**(e-1));return g===`none`?t:g===`full`?Math.floor(Math.random()*t):g===`equal`?Math.floor(t/2+t/2*Math.random()):t},D=async()=>{x(!0),C([]),T(0);let e=Date.now(),t=1;for(;t<=r;){let e=t===v,n={attempt:t,delayMs:0,status:e?`success`:`failed`,timestamp:new Date().toLocaleTimeString()};if(C(e=>[...e,n]),e)break;if(t<r){let e=E(t);n.delayMs=e,await new Promise(t=>setTimeout(t,Math.min(e,800)))}t++}T(Date.now()-e),x(!1)},O={typescript:`// TypeScript / Node
import { withRetry } from '@montionugera/server-decorator';

const resilientCall = withRetry(async (id: string) => {
  return await remoteRpcService(id);
}, {
  maxAttempts: ${r},
  backoffMs: ${l},
  maxBackoffMs: ${m},
  jitter: ${g!==`none`},
  retryIf: (err) => err.isTransient === true
});`,python:`# Python
from server_decorator import retry

@retry(max_attempts=${r}, backoff_ms=${l}, max_backoff_ms=${m})
async def remote_rpc(user_id: str):
    return await client.fetch(user_id)`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

res, err := core.Retry(ctx, core.RetryOptions{
    MaxAttempts:  ${r},
    Backoff:      ${l} * time.Millisecond,
    MaxBackoff:   ${m} * time.Millisecond,
    Jitter:       ${g!==`none`},
}, func() (any, error) {
    return remoteCall(id)
})`,nim:`// Nim
import server_decorator/resilience

let res = withRetry(
  maxAttempts = ${r},
  backoffMs = ${l},
  maxBackoffMs = ${m}
):
  remoteCall(id)`,rust:`// Rust
use server_decorator_core::retry::{with_retry, RetryOptions};

let opts = RetryOptions {
    max_attempts: ${r},
    backoff: Duration::from_millis(${l}),
    max_backoff: Duration::from_millis(${m}),
    jitter: ${g!==`none`},
};
let res = with_retry(opts, || async { remote_call(id).await }).await;`};return(0,f.jsxs)(`div`,{className:`studio-card`,children:[(0,f.jsxs)(`div`,{className:`studio-header`,children:[(0,f.jsxs)(`h3`,{className:`studio-title`,children:[(0,f.jsx)(u,{size:22,color:`#bc8cff`}),` Exponential Backoff & Retry Simulator`]}),(0,f.jsxs)(`span`,{className:`studio-badge badge-purple`,children:[`Jitter: `,g]})]}),(0,f.jsxs)(`div`,{className:`studio-grid`,children:[(0,f.jsxs)(`div`,{className:`studio-panel`,children:[(0,f.jsxs)(`div`,{className:`studio-controls`,children:[(0,f.jsxs)(`div`,{className:`studio-control-row`,children:[(0,f.jsx)(`span`,{className:`studio-control-label`,children:`Max Attempts:`}),(0,f.jsx)(`input`,{type:`number`,min:`1`,max:`10`,className:`studio-input`,value:r,onChange:e=>s(Number(e.target.value))})]}),(0,f.jsxs)(`div`,{className:`studio-control-row`,children:[(0,f.jsx)(`span`,{className:`studio-control-label`,children:`Initial Backoff (ms):`}),(0,f.jsx)(`input`,{type:`number`,min:`50`,step:`50`,max:`1000`,className:`studio-input`,value:l,onChange:e=>p(Number(e.target.value))})]}),(0,f.jsxs)(`div`,{className:`studio-control-row`,children:[(0,f.jsx)(`span`,{className:`studio-control-label`,children:`Max Backoff Cap (ms):`}),(0,f.jsx)(`input`,{type:`number`,min:`500`,step:`250`,max:`5000`,className:`studio-input`,value:m,onChange:e=>h(Number(e.target.value))})]}),(0,f.jsxs)(`div`,{className:`studio-control-row`,children:[(0,f.jsx)(`span`,{className:`studio-control-label`,children:`Jitter Strategy:`}),(0,f.jsxs)(`select`,{className:`studio-input`,value:g,onChange:e=>_(e.target.value),children:[(0,f.jsx)(`option`,{value:`none`,children:`No Jitter (Deterministic)`}),(0,f.jsx)(`option`,{value:`full`,children:`Full Jitter (Random Uniform)`}),(0,f.jsx)(`option`,{value:`equal`,children:`Equal Jitter (Half Base + Half Random)`})]})]}),(0,f.jsxs)(`div`,{className:`studio-control-row`,children:[(0,f.jsx)(`span`,{className:`studio-control-label`,children:`Simulate Success On:`}),(0,f.jsxs)(`select`,{className:`studio-input`,value:v,onChange:e=>y(Number(e.target.value)),children:[Array.from({length:r},(e,t)=>t+1).map(e=>(0,f.jsxs)(`option`,{value:e,children:[`Attempt #`,e]},e)),(0,f.jsx)(`option`,{value:999,children:`Never (Exhaust All Attempts)`})]})]})]}),(0,f.jsx)(`div`,{className:`studio-btn-group`,children:(0,f.jsxs)(`button`,{className:`studio-btn btn-primary`,disabled:b,onClick:D,children:[(0,f.jsx)(a,{size:16}),` `,b?`Retrying...`:`Run Retry Execution`]})})]}),(0,f.jsxs)(`div`,{className:`studio-panel`,children:[(0,f.jsx)(`div`,{style:{fontSize:`0.875rem`,fontWeight:600,marginBottom:`0.5rem`,color:`#8b949e`},children:`Attempt Timeline Visualizer`}),(0,f.jsxs)(`div`,{style:{minHeight:`160px`,display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[S.length===0?(0,f.jsx)(`div`,{style:{color:`#8b949e`,fontSize:`0.85rem`,fontStyle:`italic`,padding:`1rem 0`},children:`Click "Run Retry Execution" to observe backoff delays and attempt resolution.`}):S.map(e=>(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.5rem 0.75rem`,background:e.status===`success`?`rgba(35, 134, 54, 0.15)`:`rgba(218, 54, 51, 0.15)`,borderLeft:`4px solid ${e.status===`success`?`#3fb950`:`#f85149`}`,borderRadius:`0.25rem`,fontSize:`0.85rem`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[e.status===`success`?(0,f.jsx)(i,{size:16,color:`#3fb950`}):(0,f.jsx)(c,{size:16,color:`#f85149`}),(0,f.jsxs)(`strong`,{children:[`Attempt #`,e.attempt]})]}),(0,f.jsxs)(`div`,{children:[e.delayMs>0&&(0,f.jsxs)(`span`,{style:{color:`#d29922`,marginRight:`0.75rem`},children:[`backoff delay: +`,e.delayMs,`ms`]}),(0,f.jsx)(`span`,{style:{color:e.status===`success`?`#3fb950`:`#f85149`,fontWeight:600},children:e.status.toUpperCase()})]})]},e.attempt)),w>0&&(0,f.jsxs)(`div`,{style:{marginTop:`0.5rem`,fontSize:`0.8rem`,color:`#58a6ff`,textAlign:`right`},children:[`Total simulated execution elapsed:`,` `,(0,f.jsxs)(`strong`,{children:[w,`ms`]})]})]})]})]}),(0,f.jsxs)(`div`,{style:{marginTop:`1.5rem`},children:[(0,f.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:600,marginBottom:`0.5rem`,color:`#8b949e`},children:`Polyglot Code Implementation`}),(0,f.jsx)(o,{snippets:O})]})]})};export{p as RetryBackoffSimulator};