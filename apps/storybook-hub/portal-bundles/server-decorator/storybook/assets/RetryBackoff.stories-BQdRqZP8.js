import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as o}from"./index-yBBFVILh.js";import{P as H}from"./PolyglotCodeTabs-CpfL-mTW.js";import{c as S}from"./studio-bK5yTmUK.js";import{P as V}from"./play-BOf30kar.js";import{C as L}from"./circle-check-big-BbDqt5n_.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _={name:"circle-x",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],aliases:["x-circle"]};_.node;const W=S(_);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w={name:"rotate-cw",size:24,node:[["path",{d:"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",key:"1p45f6"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}]]};w.node;const U=S(w),B=({maxAttempts:A=3,backoffMs:C=200,maxBackoffMs:$=2e3})=>{const[a,T]=o.useState(A),[i,z]=o.useState(C),[n,D]=o.useState($),[r,E]=o.useState("full"),[d,q]=o.useState(3),[u,p]=o.useState(!1),[f,x]=o.useState([]),[y,h]=o.useState(0),I=t=>{const s=Math.min(n,i*Math.pow(2,t-1));return r==="none"?s:r==="full"?Math.floor(Math.random()*s):r==="equal"?Math.floor(s/2+Math.random()*(s/2)):s},J=async()=>{p(!0),x([]),h(0);const t=Date.now();let s=1;for(;s<=a;){const g=s===d,b={attempt:s,delayMs:0,status:g?"success":"failed",timestamp:new Date().toLocaleTimeString()};if(x(c=>[...c,b]),g)break;if(s<a){const c=I(s);b.delayMs=c,await new Promise(P=>setTimeout(P,Math.min(c,800)))}s++}h(Date.now()-t),p(!1)},O={typescript:`// TypeScript / Node
import { withRetry } from '@montionugera/server-decorator';

const resilientCall = withRetry(async (id: string) => {
  return await remoteRpcService(id);
}, {
  maxAttempts: ${a},
  backoffMs: ${i},
  maxBackoffMs: ${n},
  jitter: ${r!=="none"},
  retryIf: (err) => err.isTransient === true
});`,python:`# Python
from server_decorator import retry

@retry(max_attempts=${a}, backoff_ms=${i}, max_backoff_ms=${n})
async def remote_rpc(user_id: str):
    return await client.fetch(user_id)`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

res, err := core.Retry(ctx, core.RetryOptions{
    MaxAttempts:  ${a},
    Backoff:      ${i} * time.Millisecond,
    MaxBackoff:   ${n} * time.Millisecond,
    Jitter:       ${r!=="none"},
}, func() (any, error) {
    return remoteCall(id)
})`,nim:`// Nim
import server_decorator/resilience

let res = withRetry(
  maxAttempts = ${a},
  backoffMs = ${i},
  maxBackoffMs = ${n}
):
  remoteCall(id)`,rust:`// Rust
use server_decorator_core::retry::{with_retry, RetryOptions};

let opts = RetryOptions {
    max_attempts: ${a},
    backoff: Duration::from_millis(${i}),
    max_backoff: Duration::from_millis(${n}),
    jitter: ${r!=="none"},
};
let res = with_retry(opts, || async { remote_call(id).await }).await;`};return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(U,{size:22,color:"#bc8cff"})," Exponential Backoff & Retry Simulator"]}),e.jsxs("span",{className:"studio-badge badge-purple",children:["Jitter: ",r]})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"studio-controls",children:[e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Max Attempts:"}),e.jsx("input",{type:"number",min:"1",max:"10",className:"studio-input",value:a,onChange:t=>T(Number(t.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Initial Backoff (ms):"}),e.jsx("input",{type:"number",min:"50",step:"50",max:"1000",className:"studio-input",value:i,onChange:t=>z(Number(t.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Max Backoff Cap (ms):"}),e.jsx("input",{type:"number",min:"500",step:"250",max:"5000",className:"studio-input",value:n,onChange:t=>D(Number(t.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Jitter Strategy:"}),e.jsxs("select",{className:"studio-input",value:r,onChange:t=>E(t.target.value),children:[e.jsx("option",{value:"none",children:"No Jitter (Deterministic)"}),e.jsx("option",{value:"full",children:"Full Jitter (Random Uniform)"}),e.jsx("option",{value:"equal",children:"Equal Jitter (Half Base + Half Random)"})]})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Simulate Success On:"}),e.jsxs("select",{className:"studio-input",value:d,onChange:t=>q(Number(t.target.value)),children:[Array.from({length:a},(t,s)=>s+1).map(t=>e.jsxs("option",{value:t,children:["Attempt #",t]},t)),e.jsx("option",{value:999,children:"Never (Exhaust All Attempts)"})]})]})]}),e.jsx("div",{className:"studio-btn-group",children:e.jsxs("button",{className:"studio-btn btn-primary",disabled:u,onClick:J,children:[e.jsx(V,{size:16})," ",u?"Retrying...":"Run Retry Execution"]})})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Attempt Timeline Visualizer"}),e.jsxs("div",{style:{minHeight:"160px",display:"flex",flexDirection:"column",gap:"0.5rem"},children:[f.length===0?e.jsx("div",{style:{color:"#8b949e",fontSize:"0.85rem",fontStyle:"italic",padding:"1rem 0"},children:'Click "Run Retry Execution" to observe backoff delays and attempt resolution.'}):f.map(t=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.5rem 0.75rem",background:t.status==="success"?"rgba(35, 134, 54, 0.15)":"rgba(218, 54, 51, 0.15)",borderLeft:`4px solid ${t.status==="success"?"#3fb950":"#f85149"}`,borderRadius:"0.25rem",fontSize:"0.85rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[t.status==="success"?e.jsx(L,{size:16,color:"#3fb950"}):e.jsx(W,{size:16,color:"#f85149"}),e.jsxs("strong",{children:["Attempt #",t.attempt]})]}),e.jsxs("div",{children:[t.delayMs>0&&e.jsxs("span",{style:{color:"#d29922",marginRight:"0.75rem"},children:["backoff delay: +",t.delayMs,"ms"]}),e.jsx("span",{style:{color:t.status==="success"?"#3fb950":"#f85149",fontWeight:600},children:t.status.toUpperCase()})]})]},t.attempt)),y>0&&e.jsxs("div",{style:{marginTop:"0.5rem",fontSize:"0.8rem",color:"#58a6ff",textAlign:"right"},children:["Total simulated execution elapsed:"," ",e.jsxs("strong",{children:[y,"ms"]})]})]})]})]}),e.jsxs("div",{style:{marginTop:"1.5rem"},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Polyglot Code Implementation"}),e.jsx(H,{snippets:O})]})]})};B.__docgenInfo={description:"",methods:[],displayName:"RetryBackoffSimulator",props:{maxAttempts:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"3",computed:!1}},backoffMs:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"200",computed:!1}},maxBackoffMs:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"2000",computed:!1}}}};const Z={title:"Resilience/RetryBackoff",component:B,parameters:{layout:"centered",docs:{description:{component:"Visual attempt timeline and jitter analysis for the `@retry` decorator."}}},tags:["autodocs"],argTypes:{maxAttempts:{control:{type:"number",min:1,max:10}},backoffMs:{control:{type:"number",min:50,max:1e3}},maxBackoffMs:{control:{type:"number",min:500,max:5e3}}}},l={args:{maxAttempts:3,backoffMs:200,maxBackoffMs:2e3}},m={args:{maxAttempts:5,backoffMs:100,maxBackoffMs:1500}};var j,v,k;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    maxAttempts: 3,
    backoffMs: 200,
    maxBackoffMs: 2000
  }
}`,...(k=(v=l.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var M,N,R;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    maxAttempts: 5,
    backoffMs: 100,
    maxBackoffMs: 1500
  }
}`,...(R=(N=m.parameters)==null?void 0:N.docs)==null?void 0:R.source}}};const ee=["Default","AggressiveRetry"];export{m as AggressiveRetry,l as Default,ee as __namedExportsOrder,Z as default};
