import { useState, useEffect, useCallback } from "react";
const SU = "https://zjhiwwbabsggzhcfhyqb.supabase.co";
const AK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaGl3d2JhYnNnZ3poY2ZoeXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzQwMzIsImV4cCI6MjA4OTg1MDAzMn0.okmdU-XNarF70eTrrqu4xjNNVrVO-Nd27FUm7sGJ97U";
const API = `${SU}/functions/v1`;
const CAT = `${API}/catalogue-api`, ADM = `${API}/admin-api`, CON = `${API}/api-connectors`, AUTH = `${SU}/auth/v1`;
const C = {navy:"#0f2b46",navyL:"#1a3d5c",teal:"#0d9488",tealB:"#14b8a6",tealBg:"#f0fdfa",gold:"#d4a843",bg:"#f6f8fb",surface:"#fff",border:"#e1e7ef",text:"#1a2332",text2:"#4a5568",text3:"#8896a7",red:"#dc2626",green:"#059669",purple:"#7c3aed",blue:"#2563eb",orange:"#ea580c"};

const fj = async(u,o={})=>{try{return await(await fetch(u,{headers:{"Content-Type":"application/json"},...o})).json()}catch{return null}};
let _tok = null;
const fjA = async(u,o={})=>{const h={"Content-Type":"application/json",...(_tok?{Authorization:"Bearer "+_tok}:{})};try{return await(await fetch(u,{headers:h,...o})).json()}catch{return null}};
const fmt = v=>v!=null?Number(v).toLocaleString("fr-FR"):"—";
const fd = d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fa = d=>{if(!d)return"—";const m=Math.floor((Date.now()-new Date(d).getTime())/60000);if(m<60)return m+"min";const h=Math.floor(m/60);return h<24?h+"h":Math.floor(h/24)+"j"};
const ah = t=>({"Content-Type":"application/json",apikey:AK,...(t?{Authorization:`Bearer ${t}`}:{})});
const au = {
  signIn:async(e,p)=>(await fetch(`${AUTH}/token?grant_type=password`,{method:"POST",headers:ah(),body:JSON.stringify({email:e,password:p})})).json(),
  getUser:async t=>(await fetch(`${AUTH}/user`,{headers:ah(t)})).json(),
  signOut:async t=>{await fetch(`${AUTH}/logout`,{method:"POST",headers:ah(t)})},
  get:()=>{try{return JSON.parse(localStorage.getItem("ls_sa"))}catch{return null}},
  set:s=>localStorage.setItem("ls_sa",JSON.stringify(s)),
  clear:()=>localStorage.removeItem("ls_sa")
};

// === UI Components ===
function Badge({children,color=C.teal}){return<span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700,background:color+"15",color,textTransform:"uppercase",marginLeft:4}}>{children}</span>}
function Btn({children,onClick,color=C.navy,variant="solid",small,disabled,style:sx}){const s=variant==="solid";return<button onClick={onClick} disabled={disabled} style={{padding:small?"5px 10px":"8px 16px",borderRadius:8,border:s?"none":"1px solid "+color+"40",cursor:disabled?"not-allowed":"pointer",background:s?color:"transparent",color:s?"#fff":color,fontSize:small?11:12,fontWeight:600,fontFamily:"inherit",opacity:disabled?.5:1,...sx}}>{children}</button>}
function Input({label,value,onChange,type="text",placeholder,rows,options,disabled}){const b={padding:"8px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:13,fontFamily:"inherit",background:disabled?C.bg:C.surface,color:C.text,outline:"none",width:"100%",boxSizing:"border-box"};return<div style={{marginBottom:10}}>{label&&<div style={{fontSize:11,fontWeight:600,color:C.text3,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>}{options?<select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} style={b}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:rows?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} disabled={disabled} style={{...b,resize:"vertical"}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={b}/>}</div>}
function Modal({open,onClose,title,children,wide}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,43,70,0.5)",backdropFilter:"blur(4px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:16,padding:24,width:wide?720:480,maxWidth:"94vw",maxHeight:"88vh",overflow:"auto",boxShadow:"0 20px 60px rgba(15,43,70,0.3)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:16,fontWeight:700,color:C.navy}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.text3}}>✕</button></div>{children}</div></div>}
function Toast({msg,error}){if(!msg)return null;return<div style={{position:"fixed",top:16,right:16,zIndex:200,padding:"10px 20px",borderRadius:10,background:error?C.red:C.green,color:"#fff",fontSize:13,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{msg}</div>}
function Stat({icon,value,label,color=C.navy}){return<div style={{padding:16,borderRadius:12,background:C.surface,border:"1px solid "+C.border,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>{icon}</span><div><div style={{fontSize:22,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace"}}>{value??"—"}</div><div style={{fontSize:10,color:C.text3,textTransform:"uppercase"}}>{label}</div></div></div>}
function DT({columns,data,onEdit,onDelete,loading,empty}){if(loading)return<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement...</div>;if(!data?.length)return<div style={{padding:40,textAlign:"center",color:C.text3}}>{empty||"Aucune donnée"}</div>;return<div style={{overflowX:"auto",borderRadius:10,border:"1px solid "+C.border}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:C.navy}}>{columns.map((c,i)=><th key={i} style={{padding:"10px 14px",color:"#fff",fontWeight:600,textAlign:"left",fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:"0.04em"}}>{c.label}</th>)}{(onEdit||onDelete)&&<th style={{padding:"10px 14px",color:"#fff",textAlign:"right",fontSize:11,width:90}}>Actions</th>}</tr></thead><tbody>{data.map((row,ri)=><tr key={row.id||ri} style={{borderBottom:"1px solid "+C.border,background:ri%2?C.bg:C.surface}}>{columns.map((c,ci)=><td key={ci} style={{padding:"8px 12px"}}>{c.render?c.render(row[c.key],row):(row[c.key]??"—")}</td>)}{(onEdit||onDelete)&&<td style={{padding:"8px 12px",textAlign:"right",whiteSpace:"nowrap"}}>{onEdit&&<Btn small variant="outline" color={C.blue} onClick={e=>{e.stopPropagation();onEdit(row)}} style={{marginRight:4}}>✏️</Btn>}{onDelete&&<Btn small variant="outline" color={C.red} onClick={e=>{e.stopPropagation();onDelete(row)}}>🗑</Btn>}</td>}</tr>)}</tbody></table></div>}
function ConfirmModal({open,onClose,onConfirm,title,message,confirmLabel="Supprimer",confirmColor=C.red,icon="⚠️"}){if(!open)return null;return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(15,43,70,0.6)",backdropFilter:"blur(6px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:20,padding:0,width:380,maxWidth:"90vw",boxShadow:"0 24px 80px rgba(15,43,70,0.35)",overflow:"hidden"}}><div style={{padding:"24px 24px 0",textAlign:"center"}}><div style={{width:56,height:56,borderRadius:28,background:confirmColor+"12",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:12}}>{icon}</div><div style={{fontSize:17,fontWeight:800,color:C.navy,marginBottom:6}}>{title||"Confirmer"}</div><div style={{fontSize:13,color:C.text2,lineHeight:1.5}}>{message||"Cette action est irréversible."}</div></div><div style={{display:"flex",gap:10,padding:"20px 24px 24px",marginTop:8}}><button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid "+C.border,background:C.surface,color:C.text2,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button><button onClick={onConfirm} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:confirmColor,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{confirmLabel}</button></div></div></div>}

function useCrud(t){const[d,sD]=useState([]);const[l,sL]=useState(true);const r=useCallback(async()=>{sL(true);const x=await fjA(ADM+"/"+t);sD(x?.data||[]);sL(false)},[t]);useEffect(()=>{r()},[r]);return{data:d,loading:l,refresh:r,create:async rec=>{const x=await fjA(ADM+"/"+t,{method:"POST",body:JSON.stringify(rec)});if(x?.data){await r();return true}return false},update:async(id,rec)=>{const x=await fjA(ADM+"/"+t+"/"+id,{method:"PUT",body:JSON.stringify(rec)});if(x?.updated||x?.data){await r();return true}return false},remove:async id=>{const x=await fjA(ADM+"/"+t+"/"+id,{method:"DELETE"});if(x&&!x.error){await r();return true}return false}}}

// ═══════════════════════════════════════════════
// === VUE GLOBALE ===
// ═══════════════════════════════════════════════
function VueGlobale(){
  const[tenants,sT]=useState([]);const[stats,sSt]=useState({});const[l,sL]=useState(true);
  useEffect(()=>{
    Promise.all([fjA(ADM+"/tenants"),fjA(ADM+"/crm-stats"),fjA(ADM+"/user-stats")])
    .then(([t,s,u])=>{sT(t?.data||[]);sSt({...s?.data,total_users:u?.data?.length||0});sL(false)});
  },[]);
  const active=tenants.filter(t=>t.actif).length;
  const planColor={starter:C.teal,pro:C.blue,enterprise:C.gold};
  return<div>
    <div style={{marginBottom:20}}><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Vue globale</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>Tableau de bord consolidé — tous les clients</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:24}}>
      <Stat icon="🏢" value={tenants.length} label="Clients total" color={C.navy}/>
      <Stat icon="✅" value={active} label="Clients actifs" color={C.green}/>
      <Stat icon="👤" value={stats.total_users} label="Utilisateurs" color={C.teal}/>
      <Stat icon="👥" value={stats.total_prospects} label="Prospects" color={C.blue}/>
      <Stat icon="📊" value={stats.total_simulations} label="Simulations" color={C.purple}/>
      <Stat icon="💰" value={stats.pipeline_montant?Math.round(Number(stats.pipeline_montant)/1000)+"k€":"0€"} label="Pipeline total" color={C.gold}/>
    </div>
    <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>Répartition par client</div>
    {l?<div style={{padding:32,textAlign:"center",color:C.text3}}>Chargement...</div>:
    <div style={{borderRadius:12,border:"1px solid "+C.border,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:C.navy}}>
          {["Client","Slug","Plan","Statut","Créé le"].map((h,i)=><th key={i} style={{padding:"10px 14px",color:"#fff",fontWeight:600,textAlign:"left",fontSize:11,textTransform:"uppercase"}}>{h}</th>)}
        </tr></thead>
        <tbody>{tenants.map((t,i)=><tr key={t.id} style={{borderBottom:"1px solid "+C.border,background:i%2?C.bg:C.surface}}>
          <td style={{padding:"10px 14px",fontWeight:700}}>{t.nom}</td>
          <td style={{padding:"10px 14px"}}><span style={{fontFamily:"monospace",fontSize:11,background:C.bg,padding:"2px 6px",borderRadius:4}}>{t.slug}</span></td>
          <td style={{padding:"10px 14px"}}><Badge color={planColor[t.plan]||C.text3}>{t.plan||"starter"}</Badge></td>
          <td style={{padding:"10px 14px"}}>{t.actif?<Badge color={C.green}>Actif</Badge>:<Badge color={C.red}>Inactif</Badge>}</td>
          <td style={{padding:"10px 14px",fontSize:11,color:C.text3}}>{fd(t.created_at)}</td>
        </tr>)}
        </tbody>
      </table>
    </div>}
  </div>
}

// ═══════════════════════════════════════════════
// === GESTION DES TENANTS (CLIENTS) ===
// ═══════════════════════════════════════════════
function Tenants(){
  const{data:tenants,loading,refresh}=useCrud("tenants");
  const[m,sM]=useState(null);const[f,sF]=useState({});const[t,sT]=useState("");const[tErr,sTErr]=useState("");
  const[creating,sCr]=useState(false);const[confirm,sConf]=useState(null);
  const F=(k,v)=>sF(p=>({...p,[k]:v}));
  const fl=(x,err=false)=>{sT(x);sTErr(err?"1":"");setTimeout(()=>{sT("");sTErr("")},4000)};

  const createTenant=async()=>{
    if(!f.nom||!f.slug||!f.email||!f.password){fl("Tous les champs* sont requis",true);return}
    sCr(true);
    const slug=f.slug.toLowerCase().replace(/[^a-z0-9-]/g,"-");
    const r=await fetch(`${SU}/functions/v1/create-tenant`,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":AK,"Authorization":"Bearer "+AK},
      body:JSON.stringify({nom:f.nom,slug,email:f.email,password:f.password,plan:f.plan||"starter",email_support:f.email_support||f.email,brand_config:{name:f.nom,colors:{navy:"#0f2b46",teal:"#0d9488",gold:"#d4a843"}}})
    }).then(r=>r.json()).catch(()=>null);
    if(r?.tenant_id||r?.access_token){fl("✓ Client \""+f.nom+"\" créé avec succès");sM(null);refresh();}
    else fl("❌ "+(r?.error||r?.message||"Erreur lors de la création"),true);
    sCr(false);
  };

  const toggleTenant=async(tenant)=>{
    await fjA(ADM+"/tenants/"+tenant.id,{method:"PUT",body:JSON.stringify({actif:!tenant.actif})});
    fl(tenant.actif?"Client désactivé":"Client réactivé ✓");refresh();
  };

  const planColor={starter:C.teal,pro:C.blue,enterprise:C.gold};
  const plans=[{value:"starter",label:"Starter"},{value:"pro",label:"Pro"},{value:"enterprise",label:"Enterprise"}];
  const active=tenants.filter(t=>t.actif).length;

  return<div>
    <Toast msg={t} error={!!tErr}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Gestion des clients</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>{tenants.length} clients enregistrés — {active} actifs</p></div>
      <Btn color={C.teal} onClick={()=>{sF({nom:"",slug:"",email:"",password:"",plan:"starter",email_support:""});sM("new")}}>+ Nouveau client</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:20}}>
      <Stat icon="🏢" value={tenants.length} label="Total clients" color={C.navy}/>
      <Stat icon="✅" value={active} label="Actifs" color={C.green}/>
      <Stat icon="🔴" value={tenants.length-active} label="Inactifs" color={C.red}/>
      <Stat icon="🚀" value={tenants.filter(t=>t.plan==="pro"||t.plan==="enterprise").length} label="Pro / Enterprise" color={C.gold}/>
    </div>

    {/* Cards clients */}
    {loading?<div style={{padding:40,textAlign:"center",color:C.text3}}>Chargement...</div>:
    tenants.length===0?<div style={{padding:40,textAlign:"center",color:C.text3}}>Aucun client — créez le premier !</div>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
      {tenants.map(tenant=>{
        const cfg=tenant.brand_config||{};
        const col=cfg.colors?.teal||C.teal;
        return<div key={tenant.id} style={{borderRadius:14,border:"1px solid "+C.border,background:C.surface,overflow:"hidden",boxShadow:"0 2px 8px rgba(15,43,70,0.06)"}}>
          {/* Card header */}
          <div style={{padding:"14px 16px",background:cfg.colors?.navy||C.navy,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:8,background:cfg.colors?.gold||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:cfg.colors?.navy||C.navy,flexShrink:0}}>{cfg.logo||tenant.nom?.[0]||"?"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:14}}>{cfg.name||tenant.nom}</div>
              <div style={{fontSize:11,color:col,fontFamily:"monospace"}}>{tenant.slug}</div>
            </div>
            <div>{tenant.actif?<Badge color={C.green}>Actif</Badge>:<Badge color={C.red}>Inactif</Badge>}</div>
          </div>
          {/* Card body */}
          <div style={{padding:"12px 16px"}}>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <Badge color={planColor[tenant.plan]||C.text3}>{tenant.plan||"starter"}</Badge>
              {tenant.domaine&&<span style={{fontSize:11,color:C.text3,fontFamily:"monospace"}}>🌐 {tenant.domaine}</span>}
              {tenant.email_support&&<span style={{fontSize:11,color:C.text3}}>✉️ {tenant.email_support}</span>}
            </div>
            <div style={{fontSize:11,color:C.text3,marginBottom:12}}>Créé le {fd(tenant.created_at)}</div>
            {/* Actions */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Btn small variant="outline" color={C.blue}
                onClick={()=>window.open("https://simulateur-gef.vercel.app?t="+tenant.slug,"_blank")}>
                🔗 Simulateur
              </Btn>
              <Btn small variant="outline" color={C.purple}
                onClick={()=>{sF({...tenant,...(tenant.brand_config||{}),colors:{...(tenant.brand_config?.colors||{})}});sM("edit")}}>
                🎨 Configurer
              </Btn>
              <Btn small variant="outline" color={tenant.actif?C.red:C.green}
                onClick={()=>sConf(tenant)}>
                {tenant.actif?"🚫 Désactiver":"✅ Réactiver"}
              </Btn>
            </div>
          </div>
        </div>
      })}
    </div>}

    {/* Modal création */}
    <Modal open={m==="new"} onClose={()=>sM(null)} title="Créer un nouveau client" wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <div style={{gridColumn:"1/3",padding:12,borderRadius:8,background:C.tealBg,border:"1px solid "+C.teal+"30",fontSize:12,color:C.text2,marginBottom:8}}>
          Un compte admin sera automatiquement créé et les identifiants devront être transmis au client.
        </div>
        <Input label="Nom de la société*" value={f.nom||""} onChange={v=>{F("nom",v);if(!f.slug)F("slug",v.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"))}}/>
        <Input label="Slug URL*" value={f.slug||""} onChange={v=>F("slug",v.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} placeholder="ex: entreprise-x"/>
        <Input label="Email admin*" value={f.email||""} onChange={v=>F("email",v)} type="email"/>
        <Input label="Mot de passe*" value={f.password||""} onChange={v=>F("password",v)} type="password"/>
        <Input label="Plan" value={f.plan||"starter"} onChange={v=>F("plan",v)} options={plans}/>
        <Input label="Email support" value={f.email_support||""} onChange={v=>F("email_support",v)} type="email" placeholder="(même que admin par défaut)"/>
      </div>
      {f.slug&&<div style={{fontSize:11,color:C.text3,marginBottom:10}}>
        URL simulateur : <span style={{fontFamily:"monospace",color:C.teal}}>simulateur-gef.vercel.app?t={f.slug}</span>
      </div>}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
        <Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn>
        <Btn color={C.teal} onClick={createTenant} disabled={creating}>{creating?"Création en cours...":"🚀 Créer le client"}</Btn>
      </div>
    </Modal>

    {/* Modal configuration branding */}
    <Modal open={m==="edit"} onClose={()=>sM(null)} title={"Configurer — "+(f.nom||"")} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <Input label="Nom affiché" value={f.name||f.nom||""} onChange={v=>F("name",v)}/>
        <Input label="Slug" value={f.slug||""} onChange={v=>F("slug",v)} disabled/>
        <Input label="Plan" value={f.plan||"starter"} onChange={v=>F("plan",v)} options={plans}/>
        <Input label="Email support" value={f.email_support||""} onChange={v=>F("email_support",v)} type="email"/>
        <div style={{gridColumn:"1/3",fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",marginTop:8,marginBottom:2}}>Couleurs</div>
        {[["navy","Principale"],["teal","Accent"],["gold","Highlight"]].map(([key,lbl])=>(
          <div key={key} style={{display:"flex",alignItems:"center",gap:8,padding:8,borderRadius:8,border:"1px solid "+C.border}}>
            <input type="color" value={f.colors?.[key]||C[key]} onChange={e=>sF(p=>({...p,colors:{...(p.colors||{}), [key]:e.target.value}}))} style={{width:32,height:32,borderRadius:6,border:"none",cursor:"pointer"}}/>
            <div><div style={{fontSize:11,fontWeight:700}}>{lbl}</div><div style={{fontSize:10,fontFamily:"monospace",color:C.text3}}>{f.colors?.[key]||C[key]}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
        <Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn>
        <Btn color={C.teal} onClick={async()=>{
          const brand_config={name:f.name||f.nom,logo:f.logo,tagline:f.tagline,colors:f.colors};
          await fjA(ADM+"/tenants/"+f.id,{method:"PUT",body:JSON.stringify({nom:f.name||f.nom,plan:f.plan,email_support:f.email_support,brand_config})});
          fl("✓ Configuration sauvegardée");sM(null);refresh();
        }}>💾 Sauvegarder</Btn>
      </div>
    </Modal>

    <ConfirmModal open={!!confirm} onClose={()=>sConf(null)}
      title={confirm?.actif?"Désactiver ce client ?":"Réactiver ce client ?"}
      message={confirm?`${confirm.actif?"Désactiver":"Réactiver"} "${confirm.nom}" — le client ${confirm.actif?"ne pourra plus":"pourra à nouveau"} se connecter.`:""}
      icon={confirm?.actif?"🚫":"✅"} confirmLabel={confirm?.actif?"Désactiver":"Réactiver"}
      confirmColor={confirm?.actif?C.red:C.green}
      onConfirm={async()=>{await toggleTenant(confirm);sConf(null)}}/>
  </div>
}

// ═══════════════════════════════════════════════
// === CATALOGUE (copié depuis App.jsx — usage super-admin uniquement) ===
// ═══════════════════════════════════════════════
function Organismes(){const{data,loading,create,update,remove}=useCrud("organismes");const[m,sM]=useState(null);const[t,sT]=useState("");const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));const fl=x=>{sT(x);setTimeout(()=>sT(""),3000)};return<div><Toast msg={t}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Organismes</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>{data.length}</p></div><Btn onClick={()=>{sF({nom:"",sigle:"",type:"national",pays:"FR",couleur:"#0d9488",actif:true});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"sigle",label:"Sigle",render:(v,r)=><span style={{fontWeight:700,color:r.couleur}}>{v}</span>},{key:"nom",label:"Nom"},{key:"type",label:"Type",render:v=><Badge color={{national:C.teal,europeen:C.purple,regional:"#7e22ce",fiscal:C.gold}[v]}>{v}</Badge>},{key:"actif",label:"",render:v=>v?"✅":"❌"}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouvel organisme":"Modifier"}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}><Input label="Sigle*" value={f.sigle||""} onChange={v=>F("sigle",v)}/><Input label="Nom*" value={f.nom||""} onChange={v=>F("nom",v)}/><Input label="Type" value={f.type||"national"} onChange={v=>F("type",v)} options={[{value:"national",label:"National"},{value:"europeen",label:"Européen"},{value:"regional",label:"Régional"},{value:"fiscal",label:"Fiscal"}]}/><Input label="Couleur" value={f.couleur||""} onChange={v=>F("couleur",v)} type="color"/></div><Input label="Description" value={f.description||""} onChange={v=>F("description",v)} rows={2}/><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{if(m==="new"?await create(f):await update(f.id,f)){fl("✓");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.sigle}" ?`:""} icon="🏛️" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);fl("✓");sDel(null)}}/></div>}

function Dispositifs(){const{data,loading,create,update,remove}=useCrud("dispositifs");const[orgs,sO]=useState([]);const[m,sM]=useState(null);const[t,sT]=useState("");const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));const fl=x=>{sT(x);setTimeout(()=>sT(""),3000)};useEffect(()=>{fjA(ADM+"/organismes").then(r=>sO(r?.data||[]))},[]);return<div><Toast msg={t}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Dispositifs</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>{data.length}</p></div><Btn onClick={()=>{sF({nom:"",code:"",type_aide:"subvention",taux_min:0,taux_max:50,statut:"actif",organisme_id:orgs[0]?.id});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"code",label:"Code",render:v=><span style={{fontFamily:"monospace",fontSize:11,fontWeight:600}}>{v}</span>},{key:"nom",label:"Nom"},{key:"organisme_id",label:"Org.",render:v=><Badge color={C.navy}>{orgs.find(o=>o.id===v)?.sigle||"?"}</Badge>},{key:"type_aide",label:"Type",render:v=><Badge color={C.teal}>{v?.replace("_"," ")}</Badge>},{key:"taux_max",label:"Taux",render:(v,r)=>v?r.taux_min+"-"+v+"%":"—"},{key:"statut",label:"",render:v=><Badge color={v==="actif"?C.green:C.red}>{v}</Badge>}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouveau":"Modifier"} wide><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}><Input label="Code*" value={f.code||""} onChange={v=>F("code",v)}/><Input label="Nom*" value={f.nom||""} onChange={v=>F("nom",v)}/><Input label="Organisme" value={f.organisme_id||""} onChange={v=>F("organisme_id",v)} options={orgs.map(o=>({value:o.id,label:o.sigle}))}/><Input label="Type" value={f.type_aide||"subvention"} onChange={v=>F("type_aide",v)} options={["subvention","pret","credit_impot","prime","garantie","reduction_taux"].map(v=>({value:v,label:v.replace("_"," ")}))}/><Input label="Min%" value={f.taux_min??0} onChange={v=>F("taux_min",parseFloat(v)||0)} type="number"/><Input label="Max%" value={f.taux_max??0} onChange={v=>F("taux_max",parseFloat(v)||0)} type="number"/></div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{if(m==="new"?await create(f):await update(f.id,f)){fl("✓");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.code}" ?`:""} icon="📋" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);fl("✓");sDel(null)}}/></div>}

function Equipements(){const{data,loading,create,update,remove}=useCrud("equipements");const[cats,sC]=useState([]);const[fiches,sFC]=useState([]);const[m,sM]=useState(null);const[t,sT]=useState("");const[f,sF]=useState({});const[del,sDel]=useState(null);const F=(k,v)=>sF(p=>({...p,[k]:v}));const fl=x=>{sT(x);setTimeout(()=>sT(""),3000)};useEffect(()=>{fjA(ADM+"/categories_equipements").then(r=>sC(r?.data||[]));fjA(ADM+"/fiches_cee").then(r=>sFC(r?.data||[]))},[]);return<div><Toast msg={t}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Équipements</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>{data.length} dans le catalogue global</p></div><Btn onClick={()=>{sF({libelle:"",code_nomenclature:"",categorie_id:cats[0]?.id,fiche_cee_id:"",gain_energetique_typique:25,actif:true});sM("new")}} color={C.teal}>+ Ajouter</Btn></div><DT loading={loading} data={data} onEdit={r=>{sF({...r});sM("edit")}} onDelete={r=>sDel(r)} columns={[{key:"code_nomenclature",label:"Code",render:v=><span style={{fontFamily:"monospace",fontSize:11}}>{v}</span>},{key:"categorie_id",label:"Cat.",render:v=>{const c=cats.find(x=>x.id===v);return c?c.icone+" "+c.nom:"—"}},{key:"libelle",label:"Équipement",render:v=><span style={{fontWeight:600}}>{v}</span>},{key:"fiche_cee_id",label:"CEE",render:v=>v?<Badge color={C.teal}>{fiches.find(x=>x.id===v)?.code||"?"}</Badge>:""},{key:"gain_energetique_typique",label:"Gain",render:v=>v?<span style={{color:C.green,fontWeight:700}}>{v}%</span>:""},{key:"actif",label:"",render:v=>v?"✅":"❌"}]}/><Modal open={!!m} onClose={()=>sM(null)} title={m==="new"?"Nouveau":"Modifier"} wide><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}><Input label="Code" value={f.code_nomenclature||""} onChange={v=>F("code_nomenclature",v)}/><Input label="Libellé*" value={f.libelle||""} onChange={v=>F("libelle",v)}/><Input label="Catégorie" value={f.categorie_id||""} onChange={v=>F("categorie_id",v)} options={cats.map(c=>({value:c.id,label:(c.icone||"")+" "+c.nom}))}/><Input label="Fiche CEE" value={f.fiche_cee_id||""} onChange={v=>F("fiche_cee_id",v)} options={[{value:"",label:"Aucune"},...fiches.map(x=>({value:x.id,label:x.code}))]}/><Input label="Gain%" value={f.gain_energetique_typique??""} onChange={v=>F("gain_energetique_typique",v?parseFloat(v):null)} type="number"/></div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn variant="outline" onClick={()=>sM(null)}>Annuler</Btn><Btn color={C.teal} onClick={async()=>{const p={...f};if(!p.fiche_cee_id)p.fiche_cee_id=null;if(m==="new"?await create(p):await update(p.id,p)){fl("✓");sM(null)}}}>{m==="new"?"Créer":"Sauvegarder"}</Btn></div></Modal><ConfirmModal open={!!del} onClose={()=>sDel(null)} title="Désactiver ?" message={del?`"${del.libelle}" ?`:""} icon="🏭" confirmLabel="Désactiver" confirmColor={C.orange} onConfirm={async()=>{await remove(del.id);fl("✓");sDel(null)}}/></div>}

function Catalogue(){const[d,sD]=useState([]);const[l,sL]=useState(true);const[f,sF]=useState({o:"",c:""});useEffect(()=>{fj(CAT+"/catalogue").then(r=>{sD(r?.data||[]);sL(false)})},[]);const orgs=[...new Set(d.map(x=>x.organisme_sigle))].sort();const cats=[...new Set(d.map(x=>x.categorie_code).filter(Boolean))].sort();const filtered=d.filter(x=>(!f.o||x.organisme_sigle===f.o)&&(!f.c||x.categorie_code===f.c));return<div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:"0 0 4px"}}>Éligibilités</h2><div style={{display:"flex",gap:10,marginBottom:16}}><select value={f.o} onChange={e=>sF(p=>({...p,o:e.target.value}))} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}><option value="">Tous</option>{orgs.map(o=><option key={o}>{o}</option>)}</select><select value={f.c} onChange={e=>sF(p=>({...p,c:e.target.value}))} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}><option value="">Toutes</option>{cats.map(c=><option key={c}>{c}</option>)}</select><span style={{marginLeft:"auto",fontSize:12,color:C.text3}}>{filtered.length} entrées</span></div><DT loading={l} data={filtered} columns={[{key:"organisme_sigle",label:"Org.",render:(v,r)=><span style={{color:r.organisme_couleur,fontWeight:700}}>{v}</span>},{key:"dispositif_code",label:"Dispositif",render:v=><span style={{fontFamily:"monospace",fontSize:11}}>{v}</span>},{key:"equipement_libelle",label:"Équipement",render:v=><span style={{fontWeight:600}}>{v}</span>},{key:"fiche_cee_code",label:"CEE",render:v=>v?<Badge color={C.teal}>{v}</Badge>:""},{key:"taux_subvention",label:"Taux",render:v=>v?<span style={{color:C.green,fontWeight:700}}>{Number(v)}%</span>:""}]}/></div>}

// ═══════════════════════════════════════════════
// === TOUS LES UTILISATEURS (toutes tenants) ===
// ═══════════════════════════════════════════════
function UsersGlobal(){
  const[users,sU]=useState([]);const[loading,sL]=useState(true);const[tenants,sT]=useState([]);const[tf,sTF]=useState("");const[t,sToast]=useState("");
  const fl=x=>{sToast(x);setTimeout(()=>sToast(""),3000)};
  const load=async()=>{sL(true);const[ur,tr]=await Promise.all([fjA(ADM+"/user-stats"),fjA(ADM+"/tenants")]);sU(ur?.data||[]);sT(tr?.data||[]);sL(false)};
  useEffect(()=>{load()},[]);
  const filtered=tf?users.filter(u=>u.tenant_id===tf):users;
  return<div><Toast msg={t}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
      <div><h2 style={{fontSize:18,fontWeight:800,color:C.navy,margin:0}}>Tous les utilisateurs</h2><p style={{fontSize:13,color:C.text3,margin:"4px 0 0"}}>{filtered.length} comptes — {tenants.length} clients</p></div>
      <select value={tf} onChange={e=>sTF(e.target.value)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid "+C.border,fontSize:12,fontFamily:"inherit"}}>
        <option value="">Tous les clients</option>
        {tenants.map(t=><option key={t.id} value={t.id}>{t.nom}</option>)}
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:16}}>
      <Stat icon="👤" value={filtered.length} label="Utilisateurs" color={C.navy}/>
      <Stat icon="✅" value={filtered.filter(u=>u.actif).length} label="Actifs" color={C.green}/>
      <Stat icon="📊" value={filtered.reduce((a,u)=>a+u.total_simulations,0)} label="Simulations" color={C.teal}/>
    </div>
    <DT loading={loading} data={filtered} columns={[
      {key:"prenom",label:"Utilisateur",render:(v,r)=><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:14,background:r.actif?C.teal:C.text3,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700}}>{(r.prenom?.[0]||"")+(r.nom?.[0]||"?")}</div><div><div style={{fontWeight:600}}>{v} {r.nom}</div><div style={{fontSize:10,color:C.text3}}>{r.email}</div></div></div>},
      {key:"tenant_id",label:"Client",render:v=>{const t=tenants.find(x=>x.id===v);return t?<Badge color={C.navy}>{t.nom}</Badge>:"—"}},
      {key:"role",label:"Rôle",render:v=><Badge color={v==="super_admin"?C.gold:v==="admin"?C.purple:C.teal}>{v}</Badge>},
      {key:"actif",label:"Statut",render:v=>v?<Badge color={C.green}>Actif</Badge>:<Badge color={C.red}>Inactif</Badge>},
      {key:"total_simulations",label:"Sims",render:v=><span style={{fontWeight:700}}>{v}</span>},
      {key:"last_sign_in",label:"Dern. connexion",render:v=><span style={{fontSize:11,color:C.text3}}>{v?fa(v):"Jamais"}</span>}
    ]}/>
  </div>
}

// ═══════════════════════════════════════════════
// === LOGIN ===
// ═══════════════════════════════════════════════
function Login({onLogin}){const[e,sE]=useState("");const[p,sP]=useState("");const[err,sErr]=useState("");const[l,sL]=useState(false);const[showPw,sShowPw]=useState(false);
  const go=async()=>{sErr("");sL(true);
    const r=await au.signIn(e,p);
    if(r.error)sErr(r.error_description||"Identifiants incorrects");
    else if(r.access_token){
      _tok=r.access_token;
      // Vérification rôle super_admin
      const ur=await fjA(ADM+"/users?auth_id=eq."+r.user.id).catch(()=>null);
      const role=ur?.data?.[0]?.role;
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
        <div style={{fontSize:11,color:C.tealB,textTransform:"uppercase",letterSpacing:"0.14em",marginTop:4}}>Super Admin — Accès restreint</div>
      </div>
      <div style={{background:C.surface,borderRadius:16,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <h2 style={{fontSize:17,fontWeight:700,color:C.navy,marginBottom:20}}>Connexion</h2>
        {err&&<div style={{padding:10,borderRadius:8,background:C.red+"10",color:C.red,fontSize:12,marginBottom:14,lineHeight:1.4}}>{err}</div>}
        <div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",display:"block",marginBottom:4}}>Email</label><input type="email" value={e} onChange={x=>sE(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid "+C.border,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
        <div style={{marginBottom:20}}><label style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:"uppercase",display:"block",marginBottom:4}}>Mot de passe</label><div style={{position:"relative"}}><input type={showPw?"text":"password"} value={p} onChange={x=>sP(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={{width:"100%",padding:"10px 14px",paddingRight:42,borderRadius:8,border:"1px solid "+C.border,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/><button onClick={()=>sShowPw(!showPw)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.text3,fontSize:16}}>{showPw?"🙈":"👁"}</button></div></div>
        <button onClick={go} disabled={l} style={{width:"100%",padding:13,borderRadius:10,border:"none",background:l?C.text3:"linear-gradient(135deg,"+C.teal+",#0b7a70)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:l?"wait":"pointer"}}>
          {l?"Vérification...":"Se connecter"}
        </button>
      </div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════
// === LAYOUT SUPER-ADMIN ===
// ═══════════════════════════════════════════════
const NAV_SUPER=[
  {s:"VUE GLOBALE",items:[{id:"vue",l:"Vue globale",i:"🌐"},{id:"tenants",l:"Clients",i:"🏢"}]},
  {s:"CATALOGUE",items:[{id:"organismes",l:"Organismes",i:"🏛️"},{id:"dispositifs",l:"Dispositifs",i:"📋"},{id:"equipements",l:"Équipements",i:"🏭"},{id:"catalogue",l:"Éligibilités",i:"✅"}]},
  {s:"ADMIN",items:[{id:"users",l:"Tous les users",i:"👤"}]}
];

function Layout({user,onLogout}){
  const[page,sP]=useState("vue");const[sb,sSb]=useState(true);
  const all=NAV_SUPER.flatMap(s=>s.items);const nav=all.find(n=>n.id===page);
  const PG={vue:VueGlobale,tenants:Tenants,organismes:Organismes,dispositifs:Dispositifs,equipements:Equipements,catalogue:Catalogue,users:UsersGlobal};
  const Pg=PG[page]||VueGlobale;
  return<div style={{height:"100vh",display:"flex",fontFamily:"'Inter','DM Sans',-apple-system,sans-serif",color:C.text,background:C.bg,overflow:"hidden"}}>
    <div style={{width:sb?240:64,flexShrink:0,background:C.navy,display:"flex",flexDirection:"column",transition:"width 0.3s",zIndex:10,borderRight:"1px solid rgba(255,255,255,0.1)"}}>
      <div style={{padding:sb?"20px 16px":"20px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,"+C.gold+",#e8b84b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:C.navy,flexShrink:0}}>L</div>
        {sb&&<div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Lihtea</div><div style={{fontSize:9,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em"}}>Super Admin</div></div>}
      </div>
      <nav style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
        {NAV_SUPER.map(section=><div key={section.s}>
          {sb&&<div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.25)",padding:"12px 16px 4px",letterSpacing:"0.1em",textTransform:"uppercase"}}>{section.s}</div>}
          {section.items.map(item=>{const isActive=page===item.id;return<button key={item.id} onClick={()=>sP(item.id)} style={{display:"flex",alignItems:"center",gap:12,padding:sb?"14px 16px":"14px 12px",justifyContent:sb?"flex-start":"center",borderRadius:0,border:"none",borderLeft:isActive?"4px solid "+C.gold:"4px solid transparent",cursor:"pointer",width:"100%",background:isActive?"linear-gradient(90deg,rgba(212,168,67,0.2),rgba(212,168,67,0.05))":"transparent",color:isActive?"#ffffff":"rgba(255,255,255,0.5)",fontSize:13,fontWeight:isActive?700:500,fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}}>
            <span style={{fontSize:16,flexShrink:0,minWidth:20,textAlign:"center",color:isActive?C.gold:"inherit"}}>{item.i}</span>
            {sb&&<span>{item.l}</span>}
          </button>})}
        </div>)}
      </nav>
      {sb&&user&&<div style={{padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,0.1)",fontSize:11,color:"rgba(255,255,255,0.4)"}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div></div>}
      <div style={{display:"flex",gap:6,padding:"0 12px 12px"}}>
        <button onClick={()=>sSb(p=>!p)} style={{flex:1,padding:8,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{sb?"◁":"▷"}</button>
        <button onClick={onLogout} style={{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(220,38,38,0.3)",background:"rgba(220,38,38,0.1)",color:"#ef4444",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>{sb?"Déconnexion":"⏻"}</button>
      </div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"0 28px",borderBottom:"1px solid "+C.border,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(16px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,height:52}}>
        <span style={{fontSize:17,fontWeight:800,color:C.navy}}>{nav?.i} {nav?.l}</span>
        <div style={{display:"flex",gap:8}}>
          <Badge color={C.gold}>Super Admin</Badge>
          <Badge color={C.navy}>Lihtea Platform</Badge>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:24}}><Pg/></div>
    </div>
  </div>
}

// ═══════════════════════════════════════════════
// === APP ===
// ═══════════════════════════════════════════════
export default function App(){
  const[s,sS]=useState(null);const[chk,sChk]=useState(true);
  useEffect(()=>{
    const sv=au.get();
    if(sv?.access_token){
      _tok=sv.access_token;
      au.getUser(sv.access_token).then(u=>{
        if(u?.id)sS({...sv,user:u});else{au.clear();_tok=null;}
        sChk(false);
      }).catch(()=>{au.clear();_tok=null;sChk(false)});
    }else sChk(false);
  },[]);
  if(chk)return<div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,"+C.navy+",#1e3a5f)"}}><div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,"+C.gold+",#e8b84b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:C.navy}}>L</div></div>;
  if(!s)return<Login onLogin={r=>sS({access_token:r.access_token,user:r.user})}/>;
  return<Layout user={s.user} onLogout={async()=>{try{await au.signOut(s.access_token)}catch{}au.clear();_tok=null;sS(null)}}/>;
}
