import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as m}from"./index-yBBFVILh.js";import{c as i}from"./studio-bK5yTmUK.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v={name:"box",size:24,node:[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]};v.node;const A=i(v);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"code",size:24,node:[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]]};j.node;const O=i(j);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b={name:"file-text",size:24,node:[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]};b.node;const q=i(b);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S={name:"globe",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]};S.node;const w=i(S);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};$.node;const T=i($);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f={name:"square-check-big",size:24,node:[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],aliases:["check-square"]};f.node;const P=i(f);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};k.node;const F=i(k),N=()=>{const[a,z]=m.useState("User"),[l,C]=m.useState("users"),[n,c]=m.useState("ir"),[r,p]=m.useState([{id:"1",name:"id",type:"str",role:"id",format:"uuid",readonly:!0},{id:"2",name:"email",type:"str",format:"email",required:!0},{id:"3",name:"displayName",type:"str",required:!0},{id:"4",name:"role",type:"enum",required:!0},{id:"5",name:"loginCount",type:"int",readonly:!0},{id:"6",name:"createdAt",type:"datetime",readonly:!0}]),_=()=>{const t=String(Date.now());p(s=>[...s,{id:t,name:`field${s.length+1}`,type:"str",required:!1}])},M=t=>{p(s=>s.filter(d=>d.id!==t))},D={entity:a,path:l,transports:["rest"],fields:r.map(t=>{const s={name:t.name,type:t.type};return t.role&&(s.role=t.role),t.format&&(s.format=t.format),t.readonly&&(s.readonly=!0),!t.required&&!t.readonly&&(s.optional=!0),t.type==="enum"&&(s.values=["admin","member","guest"]),s}),actions:[{name:"activate",desc:"Activate user account"},{name:"archive",desc:"Archive user record"}]},E={openapi:"3.1.0",info:{title:`${a} Service API`,version:"2.0.17"},paths:{[`/${l}`]:{get:{summary:`List ${a}s`,responses:{200:{description:"Success"}}},post:{summary:`Create ${a}`,responses:{201:{description:"Created"}}}},[`/${l}/{id}`]:{get:{summary:`Get ${a} by ID`,responses:{200:{description:"Found"}}},patch:{summary:`Update ${a}`,responses:{200:{description:"Updated"}}},delete:{summary:`Delete ${a}`,responses:{204:{description:"Deleted"}}}}},components:{schemas:{[`${a}Read`]:{type:"object",properties:Object.fromEntries(r.map(t=>[t.name,{type:t.type==="int"?"integer":"string",format:t.format}]))}}}},R=`// Generated TypeScript Zod DTO
import { z } from 'zod';

export const ${a}CreateSchema = z.object({
${r.filter(t=>!t.readonly).map(t=>`  ${t.name}: z.${t.type==="int"?"number().int()":"string()"}${t.format==="email"?".email()":""}${t.required?"":".optional()"},`).join(`
`)}
});

export const ${a}UpdateSchema = ${a}CreateSchema.partial();
export type ${a}CreateDTO = z.infer<typeof ${a}CreateSchema>;`,I=`// Multi-Framework Mount Code
// 1. Express (Node):
import { mountExpressRoutes } from '@montionugera/server-decorator/express';
mountExpressRoutes(app, ${a}Spec, new ${a}Service());

// 2. FastAPI (Python):
# mount_fastapi_routes(router, ${a}Spec, ${a}Service())

// 3. Gin (Go):
// ginadapter.Mount(router, ${a}Spec, ${a}Handler)

// 4. Axum (Rust):
// let app = Router::new().merge(mount_entity_routes::<${a}Handler>(spec));`;return e.jsxs("div",{className:"studio-card",children:[e.jsxs("div",{className:"studio-header",children:[e.jsxs("h3",{className:"studio-title",children:[e.jsx(A,{size:22,color:"#58a6ff"})," EntitySpec Studio & Polyglot Compiler"]}),e.jsx("span",{className:"studio-badge badge-blue",children:"Interactive Schema Studio"})]}),e.jsxs("div",{className:"studio-grid",children:[e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"studio-controls",style:{marginBottom:"1rem"},children:[e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"Entity Name:"}),e.jsx("input",{type:"text",className:"studio-input",value:a,onChange:t=>z(t.target.value)})]}),e.jsxs("div",{className:"studio-control-row",children:[e.jsx("span",{className:"studio-control-label",children:"REST API Path:"}),e.jsx("input",{type:"text",className:"studio-input",value:l,onChange:t=>C(t.target.value)})]})]}),e.jsxs("div",{style:{fontSize:"0.85rem",fontWeight:600,marginBottom:"0.5rem",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("span",{children:["Entity Fields (",r.length,"):"]}),e.jsxs("button",{className:"studio-btn btn-secondary",style:{padding:"0.2rem 0.5rem",fontSize:"0.75rem"},onClick:_,children:[e.jsx(T,{size:12})," Add Field"]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"220px",overflowY:"auto"},children:r.map(t=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",background:"#0d1117",padding:"0.4rem 0.6rem",borderRadius:"0.375rem",border:"1px solid #21262d",fontSize:"0.8rem"},children:[e.jsx("input",{type:"text",className:"studio-input",style:{width:"90px",padding:"0.2rem 0.4rem"},value:t.name,onChange:s=>{const d=s.target.value;p(y=>y.map(o=>o.id===t.id?{...o,name:d}:o))}}),e.jsxs("select",{className:"studio-input",style:{padding:"0.2rem 0.4rem"},value:t.type,onChange:s=>{const d=s.target.value;p(y=>y.map(o=>o.id===t.id?{...o,type:d}:o))},children:[e.jsx("option",{value:"str",children:"str"}),e.jsx("option",{value:"int",children:"int"}),e.jsx("option",{value:"bool",children:"bool"}),e.jsx("option",{value:"datetime",children:"datetime"}),e.jsx("option",{value:"enum",children:"enum"})]}),t.readonly?e.jsx("span",{className:"studio-badge badge-amber",style:{fontSize:"0.65rem"},children:"readonly"}):t.required?e.jsx("span",{className:"studio-badge badge-blue",style:{fontSize:"0.65rem"},children:"required"}):e.jsx("span",{style:{fontSize:"0.7rem",color:"#8b949e"},children:"optional"}),r.length>1&&e.jsx("button",{onClick:()=>M(t.id),style:{background:"transparent",border:"none",color:"#8b949e",cursor:"pointer",marginLeft:"auto"},children:e.jsx(F,{size:14})})]},t.id))})]}),e.jsxs("div",{className:"studio-panel",children:[e.jsxs("div",{className:"polyglot-tabs-header",children:[e.jsxs("button",{className:`polyglot-tab-btn ${n==="ir"?"active":""}`,onClick:()=>c("ir"),children:[e.jsx(q,{size:12,style:{display:"inline",marginRight:"0.3rem"}})," ","Canonical IR"]}),e.jsxs("button",{className:`polyglot-tab-btn ${n==="openapi"?"active":""}`,onClick:()=>c("openapi"),children:[e.jsx(w,{size:12,style:{display:"inline",marginRight:"0.3rem"}})," ","OpenAPI 3.1"]}),e.jsxs("button",{className:`polyglot-tab-btn ${n==="dto"?"active":""}`,onClick:()=>c("dto"),children:[e.jsx(P,{size:12,style:{display:"inline",marginRight:"0.3rem"}})," ","DTO Validator"]}),e.jsxs("button",{className:`polyglot-tab-btn ${n==="server"?"active":""}`,onClick:()=>c("server"),children:[e.jsx(O,{size:12,style:{display:"inline",marginRight:"0.3rem"}})," ","REST Routers"]})]}),e.jsx("pre",{className:"polyglot-code-block",style:{maxHeight:"250px"},children:e.jsxs("code",{children:[n==="ir"&&JSON.stringify(D,null,2),n==="openapi"&&JSON.stringify(E,null,2),n==="dto"&&R,n==="server"&&I]})})]})]})]})};N.__docgenInfo={description:"",methods:[],displayName:"EntitySpecStudio"};const B={title:"EntitySpec/Studio",component:N,parameters:{layout:"padded",docs:{description:{component:"Interactive visual entity schema designer and multi-language compiler. Generates Canonical EntitySpec IR, OpenAPI 3.1 JSON, DTO validators, and REST router mounting code in real-time."}}},tags:["autodocs"]},u={};var h,g,x;u.parameters={...u.parameters,docs:{...(h=u.parameters)==null?void 0:h.docs,source:{originalSource:"{}",...(x=(g=u.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};const L=["Default"];export{u as Default,L as __namedExportsOrder,B as default};
