import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as o}from"./index-yBBFVILh.js";import{P as $}from"./PolyglotCodeTabs-CpfL-mTW.js";import{c as l}from"./studio-bK5yTmUK.js";import{P as O}from"./play-BOf30kar.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v={name:"circle-stop",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["rect",{x:"9",y:"9",width:"6",height:"6",rx:"1",key:"1ssd4o"}]],aliases:["stop-circle"]};v.node;const P=l(v);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L={name:"heart",size:24,node:[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]]};L.node;const q=l(L);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w={name:"lock-open",size:24,node:[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 9.9-1",key:"1mm8w8"}]],aliases:["unlock"]};w.node;const H=l(w);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T={name:"lock",size:24,node:[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]};T.node;const B=l(T);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"octagon-alert",size:24,node:[["path",{d:"M12 16h.01",key:"1drbdi"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",key:"1fd625"}]],aliases:["alert-octagon"]};j.node;const U=l(j),_=({initialTtlMs:N=3e3})=>{const[t,E]=o.useState(N),[s,h]=o.useState(!1),[g,d]=o.useState(0),[S,p]=o.useState(!1),[u,k]=o.useState(!0),[R,f]=o.useState(0),[W,D]=o.useState(['Lock "lock:order:101" is currently idle in Redis.']),n=o.useRef(null),a=o.useRef(null),i=r=>{D(c=>[`[${new Date().toLocaleTimeString()}] ${r}`,...c.slice(0,15)])},M=()=>{if(s){i("Worker 1 already holds the lock.");return}h(!0),k(!0),d(t),f(0),p(!1),i(`Acquired lock token with initial TTL: ${t}ms. Heartbeat watchdog running every ${Math.floor(t/3)}ms.`)};o.useEffect(()=>{if(s)return n.current=setInterval(()=>{d(r=>r<=100?(clearInterval(n.current),h(!1),i("LOCK EXPIRED! TTL hit 0 (watchdog was stopped or lost)."),0):r-100)},100),()=>{n.current&&clearInterval(n.current)}},[s]),o.useEffect(()=>{if(s&&u){const r=Math.floor(t/3);return a.current=setInterval(()=>{d(t),f(c=>c+1),i(`Watchdog pulse: evaluated RENEW_LOCK_LUA in Redis. Extended TTL back to ${t}ms.`)},r),()=>{a.current&&clearInterval(a.current)}}},[s,u,t]);const C=()=>{k(!1),a.current&&clearInterval(a.current),i("SIMULATION: Worker process hung / watchdog crashed! Watchdog stopped. Lock will expire when remaining TTL hits 0.")},I=()=>{s?(p(!0),i('Worker 2 attempted SET NX PX "lock:order:101" -> REJECTED: LockAcquisitionError (Contention)!'),setTimeout(()=>p(!1),2e3)):i("Worker 2 attempted acquisition -> SUCCESS! Lock acquired by Worker 2.")},z=()=>{n.current&&clearInterval(n.current),a.current&&clearInterval(a.current),h(!1),d(0),k(!0),i("Evaluated RELEASE_LOCK_LUA in Redis. Lock cleanly released.")},A={typescript:`// TypeScript / Node
import { withDistributedLock, LockAcquisitionError } from '@montionugera/server-decorator';

const processOrder = withDistributedLock('lock:order:101', async (orderId: string) => {
  // Watchdog automatically extends lock TTL while this async function runs!
  await performHeavyComputation();
  return { status: 'processed' };
}, {
  ttlMs: ${t},
  autoRenew: true,
  waitTimeoutMs: 500 // Fail fast or wait
});`,python:`# Python
from server_decorator import distributed_lock

@distributed_lock("lock:order:101", ttl_ms=${t}, auto_renew=True)
async def process_order(order_id: str):
    await heavy_computation()`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

err := lockManager.WithDistributedLock(ctx, "lock:order:101", core.LockOptions{
    TTL:       ${t} * time.Millisecond,
    AutoRenew: true,
}, func() error {
    return processOrder(orderId)
})`,nim:`// Nim
import server_decorator/distlock

withLock("lock:order:101", ttlMs = ${t}, autoRenew = true):
  processOrder(orderId)`,rust:`// Rust
use server_decorator_core::distlock::{with_distributed_lock, LockOptions};

let res = with_distributed_lock("lock:order:101", LockOptions {
    ttl: Duration::from_millis(${t}),
    auto_renew: true,
}, || async {
    process_order(order_id).await
}).await;`};return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(B,{size:22,color:"#f0883e"})," Distributed Lock & Watchdog Simulator"]}),e.jsx("span",{className:`studio-badge ${s?"badge-amber":"badge-green"}`,children:s?"Lock Held":"Lock Free"})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"studio-controls",children:[e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Lock Base TTL (ms):"}),e.jsx("input",{type:"number",min:"1000",step:"500",max:"10000",className:"studio-input",value:t,onChange:r=>E(Number(r.target.value))})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Watchdog Interval:"}),e.jsxs("span",{style:{fontSize:"0.85rem",color:"#58a6ff"},children:["Every ~",Math.floor(t/3),"ms (TTL / 3)"]})]})]}),e.jsxs("div",{style:{marginTop:"1.25rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.35rem"},children:[e.jsx("span",{children:"Remaining TTL:"}),e.jsxs("strong",{children:[g,"ms"]})]}),e.jsx("div",{style:{width:"100%",height:"14px",background:"#21262d",borderRadius:"9999px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${g/t*100}%`,height:"100%",background:s?"#f0883e":"#238636",transition:"width 0.1s linear"}})}),s&&u&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.4rem",color:"#3fb950",fontSize:"0.8rem",marginTop:"0.5rem"},children:[e.jsx(q,{size:14,className:"pulse"})," Watchdog active:"," ",R," renewals sent to Redis"]})]}),e.jsxs("div",{className:"studio-btn-group",children:[s?e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"studio-btn btn-secondary",onClick:z,children:[e.jsx(H,{size:16})," Release Lock"]}),u&&e.jsxs("button",{className:"studio-btn btn-danger",onClick:C,children:[e.jsx(U,{size:16})," Simulate Worker Crash"]})]}):e.jsxs("button",{className:"studio-btn btn-primary",onClick:M,children:[e.jsx(O,{size:16})," Acquire Lock (Worker 1)"]}),e.jsxs("button",{className:`studio-btn ${S?"btn-danger":"btn-accent"}`,onClick:I,children:[e.jsx(P,{size:16})," Worker 2: Try Acquire"]})]})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Distributed Lock Events"}),e.jsx("div",{className:"studio-log-box",children:W.map((r,c)=>e.jsx("div",{className:"log-entry",style:{color:r.includes("REJECTED")?"#f85149":r.includes("pulse")?"#3fb950":"#c9d1d9"},children:r},c))})]})]}),e.jsxs("div",{style:{marginTop:"1.5rem"},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Polyglot Code Implementation"}),e.jsx($,{snippets:A})]})]})};_.__docgenInfo={description:"",methods:[],displayName:"DistributedLockSimulator",props:{initialTtlMs:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"3000",computed:!1}}}};const G={title:"Resilience/DistributedLock",component:_,parameters:{layout:"centered",docs:{description:{component:"Distributed Lock and Heartbeat Watchdog simulator demonstrating lease renewal at TTL/3 and lock safety under process failure."}}},tags:["autodocs"],argTypes:{initialTtlMs:{control:{type:"number",step:500,min:1e3,max:1e4}}}},m={args:{initialTtlMs:3e3}};var x,y,b;m.parameters={...m.parameters,docs:{...(x=m.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    initialTtlMs: 3000
  }
}`,...(b=(y=m.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};const Q=["Default"];export{m as Default,Q as __namedExportsOrder,G as default};
