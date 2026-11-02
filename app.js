const RED=new Set([1,2,6,7,8,9,10,15,16,17,18,34,35,36,53,54,85,86]);
const YEL=new Set([3,4,5,11,12,13,14,19,20,31,32,33,37,38,49,50,51,52,55,56,81,82,83,84,87,88]);
const COL={R:["255,70,70","255,150,150"],Y:["232,172,30","255,226,110"],G:["60,220,90","150,255,165"],T:["30,210,190","120,255,236"]};
const key=n=>n>=104?"T":RED.has(n)?"R":YEL.has(n)?"Y":"G";
const pos=n=>n<=2?[1,n==1?1:18]:n<=4?[2,n-2]:n<=10?[2,n+8]:n<=12?[3,n-10]:n<=18?[3,n]:n<=36?[4,n-18]:n<=54?[5,n-36]:n<=56?[6,n-54]:n<=71?[9,n-54]:n<=86?[6,n-68]:n<=88?[7,n-86]:n<=103?[10,n-86]:[7,n-100];
const PI=Math.PI,L=N.length;
const LAY={
 table:i=>{const[r,c]=pos(i+1);return{x:c*140-1330,y:r*180-990,z:0,rx:0,ry:0}},
 sphere:i=>{const phi=Math.acos(-1+2*i/L),a=Math.sqrt(L*PI)*phi,e=PI/2-phi,R=800;return{x:R*Math.cos(e)*Math.sin(a),y:-R*Math.sin(e),z:R*Math.cos(e)*Math.cos(a),rx:e,ry:a}},
 helix:i=>{const t=i*.175+PI,R=900;return{x:R*Math.sin(t),y:i*8-450,z:R*Math.cos(t),rx:0,ry:t}},
 grid:i=>({x:(i%5)*320-640,y:(Math.floor(i/5)%5)*300-600,z:Math.floor(i/25)*500-1000,rx:0,ry:0})
};
// Layout spacing follows tile size, so large tiles never overlap
const scaleF=()=>{const[w,h]=SHAPES[CF.shape]||SHAPES.rect;return Math.max(1,(w*CF.size+20)/140,(h*CF.size+20)/180)};
const lay=(m,i)=>{const T=LAY[m](i),f=scaleF();T.x*=f;T.y*=f;T.z*=f;return T};
const scene=document.getElementById("scene"),btns=[...document.querySelectorAll("#bar button")];
const rnd=a=>(Math.random()-.5)*a;
const tiles=N.map(([s,nm],i)=>{
 const n=i+1,[c,l]=tc(n),d=document.createElement("div");
 d.className="t";d.dataset.i=i;d.style.cssText=`--c:${c};--l:${l};--ra:${(.12+Math.random()*.35).toFixed(2)}`;
 // keyboard access: roving tabindex, Enter/Space opens, arrows move between elements
 d.tabIndex=i?-1:0;d.setAttribute("role","button");d.setAttribute("aria-label",`${n} ${nm}`);
 d.innerHTML=`<i>${n}</i><b>${s}</b><s>${nm}</s>`;scene.appendChild(d);
 d.onkeydown=e=>{
  if(e.key=="Enter"||e.key==" "){e.preventDefault();openEl(i,d)}
  else{const j={ArrowRight:i+1,ArrowDown:i+1,ArrowLeft:i-1,ArrowUp:i-1,Home:0,End:L-1}[e.key];if(j!==undefined&&tiles[j]){e.preventDefault();tiles[j].d.focus({preventScroll:true})}}
 };
 d.onfocus=()=>tiles.forEach(t=>{t.d.tabIndex=t.d===d?0:-1});
 return{d,c:{x:rnd(4000),y:rnd(4000),z:rnd(4000),rx:rnd(6),ry:rnd(6)},f:null,to:null,t0:0};
});
const wrap=a=>a-2*PI*Math.round(a/(2*PI)),ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
let mode="",rot={x:0,y:0},zoom=1,drag=false,resetAt=0,S=.4,sel=false,sx=0,sy=0,pan={x:0,y:0},ptrs=new Map(),t0=0,moved=false,pd=0,kk=1,po={x:0,y:0},mvUntil=0,wasMv=false,raf=0,opener=null;
// The render loop only runs while something moves; wake() restarts it
function wake(){if(!raf)raf=requestAnimationFrame(frame)}
// Fit the camera to the current layout: [width, height] of each shape in scene units
const FIT={table:[2520,1850],sphere:[1800,1800],helix:[2000,1250],grid:[1500,1500]},EXT={table:0,sphere:820,helix:920,grid:1050};
function fit(){const f=FIT[mode]||FIT.table,k=scaleF();S=Math.max(.1,Math.min(innerWidth*.94/(f[0]*k),innerHeight*.82/(f[1]*k)));wake()}
// Tile size/shape changed: snap tiles to the re-spaced layout
function rescale(){if(!LAY[mode]||!tiles[0].to)return;tiles.forEach((t,i)=>{const T=lay(mode,i);for(const k of["x","y","z"])t.c[k]=t.f[k]=t.to[k]=T[k]});fit()}
function go(m){
 mode=m;{const e0=S*zoom,px=pan.x,py=pan.y;fit();zoom=1;pan.x=pan.y=0;kk=e0/S;po.x=px;po.y=py;ptrs.clear();drag=false;mvUntil=performance.now()+2400}btns.forEach(b=>b.classList.toggle("on",b.dataset.m==m));resetAt=performance.now();
 tiles.forEach((t,i)=>{const T=lay(m,i);t.f={...t.c};T.rx=t.c.rx+wrap(T.rx-t.c.rx);T.ry=t.c.ry+wrap(T.ry-t.c.ry);t.to=T;t.t0=performance.now()+Math.random()*500});
 wake();
}
function frame(now){
 raf=0;let busy=false;
 const mv=now<mvUntil;if(mv!==wasMv){wasMv=mv;document.body.classList.toggle("mv",mv)}
 if(mv)busy=true;
 for(const t of tiles){
  const raw=(now-t.t0)/1600;if(raw<1)busy=true;
  const p=Math.max(0,Math.min(1,raw)),e=ease(p),c=t.c,f=t.f,T=t.to;
  for(const k in T)c[k]=f[k]+(T[k]-f[k])*e;
  t.d.style.transform=`translate3d(${c.x}px,${c.y}px,${c.z}px) rotateY(${c.ry}rad) rotateX(${c.rx}rad)`;
 }
 if(drag)busy=true;
 else if(!sel){
  const settling=now-resetAt<2200;
  if(mode=="table"||mode=="grid"||settling){
   const tg=Math.round(rot.y/(2*PI))*2*PI;rot.x*=.9;rot.y+=(tg-rot.y)*.08;
   if(Math.abs(rot.x)<.001)rot.x=0;if(Math.abs(tg-rot.y)<.001)rot.y=tg;
   if(rot.x||rot.y!==tg||settling)busy=true;
  }else{rot.y+=.003;busy=true}
 }
 kk+=(1-kk)*.1;po.x*=.9;po.y*=.9;
 if(Math.abs(kk-1)>.002||Math.abs(po.x)>.2||Math.abs(po.y)>.2)busy=true;else{kk=1;po.x=po.y=0}
 const E=S*zoom*kk;scene.style.transform=`translate(${pan.x+po.x}px,${pan.y+po.y}px) scale3d(${E},${E},${E}) rotateX(${rot.x}rad) rotateY(${rot.y}rad)`;
 if(busy)raf=requestAnimationFrame(frame);
}
btns.forEach(b=>b.onclick=()=>go(b.dataset.m));
const st=document.getElementById("stage");
st.onpointerdown=e=>{if(e.pointerType=="mouse")ptrs.clear();st.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});drag=true;if(ptrs.size==1){sx=e.clientX;sy=e.clientY;t0=Date.now();moved=false}else{moved=true;pd=dist()}st.style.cursor="grabbing";wake()};
const dist=()=>{const a=[...ptrs.values()];return a.length>1?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0};
const mid=()=>{const a=[...ptrs.values()];return a.length>1?{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}:{x:0,y:0}};
function zoomAt(f,cx,cy){mvUntil=performance.now()+300;const ex=(EXT[mode]||0)*scaleF(),mx=ex?Math.min(5,1100/(S*ex)):5,nz=Math.max(.3,Math.min(mx,zoom*f)),k=nz/zoom;pan.x=(pan.x-cx)*k+cx;pan.y=(pan.y-cy)*k+cy;zoom=nz;wake()}
function pick(x,y){let b=null,bd=1e9,ba=0;for(const t of tiles){const r=t.d.getBoundingClientRect();if(!r.width)continue;const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),d=Math.hypot(dx,dy),a=r.width*r.height;if(d<=24&&(d<bd-.5||(Math.abs(d-bd)<=.5&&a>ba))){bd=d;ba=a;b=t.d}}return b}
st.onpointermove=e=>{const p=ptrs.get(e.pointerId);if(!p)return;
 if(ptrs.size==1){const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.hypot(e.clientX-sx,e.clientY-sy)>16)moved=true;
  if(mode=="table"||e.shiftKey||e.buttons==2){pan.x+=dx;pan.y+=dy}else{rot.y+=dx*.005;rot.x=Math.max(-1.4,Math.min(1.4,rot.x-dy*.005))}
  p.x=e.clientX;p.y=e.clientY}
 else{const m0=mid();p.x=e.clientX;p.y=e.clientY;const m1=mid(),d1=dist();pan.x+=m1.x-m0.x;pan.y+=m1.y-m0.y;if(pd>0&&d1>0)zoomAt(d1/pd,m1.x-innerWidth/2,m1.y-innerHeight/2);pd=d1}};
st.onpointerup=st.onpointercancel=e=>{const was=ptrs.size;ptrs.delete(e.pointerId);if(ptrs.size==0){drag=false;st.style.cursor="grab";if(e.type=="pointerup"&&!moved&&was==1&&Date.now()-t0<1200){const d=pick(e.clientX,e.clientY);if(d)openEl(+d.dataset.i,d)}}else pd=dist();wake()};
st.onwheel=e=>{e.preventDefault();zoomAt(e.deltaY>0?.9:1.1,e.clientX-innerWidth/2,e.clientY-innerHeight/2)};
document.querySelectorAll("#zm button").forEach(b=>b.onclick=()=>{const z=+b.dataset.z;if(!z){zoom=1;pan.x=pan.y=0;wake()}else zoomAt(z,0,0)});
addEventListener("keydown",e=>{
 if(e.target.matches&&e.target.matches("input,select"))return;
 if(e.key=="+"||e.key=="=")zoomAt(1.2,0,0);if(e.key=="-")zoomAt(.83,0,0);if(e.key=="0"){zoom=1;pan.x=pan.y=0;wake()}
 if(e.key=="Escape"){closeEl();if(dr.classList.contains("open"))toggleDr(false)}
});
st.oncontextmenu=e=>e.preventDefault();
st.onlostpointercapture=e=>{ptrs.delete(e.pointerId);if(!ptrs.size){drag=false;st.style.cursor="grab";wake()}};
addEventListener("blur",()=>{ptrs.clear();drag=false;wake()});
setTimeout(()=>document.getElementById("hint").style.opacity=0,7000);
const ov=document.getElementById("ov"),cd=document.getElementById("cd"),hd=cd.querySelector(".hd"),exs=document.getElementById("exs"),lst=document.getElementById("lst");
const lbl=document.querySelector(".lb"),dtb=document.getElementById("dtb"),dp=document.getElementById("dt");
dtb.onclick=()=>{const o=dp.classList.toggle("open");dtb.classList.toggle("open",o);dtb.setAttribute("aria-expanded",o);dp.inert=!o};
ov.inert=true;dp.inert=true;
const BG=["stage","bar","zm","mn","lg"],bgInert=b=>BG.forEach(id=>{document.getElementById(id).inert=b});
let ft="",cur=0,lang="en";
function fill(){const i=cur,n=i+1,a=lang=="ar";let ex=(a?X:XE)[i].split("|");if(n>=104)ex=[a?"عنصر اصطناعي يتحلل خلال أجزاء من الثانية":"Synthetic, decays in a fraction of a second",...ex];hd.innerHTML=`<i>${n}</i><b>${N[i][0]}</b><s>${a?AR[i]:N[i][1]}</s>`;lst.innerHTML=ex.map(t=>`<div class="ex">${t}</div>`).join("");lbl.textContent=a?"أمثلة من الحياة الواقعية":"Real-life examples";dtb.innerHTML=`<span>${a?"التفاصيل العلمية":"Scientific details"}</span><span class="chev">▾</span>`;dp.innerHTML=details(i)}
const AL={en:{mn:"Menu",cl:"Close",zm:["Zoom in","Zoom out","Reset zoom"]},ar:{mn:"القائمة",cl:"إغلاق",zm:["تكبير","تصغير","إعادة الزوم"]}};
function setLang(l){lang=l;const a=l=="ar",A=AL[l];document.body.classList.toggle("ar",a);document.documentElement.lang=l;tiles.forEach((t,i)=>{const nm=a?AR[i]:N[i][1];t.d.querySelector("s").textContent=nm;t.d.setAttribute("aria-label",`${i+1} ${nm}`)});document.getElementById("lg").textContent=a?"English":"العربية";document.getElementById("hint").textContent=a?"اضغط على عنصر • اسحب للتحريك • قرّب بإصبعين أو بالعجلة":"Tap an element • Drag to move • Pinch or scroll to zoom";document.getElementById("mn").setAttribute("aria-label",A.mn);document.getElementById("cl").setAttribute("aria-label",A.cl);document.querySelectorAll("#zm button").forEach((b,i)=>b.setAttribute("aria-label",A.zm[i]));if(sel)fill();try{localStorage.setItem("lang",l)}catch(e){}renderMenu()}
function openEl(i,tl){
 const[s,nm]=N[i],n=i+1,[c,l]=tc(n);
 cur=i;opener=tl;dp.classList.remove("open");dtb.classList.remove("open");dtb.setAttribute("aria-expanded",false);dp.inert=true;
 cd.style.cssText=`--c:${c};--l:${l}`;
 fill();
 sel=true;exs.style.opacity=0;ov.inert=false;bgInert(true);
 const r=tl.getBoundingClientRect(),h=hd.getBoundingClientRect();
 ft=`translate(${r.left+r.width/2-h.left-h.width/2}px,${r.top+r.height/2-h.top-h.height/2}px) scale(${Math.max(.05,r.width/h.width)})`;
 cd.style.transformOrigin=`50% ${h.height/2}px`;cd.style.transition="none";cd.style.transform=ft;cd.offsetWidth;
 cd.style.transition="transform .6s cubic-bezier(.2,.8,.2,1)";cd.style.transform="none";
 exs.style.opacity=1;ov.classList.add("show");document.getElementById("cl").focus({preventScroll:true});
}
function closeEl(){
 if(!ov.classList.contains("show"))return;
 ov.classList.remove("show");cd.style.transform=ft;exs.style.opacity=0;
 setTimeout(()=>{if(ov.classList.contains("show"))return;sel=false;ov.inert=true;bgInert(false);if(opener&&opener.isConnected)opener.focus({preventScroll:true});wake()},550);
}
ov.onclick=e=>{if(!cd.contains(e.target))closeEl()};
let sl="en";try{sl=localStorage.getItem("lang")=="ar"?"ar":"en"}catch(e){}
document.getElementById("lg").onclick=()=>setLang(lang=="ar"?"en":"ar");
applyAll();setLang(sl);addEventListener("resize",fit);fit();go("table");kk=1;po.x=po.y=0;
