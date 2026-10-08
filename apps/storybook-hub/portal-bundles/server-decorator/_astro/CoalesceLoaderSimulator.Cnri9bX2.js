import{r as e,t}from"./react.yIOJJ3r4.js";import{n,t as r}from"./jsx-runtime.JMAt2w8r.js";import{t as i}from"./refresh-cw.DyipJcV5.js";import{t as a}from"./PolyglotCodeTabs.1K7Ixw4G.js";var o={name:`arrow-down`,size:24,node:[[`path`,{d:`M12 5v14`,key:`s699le`}],[`path`,{d:`m19 12-7 7-7-7`,key:`1idqje`}]]};o.node;var s=n(o),c={name:`database`,size:24,node:[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`,key:`msslwz`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`,key:`1wlel7`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`,key:`mv7ke4`}]]};c.node;var l=n(c),u={name:`layers`,size:24,node:[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]],aliases:[`layers-3`]};u.node;var d=n(u),f={name:`sparkles`,size:24,node:[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]],aliases:[`stars`]};f.node;var p=n(f),m={name:`user`,size:24,node:[[`path`,{d:`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`,key:`975kel`}],[`circle`,{cx:`12`,cy:`7`,r:`4`,key:`17ys0d`}]]};m.node;var h=n(m),g=e(t(),1),_=r(),v=()=>{let e=[{id:`u_1`,name:`Alice`,role:`Admin`},{id:`u_2`,name:`Bob`,role:`Engineer`},{id:`u_3`,name:`Carol`,role:`Designer`},{id:`u_4`,name:`Dave`,role:`Support`}],[t,n]=(0,g.useState)([]),[r,o]=(0,g.useState)([]),[c,u]=(0,g.useState)(0),f=e=>{u(e=>e+1),n(t=>[...t,e])},m=()=>{let e=[`u_1`,`u_2`,`u_1`,`u_3`,`u_2`,`u_4`,`u_1`,`u_3`];u(t=>t+e.length),n(t=>[...t,...e])},v=()=>{if(t.length===0)return;let e=Array.from(new Set(t));o(t=>[[...e],...t.slice(0,5)]),n([])},y=()=>{n([]),o([]),u(0)},b=r.length,x=c>0?Math.round((c-Math.max(1,b))/c*100):0;return(0,_.jsxs)(`div`,{className:`studio-card`,children:[(0,_.jsxs)(`div`,{className:`studio-header`,children:[(0,_.jsxs)(`h3`,{className:`studio-title`,children:[(0,_.jsx)(d,{size:22,color:`#3fb950`}),` Reactive Call Coalescing / DataLoader Simulator`]}),(0,_.jsx)(`span`,{className:`studio-badge badge-green`,children:x>0?`${x}% I/O Calls Saved`:`Ready`})]}),(0,_.jsxs)(`div`,{className:`studio-grid`,children:[(0,_.jsxs)(`div`,{className:`studio-panel`,children:[(0,_.jsx)(`div`,{style:{fontSize:`0.875rem`,fontWeight:600,marginBottom:`0.75rem`,color:`#8b949e`},children:`Click entities to simulate concurrent consumer requests:`}),(0,_.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`0.5rem`,marginBottom:`1rem`},children:e.map(e=>(0,_.jsxs)(`button`,{className:`studio-btn btn-secondary`,style:{justifyContent:`flex-start`,padding:`0.6rem 0.75rem`},onClick:()=>f(e.id),children:[(0,_.jsx)(h,{size:16,color:`#58a6ff`}),(0,_.jsxs)(`div`,{style:{textAlign:`left`,lineHeight:1.2},children:[(0,_.jsx)(`div`,{style:{fontWeight:600},children:e.name}),(0,_.jsxs)(`div`,{style:{fontSize:`0.7rem`,color:`#8b949e`},children:[`ID: `,e.id]})]})]},e.id))}),(0,_.jsxs)(`div`,{className:`studio-btn-group`,children:[(0,_.jsxs)(`button`,{className:`studio-btn btn-primary`,onClick:m,children:[(0,_.jsx)(p,{size:16}),` Burst 8 Concurrent Requests`]}),(0,_.jsxs)(`button`,{className:`studio-btn btn-accent`,onClick:v,disabled:t.length===0,children:[(0,_.jsx)(s,{size:16}),` Dispatch Microtask Batch (`,t.length,`)`]}),(0,_.jsxs)(`button`,{className:`studio-btn btn-secondary`,onClick:y,children:[(0,_.jsx)(i,{size:16}),` Reset`]})]})]}),(0,_.jsxs)(`div`,{className:`studio-panel`,children:[(0,_.jsx)(`div`,{style:{fontSize:`0.875rem`,fontWeight:600,marginBottom:`0.5rem`,color:`#8b949e`},children:`Batch Execution Inspector`}),(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`1rem`,marginBottom:`1rem`},children:[(0,_.jsxs)(`div`,{style:{flex:1,padding:`0.6rem`,background:`#0d1117`,borderRadius:`0.375rem`,border:`1px solid #21262d`},children:[(0,_.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#8b949e`},children:`Client Function Calls`}),(0,_.jsx)(`div`,{style:{fontSize:`1.4rem`,fontWeight:700,color:`#e6edf3`},children:c})]}),(0,_.jsxs)(`div`,{style:{flex:1,padding:`0.6rem`,background:`#0d1117`,borderRadius:`0.375rem`,border:`1px solid #21262d`},children:[(0,_.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#3fb950`},children:`Batched DB Queries`}),(0,_.jsx)(`div`,{style:{fontSize:`1.4rem`,fontWeight:700,color:`#3fb950`},children:b})]})]}),t.length>0&&(0,_.jsxs)(`div`,{style:{padding:`0.6rem`,background:`rgba(210, 153, 34, 0.1)`,border:`1px solid #bb8009`,borderRadius:`0.375rem`,marginBottom:`0.75rem`,fontSize:`0.8rem`,color:`#d29922`},children:[`Pending in Event Loop Microtask Tick: [`,t.join(`, `),`]`]}),(0,_.jsx)(`div`,{className:`studio-log-box`,style:{maxHeight:`130px`},children:r.length===0?(0,_.jsx)(`div`,{style:{fontStyle:`italic`,color:`#8b949e`},children:`No batches dispatched yet.`}):r.map((e,t)=>(0,_.jsxs)(`div`,{className:`log-entry log-success`,children:[(0,_.jsx)(l,{size:12,style:{display:`inline`,marginRight:`0.3rem`}}),`SELECT * FROM users WHERE id IN (`,e.map(e=>`'${e}'`).join(`, `),`)`]},t))})]})]}),(0,_.jsxs)(`div`,{style:{marginTop:`1.5rem`},children:[(0,_.jsx)(`h4`,{style:{fontSize:`0.95rem`,fontWeight:600,marginBottom:`0.5rem`,color:`#8b949e`},children:`Polyglot Code Implementation`}),(0,_.jsx)(a,{snippets:{typescript:`// TypeScript / Node
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
let user1 = loader.load("u_1").await;`}})]})]})};export{v as CoalesceLoaderSimulator};