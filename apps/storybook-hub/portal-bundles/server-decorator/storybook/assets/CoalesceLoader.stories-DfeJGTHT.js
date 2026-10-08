import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as c}from"./index-yBBFVILh.js";import{P as N}from"./PolyglotCodeTabs-CpfL-mTW.js";import{c as o}from"./studio-bK5yTmUK.js";import{R as D}from"./refresh-cw-B4Yn5L62.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x={name:"arrow-down",size:24,node:[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]};x.node;const L=o(x);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b={name:"database",size:24,node:[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]};b.node;const E=o(b);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f={name:"layers",size:24,node:[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],aliases:["layers-3"]};f.node;const q=o(f);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _={name:"sparkles",size:24,node:[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],aliases:["stars"]};_.node;const M=o(_);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"user",size:24,node:[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]};j.node;const I=o(j),v=()=>{const k=[{id:"u_1",name:"Alice",role:"Admin"},{id:"u_2",name:"Bob",role:"Engineer"},{id:"u_3",name:"Carol",role:"Designer"},{id:"u_4",name:"Dave",role:"Support"}],[r,a]=c.useState([]),[d,m]=c.useState([]),[i,l]=c.useState(0),C=s=>{l(t=>t+1),a(t=>[...t,s])},S=()=>{const s=["u_1","u_2","u_1","u_3","u_2","u_4","u_1","u_3"];l(t=>t+s.length),a(t=>[...t,...s])},w=()=>{if(r.length===0)return;const s=Array.from(new Set(r));m(t=>[[...s],...t.slice(0,5)]),a([])},z=()=>{a([]),m([]),l(0)},u=d.length,h=i>0?Math.round((i-Math.max(1,u))/i*100):0,B={typescript:`// TypeScript / Node
import { withBatchLoad } from '@montionugera/server-decorator';

// Microservice callers use standard single-fetch signature:
export const getUserById = withBatchLoad(async (ids: string[]) => {
  console.log('Fired single batched database query for:', ids);
  return await db.query('SELECT * FROM users WHERE id IN (?)', [ids]);
});

// Elsewhere in parallel resolvers:
const [u1, u2, u3] = await Promise.all([
  getUserById('u_1'),
  getUserById('u_2'),
  getUserById('u_1') // Deduped & coalesced!
]);`,python:`# Python
from server_decorator import batch_load

@batch_load
async def get_user_by_id(ids: list[str]):
    return await db.fetch_all("SELECT * FROM users WHERE id = ANY($1)", ids)`,go:`// Go
import "github.com/montionugera/node-server-decorator/go/core"

loader := core.NewBatchLoader(func(ctx context.Context, keys []string) ([]User, error) {
    return db.FindUsersByIDs(ctx, keys)
})
user1, _ := loader.Load(ctx, "u_1")
user2, _ := loader.Load(ctx, "u_2")`,nim:`// Nim
import server_decorator/coalesce

let loader = newBatchLoader(proc(ids: seq[string]): Future[seq[User]] {.async.} =
  return await db.queryUsers(ids)
)
let u1 = await loader.load("u_1")`,rust:`// Rust
use server_decorator_core::coalesce::CoalesceLoader;

let loader = CoalesceLoader::new(|ids: Vec<String>| async move {
    db::find_users_by_ids(&ids).await
});
let user1 = loader.load("u_1").await;`};return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(q,{size:22,color:"#3fb950"})," Reactive Call Coalescing / DataLoader Simulator"]}),e.jsx("span",{className:"studio-badge badge-green",children:h>0?`${h}% I/O Calls Saved`:"Ready"})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.75rem",color:"#8b949e"},children:"Click entities to simulate concurrent consumer requests:"}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"1rem"},children:k.map(s=>e.jsxs("button",{className:"studio-btn btn-secondary",style:{justifyContent:"flex-start",padding:"0.6rem 0.75rem"},onClick:()=>C(s.id),children:[e.jsx(I,{size:16,color:"#58a6ff"}),e.jsxs("div",{style:{textAlign:"left",lineHeight:1.2},children:[e.jsx("div",{style:{fontWeight:600},children:s.name}),e.jsxs("div",{style:{fontSize:"0.7rem",color:"#8b949e"},children:["ID: ",s.id]})]})]},s.id))}),e.jsxs("div",{className:"studio-btn-group",children:[e.jsxs("button",{className:"studio-btn btn-primary",onClick:S,children:[e.jsx(M,{size:16})," Burst 8 Concurrent Requests"]}),e.jsxs("button",{className:"studio-btn btn-accent",onClick:w,disabled:r.length===0,children:[e.jsx(L,{size:16})," Dispatch Microtask Batch (",r.length,")"]}),e.jsxs("button",{className:"studio-btn btn-secondary",onClick:z,children:[e.jsx(D,{size:16})," Reset"]})]})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsx("div",{style:{fontSize:"0.875rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Batch Execution Inspector"}),e.jsxs("div",{style:{display:"flex",gap:"1rem",marginBottom:"1rem"},children:[e.jsxs("div",{style:{flex:1,padding:"0.6rem",background:"#0d1117",borderRadius:"0.375rem",border:"1px solid #21262d"},children:[e.jsx("div",{style:{fontSize:"0.75rem",color:"#8b949e"},children:"Client Function Calls"}),e.jsx("div",{style:{fontSize:"1.4rem",fontWeight:700,color:"#e6edf3"},children:i})]}),e.jsxs("div",{style:{flex:1,padding:"0.6rem",background:"#0d1117",borderRadius:"0.375rem",border:"1px solid #21262d"},children:[e.jsx("div",{style:{fontSize:"0.75rem",color:"#3fb950"},children:"Batched DB Queries"}),e.jsx("div",{style:{fontSize:"1.4rem",fontWeight:700,color:"#3fb950"},children:u})]})]}),r.length>0&&e.jsxs("div",{style:{padding:"0.6rem",background:"rgba(210, 153, 34, 0.1)",border:"1px solid #bb8009",borderRadius:"0.375rem",marginBottom:"0.75rem",fontSize:"0.8rem",color:"#d29922"},children:["Pending in Event Loop Microtask Tick: [",r.join(", "),"]"]}),e.jsx("div",{className:"studio-log-box",style:{maxHeight:"130px"},children:d.length===0?e.jsx("div",{style:{fontStyle:"italic",color:"#8b949e"},children:"No batches dispatched yet."}):d.map((s,t)=>e.jsxs("div",{className:"log-entry log-success",children:[e.jsx(E,{size:12,style:{display:"inline",marginRight:"0.3rem"}}),"SELECT * FROM users WHERE id IN (",s.map(R=>`'${R}'`).join(", "),")"]},t))})]})]}),e.jsxs("div",{style:{marginTop:"1.5rem"},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:600,marginBottom:"0.5rem",color:"#8b949e"},children:"Polyglot Code Implementation"}),e.jsx(N,{snippets:B})]})]})};v.__docgenInfo={description:"",methods:[],displayName:"CoalesceLoaderSimulator"};const P={title:"Resilience/CoalesceLoader",component:v,parameters:{layout:"centered",docs:{description:{component:"Interactive DataLoader & Reactive Call Coalescing simulator demonstrating event-loop microtask tick batching and singleflight database query reduction."}}},tags:["autodocs"]},n={};var g,p,y;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:"{}",...(y=(p=n.parameters)==null?void 0:p.docs)==null?void 0:y.source}}};const $=["Default"];export{n as Default,$ as __namedExportsOrder,P as default};
