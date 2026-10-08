import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as a}from"./index-yBBFVILh.js";import{P as D}from"./PolyglotCodeTabs-CpfL-mTW.js";import{c}from"./studio-bK5yTmUK.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};S.node;const I=c(S);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N={name:"flame",size:24,node:[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",key:"1slcih"}]]};N.node;const O=c(N);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C={name:"gauge",size:24,node:[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]};C.node;const F=c(C);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _={name:"refresh-ccw",size:24,node:[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]};_.node;const A=c(_);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w={name:"shield-alert",size:24,node:[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]};w.node;const W=c(w),z=({capacity:x=10,refillPerSecond:L=2})=>{const[t,T]=a.useState(x),[i,P]=a.useState(L),[o,n]=a.useState(x),[q,m]=a.useState(0),[B,y]=a.useState(0),[E,u]=a.useState(!1);a.useEffect(()=>{const r=setInterval(()=>{n(s=>Math.min(t,s+i/2))},500);return()=>clearInterval(r)},[t,i]);const p=r=>{if(o>=r)n(s=>s-r),m(s=>s+r),u(!1);else{const s=Math.floor(o);n(0),m(f=>f+s),y(f=>f+(r-s)),u(!0)}},$=()=>{n(t),m(0),y(0),u(!1)},h=Math.round(o/t*100),M={typescript:`// TypeScript / Node
import { withRateLimit, RateLimitExceededError } from '@montionugera/server-decorator';

const rateLimitedEndpoint = withRateLimit(async (req: Request) => {
  return await handleRequest(req);
}, {
  tokensPerInterval: ${t},
  interval: 'second',
  key: (req) => req.headers.get('x-user-id') ?? req.ip
});`,python:`# Python
from server_decorator import rate_limit

@rate_limit(tokens=${t}, interval="1s", key=lambda req: req.client.host)
async def api_endpoint(request: Request):
    return {"status": "ok"}`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

limiter := core.NewTokenBucketLimiter(${t}, ${i})
if !limiter.Allow() {
    return c.JSON(429, core.NewProblem(429, "Rate Limit Exceeded"))
}`,nim:`// Nim
import server_decorator/resilience

let limiter = newTokenBucket(capacity = ${t}, refillRate = ${i})
if not limiter.tryAcquire():
  raise newException(RateLimitError, "Token bucket depleted")`,rust:`// Rust
use server_decorator_core::rate_limit::{RateLimiter, RateLimitOptions};

let limiter = RateLimiter::new(RateLimitOptions {
    capacity: ${t},
    refill_rate: ${i},
});
if !limiter.check_and_consume(1) {
    return Err(Problem::new(StatusCode::TOO_MANY_REQUESTS, "Rate Limit Exceeded"));
}`};return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(F,{size:22,color:"#388bfd"})," Token Bucket Rate Limiter Simulator"]}),e.jsxs("span",{className:"studio-badge badge-blue",children:["Refill: +",i," tokens/sec"]})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"studio-controls",children:[e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Bucket Capacity (Burst limit):"}),e.jsx("input",{type:"number",min:"2",max:"30",className:"studio-input",value:t,onChange:r=>{const s=Number(r.target.value);T(s),n(s)}})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Refill Rate (tokens / second):"}),e.jsx("input",{type:"number",min:"1",max:"10",className:"studio-input",value:i,onChange:r=>P(Number(r.target.value))})]})]}),e.jsxs("div",{style:{marginTop:"1.25rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.35rem"},children:[e.jsx("span",{children:"Bucket Fill Level:"}),e.jsxs("strong",{children:[o.toFixed(1)," / ",t," Tokens (",h,"%)"]})]}),e.jsx("div",{style:{width:"100%",height:"20px",background:"#21262d",borderRadius:"9999px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${h}%`,height:"100%",background:h>25?"#388bfd":"#f85149",transition:"width 0.3s ease, background 0.3s ease"}})})]}),e.jsxs("div",{className:"studio-btn-group",children:[e.jsxs("button",{className:"studio-btn btn-primary",onClick:()=>p(1),children:[e.jsx(I,{size:16})," 1 Request"]}),e.jsx("button",{className:"studio-btn btn-secondary",onClick:()=>p(5),children:"Burst (5 Calls)"}),e.jsxs("button",{className:"studio-btn btn-danger",onClick:()=>p(12),children:[e.jsx(O,{size:16})," Spam (12 Calls)"]}),e.jsxs("button",{className:"studio-btn btn-secondary",onClick:$,children:[e.jsx(A,{size:16})," Reset"]})]})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Traffic Stats & Rejection Inspector"}),e.jsxs("div",{style:{display:"flex",gap:"1rem",marginBottom:"1rem"},children:[e.jsxs("div",{style:{flex:1,padding:"0.75rem",background:"rgba(35, 134, 54, 0.1)",borderRadius:"0.375rem",border:"1px solid #238636"},children:[e.jsx("div",{style:{fontSize:"0.75rem",color:"#3fb950"},children:"200 OK (Allowed)"}),e.jsx("div",{style:{fontSize:"1.5rem",fontWeight:700,color:"#3fb950"},children:q})]}),e.jsxs("div",{style:{flex:1,padding:"0.75rem",background:"rgba(218, 54, 51, 0.1)",borderRadius:"0.375rem",border:"1px solid #da3633"},children:[e.jsx("div",{style:{fontSize:"0.75rem",color:"#f85149"},children:"429 Rejected (Blocked)"}),e.jsx("div",{style:{fontSize:"1.5rem",fontWeight:700,color:"#f85149"},children:B})]})]}),E&&e.jsxs("div",{style:{background:"#0d1117",border:"1px solid #da3633",borderRadius:"0.375rem",padding:"0.75rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.4rem",color:"#f85149",fontSize:"0.8rem",fontWeight:600,marginBottom:"0.4rem"},children:[e.jsx(W,{size:14})," RFC 7807 Problem Details Response (HTTP 429)"]}),e.jsx("pre",{style:{margin:0,fontSize:"0.75rem",color:"#e6edf3",overflowX:"auto"},children:JSON.stringify({type:"https://example.com/probs/rate-limit-exceeded",title:"Rate Limit Exceeded",status:429,detail:`Token bucket depleted. Capacity: ${t}, current tokens: ${o.toFixed(1)}. Please retry after 1s.`,instance:"/api/v1/orders"},null,2)})]})]})]}),e.jsxs("div",{style:{marginTop:"1.5rem"},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Polyglot Code Implementation"}),e.jsx(D,{snippets:M})]})]})};z.__docgenInfo={description:"",methods:[],displayName:"RateLimiterSimulator",props:{capacity:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"10",computed:!1}},refillPerSecond:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"2",computed:!1}}}};const K={title:"Resilience/RateLimiter",component:z,parameters:{layout:"centered",docs:{description:{component:"Interactive Token Bucket visualizer demonstrating token leakage, replenishment, burst traffic, and RFC 7807 429 Problem Details generation."}}},tags:["autodocs"],argTypes:{capacity:{control:{type:"number",min:2,max:30}},refillPerSecond:{control:{type:"number",min:1,max:10}}}},l={args:{capacity:10,refillPerSecond:2}},d={args:{capacity:25,refillPerSecond:5}};var g,b,k;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    capacity: 10,
    refillPerSecond: 2
  }
}`,...(k=(b=l.parameters)==null?void 0:b.docs)==null?void 0:k.source}}};var j,v,R;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    capacity: 25,
    refillPerSecond: 5
  }
}`,...(R=(v=d.parameters)==null?void 0:v.docs)==null?void 0:R.source}}};const Q=["Default","HighCapacity"];export{l as Default,d as HighCapacity,Q as __namedExportsOrder,K as default};
