// Customisation: colour modes, tile shapes, themes, fonts, and the side menu
const DEF={mode:"classic",bg:"#000000",op:false,shape:"rect",size:1,glow:1,fill:1,font:"mono",names:true,nums:true,colors:{
 classic:{R:"#ff4646",Y:"#e8ac1e",G:"#3cdc5a",T:"#1ed2be"},
 category:{am:"#e8a838",ae:"#d4e157",la:"#f06292",ac:"#ba68c8",tr:"#ff7a6b",pt:"#26c6da",me:"#2ee6a8",nm:"#4cff6e",ng:"#6c8cff",un:"#cfcfcf"},
 block:{s:"#ff6b6b",p:"#4dd0e1",d:"#ffd54f",f:"#ba68c8"},
 state:{solid:"#ffd54f",liquid:"#4dd0e1",gas:"#ff6b6b",unknown:"#9e9e9e"},
 en:{lo:"#2e7dff",hi:"#ff4d4d"},mass:{lo:"#4dff88",hi:"#ff4dd2"},single:{one:"#4cc9f0"}}};
const SHAPES={rect:[120,160,0],round:[120,160,18],square:[130,130,0],circle:[136,136,50]};
const FONTS={mono:'"JetBrains Mono",ui-monospace,Menlo,monospace',sans:'system-ui,"Segoe UI",Roboto,Tahoma,sans-serif',serif:'Georgia,"Times New Roman",serif',cairo:'Cairo,system-ui,sans-serif'};
const PRE={classic:{s:{}},neon:{s:{mode:"category",bg:"#05010f",glow:1.8,fill:.8}},light:{s:{mode:"category",bg:"#ffffff",glow:.3,fill:1.6,font:"sans"}},board:{s:{mode:"single",bg:"#1c3a2e",glow:.4,fill:.6,font:"sans"},one:"#f5f5dc"},ocean:{s:{mode:"en",bg:"#02121f",glow:1.2}}};
const ST={
en:{menu:"Menu",lang:"Language",pre:"Presets",mode:"Colour by",cols:"Colours",bg:"Background",shape:"Tile shape",size:"Size",glow:"Glow",fill:"Fill",font:"Font",lab:"Tile labels",op:"Opaque tiles",names:"Names",nums:"Numbers",reset:"Reset all",
 modes:{classic:"Classic (4 colours)",category:"Category",block:"Block (s/p/d/f)",state:"State at 25 °C",en:"Electronegativity",mass:"Atomic mass",single:"One colour"},
 shapes:{rect:"Rectangle",round:"Rounded",square:"Square",circle:"Circle"},fonts:{mono:"Mono",sans:"Sans",serif:"Serif",cairo:"Cairo"},
 keys:{R:"Nonmetals",Y:"Light and post-transition metals",G:"Transition and f-block metals",T:"Superheavy elements (104+)",s:"s-block",p:"p-block",d:"d-block",f:"f-block",lo:"Low",hi:"High",one:"Colour"},
 presets:{classic:"Classic",neon:"Neon",light:"Projector (light)",board:"Blackboard",ocean:"Ocean"}},
ar:{menu:"القائمة",lang:"اللغة",pre:"قوالب جاهزة",mode:"تلوين حسب",cols:"الألوان",bg:"لون الخلفية",shape:"شكل البطاقة",size:"الحجم",glow:"التوهج",fill:"التعبئة",font:"الخط",lab:"النصوص على البطاقة",op:"بطاقات غير شفافة",names:"الأسماء",nums:"الأرقام",reset:"إعادة الضبط",
 modes:{classic:"كلاسيكي (4 ألوان)",category:"التصنيف",block:"الفئة الفرعية (s/p/d/f)",state:"الحالة عند 25 °م",en:"السالبية الكهربية",mass:"الكتلة الذرية",single:"لون واحد"},
 shapes:{rect:"مستطيل",round:"مستدير",square:"مربع",circle:"دائرة"},fonts:{mono:"برمجي",sans:"عادي",serif:"كلاسيكي",cairo:"القاهرة"},
 keys:{R:"اللافلزات",Y:"فلزات خفيفة وما بعد الانتقالية",G:"فلزات انتقالية وفئة f",T:"العناصر الثقيلة جداً (104+)",s:"فئة s",p:"فئة p",d:"فئة d",f:"فئة f",lo:"الأقل",hi:"الأعلى",one:"اللون"},
 presets:{classic:"كلاسيكي",neon:"نيون",light:"للبروجكتر (فاتح)",board:"سبورة",ocean:"محيط"}}};

const clone=o=>JSON.parse(JSON.stringify(o));
function merge(j){const d=clone(DEF);for(const k in j){if(k=="colors"){for(const m in j.colors)Object.assign(d.colors[m]||(d.colors[m]={}),j.colors[m])}else d[k]=j[k]}return d}
function load(){try{const j=JSON.parse(localStorage.getItem("pt3d")||"null");if(j)return merge(j)}catch(e){}return clone(DEF)}
function save(){try{localStorage.setItem("pt3d",JSON.stringify(CF))}catch(e){}}
let CF=load();

// Colour helpers
const hex2=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const isLight=()=>{const[r,g,b]=hex2(CF.bg);return .299*r+.587*g+.114*b>140};
const pair=rgb=>[rgb.join(","),(isLight()?mixc(rgb,[0,0,0],.55):mixc(rgb,[255,255,255],.45)).join(",")];
function blockOf(z){const c=pos(z)[1];return(z>=57&&z<=71)||(z>=89&&z<=103)?"f":z==2||c<=2?"s":c>=13?"p":"d"}
function stateOf(z){const[,mp,bp]=DT[z-1];if(bp&&+bp<298.15)return"gas";if(mp&&+mp<298.15)return"liquid";return mp?"solid":"unknown"}
// Colour pair [c, l] ("r,g,b" strings) for element z in the current colour mode
function tc(z){
 const m=CF.mode,C=CF.colors[m];let h;
 if(m=="classic")h=C[key(z)];
 else if(m=="category")h=C[CATS.find(c=>c[3].includes(z))[0]];
 else if(m=="block")h=C[blockOf(z)];
 else if(m=="state")h=C[stateOf(z)];
 else if(m=="single")h=C.one;
 else{
  const v=m=="en"?+DT[z-1][4]:Math.sqrt(+DT[z-1][0]);
  if(!v)h="#777777";
  else{const t=m=="en"?(v-.7)/3.3:v/Math.sqrt(300);return pair(mixc(hex2(C.lo),hex2(C.hi),Math.max(0,Math.min(1,t))))}
 }
 return pair(hex2(h));
}

// Apply every setting to the page
function applyAll(){
 const r=document.documentElement.style,[w,h,rad]=SHAPES[CF.shape],lt=isLight();
 r.setProperty("--w",w*CF.size+"px");r.setProperty("--h",h*CF.size+"px");r.setProperty("--rad",rad==50?"50%":rad+"px");
 r.setProperty("--g",CF.glow);r.setProperty("--f",CF.fill);r.setProperty("--ff",FONTS[CF.font]);r.setProperty("--bg",CF.bg);r.colorScheme=lt?"light":"dark";
 document.body.classList.toggle("lt",lt);document.body.classList.toggle("hn",!CF.names);document.body.classList.toggle("hz",!CF.nums);
 document.body.dataset.shape=CF.shape;
 document.body.classList.toggle("op",!!CF.op);const bgc=lt?[255,255,255]:[10,10,14];
 tiles.forEach((t,i)=>{const[c,l]=tc(i+1),s=t.d.style;s.setProperty("--c",c);s.setProperty("--l",l);
  if(CF.op){const k=Math.min(.5,(+s.getPropertyValue("--ra")||.3)*CF.fill*1.1);s.setProperty("--bf",mixc(bgc,c.split(",").map(Number),k).join(","))}});
}
function preset(k){const d=clone(DEF),p=PRE[k];Object.assign(d,p.s);d.op=d.bg!="#000000";if(p.one)d.colors.single.one=p.one;CF=d;save();applyAll();renderMenu()}

// Side menu
const dr=document.getElementById("dr"),scrim=document.getElementById("scrim");
const toggleDr=o=>{dr.classList.toggle("open",o);scrim.classList.toggle("open",o)};
document.getElementById("mn").onclick=()=>toggleDr(true);scrim.onclick=()=>toggleDr(false);
function renderMenu(){
 const a=lang=="ar",T=ST[a?"ar":"en"],t=TX[a?"ar":"en"],C=CF.colors[CF.mode];
 const ks=CF.mode=="classic"?["R","Y","G","T"]:CF.mode=="category"?CATS.map(c=>c[0]):CF.mode=="block"?["s","p","d","f"]:CF.mode=="state"?["solid","liquid","gas","unknown"]:CF.mode=="single"?["one"]:["lo","hi"];
 const nm=k=>T.keys[k]||(CATS.find(c=>c[0]==k)||[])[a?2:1]||(k=="unknown"?t.unk:t[k])||k;
 const chips=(act,obj,cur)=>`<div class="chips">${Object.keys(obj).map(k=>`<button data-a="${act}" data-v="${k}" class="${cur==k?"on":""}">${obj[k]}</button>`).join("")}</div>`;
 const rng=(k,mn,mx,st)=>`<h4>${T[k]}</h4><input type="range" data-a="${k}" min="${mn}" max="${mx}" step="${st}" value="${CF[k]}">`;
 dr.dir=a?"rtl":"ltr";
 dr.innerHTML=`<div class="dh"><b>${T.menu}</b><button data-a="close">✕</button></div>`
 +`<h4>${T.lang}</h4>`+chips("lang",{en:"English",ar:"العربية"},lang)
 +`<h4>${T.pre}</h4>`+chips("pre",T.presets,"")
 +`<h4>${T.mode}</h4><select data-a="mode">${Object.keys(T.modes).map(k=>`<option value="${k}"${CF.mode==k?" selected":""}>${T.modes[k]}</option>`).join("")}</select>`
 +`<h4>${T.cols}</h4>`+ks.map(k=>`<label class="cr"><input type="color" data-a="col" data-k="${k}" value="${C[k]}"><span>${nm(k)}</span></label>`).join("")
 +`<h4>${T.bg}</h4><label class="cr"><input type="color" data-a="bg" value="${CF.bg}"><span>${CF.bg}</span></label>`
 +`<h4>${T.shape}</h4>`+chips("shape",T.shapes,CF.shape)
 +rng("size",.6,1.5,.05)+rng("glow",0,2.5,.1)+rng("fill",0,2.5,.1)
 +`<h4>${T.font}</h4>`+chips("font",T.fonts,CF.font)
 +`<h4>${T.lab}</h4><label class="ck"><input type="checkbox" data-a="names"${CF.names?" checked":""}>${T.names}</label><label class="ck"><input type="checkbox" data-a="nums"${CF.nums?" checked":""}>${T.nums}</label><label class="ck"><input type="checkbox" data-a="op"${CF.op?" checked":""}>${T.op}</label>`
 +`<h4></h4><button data-a="reset" class="wide">${T.reset}</button>`;
}
dr.oninput=e=>{
 const t=e.target,a=t.dataset.a;
 if(a=="col")CF.colors[CF.mode][t.dataset.k]=t.value;
 else if(a=="bg"){CF.bg=t.value;CF.op=true}
 else if(a=="size"||a=="glow"||a=="fill")CF[a]=+t.value;
 else return;
 save();applyAll();
};
dr.onchange=e=>{
 const t=e.target,a=t.dataset.a;
 if(a=="mode"){CF.mode=t.value;save();applyAll();renderMenu()}
 else if(a=="names"||a=="nums"||a=="op"){CF[a]=t.checked;save();applyAll()}
 else if(a=="bg"){renderMenu()}
};
dr.onclick=e=>{
 const b=e.target.closest("button[data-a]");if(!b)return;
 const a=b.dataset.a,v=b.dataset.v;
 if(a=="close")toggleDr(false);
 else if(a=="lang")setLang(v);
 else if(a=="pre")preset(v);
 else if(a=="shape"||a=="font"){CF[a]=v;save();applyAll();renderMenu()}
 else if(a=="reset"){CF=clone(DEF);save();applyAll();renderMenu()}
};
