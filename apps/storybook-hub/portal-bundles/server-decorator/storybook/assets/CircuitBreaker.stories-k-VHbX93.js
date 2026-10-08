import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as a}from"./index-yBBFVILh.js";import{P as V}from"./PolyglotCodeTabs-CpfL-mTW.js";import{c as C}from"./studio-bK5yTmUK.js";import{C as W}from"./circle-check-big-BbDqt5n_.js";import{R as G}from"./refresh-cw-B4Yn5L62.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};T.node;const K=C(T);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E={name:"triangle-alert",size:24,node:[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["alert-triangle"]};E.node;const Z=C(E);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O={name:"zap",size:24,node:[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]]};O.node;const J=C(O),k=({failureThreshold:_=3,resetTimeoutMs:w=3e3,trialSuccesses:L=2})=>{const[i,P]=a.useState(_),[o,B]=a.useState(w),[d,D]=a.useState(L),[r,n]=a.useState("CLOSED"),[g,u]=a.useState(0),[x,c]=a.useState(0),[M,m]=a.useState(0),[$,z]=a.useState([{id:"init",time:new Date().toLocaleTimeString(),type:"info",message:"Circuit initialized in CLOSED state. Monitoring service calls."}]),l=a.useRef(null),s=(t,p)=>{z(U=>[{id:Math.random().toString(36).substring(2,9),time:new Date().toLocaleTimeString(),type:t,message:p},...U.slice(0,19)])};a.useEffect(()=>{if(r==="OPEN"){m(Math.ceil(o/1e3));const t=setInterval(()=>{m(p=>p<=1?(clearInterval(t),n("HALF_OPEN"),c(0),s("warn","Reset timeout expired. Transitioned to HALF-OPEN state (trial mode)."),0):p-1)},1e3);return l.current=t,()=>clearInterval(t)}},[r,o]);const R=()=>{if(r==="OPEN"){s("fail","Blocked: CircuitBreakerOpenError! Call rejected immediately (fast failure).");return}if(r==="HALF_OPEN"){const t=x+1;c(t),s("success",`Trial canary call succeeded (${t}/${d}).`),t>=d&&(n("CLOSED"),u(0),c(0),s("success","Health verified! Circuit recovered and transitioned to CLOSED state."))}else s("success","Call succeeded (200 OK). Circuit remains CLOSED.")},F=()=>{if(r==="OPEN"){s("fail","Blocked: CircuitBreakerOpenError! Downstream is protected from further load.");return}if(r==="HALF_OPEN"){n("OPEN"),c(0),s("fail","Trial call failed! Canary tripped; circuit immediately reopened to OPEN state.");return}const t=g+1;u(t),s("fail",`Call failed with 500 error (${t}/${i} threshold).`),t>=i&&(n("OPEN"),u(0),s("warn",`Threshold reached (${i} errors)! Circuit TRIPPED to OPEN state.`))},A=()=>{r==="OPEN"&&(l.current&&clearInterval(l.current),m(0),n("HALF_OPEN"),c(0),s("info","Fast-forwarded timeout. Circuit transitioned to HALF-OPEN."))},I=()=>{l.current&&clearInterval(l.current),n("CLOSED"),u(0),c(0),m(0),s("info","Manual reset applied: Circuit forced to CLOSED.")},H=r==="CLOSED"?"badge-green":r==="OPEN"?"badge-red":"badge-amber",q={typescript:`// TypeScript / Node
import { withCircuitBreaker, CircuitBreakerOpenError } from '@montionugera/server-decorator';

const resilientFetch = withCircuitBreaker(async (id: string) => {
  return await fetchUserFromRemote(id);
}, {
  threshold: ${i},
  resetTimeoutMs: ${o},
  fallback: () => ({ id: 'fallback', name: 'Cached User' })
});`,python:`# Python
from server_decorator import circuit_breaker, CircuitBreakerOpenError

@circuit_breaker(threshold=${i}, reset_timeout_ms=${o})
async def fetch_user(user_id: str):
    return await remote_service.get(user_id)`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

cb := core.NewCircuitBreaker(core.CircuitBreakerOptions{
    FailureThreshold: ${i},
    ResetTimeout:     ${o} * time.Millisecond,
})
res, err := cb.Execute(ctx, func() (any, error) {
    return fetchUser(id)
})`,nim:`// Nim
import server_decorator/resilience

let cb = newCircuitBreaker(
  threshold = ${i},
  resetTimeoutMs = ${o}
)
let result = cb.protect:
  fetchUser(id)`,rust:`// Rust (Axum / Core)
use server_decorator_core::circuit_breaker::{CircuitBreaker, CircuitBreakerOptions};

let cb = CircuitBreaker::new(CircuitBreakerOptions {
    threshold: ${i},
    reset_timeout: Duration::from_millis(${o}),
});
let res = cb.call(|| async { fetch_user(id).await }).await;`};return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(K,{size:22,color:"#58a6ff"})," Circuit Breaker Interactive Simulator"]}),e.jsxs("span",{className:`studio-badge ${H}`,children:["State: ",r]})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"studio-controls",children:[e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Failure Threshold:"}),e.jsx("input",{type:"number",min:"1",max:"10",className:"studio-input",value:i,onChange:t=>P(Number(t.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Reset Timeout (ms):"}),e.jsx("input",{type:"number",min:"1000",step:"500",max:"10000",className:"studio-input",value:o,onChange:t=>B(Number(t.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Trial Successes Required:"}),e.jsx("input",{type:"number",min:"1",max:"5",className:"studio-input",value:d,onChange:t=>D(Number(t.target.value))})]})]}),e.jsxs("div",{style:{marginTop:"1rem",padding:"0.75rem",background:"#0d1117",borderRadius:"0.375rem",border:"1px solid #21262d"},children:[e.jsxs("div",{style:{fontSize:"0.85rem",marginBottom:"0.4rem",display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{children:"Failure Counter:"}),e.jsxs("strong",{style:{color:g>0?"#f85149":"#3fb950"},children:[g," / ",i]})]}),r==="OPEN"&&e.jsxs("div",{style:{fontSize:"0.85rem",display:"flex",justifyContent:"space-between",color:"#f85149"},children:[e.jsx("span",{children:"Cooldown Remaining:"}),e.jsxs("strong",{children:[M,"s"]})]}),r==="HALF_OPEN"&&e.jsxs("div",{style:{fontSize:"0.85rem",display:"flex",justifyContent:"space-between",color:"#d29922"},children:[e.jsx("span",{children:"Canary Successes:"}),e.jsxs("strong",{children:[x," / ",d]})]})]}),e.jsxs("div",{className:"studio-btn-group",children:[e.jsxs("button",{className:"studio-btn btn-primary",onClick:R,children:[e.jsx(W,{size:16})," Call (Success 200)"]}),e.jsxs("button",{className:"studio-btn btn-danger",onClick:F,children:[e.jsx(Z,{size:16})," Call (Error 500)"]}),r==="OPEN"&&e.jsxs("button",{className:"studio-btn btn-accent",onClick:A,children:[e.jsx(J,{size:16})," Skip Cooldown"]}),e.jsxs("button",{className:"studio-btn btn-secondary",onClick:I,children:[e.jsx(G,{size:16})," Reset"]})]})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Live Telemetry Log"}),e.jsx("div",{className:"studio-log-box",children:$.map(t=>e.jsxs("div",{className:`log-entry log-${t.type}`,children:[e.jsxs("span",{style:{opacity:.5,marginRight:"0.4rem"},children:["[",t.time,"]"]}),t.message]},t.id))})]})]}),e.jsxs("div",{style:{marginTop:"1.5rem"},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Polyglot Code Implementation"}),e.jsx(V,{snippets:q})]})]})};k.__docgenInfo={description:"",methods:[],displayName:"CircuitBreakerSimulator",props:{failureThreshold:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"3",computed:!1}},resetTimeoutMs:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"3000",computed:!1}},trialSuccesses:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"2",computed:!1}}}};const se={title:"Resilience/CircuitBreaker",component:k,parameters:{layout:"centered",docs:{description:{component:"Interactive visual state machine for the `@circuitBreaker` decorator. Demonstrates CLOSED, OPEN, and HALF-OPEN transitions with configurable thresholds."}}},tags:["autodocs"],argTypes:{failureThreshold:{control:{type:"number",min:1,max:10}},resetTimeoutMs:{control:{type:"number",step:500,min:1e3,max:1e4}},trialSuccesses:{control:{type:"number",min:1,max:5}}}},h={args:{failureThreshold:3,resetTimeoutMs:3e3,trialSuccesses:2}},f={args:{failureThreshold:2,resetTimeoutMs:5e3,trialSuccesses:3}};var b,y,N;h.parameters={...h.parameters,docs:{...(b=h.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    failureThreshold: 3,
    resetTimeoutMs: 3000,
    trialSuccesses: 2
  }
}`,...(N=(y=h.parameters)==null?void 0:y.docs)==null?void 0:N.source}}};var j,v,S;f.parameters={...f.parameters,docs:{...(j=f.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    failureThreshold: 2,
    resetTimeoutMs: 5000,
    trialSuccesses: 3
  }
}`,...(S=(v=f.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};const ie=["Default","SensitiveCircuit"];export{h as Default,f as SensitiveCircuit,ie as __namedExportsOrder,se as default};
