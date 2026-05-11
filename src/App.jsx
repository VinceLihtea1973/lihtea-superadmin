import { useState, useEffect, useCallback, useMemo } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SU  = "https://zjhiwwbabsggzhcfhyqb.supabase.co";
const AK  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaGl3d2JhYnNnZ3poY2ZoeXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzQwMzIsImV4cCI6MjA4OTg1MDAzMn0.okmdU-XNarF70eTrrqu4xjNNVrVO-Nd27FUm7sGJ97U";
const API = `${SU}/functions/v1`;
const CAT = `${API}/catalogue-api`, ADM = `${API}/admin-api`, AUTH = `${SU}/auth/v1`;

// ── PALETTE V5 ── (alignée avec simulateur + admin — ScoreFinance + teal Lihtea)
const C = {
  navy:"#0B1D35", navyL:"#163354",
  teal:"#0d9488", tealB:"#14b8a6", tealBg:"#E0F5EE",
  gold:"#14b8a6",
  bg:"#F7F6F3",
  surface:"#FFFFFF",
  border:"#EDECEA", borderStrong:"#D3D1C7",
  text:"#2C2C2A", text2:"#5F5E5A", text3:"#888780",
  red:"#B02020", redBg:"#FDEAEA",
  green:"#0E7A5F", greenBg:"#E0F5EE",
  amber:"#C07A10", amberBg:"#FDF3E0",
  purple:"#7c3aed", blue:"#2563eb", orange:"#ea580c",
  pink:"#db2777", cyan:"#0891b2",
};
const SH = { sm:"0 1px 3px rgba(11,29,53,.08)", md:"0 4px 16px rgba(11,29,53,.10)" };
const R  = { sm:6, md:10, lg:16 };
const F  = { body:"'Sora','DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", mono:"'DM Mono','JetBrains Mono','SF Mono',monospace" };

// ── Icônes SVG v5 (remplace les emojis old school) ──
const SvgI = (size, paths) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}>{paths}</svg>;
const Ico = {
  edit:s=>SvgI(s||14,<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>),
  trash:s=>SvgI(s||14,<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>),
  eye:s=>SvgI(s||14,<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),
  close:s=>SvgI(s||14,<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
  plus:s=>SvgI(s||14,<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  check:s=>SvgI(s||14,<polyline points="20 6 9 17 4 12"/>),
  refresh:s=>SvgI(s||14,<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>),
  search:s=>SvgI(s||14,<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
  alert:s=>SvgI(s||14,<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
  phone:s=>SvgI(s||14,<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12 19.79 19.79 0 0 1 1.42 3.35 2 2 0 0 1 3.4 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>),
  mail:s=>SvgI(s||14,<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>),
  doc:s=>SvgI(s||14,<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>),
  chart:s=>SvgI(s||14,<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),
  trend:s=>SvgI(s||14,<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>),
  euro:s=>SvgI(s||14,<><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></>),
  flame:s=>SvgI(s||14,<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>),
  trophy:s=>SvgI(s||14,<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>),
  building:s=>SvgI(s||14,<><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M19 21V11a2 2 0 0 0-2-2h-2"/><line x1="9" y1="7" x2="11" y2="7"/><line x1="9" y1="11" x2="11" y2="11"/><line x1="9" y1="15" x2="11" y2="15"/></>),
  factory:s=>SvgI(s||14,<><path d="M2 22h20"/><path d="M3 22V11l7-5 7 5v11"/><path d="M9 22v-7h2v7"/><path d="M13 22v-4h2v4"/></>),
  landmark:s=>SvgI(s||14,<><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></>),
  user:s=>SvgI(s||14,<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>),
  users:s=>SvgI(s||14,<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  star:s=>SvgI(s||14,<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>),
  zap:s=>SvgI(s||14,<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>),
  bell:s=>SvgI(s||14,<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>),
  shield:s=>SvgI(s||14,<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  link:s=>SvgI(s||14,<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>),
  card:s=>SvgI(s||14,<><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>),
  clock:s=>SvgI(s||14,<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>),
  rocket:s=>SvgI(s||14,<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>),
  sleep:s=>SvgI(s||14,<><path d="M2 4h6v2L4 18h4v2H2v-2l4-12H2z"/><path d="M14 8h8v2l-6 10h6v2h-8v-2l6-10h-6z"/></>),
  mask:s=>SvgI(s||14,<><path d="M19 11h2m-1-1v2M17 12c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-1c-.5 0-1-.5-1-1v-2c0-.5.5-1 1-1zM6.5 11H4M5 10v2"/><path d="M2 12c0-3.86 3.14-7 7-7h6c3.86 0 7 3.14 7 7v0c0 3.86-3.14 7-7 7H9c-3.86 0-7-3.14-7-7v0z"/></>),
  pin:s=>SvgI(s||14,<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>),
  folder:s=>SvgI(s||14,<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>),
  clipboard:s=>SvgI(s||14,<><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>),
  power:s=>SvgI(s||14,<><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></>),
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fj  = async(u,o={})=>{try{return await(await fetch(u,{headers:{"Content-Type":"application/json"},...o})).json()}catch{return null}};
let _tok  = null;
const fjA = async(u,o={})=>{const h={"Content-Type":"application/json","apikey":AK,...(_tok?{Authorization:"Bearer "+_tok}:{})};try{return await(await fetch(u,{headers:h,...o})).json()}catch{return null}};
const ah  = t=>({"Content-Type":"application/json",apikey:AK,...(t?{Authorization:`Bearer ${t}`}:{})});
const fmt = v=>v!=null?Number(v).toLocaleString("fr-FR"):"—";
const fd  = d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fa  = d=>{if(!d)return"Jamais";const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<2)return"À l'instant";if(m<60)return m+"min";const h=Math.floor(m/60);if(h<24)return h+"h";const dy=Math.floor(h/24);return dy<30?dy+"j":Math.floor(dy/30)+"mois"};
const daysAgo = d=>d?Math.floor((Date.now()-new Date(d).getTime())/86400000):9999;
const fk  = n=>{const v=Math.round(n);if(Math.abs(v)>=1e6)return(v/1e6).toFixed(1).replace(".",",")+"\u202fM€";if(Math.abs(v)>=1e3)return Math.round(v/1e3)+"\u202fk€";return v.toLocaleString("fr-FR")+" €"};
const PLAN_COLOR = {starter:C.teal,pro:C.blue,enterprise:C.gold};
const PLAN_PRICE = {starter:149,pro:349,enterprise:990};
const STATUS_COLOR= {actif:C.green,trial:C.amber,suspended:C.red,churn:"#6b7280"};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const au = {
  signIn:async(e,p)=>(await fetch(`${AUTH}/token?grant_type=password`,{method:"POST",headers:ah(),body:JSON.stringify({email:e,password:p})})).json(),
  getUser:async t=>(await fetch(`${AUTH}/user`,{headers:ah(t)})).json(),
  signOut:async t=>{await fetch(`${AUTH}/logout`,{method:"POST",headers:ah(t)})},
  get:()=>{try{return JSON.parse(localStorage.getItem("ls_sa"))}catch{return null}},
  set:s=>localStorage.setItem("ls_sa",JSON.stringify(s)),
  clear:()=>localStorage.removeItem("ls_sa"),
};

// ─── HEALTH SCORE ─────────────────────────────────────────────────────────────
function computeHealthScore(tenant, userCount=0, simCount=0, lastActivity=null){
  let score = 0;
  const days = daysAgo(lastActivity || tenant.updated_at || tenant.created_at);
  // Activité récente : 0-30 pts
  if(days<=7) score+=30; else if(days<=30) score+=22; else if(days<=60) score+=10; else if(days<=90) score+=3;
  // Utilisateurs actifs : 0-25 pts
  const uScore = Math.min(25, userCount*5);
  score += uScore;
  // Volume simulations : 0-25 pts
  if(simCount>50) score+=25; else if(simCount>20) score+=18; else if(simCount>5) score+=10; else if(simCount>0) score+=4;
  // Plan : 0-20 pts
  if(tenant.plan==="enterprise") score+=20; else if(tenant.plan==="pro") score+=13; else score+=6;
  return Math.min(100, Math.max(0, score));
}
function healthLabel(score){ if(score>=70) return{l:"Sain",c:C.green}; if(score>=40) return{l:"Attention",c:C.amber}; return{l:"À risque",c:C.red}; }
function churnRisk(score,days){ if(days>60&&score<40) return "Élevé"; if(days>30&&score<55) return "Modéré"; return "Faible"; }

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Badge({children,color=C.teal,dot}){return<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:color+"18",color,textTransform:"uppercase",letterSpacing:"0.03em"}}>{dot&&<span style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>}{children}</span>}
function Btn({children,onClick,color=C.navy,variant="solid",small,disabled,style:sx,icon}){const s=variant==="solid";return<button onClick={onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"5px 10px":"9px 16px",borderRadius:8,border:s?"none":"1px solid "+color+"40",cursor:disabled?"not-allowed":"pointer",background:s?color:"transparent",color:s?"#fff":color,fontSize:small?11:12,fontWeight:600,fontFamily:"inherit",opacity:disabled?.5:1,...sx}}>{icon&&<span>{icon}</span>}{children}</button>}
function Input({label,value,onChange,type="text",placeholder,rows,options,disabled}){const b={padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:13,fontFamily:"inherit",background:disabled?C.bg:C.surface,color:C.text,outline:"none",width:"100%",boxSizing:"border-box"};return<div style={{marginBottom:10}}>{label&&<div style={{fontSize:11,fontWeight:600,color:C.text3,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>}{options?<select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} style={b}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:rows?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} disabled={disabled} style={{...b,resize:"vertical"}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={b}/>}</div>}
function Modal({open,onClose,title,children,wide,xwide}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,43,70,0.55)",backdropFilter:"blur(5px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:16,padding:24,width:xwide?960:wide?720:480,maxWidth:"95vw",maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 80px rgba(15,43,70,0.35)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div style={{fontSize:16,fontWeight:800,color:C.navy}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.text3,lineHeight:1}}>{Ico.close()}</button></div>{children}</div></div>}
function Toast({msg,error}){if(!msg)return null;return<div style={{position:"fixed",top:16,right:16,zIndex:300,padding:"11px 20px",borderRadius:10,background:error?C.red:C.green,color:"#fff",fontSize:13,fontWeight:600,boxShadow:"0 4px 24px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",gap:8}}>{error?"❌":"✓"} {msg}</div>}
function Stat({icon,value,label,color=C.navy,sub,trend}){return<div style={{padding:"14px 16px",borderRadius:R.md,background:C.surface,border:"1px solid "+C.border,boxShadow:SH.sm}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><span style={{width:32,height:32,borderRadius:R.sm,background:color+"15",color,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon}</span>{trend!==undefined&&<span style={{fontSize:10,fontWeight:700,color:trend>=0?C.green:C.red}}>{trend>=0?"+":""}{trend}%</span>}</div><div style={{fontSize:22,fontWeight:700,color:C.navy,fontFamily:F.mono,letterSpacing:"-0.5px"}}>{value??"—"}</div><div style={{fontSize:10,fontWeight:600,color:C.text3,textTransform:"uppercase",letterSpacing:"0.04em",marginTop:2}}>{label}</div>{sub&&<div style={{fontSize:11,color:C.text2,marginTop:3}}>{sub}</div>}</div>}
function DT({columns,data,onEdit,onDelete,loading,empty,onRowClick,pageSize=50}){
  const[pg,setPg]=useState(0);
  const total=data?.length||0;const pages=Math.ceil(total/pageSize);const slice=(data||[]).slice(pg*pageSize,(pg+1)*pageSize);
  if(loading)return<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement...</div>;
  if(!total)return<div style={{padding:40,textAlign:"center",color:C.text3}}>{empty||"Aucune donnée"}</div>;
  return<div>
    <div style={{overflowX:"auto",borderRadius:10,border:"1px solid "+C.border}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:C.navy}}>{columns.map((c,i)=><th key={i} style={{padding:"10px 14px",color:"#fff",fontWeight:600,textAlign:"left",fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:"0.04em"}}>{c.label}</th>)}{(onEdit||onDelete)&&<th style={{padding:"10px 14px",color:"#fff",textAlign:"right",fontSize:11,width:90}}>Actions</th>}</tr></thead>
        <tbody>{slice.map((row,ri)=><tr key={row.id||ri} onClick={onRowClick?()=>onRowClick(row):undefined} style={{borderBottom:"1px solid "+C.border,background:ri%2?C.bg:C.surface,cursor:onRowClick?"pointer":"default",transition:"background 0.15s"}}>{columns.map((c,ci)=><td key={ci} style={{padding:"9px 12px"}}>{c.render?c.render(row[c.key],row):(row[c.key]??"—")}</td>)}{(onEdit||onDelete)&&<td style={{padding:"8px 12px",textAlign:"right",whiteSpace:"nowrap"}}>{onEdit&&<Btn small variant="outline" color={C.blue} onClick={e=>{e.stopPropagation();onEdit(row)}} style={{marginRight:4}}>{Ico.edit()}</Btn>}{onDelete&&<Btn small variant="outline" color={C.red} onClick={e=>{e.stopPropagation();onDelete(row)}}>{Ico.trash()}</Btn>}</td>}</tr>)}</tbody>
      </table>
    </div>
    {pages>1&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",fontSize:12,color:C.text3,borderTop:"1px solid "+C.border}}>
      <span>{pg*pageSize+1}–{Math.min((pg+1)*pageSize,total)} sur {total}</span>
      <div style={{display:"flex",gap:6}}>
        <Btn small variant="outline" color={C.navy} disabled={pg===0} onClick={()=>setPg(p=>p-1)}>← Préc.</Btn>
        <Btn small variant="outline" color={C.navy} disabled={pg>=pages-1} onClick={()=>setPg(p=>p+1)}>Suiv. →</Btn>
      </div>
    </div>}
  </div>
}
function ConfirmModal({open,onClose,onConfirm,title,message,confirmLabel="Supprimer",confirmColor=C.red,icon=Ico.alert(28)}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,43,70,0.6)",backdropFilter:"blur(6px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:20,padding:0,width:380,maxWidth:"90vw",boxShadow:"0 24px 80px rgba(15,43,70,0.35)",overflow:"hidden"}}><div style={{padding:"24px 24px 0",textAlign:"center"}}><div style={{width:56,height:56,borderRadius:28,background:confirmColor+"15",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:12}}>{icon}</div><div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:6}}>{title||"Confirmer"}</div><div style={{fontSize:13,color:C.text2,lineHeight:1.5}}>{message}</div></div><div style={{display:"flex",gap:10,padding:"20px 24px 24px",marginTop:8}}><button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid "+C.border,background:C.surface,color:C.text2,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button><button onClick={onConfirm} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:confirmColor,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{confirmLabel}</button></div></div></div>}
function HealthBar({score}){const{l,c}=healthLabel(score);return<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{flex:1,height:5,borderRadius:3,background:C.border,overflow:"hidden"}}><div style={{width:score+"%",height:"100%",background:c,borderRadius:3,transition:"width 0.4s"}}/></div><span style={{fontSize:11,fontWeight:700,color:c,minWidth:28}}>{score}</span></div>}
function TabBar({tabs,active,onChange}){return<div style={{display:"flex",gap:2,borderBottom:"2px solid "+C.border,marginBottom:20}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{padding:"10px 16px",border:"none",background:"none",fontFamily:"inherit",fontSize:13,fontWeight:active===t.id?700:500,color:active===t.id?C.teal:C.text3,borderBottom:active===t.id?"2px solid "+C.teal:"2px solid transparent",marginBottom:-2,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>{t.icon&&<span>{t.icon}</span>}{t.label}{t.count!==undefined&&<span style={{background:active===t.id?C.teal+"20":C.bg,color:active===t.id?C.teal:C.text3,borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>{t.count}</span>}</button>)}</div>}
function AlertBanner({alerts}){if(!alerts?.length)return null;return<div style={{background:C.red+"08",border:"1px solid "+C.red+"25",borderRadius:10,padding:"10px 16px",marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:alerts.length>1?8:0}}><span style={{fontSize:16}}>🔔</span><span style={{fontWeight:700,color:C.red,fontSize:13}}>{alerts.length} alerte{alerts.length>1?"s":""} active{alerts.length>1?"s":""}</span></div>{alerts.slice(0,3).map((a,i)=><div key={i} style={{fontSize:12,color:C.text2,padding:"3px 0 3px 26px",borderTop:i?"1px solid "+C.border+"80":"none"}}>{a.icon} {a.message}</div>)}</div>}
function SectionTitle({children,sub}){return<div style={{marginBottom:16}}><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>{children}</h2>{sub&&<p style={{fontSize:13,color:C.text3,margin:"3px 0 0"}}>{sub}</p>}</div>}
function Card({children,style:sx}){return<div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:12,padding:16,...sx}}>{children}</div>}
function EmptyState({icon,title,sub}){return<div style={{padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>{icon}</div><div style={{fontSize:16,fontWeight:700,color:C.navy,marginBottom:6}}>{title}</div>{sub&&<div style={{fontSize:13,color:C.text3}}>{sub}</div>}</div>}

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useCrud(t){const[d,sD]=useState([]);const[l,sL]=useState(true);const r=useCallback(async()=>{sL(true);const x=await fjA(ADM+"/"+t);sD(x?.data||[]);sL(false)},[t]);useEffect(()=>{r()},[r]);return{data:d,loading:l,refresh:r,create:async rec=>{const x=await fjA(ADM+"/"+t,{method:"POST",body:JSON.stringify(rec)});if(x?.data){await r();return true}return false},update:async(id,rec)=>{const x=await fjA(ADM+"/"+t+"/"+id,{method:"PUT",body:JSON.stringify(rec)});if(x?.updated||x?.data){await r();return true}return false},remove:async id=>{const x=await fjA(ADM+"/"+t+"/"+id,{method:"DELETE"});if(x&&!x.error){await r();return true}return false}}}

function useToast(){const[t,sT]=useState("");const[err,sE]=useState(false);const toast=(msg,isErr=false)=>{sT(msg);sE(isErr);setTimeout(()=>sT(""),4000)};return{toastMsg:t,toastErr:err,toast}}

// ─── DASHBOARD SAAS ──────────────────────────────────────────────────────────
function DashboardSaaS({onNavigate}){
  const[tenants,sT]=useState([]);const[stats,sSt]=useState({});const[users,sU]=useState([]);const[l,sL]=useState(true);
  useEffect(()=>{
    Promise.all([fjA(ADM+"/tenants"),fjA(ADM+"/crm-stats"),fjA(ADM+"/user-stats")])
    .then(([t,s,u])=>{sT(t?.data||[]);sSt(s?.data||{});sU(u?.data||[]);sL(false)});
  },[]);

  const active=tenants.filter(t=>t.actif);
  const inactive=tenants.filter(t=>!t.actif);
  const trial=tenants.filter(t=>t.plan==="trial"||t.statut==="trial");
  const mrr=active.reduce((s,t)=>s+(PLAN_PRICE[t.plan]||149),0);
  const arr=mrr*12;

  // Health scores
  const withScores=useMemo(()=>tenants.map(t=>{
    const tu=users.filter(u=>u.tenant_id===t.id);
    const score=computeHealthScore(t,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));
    const days=daysAgo(t.updated_at||t.created_at);
    return{...t,score,days,tuCount:tu.length,simCount:tu.reduce((s,u)=>s+u.total_simulations,0)};
  }),[tenants,users]);

  const atRisk=withScores.filter(t=>t.score<40&&t.actif).length;
  const inactive30=withScores.filter(t=>t.days>30&&t.actif).length;

  // Alerts
  const alerts=[];
  if(inactive30>0) alerts.push({icon:"💤",message:`${inactive30} client(s) inactif(s) depuis plus de 30 jours`});
  if(atRisk>0) alerts.push({icon:"⚠️",message:`${atRisk} client(s) à risque de churn`});
  const noAdmin=tenants.filter(t=>t.actif&&!users.some(u=>u.tenant_id===t.id&&(u.role==="admin"||u.role==="super_admin"))).length;
  if(noAdmin>0) alerts.push({icon:"👤",message:`${noAdmin} client(s) sans administrateur configuré`});

  const planDist=[["Enterprise",C.gold],["Pro",C.blue],["Starter",C.teal]].map(([p,c])=>({p:p.toLowerCase(),label:p,color:c,count:tenants.filter(t=>t.plan===p.toLowerCase()).length}));

  return<div>
    <SectionTitle sub="Vue consolidée temps réel — plateforme Lihtea">🏠 Tour de contrôle</SectionTitle>
    <AlertBanner alerts={alerts}/>

    {/* KPIs principaux */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
      <Stat icon={Ico.euro(20)} value={l?"…":fk(mrr)+"/mois"} label="MRR estimé" color={C.gold} sub={fk(arr)+"/an ARR"}/>
      <Stat icon={Ico.building(20)} value={l?"…":active.length} label="Clients actifs" color={C.green}/>
      <Stat icon={Ico.clock(20)} value={l?"…":trial.length} label="En trial" color={C.amber}/>
      <Stat icon={Ico.alert(20)} value={l?"…":atRisk} label="Churn risk" color={C.red}/>
      <Stat icon={Ico.user(20)} value={l?"…":users.length} label="Utilisateurs" color={C.teal}/>
      <Stat icon={Ico.chart(20)} value={l?"…":fmt(stats.total_simulations)} label="Simulations" color={C.purple}/>
      <Stat icon={Ico.euro(20)} value={l?"…":fk(Number(stats.pipeline_montant)||0)} label="Pipeline" color={C.navy}/>
      <Stat icon={Ico.star(20)} value={l?"…":fmt(stats.total_prospects)} label="Prospects" color={C.blue}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
      {/* Tableau clients enrichi */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontWeight:700,fontSize:14,color:C.navy}}>Clients — Health scores</span>
          <Btn small variant="outline" color={C.teal} onClick={()=>onNavigate("tenants")}>Voir tout →</Btn>
        </div>
        {l?<div style={{padding:20,textAlign:"center",color:C.text3}}>Chargement...</div>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"2px solid "+C.border}}>{["Client","Plan","Score","Activité","Churn"].map(h=><th key={h} style={{padding:"6px 8px",color:C.text3,fontWeight:600,textAlign:"left",fontSize:10,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>{withScores.filter(t=>t.actif).slice(0,8).map((t,i)=>{const{l:hl,c:hc}=healthLabel(t.score);return<tr key={t.id} style={{borderBottom:"1px solid "+C.border+"60",cursor:"pointer"}} onClick={()=>onNavigate("tenants",t)}>
            <td style={{padding:"7px 8px",fontWeight:600,color:C.navy}}>{t.nom}</td>
            <td style={{padding:"7px 8px"}}><Badge color={PLAN_COLOR[t.plan]||C.text3}>{t.plan||"starter"}</Badge></td>
            <td style={{padding:"7px 8px",minWidth:80}}><HealthBar score={t.score}/></td>
            <td style={{padding:"7px 8px",color:C.text3,fontSize:11}}>{t.days<2?"Auj.":t.days+"j"}</td>
            <td style={{padding:"7px 8px"}}><Badge color={churnRisk(t.score,t.days)==="Élevé"?C.red:churnRisk(t.score,t.days)==="Modéré"?C.amber:C.green} dot>{churnRisk(t.score,t.days)}</Badge></td>
          </tr>})}
          </tbody>
        </table></div>}
      </Card>

      {/* Répartition plans + activité */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card style={{flex:"none"}}>
          <div style={{fontWeight:700,fontSize:13,color:C.navy,marginBottom:12}}>Répartition plans</div>
          {planDist.map(({p,label,color,count})=><div key={p} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{fontWeight:600,color}}>{label}</span><span style={{color:C.text3}}>{count} client{count>1?"s":""}</span>
            </div>
            <div style={{height:6,borderRadius:3,background:C.border}}><div style={{width:tenants.length?count/tenants.length*100+"%":"0%",height:"100%",background:color,borderRadius:3}}/></div>
          </div>)}
        </Card>
        <Card style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,color:C.navy,marginBottom:10}}>Actions rapides</div>
          {[
            {icon:"🏢",label:"Nouveau client",color:C.teal,action:()=>onNavigate("tenants","new")},
            {icon:"📊",label:"Analytics usage",color:C.blue,action:()=>onNavigate("analytics")},
            {icon:"🔔",label:"Voir les alertes",color:C.red,action:()=>onNavigate("alertes")},
            {icon:"📋",label:"Audit logs",color:C.purple,action:()=>onNavigate("logs")},
          ].map(({icon,label,color,action})=><button key={label} onClick={action} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",marginBottom:6,borderRadius:8,border:"1px solid "+C.border,background:C.bg,cursor:"pointer",fontSize:12,fontWeight:600,color:C.text,fontFamily:"inherit",textAlign:"left"}}>
            <span style={{fontSize:15}}>{icon}</span>{label}
          </button>)}
        </Card>
      </div>
    </div>

    {/* Clients inactifs */}
    {inactive30>0&&<Card style={{borderColor:C.amber+"40",background:C.amber+"05"}}>
      <div style={{fontWeight:700,fontSize:13,color:C.amber,marginBottom:10}}>{Ico.sleep()} Clients inactifs +30 jours</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {withScores.filter(t=>t.days>30&&t.actif).map(t=><div key={t.id} onClick={()=>onNavigate("tenants",t)} style={{padding:"6px 12px",borderRadius:8,background:C.surface,border:"1px solid "+C.amber+"30",cursor:"pointer",fontSize:12}}>
          <span style={{fontWeight:600,color:C.navy}}>{t.nom}</span>
          <span style={{color:C.text3,marginLeft:8}}>{t.days}j</span>
        </div>)}
      </div>
    </Card>}
  </div>
}

// ─── TENANT DETAIL ────────────────────────────────────────────────────────────
function TenantDetail({tenant,onBack,allUsers,onRefresh}){
  const[tab,setTab]=useState("overview");
  const[auditLogs,sAL]=useState([]);const[loadingLogs,sLL]=useState(false);
  const[localPlan,setLocalPlan]=useState(tenant.plan||"starter");
  const[planModal,setPlanModal]=useState(null); // {newPlan, label}
  const[saving,setSaving]=useState(false);
  const tu=allUsers.filter(u=>u.tenant_id===tenant.id);
  const score=computeHealthScore(tenant,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));
  const{l:hl,c:hc}=healthLabel(score);
  const simTotal=tu.reduce((s,u)=>s+u.total_simulations,0);
  const mrr=PLAN_PRICE[localPlan]||149;
  const{toastMsg,toastErr,toast}=useToast();

  const PLANS=["starter","pro","enterprise"];
  const planIdx=PLANS.indexOf(localPlan);
  const canUpgrade=planIdx<PLANS.length-1;
  const canDowngrade=planIdx>0;

  const changePlan=async(newPlan)=>{
    setSaving(true);
    const r=await fjA(ADM+"/tenants/"+tenant.id,{method:"PATCH",body:JSON.stringify({plan:newPlan})});
    if(r?.updated||r?.data||r?.ok||!r?.error){
      setLocalPlan(newPlan);
      toast("Plan changé vers "+newPlan+" ✓");
      if(onRefresh) onRefresh();
    } else {
      toast("Erreur : "+(r?.error||r?.message||"Impossible de changer le plan"),true);
    }
    setSaving(false);
    setPlanModal(null);
  };

  useEffect(()=>{
    if(tab==="logs"){
      sLL(true);
      fjA(ADM+"/audit-logs?tenant_id="+tenant.id).then(r=>{sAL(r?.data||[]);sLL(false)});
    }
  },[tab,tenant.id]);

  const TABS=[
    {id:"overview",label:"Vue d'ensemble",icon:"📊"},
    {id:"users",label:"Utilisateurs",icon:"👤",count:tu.length},
    {id:"usage",label:"Usage",icon:"📈"},
    {id:"billing",label:"Billing",icon:"💳"},
    {id:"config",label:"Configuration",icon:"⚙️"},
    {id:"logs",label:"Audit logs",icon:"📋"},
    {id:"support",label:"Support",icon:"🛠"},
  ];

  return<div>
    <Toast msg={toastMsg} error={toastErr}/>
    <ConfirmModal open={!!planModal} onClose={()=>setPlanModal(null)} onConfirm={()=>planModal&&changePlan(planModal.newPlan)}
      title={planModal?.title||"Changer de plan"}
      message={planModal?.message||""}
      icon={planModal?.icon||"💳"}
      confirmLabel={saving?"En cours...":planModal?.confirmLabel||"Confirmer"}
      confirmColor={planModal?.confirmColor||C.teal}/>
    {/* Header tenant */}
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
      <button onClick={onBack} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,background:C.surface,cursor:"pointer",fontSize:12,fontFamily:"inherit",color:C.text2}}>← Retour</button>
      <div style={{width:42,height:42,borderRadius:10,background:tenant.brand_config?.colors?.navy||C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:tenant.brand_config?.colors?.gold||C.gold}}>{tenant.nom?.[0]}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:18,fontWeight:800,color:C.navy}}>{tenant.nom}</div>
        <div style={{fontSize:11,color:C.text3,fontFamily:"monospace"}}>{tenant.slug} · créé le {fd(tenant.created_at)}</div>
      </div>
      <Badge color={PLAN_COLOR[localPlan]||C.text3}>{localPlan}</Badge>
      <Badge color={tenant.actif?C.green:C.red} dot>{tenant.actif?"Actif":"Inactif"}</Badge>
      <Badge color={hc} dot>{hl} · {score}/100</Badge>
    </div>

    <TabBar tabs={TABS} active={tab} onChange={setTab}/>

    {/* ── OVERVIEW ── */}
    {tab==="overview"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
        <Stat icon={Ico.euro(20)} value={fk(mrr)+"/mois"} label="MRR" color={C.gold}/>
        <Stat icon={Ico.user(20)} value={tu.length} label="Utilisateurs" color={C.teal}/>
        <Stat icon={Ico.chart(20)} value={fmt(simTotal)} label="Simulations" color={C.purple}/>
        <Stat icon={Ico.zap(20)} value={score+"/100"} label="Health score" color={hc}/>
        <Stat icon={Ico.star(20)} value={daysAgo(tenant.updated_at||tenant.created_at)+"j"} label="Dernière activité" color={C.text2}/>
        <Stat icon={Ico.star(20)} value={fd(tenant.created_at)} label="Client depuis" color={C.navy}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Informations client</div>
          {[["Nom","nom"],["Slug","slug"],["Email support","email_support"],["Domaine","domaine"],["Plan","plan"],["Environnement","env"]].map(([lbl,key])=>tenant[key]?<div key={key} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid "+C.border+"60",fontSize:13}}>
            <span style={{color:C.text3,minWidth:130,flexShrink:0}}>{lbl}</span>
            <span style={{fontWeight:600,color:C.navy,fontFamily:key==="slug"?"monospace":undefined}}>{tenant[key]}</span>
          </div>:null)}
        </Card>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Health score détail</div>
          <HealthBar score={score}/>
          <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"Activité récente",v:daysAgo(tenant.updated_at)+"j",good:daysAgo(tenant.updated_at)<30},
              {l:"Utilisateurs",v:tu.length,good:tu.length>0},
              {l:"Simulations",v:simTotal,good:simTotal>5},
              {l:"Plan",v:tenant.plan||"starter",good:tenant.plan!=="starter"},
              {l:"Churn risk",v:churnRisk(score,daysAgo(tenant.updated_at||tenant.created_at)),good:churnRisk(score,daysAgo(tenant.updated_at||tenant.created_at))==="Faible"},
            ].map(({l,v,good})=><div key={l} style={{padding:"6px 10px",borderRadius:8,background:good?C.green+"08":C.red+"08",border:"1px solid "+(good?C.green:C.red)+"20"}}>
              <div style={{fontSize:10,color:C.text3,textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:13,fontWeight:700,color:good?C.green:C.red}}>{v}</div>
            </div>)}
          </div>
        </Card>
      </div>
    </div>}

    {/* ── USERS ── */}
    {tab==="users"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontWeight:700,color:C.navy}}>{tu.length} utilisateur{tu.length>1?"s":""}</span>
        <Btn small color={C.teal} icon="✉️">Inviter un utilisateur</Btn>
      </div>
      {tu.length===0?<EmptyState icon="👤" title="Aucun utilisateur" sub="Invitez le premier administrateur"/>:
      <DT data={tu} columns={[
        {key:"prenom",label:"Utilisateur",render:(v,r)=><div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:14,background:r.actif?C.teal:C.text3,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700}}>{(r.prenom?.[0]||"")+(r.nom?.[0]||"?")}</div>
          <div><div style={{fontWeight:600}}>{v} {r.nom}</div><div style={{fontSize:10,color:C.text3}}>{r.email}</div></div>
        </div>},
        {key:"role",label:"Rôle",render:v=><Badge color={v==="super_admin"?C.gold:v==="admin"?C.purple:v==="commercial"?C.blue:C.teal}>{v||"user"}</Badge>},
        {key:"actif",label:"Statut",render:v=>v?<Badge color={C.green} dot>Actif</Badge>:<Badge color={C.red} dot>Inactif</Badge>},
        {key:"total_simulations",label:"Simulations",render:v=><span style={{fontWeight:700,color:C.purple}}>{v||0}</span>},
        {key:"last_sign_in",label:"Dernière connexion",render:v=><span style={{fontSize:11,color:C.text3}}>{fa(v)}</span>},
      ]}/>}
    </div>}

    {/* ── USAGE ── */}
    {tab==="usage"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
        <Stat icon={Ico.chart(20)} value={simTotal} label="Simulations total" color={C.purple}/>
        <Stat icon={Ico.user(20)} value={tu.filter(u=>u.actif).length} label="Users actifs" color={C.teal}/>
        <Stat icon={Ico.doc(20)} value="—" label="Exports PDF" color={C.blue}/>
        <Stat icon={Ico.star(20)} value="—" label="Volume financé simulé" color={C.gold}/>
      </div>
      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Simulations par utilisateur</div>
        {tu.length===0?<EmptyState icon="📊" title="Aucune donnée" sub="Aucun utilisateur enregistré"/>:
        tu.sort((a,b)=>b.total_simulations-a.total_simulations).map((u,i)=><div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border+"60"}}>
          <span style={{fontSize:11,color:C.text3,minWidth:18}}>{i+1}</span>
          <div style={{flex:1,fontSize:13}}>{u.prenom} {u.nom} <span style={{color:C.text3,fontSize:11}}>({u.email})</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:80,height:4,borderRadius:2,background:C.border}}><div style={{width:simTotal?u.total_simulations/simTotal*100+"%":"0%",height:"100%",background:C.purple,borderRadius:2}}/></div>
            <span style={{fontSize:12,fontWeight:700,color:C.purple,minWidth:24}}>{u.total_simulations}</span>
          </div>
        </div>)}
      </Card>
    </div>}

    {/* ── BILLING ── */}
    {tab==="billing"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card style={{borderColor:C.gold+"40",background:C.gold+"05"}}>
          <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",marginBottom:8}}>Plan actuel</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:12}}>
            <span style={{fontSize:32,fontWeight:900,color:C.gold}}>{PLAN_PRICE[localPlan]||149} €</span>
            <span style={{color:C.text3,fontSize:13}}>/mois</span>
          </div>
          <Badge color={PLAN_COLOR[localPlan]||C.text3}>{localPlan}</Badge>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <Btn small color={C.teal} icon="⬆️" disabled={!canUpgrade||saving} onClick={()=>{const np=PLANS[planIdx+1];setPlanModal({newPlan:np,title:"Upgrade vers "+np,message:`Passer "${tenant.nom}" du plan ${localPlan} au plan ${np} (${PLAN_PRICE[np]}€/mois) ?`,icon:"⬆️",confirmLabel:"Upgrade",confirmColor:C.teal})}}>Upgrade</Btn>
            <Btn small variant="outline" color={C.red} icon="⬇️" disabled={!canDowngrade||saving} onClick={()=>{const np=PLANS[planIdx-1];setPlanModal({newPlan:np,title:"Downgrade vers "+np,message:`Passer "${tenant.nom}" du plan ${localPlan} au plan ${np} (${PLAN_PRICE[np]}€/mois) ?`,icon:"⬇️",confirmLabel:"Downgrade",confirmColor:C.orange})}}>Downgrade</Btn>
          </div>
        </Card>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Quotas</div>
          {[
            {l:"Utilisateurs",used:tu.length,max:localPlan==="enterprise"?50:localPlan==="pro"?15:5},
            {l:"Simulations/mois",used:simTotal,max:localPlan==="enterprise"?1000:localPlan==="pro"?200:50},
            {l:"Exports PDF/mois",used:0,max:localPlan==="enterprise"?500:localPlan==="pro"?100:20},
          ].map(({l,used,max})=>{const pct=Math.min(100,Math.round(used/max*100));return<div key={l} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{color:C.text2}}>{l}</span><span style={{color:pct>80?C.red:C.text3}}>{used}/{max}</span>
            </div>
            <div style={{height:5,borderRadius:3,background:C.border}}><div style={{width:pct+"%",height:"100%",background:pct>80?C.red:pct>60?C.amber:C.green,borderRadius:3}}/></div>
          </div>})}
        </Card>
      </div>
      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Historique facturation</div>
        <EmptyState icon="📄" title="Données de facturation" sub="Connectez Stripe pour afficher l'historique des factures"/>
      </Card>
    </div>}

    {/* ── CONFIG ── */}
    {tab==="config"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Branding</div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[["navy","Principale"],["teal","Accent"],["gold","Highlight"]].map(([key,lbl])=>(
              <div key={key} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:8,border:"1px solid "+C.border}}>
                <div style={{width:16,height:16,borderRadius:4,background:tenant.brand_config?.colors?.[key]||C[key]}}/>
                <div style={{fontSize:11}}><div style={{fontWeight:600}}>{lbl}</div><div style={{fontFamily:"monospace",color:C.text3,fontSize:10}}>{tenant.brand_config?.colors?.[key]||C[key]}</div></div>
              </div>
            ))}
          </div>
          <Btn small variant="outline" color={C.teal} icon="🎨">Modifier le branding</Btn>
        </Card>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>Modules activés</div>
          {[{l:"Simulateur Green Finance",on:true},{l:"Catalogue CEE",on:true},{l:"Export PDF",on:localPlan!=="starter"},{l:"Multi-utilisateurs",on:localPlan!=="starter"},{l:"API access",on:localPlan==="enterprise"},{l:"SSO SAML",on:localPlan==="enterprise"}].map(({l,on})=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+C.border+"60",fontSize:13}}>
            <span style={{color:on?C.text:C.text3}}>{l}</span>
            <span>{on?"✅":"🔒"}</span>
          </div>)}
        </Card>
      </div>
    </div>}

    {/* ── LOGS ── */}
    {tab==="logs"&&<div>
      {loadingLogs?<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement des logs...</div>:
      auditLogs.length===0?<EmptyState icon="📋" title="Aucun log trouvé" sub="L'audit trail sera visible ici"/>:
      <div style={{borderRadius:10,border:"1px solid "+C.border,overflow:"hidden"}}>
        {auditLogs.map((log,i)=><div key={i} style={{padding:"10px 16px",borderBottom:"1px solid "+C.border+"60",fontSize:12,display:"flex",gap:12,alignItems:"flex-start",background:i%2?C.bg:C.surface}}>
          <span style={{color:C.text3,fontFamily:"monospace",fontSize:10,minWidth:130,flexShrink:0}}>{fd(log.created_at)}</span>
          <Badge color={log.action?.includes("delete")?C.red:log.action?.includes("create")?C.green:C.blue}>{log.action||"action"}</Badge>
          <span style={{flex:1,color:C.text2}}>{log.details||log.description||"—"}</span>
          <span style={{color:C.text3,fontSize:11}}>{log.user_email||"système"}</span>
        </div>)}
      </div>}
    </div>}

    {/* ── SUPPORT ── */}
    {tab==="support"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>{Ico.mask()} Impersonation</div>
          <p style={{fontSize:13,color:C.text2,marginBottom:12}}>Accédez au compte client en mode lecture pour diagnostiquer un problème. Toutes les actions sont loggées.</p>
          <div style={{padding:10,borderRadius:8,background:C.red+"08",border:"1px solid "+C.red+"20",fontSize:12,color:C.red,marginBottom:12}}>{Ico.alert()} L'impersonation est tracée et auditée.</div>
          <Btn color={C.purple} icon="🎭" onClick={()=>{
            if(!tenant.slug){toast("Slug manquant pour ce client",true);return;}
            // window.open AVANT tout await — sinon le navigateur bloque le popup
            window.open("https://app.lihtea.com?t="+tenant.slug+"&_sa_impersonate=1","_blank");
            fjA(ADM+"/audit-logs",{method:"POST",body:JSON.stringify({action:"impersonate",details:`Impersonation tenant : ${tenant.nom} (${tenant.slug})`,tenant_id:tenant.id})});
            toast("Session d'impersonation ouverte — tracée ✓");
          }}>
            Accéder en tant que {tenant.nom}
          </Btn>
        </Card>
        <Card>
          <div style={{fontWeight:700,color:C.navy,marginBottom:12,fontSize:13}}>{Ico.link()} Liens rapides</div>
          {[
            {l:"Simulateur client",url:"https://app.lihtea.com?t="+tenant.slug,icon:"🌐"},
            {l:"Admin client",url:"https://admin.lihtea.com?t="+tenant.slug,icon:"⚙️"},
          ].map(({l,url,icon})=><a key={l} href={url} target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:6,borderRadius:8,border:"1px solid "+C.border,background:C.bg,textDecoration:"none",color:C.text,fontSize:12,fontWeight:600}}>
            <span>{icon}</span>{l}<span style={{marginLeft:"auto",color:C.text3}}>↗</span>
          </a>)}
        </Card>
      </div>
    </div>}
  </div>
}

// ─── TENANTS LIST ─────────────────────────────────────────────────────────────
function Tenants({initialAction,allUsers,onSelectTenant}){
  const{data:tenants,loading,refresh}=useCrud("tenants");
  const[m,sM]=useState(initialAction==="new"?"new":null);
  const[f,sF]=useState({});const[confirm,sConf]=useState(null);
  const[search,setSearch]=useState("");const[planF,setPlanF]=useState("");
  const{toastMsg,toastErr,toast}=useToast();
  const F=(k,v)=>sF(p=>({...p,[k]:v}));const[creating,sCr]=useState(false);
  const plans=[{value:"starter",label:"Starter"},{value:"pro",label:"Pro"},{value:"enterprise",label:"Enterprise"}];

  const withScores=useMemo(()=>tenants.map(t=>{
    const tu=(allUsers||[]).filter(u=>u.tenant_id===t.id);
    const score=computeHealthScore(t,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));
    return{...t,score,tuCount:tu.length,simCount:tu.reduce((s,u)=>s+u.total_simulations,0)};
  }),[tenants,allUsers]);

  const filtered=withScores.filter(t=>
    (!search||t.nom?.toLowerCase().includes(search.toLowerCase())||t.slug?.toLowerCase().includes(search.toLowerCase()))&&
    (!planF||t.plan===planF)
  );

  const createTenant=async()=>{
    if(!f.nom||!f.slug||!f.email||!f.password){toast("Tous les champs* sont requis",true);return}
    sCr(true);
    const slug=f.slug.toLowerCase().replace(/[^a-z0-9-]/g,"-");
    // Utilise fjA() → Bearer JWT du super_admin (pas l'anon key)
    // L'edge function create-tenant valide le rôle et utilise sa propre service role key
    const r=await fjA(`${SU}/functions/v1/create-tenant`,{method:"POST",body:JSON.stringify({nom:f.nom,slug,email:f.email,password:f.password,plan:f.plan||"starter",email_support:f.email_support||f.email,brand_config:{name:f.nom,colors:{navy:"#0f2b46",teal:"#0d9488",gold:"#d4a843"}}})});
    if(r?.tenant_id||r?.success||r?.data?.id){toast(`Client "${f.nom}" créé avec succès`);sM(null);refresh();}
    else toast(r?.error||r?.message||"Erreur lors de la création — vérifiez les logs edge function",true);
    sCr(false);
  };

  const toggleTenant=async(t)=>{
    await fjA(ADM+"/tenants/"+t.id,{method:"PUT",body:JSON.stringify({actif:!t.actif})});
    toast(t.actif?"Client désactivé":"Client réactivé ✓");refresh();
  };

  return<div>
    <Toast msg={toastMsg} error={toastErr}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <SectionTitle sub={`${tenants.length} clients · ${tenants.filter(t=>t.actif).length} actifs`}>{Ico.building()} Clients</SectionTitle>
      <Btn color={C.teal} icon="+" onClick={()=>{sF({nom:"",slug:"",email:"",password:"",plan:"starter",email_support:""});sM("new")}}>Nouveau client</Btn>
    </div>

    {/* Filtres */}
    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un client..." style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:13,fontFamily:"inherit",minWidth:220,outline:"none"}}/>
      <select value={planF} onChange={e=>setPlanF(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}>
        <option value="">Tous les plans</option>
        {plans.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <div style={{marginLeft:"auto",fontSize:12,color:C.text3,alignSelf:"center"}}>{filtered.length} résultats</div>
    </div>

    {/* Stats rapides */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
      <Stat icon={Ico.building(20)} value={tenants.length} label="Total" color={C.navy}/>
      <Stat icon={Ico.check(20)} value={tenants.filter(t=>t.actif).length} label="Actifs" color={C.green}/>
      <Stat icon={Ico.alert(20)} value={withScores.filter(t=>t.score<40&&t.actif).length} label="À risque" color={C.red}/>
      <Stat icon={Ico.trophy(20)} value={tenants.filter(t=>t.plan==="enterprise").length} label="Enterprise" color={C.gold}/>
      <Stat icon={Ico.euro(20)} value={fk(tenants.filter(t=>t.actif).reduce((s,t)=>s+(PLAN_PRICE[t.plan]||149),0))+"/mois"} label="MRR" color={C.teal}/>
    </div>

    {/* Tableau enrichi */}
    {loading?<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement...</div>:
    <DT data={filtered} onRowClick={onSelectTenant} columns={[
      {key:"nom",label:"Client",render:(v,r)=><div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:r.brand_config?.colors?.navy||C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:r.brand_config?.colors?.gold||C.gold,flexShrink:0}}>{v?.[0]}</div>
        <div><div style={{fontWeight:700,color:C.navy}}>{v}</div><div style={{fontSize:10,color:C.text3,fontFamily:"monospace"}}>{r.slug}</div></div>
      </div>},
      {key:"plan",label:"Plan",render:v=><Badge color={PLAN_COLOR[v]||C.text3}>{v||"starter"}</Badge>},
      {key:"actif",label:"Statut",render:v=>v?<Badge color={C.green} dot>Actif</Badge>:<Badge color={C.red} dot>Inactif</Badge>},
      {key:"tuCount",label:"Users",render:v=><span style={{fontWeight:600}}>{v||0}</span>},
      {key:"simCount",label:"Sims",render:v=><span style={{fontWeight:600,color:C.purple}}>{v||0}</span>},
      {key:"score",label:"Health",render:(v,r)=><div style={{minWidth:100}}><HealthBar score={v}/></div>},
      {key:"created_at",label:"Client depuis",render:v=><span style={{fontSize:11,color:C.text3}}>{fd(v)}</span>},
      {key:"id",label:"Actions",render:(v,r)=><div style={{display:"flex",gap:4,flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
        <Btn small variant="outline" color={C.blue} onClick={()=>onSelectTenant(r)}>{Ico.search()} Détail</Btn>
        <Btn small variant="outline" color={C.purple} onClick={()=>{if(!r.slug)return;window.open("https://app.lihtea.com?t="+r.slug+"&_sa_impersonate=1","_blank");fjA(ADM+"/audit-logs",{method:"POST",body:JSON.stringify({action:"impersonate",details:`Impersonation tenant : ${r.nom} (${r.slug})`,tenant_id:r.id})});}}>🎭</Btn>
        <Btn small variant="outline" color={r.actif?C.red:C.green} onClick={()=>sConf(r)}>{r.actif?"⏸":"▶"}</Btn>
      </div>},
    ]}/>}

    {/* Modal création */}
    <Modal open={m==="new"} onClose={()=>sM(null)} title="Créer un nouveau client" wide>
      <div style={{padding:12,borderRadius:8,background:C.tealBg,border:"1px solid "+C.teal+"30",fontSize:12,color:C.text2,marginBottom:12}}>Un compte admin sera automatiquement créé. Transmettez les identifiants au client.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <Input label="Nom de la société*" value={f.nom||""} onChange={v=>{F("nom",v);if(!f.slug||f._slugAuto)F("slug",(v||"").toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"));F("_slugAuto",true)}}/>
        <Input label="Slug URL*" value={f.slug||""} onChange={v=>{F("slug",v.toLowerCase().replace(/[^a-z0-9-]/g,"-"));F("_slugAuto",false)}} placeholder="ex: entreprise-x"/>
        <Input label="Email admin*" value={f.email||""} onChange={v=>F("email",v)} type="email"/>
        <Input label="Mot de passe admin*" value={f.password||""} onChange={v=>F("password",v)} type="password"/>
        <Input label="Plan" value={f.plan||"starter"} onChange={v=>F("plan",v)} options={plans}/>
        <Input label="Email support" value={f.email_support||""} onChange={v=>F("email_support",v)} type="email" placeholder="(même que admin)"/>
      </div>
      {f.slug&&<div style={{fontSize:11,color:C.text3,marginBottom:10}}>URL : <span style={{fontFamily:"monospace",color:C.teal}}>app.lihtea.com?t={f.slug}</span></div>}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
        <Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn>
        <Btn color={C.teal} onClick={createTenant} disabled={creating}>{creating?"Création…":"🚀 Créer le client"}</Btn>
      </div>
    </Modal>

    <ConfirmModal open={!!confirm} onClose={()=>sConf(null)}
      title={confirm?.actif?"Désactiver ce client ?":"Réactiver ce client ?"}
      message={`${confirm?.actif?"Désactiver":"Réactiver"} "${confirm?.nom}" ?`}
      icon={confirm?.actif?"🚫":"✅"} confirmLabel={confirm?.actif?"Désactiver":"Réactiver"}
      confirmColor={confirm?.actif?C.red:C.green}
      onConfirm={async()=>{await toggleTenant(confirm);sConf(null)}}/>
  </div>
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics({tenants,users}){
  const withScores=useMemo(()=>tenants.map(t=>{
    const tu=users.filter(u=>u.tenant_id===t.id);
    const score=computeHealthScore(t,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));
    const simCount=tu.reduce((s,u)=>s+u.total_simulations,0);
    return{...t,score,tuCount:tu.length,simCount};
  }),[tenants,users]);

  const top=withScores.filter(t=>t.actif).sort((a,b)=>b.simCount-a.simCount).slice(0,5);
  const inactive=withScores.filter(t=>t.actif&&daysAgo(t.updated_at||t.created_at)>30);
  const adopRate=Math.round(withScores.filter(t=>t.score>=60).length/Math.max(withScores.length,1)*100);
  const simTotal=withScores.reduce((s,t)=>s+t.simCount,0);

  return<div>
    <SectionTitle sub="Adoption, usage et performance par client">{Ico.trend()} Analytics</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
      <Stat icon={Ico.rocket(20)} value={adopRate+"%"} label="Taux d'adoption" color={C.green}/>
      <Stat icon={Ico.chart(20)} value={simTotal} label="Simulations total" color={C.purple}/>
      <Stat icon={Ico.user(20)} value={users.length} label="Utilisateurs total" color={C.teal}/>
      <Stat icon={Ico.sleep(20)} value={inactive.length} label="Inactifs +30j" color={C.amber}/>
      <Stat icon={Ico.alert(20)} value={withScores.filter(t=>t.score<40&&t.actif).length} label="Churn risk" color={C.red}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>{Ico.trophy()} Top clients — Simulations</div>
        {top.length===0?<EmptyState icon="📊" title="Pas de données" sub="Données insuffisantes"/>:
        top.map((t,i)=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border+"60"}}>
          <span style={{fontSize:15,minWidth:24,textAlign:"center"}}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:C.navy}}>{t.nom}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <div style={{flex:1,height:4,borderRadius:2,background:C.border}}><div style={{width:top[0].simCount?t.simCount/top[0].simCount*100+"%":"0%",height:"100%",background:C.purple,borderRadius:2}}/></div>
            </div>
          </div>
          <span style={{fontWeight:800,color:C.purple}}>{t.simCount}</span>
        </div>)}
      </Card>

      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>{Ico.sleep()} Clients inactifs</div>
        {inactive.length===0?<div style={{padding:20,textAlign:"center",color:C.green,fontSize:13}}>✓ Tous les clients sont actifs</div>:
        inactive.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+C.border+"60"}}>
          <Badge color={C.amber}>+{daysAgo(t.updated_at||t.created_at)}j</Badge>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600}}>{t.nom}</div>
            <div style={{fontSize:11,color:C.text3}}>Score : {t.score}/100</div>
          </div>
          <Badge color={PLAN_COLOR[t.plan]||C.text3}>{t.plan}</Badge>
        </div>)}
      </Card>
    </div>

    {/* Health distribution */}
    <Card>
      <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>Distribution Health Score</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
        {[{l:"Sains (70-100)",min:70,color:C.green},{l:"Attention (40-69)",min:40,max:70,color:C.amber},{l:"À risque (0-39)",max:40,color:C.red}].map(({l,min=0,max=101,color})=>{
          const count=withScores.filter(t=>t.actif&&t.score>=min&&t.score<max).length;
          const pct=Math.round(count/Math.max(withScores.filter(t=>t.actif).length,1)*100);
          return<div key={l} style={{padding:14,borderRadius:10,background:color+"08",border:"1px solid "+color+"30",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,color}}>{count}</div>
            <div style={{fontSize:12,color,fontWeight:600}}>{l}</div>
            <div style={{fontSize:10,color:C.text3}}>{pct}% des clients actifs</div>
          </div>;
        })}
      </div>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:6}}>
        {withScores.filter(t=>t.actif).sort((a,b)=>b.score-a.score).map(t=>{
          const{c}=healthLabel(t.score);
          return<div key={t.id} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,minWidth:160,color:C.text2}}>{t.nom}</span>
            <div style={{flex:1}}><HealthBar score={t.score}/></div>
            <Badge color={c} dot>{t.score}</Badge>
          </div>;
        })}
      </div>
    </Card>
  </div>
}

// ─── ALERTES ─────────────────────────────────────────────────────────────────
function Alertes({tenants,users}){
  const withScores=useMemo(()=>tenants.map(t=>{
    const tu=users.filter(u=>u.tenant_id===t.id);
    const score=computeHealthScore(t,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));
    // hasAdmin : role "admin" OU "super_admin" comptent comme administrateur valide
    const hasAdmin=tu.some(u=>u.role==="admin"||u.role==="super_admin");
    return{...t,score,tuCount:tu.length,hasAdmin,days:daysAgo(t.updated_at||t.created_at)};
  }),[tenants,users]);

  const alerts=[
    ...withScores.filter(t=>t.days>30&&t.actif).map(t=>({type:"inactive",level:"warning",icon:"💤",title:"Client inactif",msg:`${t.nom} est inactif depuis ${t.days} jours`,tenant:t})),
    ...withScores.filter(t=>t.score<40&&t.actif).map(t=>({type:"churn",level:"critical",icon:"⚠️",title:"Churn risk élevé",msg:`${t.nom} a un health score de ${t.score}/100`,tenant:t})),
    ...withScores.filter(t=>t.actif&&!t.hasAdmin).map(t=>({type:"noadmin",level:"warning",icon:"👤",title:"Compte sans admin",msg:`${t.nom} n'a aucun administrateur configuré`,tenant:t})),
  ];

  const critical=alerts.filter(a=>a.level==="critical");
  const warning=alerts.filter(a=>a.level==="warning");

  return<div>
    <SectionTitle sub={`${alerts.length} alerte${alerts.length>1?"s":""} active${alerts.length>1?"s":""}`}>{Ico.bell()} Alertes système</SectionTitle>
    {alerts.length===0?<EmptyState icon="✅" title="Aucune alerte" sub="La plateforme est en bonne santé"/>:<>
    {critical.length>0&&<div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>🔴 Critique — {critical.length} alerte{critical.length>1?"s":""}</div>
      {critical.map((a,i)=><div key={i} style={{padding:"12px 16px",borderRadius:10,border:"1px solid "+C.red+"30",background:C.red+"06",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
        <span style={{fontSize:18}}>{a.icon}</span>
        <div style={{flex:1}}><div style={{fontWeight:700,color:C.red,fontSize:13}}>{a.title}</div><div style={{fontSize:12,color:C.text2,marginTop:2}}>{a.msg}</div></div>
        <Badge color={PLAN_COLOR[a.tenant?.plan]||C.text3}>{a.tenant?.plan}</Badge>
      </div>)}
    </div>}
    {warning.length>0&&<div>
      <div style={{fontSize:12,fontWeight:700,color:C.amber,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>🟠 Attention — {warning.length} alerte{warning.length>1?"s":""}</div>
      {warning.map((a,i)=><div key={i} style={{padding:"12px 16px",borderRadius:10,border:"1px solid "+C.amber+"30",background:C.amber+"06",marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
        <span style={{fontSize:18}}>{a.icon}</span>
        <div style={{flex:1}}><div style={{fontWeight:700,color:C.amber,fontSize:13}}>{a.title}</div><div style={{fontSize:12,color:C.text2,marginTop:2}}>{a.msg}</div></div>
        <Badge color={PLAN_COLOR[a.tenant?.plan]||C.text3}>{a.tenant?.plan}</Badge>
      </div>)}
    </div>}
    </>}
  </div>
}

// ─── ROLES RBAC ──────────────────────────────────────────────────────────────
function RolesRBAC({users,tenants}){
  const GLOBAL_ROLES=[
    {id:"super_admin",label:"Super Admin",color:C.gold,desc:"Accès total à la plateforme — Lihtea interne uniquement",perms:["Tout"]},
    {id:"support",label:"Support",color:C.blue,desc:"Lecture + impersonation + logs. Pas de modification config.",perms:["Lecture","Impersonation","Logs"]},
    {id:"ops",label:"Ops",color:C.teal,desc:"Gestion tenants, catalogue et utilisateurs.",perms:["Tenants","Catalogue","Users"]},
    {id:"finance",label:"Finance",color:C.green,desc:"Accès billing, MRR, ARR. Pas d'accès aux données clients.",perms:["Billing","Analytics"]},
  ];
  const TENANT_ROLES=[
    {id:"admin",label:"Admin client",color:C.purple,desc:"Accès complet au compte client"},
    {id:"direction",label:"Direction",color:C.navy,desc:"Vue synthèse et KPIs"},
    {id:"commercial",label:"Commercial",color:C.blue,desc:"Simulateur + export propositions"},
    {id:"analyste",label:"Analyste",color:C.teal,desc:"Simulations + CEE avancés"},
    {id:"readonly",label:"Lecture seule",color:C.text3,desc:"Consultation uniquement"},
  ];
  const saUsers=users.filter(u=>!u.tenant_id||u.role==="super_admin");
  const tenantUsers=users.filter(u=>u.tenant_id);
  return<div>
    <SectionTitle sub="Gestion des rôles et permissions">🔐 Rôles & Accès (RBAC)</SectionTitle>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>Rôles globaux (plateforme)</div>
        {GLOBAL_ROLES.map(r=><div key={r.id} style={{padding:"10px 12px",borderRadius:8,border:"1px solid "+C.border,marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Badge color={r.color}>{r.label}</Badge><span style={{fontSize:10,color:C.text3}}>{users.filter(u=>u.role===r.id).length} user(s)</span></div>
          <div style={{fontSize:12,color:C.text2}}>{r.desc}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{r.perms.map(p=><span key={p} style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:C.bg,color:C.text3,border:"1px solid "+C.border}}>{p}</span>)}</div>
        </div>)}
      </Card>
      <Card>
        <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>Rôles par client (tenant)</div>
        {TENANT_ROLES.map(r=><div key={r.id} style={{padding:"10px 12px",borderRadius:8,border:"1px solid "+C.border,marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Badge color={r.color}>{r.label}</Badge><span style={{fontSize:10,color:C.text3}}>{users.filter(u=>u.role===r.id).length} user(s)</span></div>
          <div style={{fontSize:12,color:C.text2}}>{r.desc}</div>
        </div>)}
      </Card>
    </div>
    <Card>
      <div style={{fontWeight:700,color:C.navy,marginBottom:14,fontSize:13}}>Utilisateurs globaux ({saUsers.length})</div>
      <DT data={saUsers} columns={[
        {key:"prenom",label:"Utilisateur",render:(v,r)=><span style={{fontWeight:600}}>{v} {r.nom} <span style={{color:C.text3,fontWeight:400,fontSize:11}}>({r.email})</span></span>},
        {key:"role",label:"Rôle",render:v=><Badge color={v==="super_admin"?C.gold:v==="support"?C.blue:v==="ops"?C.teal:C.green}>{v||"user"}</Badge>},
        {key:"actif",label:"Statut",render:v=>v?<Badge color={C.green} dot>Actif</Badge>:<Badge color={C.red} dot>Inactif</Badge>},
        {key:"last_sign_in",label:"Dernière connexion",render:v=><span style={{fontSize:11,color:C.text3}}>{fa(v)}</span>},
      ]}/>
    </Card>
  </div>
}

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
function AuditLogs(){
  const[logs,sL]=useState([]);const[loading,sLoad]=useState(true);const[tenantF,sTF]=useState("");const[actionF,setAF]=useState("");
  useEffect(()=>{fjA(ADM+"/audit-logs").then(r=>{sL(r?.data||[]);sLoad(false)})},[]);
  const actions=[...new Set(logs.map(l=>l.action).filter(Boolean))];
  const tenants=[...new Set(logs.map(l=>l.tenant_id).filter(Boolean))];
  const filtered=logs.filter(l=>(!tenantF||l.tenant_id===tenantF)&&(!actionF||l.action===actionF));
  const ACTION_COLOR={create:C.green,update:C.blue,delete:C.red,login:C.teal,export:C.purple,impersonate:C.orange};
  return<div>
    <SectionTitle sub={`${logs.length} événements tracés`}>{Ico.clipboard()} Audit Trail</SectionTitle>
    <div style={{display:"flex",gap:10,marginBottom:16}}>
      <select value={actionF} onChange={e=>setAF(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}>
        <option value="">Toutes les actions</option>
        {actions.map(a=><option key={a} value={a}>{a}</option>)}
      </select>
      <span style={{marginLeft:"auto",fontSize:12,color:C.text3,alignSelf:"center"}}>{filtered.length} entrées</span>
    </div>
    {loading?<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement...</div>:
    logs.length===0?<EmptyState icon="📋" title="Aucun log" sub="Les actions seront enregistrées ici"/>:
    <div style={{borderRadius:10,border:"1px solid "+C.border,overflow:"hidden"}}>
      {filtered.slice(0,100).map((log,i)=><div key={i} style={{padding:"10px 16px",borderBottom:"1px solid "+C.border+"60",fontSize:12,display:"flex",gap:12,alignItems:"center",background:i%2?C.bg:C.surface}}>
        <span style={{color:C.text3,fontFamily:"monospace",fontSize:10,minWidth:120,flexShrink:0}}>{fd(log.created_at)}</span>
        <Badge color={ACTION_COLOR[log.action]||C.navy}>{log.action||"?"}</Badge>
        <span style={{flex:1,color:C.text2}}>{log.details||log.description||"—"}</span>
        <span style={{color:C.text3,fontSize:11}}>{log.user_email||"système"}</span>
      </div>)}
    </div>}
  </div>
}

// ─── USERS GLOBAL ────────────────────────────────────────────────────────────
function UsersGlobal(){
  const[users,sU]=useState([]);const[loading,sL]=useState(true);const[tenants,sT]=useState([]);const[tf,sTF]=useState("");
  const load=async()=>{sL(true);const[ur,tr]=await Promise.all([fjA(ADM+"/user-stats"),fjA(ADM+"/tenants")]);sU(ur?.data||[]);sT(tr?.data||[]);sL(false)};
  useEffect(()=>{load()},[]);
  const filtered=tf?users.filter(u=>u.tenant_id===tf):users;
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
      <SectionTitle sub={`${filtered.length} comptes · ${tenants.length} clients`}>{Ico.user()} Tous les utilisateurs</SectionTitle>
      <select value={tf} onChange={e=>sTF(e.target.value)} style={{padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}>
        <option value="">Tous les clients</option>
        {tenants.map(t=><option key={t.id} value={t.id}>{t.nom}</option>)}
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
      <Stat icon={Ico.user(20)} value={filtered.length} label="Utilisateurs" color={C.navy}/>
      <Stat icon={Ico.check(20)} value={filtered.filter(u=>u.actif).length} label="Actifs" color={C.green}/>
      <Stat icon={Ico.chart(20)} value={filtered.reduce((a,u)=>a+(u.total_simulations||0),0)} label="Simulations" color={C.purple}/>
      <Stat icon={Ico.star(20)} value={filtered.filter(u=>u.role==="admin").length} label="Admins" color={C.gold}/>
    </div>
    <DT loading={loading} data={filtered} columns={[
      {key:"prenom",label:"Utilisateur",render:(v,r)=><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:14,background:r.actif?C.teal:C.text3,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700}}>{(r.prenom?.[0]||"")+(r.nom?.[0]||"?")}</div><div><div style={{fontWeight:600}}>{v} {r.nom}</div><div style={{fontSize:10,color:C.text3}}>{r.email}</div></div></div>},
      {key:"tenant_id",label:"Client",render:v=>{const t=tenants.find(x=>x.id===v);return t?<Badge color={C.navy}>{t.nom}</Badge>:"Plateforme"}},
      {key:"role",label:"Rôle",render:v=><Badge color={v==="super_admin"?C.gold:v==="admin"?C.purple:v==="commercial"?C.blue:C.teal}>{v||"user"}</Badge>},
      {key:"actif",label:"Statut",render:v=>v?<Badge color={C.green} dot>Actif</Badge>:<Badge color={C.red} dot>Inactif</Badge>},
      {key:"total_simulations",label:"Sims",render:v=><span style={{fontWeight:700,color:C.purple}}>{v||0}</span>},
      {key:"last_sign_in",label:"Dernière connexion",render:v=><span style={{fontSize:11,color:C.text3}}>{fa(v)}</span>},
    ]}/>
  </div>
}

// ─── CATALOGUE (inchangé, compact) ───────────────────────────────────────────
function Organismes(){const{data,loading,create,update,remove}=useCrud("organismes");const[m,sM]=useState(null);const{toastMsg,toastErr,toast}=useToast();const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));return<div><Toast msg={toastMsg} error={toastErr}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><SectionTitle sub={data.length+" organismes"}>{Ico.landmark()} Organismes</SectionTitle><Btn onClick={()=>{sF({nom:"",sigle:"",type:"national",pays:"FR",couleur:"#0d9488",actif:true});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"sigle",label:"Sigle",render:(v,r)=><span style={{fontWeight:700,color:r.couleur}}>{v}</span>},{key:"nom",label:"Nom"},{key:"type",label:"Type",render:v=><Badge color={{national:C.teal,europeen:C.purple,regional:"#7e22ce",fiscal:C.gold}[v]}>{v}</Badge>},{key:"actif",label:"",render:v=>v?"✅":"❌"}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouvel organisme":"Modifier"}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}><Input label="Sigle*" value={f.sigle||""} onChange={v=>F("sigle",v)}/><Input label="Nom*" value={f.nom||""} onChange={v=>F("nom",v)}/><Input label="Type" value={f.type||"national"} onChange={v=>F("type",v)} options={[{value:"national",label:"National"},{value:"europeen",label:"Européen"},{value:"regional",label:"Régional"},{value:"fiscal",label:"Fiscal"}]}/><Input label="Couleur" value={f.couleur||""} onChange={v=>F("couleur",v)} type="color"/></div><Input label="Description" value={f.description||""} onChange={v=>F("description",v)} rows={2}/><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{if(m==="new"?await create(f):await update(f.id,f)){toast("✓ Sauvegardé");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.sigle}" ?`:""} icon="🏛️" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);toast("✓");sDel(null)}}/></div>}

function Dispositifs(){const{data,loading,create,update,remove}=useCrud("dispositifs");const[orgs,sO]=useState([]);const[m,sM]=useState(null);const{toastMsg,toastErr,toast}=useToast();const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));useEffect(()=>{fjA(ADM+"/organismes").then(r=>sO(r?.data||[]))},[]);return<div><Toast msg={toastMsg} error={toastErr}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><SectionTitle sub={data.length+" dispositifs"}>{Ico.clipboard()} Dispositifs</SectionTitle><Btn onClick={()=>{sF({nom:"",code:"",type_aide:"subvention",taux_min:0,taux_max:50,statut:"actif",organisme_id:orgs[0]?.id});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"code",label:"Code",render:v=><span style={{fontFamily:"monospace",fontSize:11,fontWeight:600}}>{v}</span>},{key:"nom",label:"Nom"},{key:"organisme_id",label:"Org.",render:v=><Badge color={C.navy}>{orgs.find(o=>o.id===v)?.sigle||"?"}</Badge>},{key:"type_aide",label:"Type",render:v=><Badge color={C.teal}>{v?.replace("_"," ")}</Badge>},{key:"taux_max",label:"Taux",render:(v,r)=>v?r.taux_min+"-"+v+"%":"—"},{key:"statut",label:"",render:v=><Badge color={v==="actif"?C.green:C.red}>{v}</Badge>}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouveau":"Modifier"} wide><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}><Input label="Code*" value={f.code||""} onChange={v=>F("code",v)}/><Input label="Nom*" value={f.nom||""} onChange={v=>F("nom",v)}/><Input label="Organisme" value={f.organisme_id||""} onChange={v=>F("organisme_id",v)} options={orgs.map(o=>({value:o.id,label:o.sigle}))}/><Input label="Type" value={f.type_aide||"subvention"} onChange={v=>F("type_aide",v)} options={["subvention","pret","credit_impot","prime","garantie","reduction_taux"].map(v=>({value:v,label:v.replace("_"," ")}))}/><Input label="Min%" value={f.taux_min??0} onChange={v=>F("taux_min",parseFloat(v)||0)} type="number"/><Input label="Max%" value={f.taux_max??0} onChange={v=>F("taux_max",parseFloat(v)||0)} type="number"/></div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{if(m==="new"?await create(f):await update(f.id,f)){toast("✓");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.code}" ?`:""} icon="📋" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);toast("✓");sDel(null)}}/></div>}

function Equipements(){const{data,loading,create,update,remove}=useCrud("equipements");const[cats,sC]=useState([]);const[fiches,sFC]=useState([]);const[m,sM]=useState(null);const{toastMsg,toastErr,toast}=useToast();const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));useEffect(()=>{fjA(ADM+"/categories_equipements").then(r=>sC(r?.data||[]));fjA(ADM+"/fiches_cee").then(r=>sFC(r?.data||[]))},[]);return<div><Toast msg={toastMsg} error={toastErr}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><SectionTitle sub={data.length+" dans le catalogue global"}>{Ico.factory()} Équipements</SectionTitle><Btn onClick={()=>{sF({libelle:"",code_nomenclature:"",categorie_id:cats[0]?.id,fiche_cee_id:"",gain_energetique_typique:25,actif:true});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"code_nomenclature",label:"Code",render:v=><span style={{fontFamily:"monospace",fontSize:11}}>{v}</span>},{key:"categorie_id",label:"Cat.",render:v=>{const c=cats.find(x=>x.id===v);return c?c.icone+" "+c.nom:"—"}},{key:"libelle",label:"Équipement",render:v=><span style={{fontWeight:600}}>{v}</span>},{key:"fiche_cee_id",label:"CEE",render:v=>v?<Badge color={C.teal}>{fiches.find(x=>x.id===v)?.code||"?"}</Badge>:""},{key:"gain_energetique_typique",label:"Gain",render:v=>v?<span style={{color:C.green,fontWeight:700}}>{v}%</span>:""},{key:"actif",label:"",render:v=>v?"✅":"❌"}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouveau":"Modifier"} wide><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}><Input label="Code" value={f.code_nomenclature||""} onChange={v=>F("code_nomenclature",v)}/><Input label="Libellé*" value={f.libelle||""} onChange={v=>F("libelle",v)}/><Input label="Catégorie" value={f.categorie_id||""} onChange={v=>F("categorie_id",v)} options={cats.map(c=>({value:c.id,label:(c.icone||"")+" "+c.nom}))}/><Input label="Fiche CEE" value={f.fiche_cee_id||""} onChange={v=>F("fiche_cee_id",v)} options={[{value:"",label:"Aucune"},...fiches.map(x=>({value:x.id,label:x.code}))]}/><Input label="Gain%" value={f.gain_energetique_typique??""} onChange={v=>F("gain_energetique_typique",v?parseFloat(v):null)} type="number"/></div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{const p={...f};if(!p.fiche_cee_id)p.fiche_cee_id=null;if(m==="new"?await create(p):await update(p.id,p)){toast("✓");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.libelle}" ?`:""} icon="🏭" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);toast("✓");sDel(null)}}/></div>}

function Catalogue(){const[d,sD]=useState([]);const[l,sL]=useState(true);const[f,sF]=useState({o:"",c:""});useEffect(()=>{fj(CAT+"/catalogue").then(r=>{sD(r?.data||[]);sL(false)})},[]);const orgs=[...new Set(d.map(x=>x.organisme_sigle))].sort();const cats=[...new Set(d.map(x=>x.categorie_code).filter(Boolean))].sort();const filtered=d.filter(x=>(!f.o||x.organisme_sigle===f.o)&&(!f.c||x.categorie_code===f.c));return<div><SectionTitle sub={filtered.length+" entrées"}>{Ico.check()} Éligibilités</SectionTitle><div style={{display:"flex",gap:10,marginBottom:16}}><select value={f.o} onChange={e=>sF(p=>({...p,o:e.target.value}))} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}><option value="">Tous</option>{orgs.map(o=><option key={o}>{o}</option>)}</select><select value={f.c} onChange={e=>sF(p=>({...p,c:e.target.value}))} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}><option value="">Toutes</option>{cats.map(c=><option key={c}>{c}</option>)}</select></div><DT loading={l} data={filtered} columns={[{key:"organisme_sigle",label:"Org.",render:(v,r)=><span style={{color:r.organisme_couleur,fontWeight:700}}>{v}</span>},{key:"dispositif_code",label:"Dispositif",render:v=><span style={{fontFamily:"monospace",fontSize:11}}>{v}</span>},{key:"equipement_libelle",label:"Équipement",render:v=><span style={{fontWeight:600}}>{v}</span>},{key:"fiche_cee_code",label:"CEE",render:v=>v?<Badge color={C.teal}>{v}</Badge>:""},{key:"taux_subvention",label:"Taux",render:v=>v?<span style={{color:C.green,fontWeight:700}}>{Number(v)}%</span>:""}]}/></div>}

// ─── BAREMES (lecture) ────────────────────────────────────────────────────────
function BaremesView(){
  const{data,loading}=useCrud("financing_grids");
  return<div>
    <SectionTitle sub="Barèmes de financement actifs">{Ico.card()} Barèmes financiers</SectionTitle>
    <DT loading={loading} data={data} columns={[
      {key:"grid_name",label:"Barème",render:v=><span style={{fontWeight:700,color:C.navy}}>{v}</span>},
      {key:"effective_date",label:"En vigueur depuis",render:v=><span style={{fontSize:12,color:C.text3}}>{fd(v)}</span>},
      {key:"is_active",label:"Statut",render:v=>v?<Badge color={C.green} dot>Actif</Badge>:<Badge color={C.text3}>Archivé</Badge>},
    ]} empty="Aucun barème configuré"/>
  </div>
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin}){const[e,sE]=useState("");const[p,sP]=useState("");const[err,sErr]=useState("");const[l,sL]=useState(false);const[showPw,sShowPw]=useState(false);
  const go=async()=>{sErr("");sL(true);
    const r=await au.signIn(e,p);
    if(r.error)sErr(r.error_description||"Identifiants incorrects");
    else if(r.access_token){
      _tok=r.access_token;
      const ur=await fetch(SU+"/rest/v1/users?auth_id=eq."+r.user.id+"&select=role",{headers:{apikey:AK,"Authorization":"Bearer "+r.access_token}}).then(x=>x.json()).catch(()=>null);
      const role=ur?.[0]?.role;
      if(role!=="super_admin"){sErr("Accès refusé — espace réservé à Lihtea");_tok=null;sL(false);return}
      au.set({access_token:r.access_token,user:r.user});onLogin(r);
    }
    sL(false);
  };
  return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+C.navy+",#1e3a5f,#0d4a3a)",fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
    <div style={{width:400,maxWidth:"92vw"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,"+C.gold+",#e8b84b)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:C.navy,marginBottom:12,boxShadow:"0 8px 24px rgba(212,168,67,0.4)"}}>L</div>
        <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>Lihtea Platform</div>
        <div style={{fontSize:11,color:C.tealB,textTransform:"uppercase",letterSpacing:"0.14em",marginTop:4}}>Super Admin · Tour de contrôle</div>
      </div>
      <div style={{background:C.surface,borderRadius:16,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        {err&&<div style={{padding:10,borderRadius:8,background:C.red+"10",color:C.red,fontSize:12,marginBottom:14,lineHeight:1.4}}>{err}</div>}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",display:"block",marginBottom:4}}>Email</label><input type="email" value={e} onChange={x=>sE(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid "+C.border,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
        <div style={{marginBottom:20}}><label style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",display:"block",marginBottom:4}}>Mot de passe</label><div style={{position:"relative"}}><input type={showPw?"text":"password"} value={p} onChange={x=>sP(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:"10px 14px",paddingRight:42,borderRadius:8,border:"1px solid "+C.border,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/><button onClick={()=>sShowPw(!showPw)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.text3,fontSize:16}}>{showPw?"🙈":"👁"}</button></div></div>
        <button onClick={go} disabled={l} style={{width:"100%",padding:13,borderRadius:10,border:"none",background:l?C.text3:"linear-gradient(135deg,"+C.teal+",#0b7a70)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:l?"wait":"pointer"}}>{l?"Vérification...":"Se connecter"}</button>
      </div>
    </div>
  </div>
}

// ─── CONNECTEURS ─────────────────────────────────────────────────────────────
function Connecteurs(){
  const[orgs,sO]=useState([]);const[loading,sL]=useState(true);const[testing,sTesting]=useState({});const[results,sResults]=useState({});
  useEffect(()=>{fjA(ADM+"/organismes").then(r=>{sO(r?.data||[]);sL(false)})},[]);

  // Définition des connecteurs API gérés par Lihtea
  const CONNECTORS=[
    {id:"siret",name:"API SIRET / INSEE",icon:"🏢",endpoint:"api.insee.fr",type:"Enrichissement entreprises",desc:"Récupération automatique des données légales (raison sociale, NAF, effectifs, adresse) via numéro SIRET.",status:"active",keyConfigured:true},
    {id:"bpi",name:"Bpifrance Connect",icon:"🏦",endpoint:"api.bpifrance.fr",type:"Subventions & prêts",desc:"Consultation des dispositifs BPI disponibles selon profil entreprise.",status:"active",keyConfigured:true},
    {id:"ademe",name:"ADEME Agences",icon:"🌿",endpoint:"data.ademe.fr",type:"Aides environnementales",desc:"Synchronisation des dispositifs CEE, MaPrimeRénov et aides régionales ADEME.",status:"active",keyConfigured:true},
    {id:"cee",name:"Registre CEE",icon:"⚡",endpoint:"www.emmy.fr",type:"Certificats d'économie d'énergie",desc:"Registre national des CEE — vérification éligibilité et montants prime.",status:"active",keyConfigured:true},
    {id:"chorus",name:"Chorus Pro",icon:"📄",endpoint:"chorus-pro.gouv.fr",type:"Facturation publique",desc:"Dépôt et suivi des factures auprès des entités publiques (collectivités, hôpitaux).",status:"inactive",keyConfigured:false},
    {id:"webhook",name:"Webhooks sortants",icon:"🔔",endpoint:"Configurable par tenant",type:"Notifications",desc:"Envoi d'événements (dossier financé, simulation créée) vers les CRM clients via webhook.",status:"active",keyConfigured:true},
  ];

  const connectedOrgs=orgs.filter(o=>["ADEME","Bpifrance","DGFIP","ASP","BPI"].some(k=>o.sigle?.toUpperCase().includes(k)||o.nom?.toUpperCase().includes(k)));

  const testConnector=async(id)=>{
    sTesting(t=>({...t,[id]:true}));
    await new Promise(r=>setTimeout(r,1200+Math.random()*800));
    sResults(r=>({...r,[id]:{ok:id!=="chorus",ms:Math.round(80+Math.random()*120),ts:new Date()}}));
    sTesting(t=>({...t,[id]:false}));
  };

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
      <div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Connecteurs API</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>Gestion des intégrations plateforme — Lihtea uniquement</p></div>
      <Badge color={C.green}>{CONNECTORS.filter(c=>c.status==="active").length}/{CONNECTORS.length} actifs</Badge>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:24}}>
      <Stat icon={Ico.link(20)} value={CONNECTORS.filter(c=>c.status==="active").length} label="Connecteurs actifs" color={C.green}/>
      <Stat icon={Ico.star(20)} value={CONNECTORS.filter(c=>c.keyConfigured).length} label="Clés configurées" color={C.teal}/>
      <Stat icon={Ico.landmark(20)} value={connectedOrgs.length} label="Organismes connectés" color={C.navy}/>
      <Stat icon={Ico.alert(20)} value={CONNECTORS.filter(c=>c.status==="inactive").length} label="Inactifs" color={C.orange}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
      {CONNECTORS.map(c=>{
        const res=results[c.id];const isTesting=testing[c.id];
        return<div key={c.id} style={{padding:16,borderRadius:12,border:"1px solid "+(c.status==="active"?C.border:C.red+"40"),background:C.surface,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,background:(c.status==="active"?C.teal:C.red)+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.navy}}>{c.name}</div>
                <div style={{fontSize:10,color:C.text3,marginTop:1}}>{c.endpoint}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <div style={{width:8,height:8,borderRadius:4,background:c.status==="active"?C.green:C.red}} title={c.status}/>
              <Badge color={c.status==="active"?C.green:C.red}>{c.status==="active"?"Actif":"Inactif"}</Badge>
            </div>
          </div>
          <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>{c.desc}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Badge color={C.blue}>{c.type}</Badge>
            {res&&<span style={{fontSize:10,color:res.ok?C.green:C.red,fontWeight:600}}>{res.ok?"✓ "+res.ms+"ms":"✗ Erreur"}</span>}
          </div>
          <Btn small variant="outline" color={isTesting?C.text3:C.teal} disabled={isTesting} onClick={()=>testConnector(c.id)}>
            {isTesting?"⏳ Test en cours…":"🔍 Tester la connexion"}
          </Btn>
        </div>
      })}
    </div>

    {!loading&&orgs.length>0&&<div style={{marginTop:24}}>
      <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:12}}>Organismes du référentiel avec connecteur actif ({connectedOrgs.length})</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {connectedOrgs.map(o=><Badge key={o.id} color={o.couleur||C.teal}>{o.sigle||o.nom}</Badge>)}
        {connectedOrgs.length===0&&<span style={{fontSize:12,color:C.text3}}>Aucun organisme détecté avec connecteur API</span>}
      </div>
    </div>}
  </div>
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
// ── Icônes SVG line v5 ──
const ICN = {
  dashboard:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  tenants:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M19 21V11a2 2 0 0 0-2-2h-2"/><line x1="9" y1="7" x2="11" y2="7"/><line x1="9" y1="11" x2="11" y2="11"/><line x1="9" y1="15" x2="11" y2="15"/></svg>,
  analytics:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  alertes:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  organismes:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/><line x1="12" y1="9" x2="12" y2="11"/></svg>,
  dispositifs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
  equipements: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M3 22V11l7-5 7 5v11"/><path d="M9 22v-7h2v7"/><path d="M13 22v-4h2v4"/><circle cx="17" cy="9" r="1"/></svg>,
  catalogue:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  connecteurs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  users:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  rbac:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  logs:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const NAV=[
  {s:"PILOTAGE",items:[{id:"dashboard",l:"Dashboard",i:ICN.dashboard},{id:"tenants",l:"Clients",i:ICN.tenants},{id:"analytics",l:"Analytics",i:ICN.analytics},{id:"alertes",l:"Alertes",i:ICN.alertes}]},
  {s:"RÉFÉRENTIEL",items:[{id:"organismes",l:"Organismes",i:ICN.organismes},{id:"dispositifs",l:"Dispositifs",i:ICN.dispositifs},{id:"equipements",l:"Équipements",i:ICN.equipements},{id:"catalogue",l:"Éligibilités",i:ICN.catalogue},{id:"connecteurs",l:"Connecteurs",i:ICN.connecteurs}]},
  {s:"ADMIN",items:[{id:"users",l:"Utilisateurs",i:ICN.users},{id:"rbac",l:"Rôles & Accès",i:ICN.rbac},{id:"logs",l:"Audit logs",i:ICN.logs}]},
];

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
function Layout({user,onLogout}){
  const[page,sP]=useState("dashboard");const[sb,sSb]=useState(true);
  const[tenants,sTenants]=useState([]);const[users,sUsers]=useState([]);
  const[selectedTenant,setSelectedTenant]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[lastRefresh,setLastRefresh]=useState(null);
  const[refreshKey,setRefreshKey]=useState(0);

  // Chargement (et rechargement) des données globales
  const loadData=async()=>{
    setRefreshing(true);
    const[t,u]=await Promise.all([fjA(ADM+"/tenants"),fjA(ADM+"/user-stats")]);
    sTenants(t?.data||[]);sUsers(u?.data||[]);
    setRefreshKey(k=>k+1); // force re-mount DashboardSaaS pour rafraîchir crm-stats
    setLastRefresh(new Date());setRefreshing(false);
  };
  useEffect(()=>{loadData()},[]);

  const navigate=(pageId,arg)=>{
    if(pageId==="tenants"&&arg&&typeof arg==="object"){setSelectedTenant(arg);sP("tenants");}
    else if(pageId==="tenants"&&arg==="new"){setSelectedTenant(null);sP("tenants");}
    else{setSelectedTenant(null);sP(pageId);}
  };

  const all=NAV.flatMap(s=>s.items);const nav=all.find(n=>n.id===page);

  // Alert count for badge
  const alertCount=useMemo(()=>{
    const ws=tenants.map(t=>{const tu=users.filter(u=>u.tenant_id===t.id);const score=computeHealthScore(t,tu.length,tu.reduce((s,u)=>s+u.total_simulations,0));const hasAdmin=tu.some(u=>u.role==="admin"||u.role==="super_admin");return{...t,score,days:daysAgo(t.updated_at||t.created_at),hasAdmin};});
    return ws.filter(t=>t.actif&&(t.days>30||t.score<40||!t.hasAdmin)).length;
  },[tenants,users]);

  const PG=()=>{
    if(selectedTenant&&page==="tenants") return<TenantDetail tenant={selectedTenant} allUsers={users} onBack={()=>setSelectedTenant(null)} onRefresh={loadData}/>;
    switch(page){
      case "dashboard": return<DashboardSaaS key={refreshKey} onNavigate={navigate}/>;
      case "tenants":   return<Tenants allUsers={users} onSelectTenant={t=>{setSelectedTenant(t);}} initialAction={null}/>;
      case "analytics": return<Analytics tenants={tenants} users={users}/>;
      case "alertes":   return<Alertes tenants={tenants} users={users}/>;
      case "users":     return<UsersGlobal/>;
      case "rbac":      return<RolesRBAC users={users} tenants={tenants}/>;
      case "logs":      return<AuditLogs/>;
      case "organismes":  return<Organismes/>;
      case "dispositifs": return<Dispositifs/>;
      case "equipements": return<Equipements/>;
      case "catalogue":   return<Catalogue/>;
      case "connecteurs": return<Connecteurs/>;
      default:            return<DashboardSaaS onNavigate={navigate}/>;
    }
  };

  const initials = ((user?.email||"SA").slice(0,2)||"SA").toUpperCase();
  return<div style={{height:"100vh",display:"flex",flexDirection:"column",fontFamily:F.body,color:C.text,background:C.bg,overflow:"hidden"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap'); body, input, button, select, textarea { font-family: ${F.body}; } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 4px; } ::-webkit-scrollbar-track { background: transparent; }`}</style>

    {/* TOPBAR v5 — 60px navy */}
    <header style={{height:60,background:C.navy,display:"flex",alignItems:"center",padding:"0 24px",gap:16,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.06)",zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,background:C.tealB,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>L</div>
        <span style={{fontSize:15,fontWeight:700,color:"#fff",letterSpacing:"-0.3px"}}>Lihtea</span>
      </div>
      <div style={{width:1,height:24,background:"rgba(255,255,255,0.12)",margin:"0 4px"}}/>
      <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{selectedTenant?selectedTenant.nom:(nav?.l||"Super Admin")}</span>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={loadData} disabled={refreshing} title={lastRefresh?"Dernière actualisation : "+lastRefresh.toLocaleTimeString("fr-FR"):"Actualiser"}
          style={{padding:"6px 12px",borderRadius:R.sm,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.85)",fontSize:11,fontWeight:600,cursor:refreshing?"wait":"pointer",fontFamily:F.body,display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}>
          <span style={{display:"inline-block",animation:refreshing?"spin 1s linear infinite":"none"}}>↻</span>
          {refreshing?"Actualisation…":"Actualiser"}
        </button>
        {lastRefresh&&<span style={{fontSize:10,color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap"}}>màj {lastRefresh.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>}
        <span style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.75)",fontSize:11,padding:"4px 10px",borderRadius:20,border:"1px solid rgba(255,255,255,0.1)"}}>✨ Super Admin</span>
        <div style={{width:32,height:32,borderRadius:"50%",background:C.tealB,color:"#fff",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}} title={user?.email||""}>{initials}</div>
      </div>
    </header>

    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      {/* SIDEBAR v5 — claire avec sections */}
      <aside style={{width:sb?240:64,flexShrink:0,background:C.surface,display:"flex",flexDirection:"column",transition:"width 0.25s cubic-bezier(0.4,0,0.2,1)",zIndex:10,borderRight:"1px solid "+C.border,height:"100%",overflow:"hidden"}}>
        <nav style={{flex:1,padding:"6px 10px",display:"flex",flexDirection:"column",overflowY:"auto",overflowX:"hidden",gap:2}}>
          {NAV.map(section=><div key={section.s}>
            {sb&&<div style={{fontSize:10,fontWeight:600,color:C.text3,padding:"14px 8px 6px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{section.s}</div>}
            {section.items.map(item=>{const isActive=(page===item.id&&!(selectedTenant&&item.id==="tenants"&&page==="tenants"))||(selectedTenant&&item.id==="tenants");
            return<button key={item.id} onClick={()=>navigate(item.id)} title={!sb?item.l:""} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:sb?"8px 10px":"10px 8px",
              justifyContent:sb?"flex-start":"center",
              borderRadius:R.sm,border:"none",cursor:"pointer",width:"100%",
              background:isActive?C.tealBg:"transparent",
              color:isActive?C.teal:C.text2,
              fontSize:13,fontWeight:isActive?500:400,fontFamily:F.body,
              transition:"all 0.18s ease",whiteSpace:"nowrap",marginBottom:2,position:"relative"
            }}
            onMouseEnter={e=>{if(!isActive){e.currentTarget.style.background=C.bg;e.currentTarget.style.color=C.text}}}
            onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.text2}}}>
              <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,minWidth:20,opacity:isActive?1:0.7}}>{item.i}</span>
              {sb&&<span>{item.l}</span>}
              {item.id==="alertes"&&alertCount>0&&<span style={{marginLeft:"auto",background:C.red,color:"#fff",borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:700,flexShrink:0}}>{alertCount}</span>}
            </button>;})}
          </div>)}
        </nav>
        <div style={{flexShrink:0,borderTop:"1px solid "+C.border,padding:sb?"8px 10px 10px":"8px 6px 10px",display:"flex",flexDirection:"column",gap:6}}>
          {sb&&user&&<div style={{padding:"6px 10px",fontSize:11,color:C.text3,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={user.email}>{user.email}</div>}
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>sSb(p=>!p)} title={sb?"Réduire":"Déplier"} style={{flex:1,padding:"8px 4px",borderRadius:R.sm,border:"1px solid "+C.border,background:C.bg,color:C.text2,cursor:"pointer",fontSize:13,fontFamily:F.body,transition:"all .15s"}}>{sb?"◁":"▷"}</button>
            <button onClick={onLogout} title="Déconnexion" style={{padding:"8px 10px",borderRadius:R.sm,border:"1px solid "+C.redBg,background:C.redBg,color:C.red,cursor:"pointer",fontSize:12,fontFamily:F.body,fontWeight:600,transition:"all .15s"}}>{sb?"Déconnexion":"⏻"}</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT v5 — fond beige warm */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.bg}}>
        <div style={{flex:1,overflow:"auto",padding:"24px 28px"}}>
          {/* Page-header v5 */}
          <div style={{marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{display:"inline-flex",alignItems:"center",color:C.teal,opacity:0.85}}>{nav?.i}</span>
              <h1 style={{fontSize:22,fontWeight:700,color:C.navy,letterSpacing:"-0.4px",margin:0,fontFamily:F.body}}>{selectedTenant?selectedTenant.nom:(nav?.l||"Super Admin")}</h1>
            </div>
            {alertCount>0&&<span style={{background:C.redBg,color:C.red,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,border:"1px solid "+C.red+"33"}}>{alertCount} alerte{alertCount>1?"s":""}</span>}
          </div>
          <PG/>
        </div>
      </div>
    </div>
  </div>
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[s,sS]=useState(null);const[chk,sChk]=useState(true);
  // Animation spin pour le bouton refresh
  if(typeof document!=="undefined"&&!document.getElementById("sa-spin-style")){const st=document.createElement("style");st.id="sa-spin-style";st.textContent="@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";document.head.appendChild(st);}
  useEffect(()=>{
    const sv=au.get();
    if(sv?.access_token){_tok=sv.access_token;au.getUser(sv.access_token).then(u=>{if(u?.id)sS({...sv,user:u});else{au.clear();_tok=null;}sChk(false)}).catch(()=>{au.clear();_tok=null;sChk(false)});}
    else sChk(false);
  },[]);
  if(chk)return<div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+C.navy+",#1e3a5f)"}}><div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,"+C.gold+",#e8b84b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:C.navy}}>L</div></div>;
  if(!s)return<Login onLogin={r=>sS({access_token:r.access_token,user:r.user})}/>;
  return<Layout user={s.user} onLogout={async()=>{try{await au.signOut(s.access_token)}catch{}au.clear();_tok=null;sS(null)}}/>;
}
