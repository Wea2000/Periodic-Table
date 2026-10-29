// Detail panel: electron configuration, Bohr model, scientific properties
const ORD=["1s","2s","2p","3s","3p","4s","3d","4p","5s","4d","5p","6s","4f","5d","6p","7s","5f","6d","7p"],CAP={s:2,p:6,d:10,f:14};
const NOBLE=[2,10,18,36,54,86];
const srt=ks=>ks.sort((a,b)=>a[0]-b[0]||"spdf".indexOf(a[1])-"spdf".indexOf(b[1]));
function config(z){
 const c={};let r=z;
 for(const o of ORD){const k=Math.min(r,CAP[o[1]]);c[o]=k;r-=k;if(!r)break}
 if(EXC[z])EXC[z].split(",").forEach(p=>{const[o,v]=p.split(":");c[o]=+v});
 return c;
}
const fmt=c=>srt(Object.keys(c).filter(o=>c[o]>0)).map(o=>`${o}<sup>${c[o]}</sup>`).join(" ");
function shorthand(z){
 const ng=NOBLE.filter(n=>n<z).pop();
 if(!ng)return fmt(config(z));
 const c=config(z),core=config(ng),rem={};
 for(const o in c){const v=c[o]-(core[o]||0);if(v>0)rem[o]=v}
 return `[${N[ng-1][0]}] `+fmt(rem);
}
function shells(z){const c=config(z),s=Array(7).fill(0);for(const o in c)s[o[0]-1]+=c[o];return s}
function bohr(z,sh,col){
 let s=`<svg viewBox="0 0 200 200" class="bohr"><circle cx="100" cy="100" r="11" fill="rgba(${col},.35)" stroke="rgb(${col})"/>`;
 sh.forEach((n,k)=>{
  if(!n)return;const r=22+k*11;
  s+=`<circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(${col},.35)"/><g class="orb" style="animation-duration:${6+k*3}s;${k%2?"animation-direction:reverse":""}">`;
  for(let j=0;j<n;j++){const a=2*Math.PI*j/n;s+=`<circle cx="${(100+r*Math.cos(a)).toFixed(1)}" cy="${(100+r*Math.sin(a)).toFixed(1)}" r="2.6" fill="rgb(${col})"/>`}
  s+="</g>";
 });
 return s+"</svg>";
}
function details(i){
 const z=i+1,T=TX[lang=="ar"?"ar":"en"],ar=lang=="ar",col=COL[key(z)][0];
 const[ms,mp,bp,rho,en,yr]=DT[i],[row,cl]=pos(z),f=(z>=57&&z<=71)||(z>=89&&z<=103);
 const period=row<=7?row:row==9?6:7,group=f?"—":cl;
 const block=f?"f":z==2||cl<=2?"s":cl>=13?"p":"d";
 const cat=CATS.find(c=>c[3].includes(z)),catName=cat?(ar?cat[2]:cat[1]):"—";
 const M=+mp,B=+bp;
 const stt=bp&&B<298.15?"gas":mp&&M<298.15?"liquid":mp?"solid":null;
 const unstable=z==43||z==61||(z>=84&&![90,91,92].includes(z));
 const k=v=>`${v} K (${(v-273.15).toFixed(v<30?1:0)} °C)`;
 const unit=stt=="gas"?"g/L":"g/cm³";
 const rows=[
  [T.pe,z],[T.ms,unstable?`(${ms})`:ms],[T.gr,group],[T.pr,period],[T.bl,block],[T.ct,catName],
  [T.st,stt?T[stt]:T.unk],[T.mp,mp?k(M):T.unk],[T.bp,bp?k(B):T.unk],[T.dn,rho?`${rho} ${unit}`:T.unk],
  [T.en,en||"—"],[T.yr,yr==="0"?T.anc:yr||T.unk]
 ];
 return bohr(z,shells(z),col)
  +`<div class="cfg"><small>${T.cfg}</small><div dir="ltr">${shorthand(z)}</div><div dir="ltr" class="full">${fmt(config(z))}</div></div>`
  +`<div class="cfg"><small>${T.sh}</small><div dir="ltr">${shells(z).filter(Boolean).join(" · ")}</div></div>`
  +`<div class="kv">${rows.map(([a,b])=>`<div><small>${a}</small>${b}</div>`).join("")}</div>`
  +`<div class="nt">${T.note}</div>`;
}
