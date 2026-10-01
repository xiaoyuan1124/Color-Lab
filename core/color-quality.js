/* Color Lab V2.37.0 Core Color Quality
   Eager local-only color math and generated-palette quality guards.
   No storage writes, network calls, source reordering, or source-palette mutation. */

const oklchCache=new Map();
const luminanceCache=new Map();

function boundedCacheSet(map,key,value,max=512){
  if(map.size>=max&&!map.has(key))map.delete(map.keys().next().value);
  map.set(key,value);return value;
}

function clamp(v,a=0,b=1){return Math.min(b,Math.max(a,v))}

function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255)}

function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(clamp(v)*255).toString(16).padStart(2,'0')).join('').toUpperCase()}

function lum(hex){
  const key=String(hex).toUpperCase(),cached=luminanceCache.get(key);
  if(cached!==undefined)return cached;
  const rgb=hexToRgb(key).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
  return boundedCacheSet(luminanceCache,key,.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]);
}

function textFor(bg){
  const dark='#000000',light='#FFFFFF';
  return contrastRatio(bg,dark)>=contrastRatio(bg,light)?dark:light;
}

function normHex(v){v=v.trim();if(!v.startsWith('#'))v='#'+v;return/^#[0-9a-fA-F]{6}$/.test(v)?v.toUpperCase():null}

function contrastRatio(a,b){
  const L1=lum(a),L2=lum(b),hi=Math.max(L1,L2),lo=Math.min(L1,L2);
  return (hi+.05)/(lo+.05);
}

function hueDistance(a,b){let d=Math.abs(a-b)%360;return Math.min(d,360-d)}

function srgbToLinear(v){return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}

function linearToSrgb(v){return v<=.0031308?12.92*v:1.055*Math.pow(Math.max(0,v),1/2.4)-.055}

function toOKLCH(hex){
  const key=String(hex).toUpperCase(),cached=oklchCache.get(key);
  if(cached)return cached;
  const [r0,g0,b0]=hexToRgb(key),r=srgbToLinear(r0),g=srgbToLinear(g0),b=srgbToLinear(b0);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L=.2104542553*l+.793617785*m-.0040720468*s;
  const a=1.9779984951*l-2.428592205*m+.4505937099*s;
  const bb=.0259040371*l+.7827717662*m-.808675766*s;
  const C=Math.sqrt(a*a+bb*bb);
  let h=Math.atan2(bb,a)*180/Math.PI;if(h<0)h+=360;
  return boundedCacheSet(oklchCache,key,Object.freeze({l:L,c:C,h:C<.00001?0:h}));
}

function fromOKLCH(L,C,h){
  const rad=((h%360)+360)%360*Math.PI/180,a=C*Math.cos(rad),bb=C*Math.sin(rad);
  const l_=L+.3963377774*a+.2158037573*bb;
  const m_=L-.1055613458*a-.0638541728*bb;
  const s_=L-.0894841775*a-1.291485548*bb;
  const l=l_*l_*l_,m=m_*m_*m_,s=s_*s_*s_;
  const r=4.0767416621*l-3.3077115913*m+.2309699292*s;
  const g=-1.2684380046*l+2.6097574011*m-.3413193965*s;
  const b=-.0041960863*l-.7034186147*m+1.707614701*s;
  return rgbToHex(linearToSrgb(r),linearToSrgb(g),linearToSrgb(b));
}

function perceptualDistance(a,b){
  const A=toOKLCH(a),B=toOKLCH(b);
  const ar=A.c*Math.cos(A.h*Math.PI/180),ai=A.c*Math.sin(A.h*Math.PI/180);
  const br=B.c*Math.cos(B.h*Math.PI/180),bi=B.c*Math.sin(B.h*Math.PI/180);
  return Math.sqrt(Math.pow((A.l-B.l)*1.25,2)+Math.pow(ar-br,2)+Math.pow(ai-bi,2));
}

function oklchLinearRgb(L,C,h){
  const rad=((h%360)+360)%360*Math.PI/180,a=C*Math.cos(rad),bb=C*Math.sin(rad);
  const l_=L+.3963377774*a+.2158037573*bb;
  const m_=L-.1055613458*a-.0638541728*bb;
  const s_=L-.0894841775*a-1.291485548*bb;
  const l=l_*l_*l_,m=m_*m_*m_,s=s_*s_*s_;
  return [
    4.0767416621*l-3.3077115913*m+.2309699292*s,
    -1.2684380046*l+2.6097574011*m-.3413193965*s,
    -.0041960863*l-.7034186147*m+1.707614701*s
  ];
}

function isLinearSrgbInGamut(rgb){
  return rgb.every(v=>Number.isFinite(v)&&v>=-1e-7&&v<=1.0000001);
}

function gamutMapOKLCH(L,C,h){
  const safeL=Number.isFinite(L)?L:.5,safeC=Number.isFinite(C)?C:0,safeH=Number.isFinite(h)?h:0;
  const l=clamp(safeL,0,1),c=Math.max(0,safeC),hh=((safeH%360)+360)%360;
  if(c<1e-7)return fromOKLCH(l,0,hh);
  if(isLinearSrgbInGamut(oklchLinearRgb(l,c,hh)))return fromOKLCH(l,c,hh);
  let lo=0,hi=Math.min(c,.5);
  for(let i=0;i<18;i++){
    const mid=(lo+hi)/2;
    if(isLinearSrgbInGamut(oklchLinearRgb(l,mid,hh)))lo=mid;
    else hi=mid;
  }
  return fromOKLCH(l,lo,hh);
}

function signedHueDelta(from,to){
  const a=Number.isFinite(from)?from:0,b=Number.isFinite(to)?to:0;
  const d=b-a;
  return (((d+180)%360)+360)%360-180;
}

function hueToward(from,to,amount){
  return from+signedHueDelta(from,to)*clamp(amount,0,1);
}

function ensureStructureContrast(baseHex,structureHex,minRatio=2.55){
  if(contrastRatio(baseHex,structureHex)>=minRatio)return structureHex;
  const b=toOKLCH(baseHex),s=toOKLCH(structureHex);

  const probe=direction=>{
    let l=s.l,best=structureHex,bestRatio=contrastRatio(baseHex,structureHex);
    for(let i=0;i<40;i++){
      l=clamp(l+direction*.025,.02,.98);
      const candidate=gamutMapOKLCH(l,s.c,s.h);
      const ratio=contrastRatio(baseHex,candidate);
      if(ratio>bestRatio){best=candidate;bestRatio=ratio}
      if(ratio>=minRatio){
        return{candidate,ratio,delta:Math.abs(l-s.l),reached:true};
      }
      if((direction>0&&l>=.98)||(direction<0&&l<=.02))break;
    }
    return{candidate:best,ratio:bestRatio,delta:Infinity,reached:false};
  };

  const preferred=b.l<=.42?1:(b.l>=.62?-1:(s.l<b.l?-1:1));
  const first=probe(preferred),second=probe(-preferred);

  if(first.reached&&second.reached)return first.delta<=second.delta?first.candidate:second.candidate;
  if(first.reached)return first.candidate;
  if(second.reached)return second.candidate;
  return first.ratio>=second.ratio?first.candidate:second.candidate;
}

function cohesionPass(colors,preserveCount=1){
  if(!Array.isArray(colors)||colors.length<3)return colors;
  const original=colors.map(x=>x.toUpperCase()),out=[...original];
  const key=toOKLCH(original[0]);
  const hueAuthority=clamp(key.c/.18,0,1);

  for(let i=Math.max(1,preserveCount);i<3;i++){
    const o=toOKLCH(original[i]);
    const basePull=i===1?.085:.055;
    const pull=basePull*(.42+.58*hueAuthority);
    const keyBlend=(i===1?.04:.02)*hueAuthority;
    const blendedC=o.c*(1-keyBlend)+key.c*keyBlend;
    out[i]=gamutMapOKLCH(o.l,blendedC,hueToward(o.h,key.h,pull));
  }

  // Contrast guard only touches generated Structure and now verifies the actual ratio.
  if(preserveCount<=1){
    out[1]=ensureStructureContrast(out[0],out[1],2.55);
  }

  // Generated Accent: preserve vibrancy, avoid unusable extremes, but keep tonal palettes tonal.
  if(preserveCount<=2){
    const before=toOKLCH(original[2]),after=toOKLCH(out[2]);
    const base=toOKLCH(out[0]),dh=hueDistance(after.h,base.h);
    let nextL=clamp(after.l,.14,.90);
    let nextC=Math.max(after.c,before.c*.88);
    if(dh>38&&before.c>.035)nextC=Math.max(nextC,.055);
    out[2]=gamutMapOKLCH(nextL,nextC,after.h);
  }
  return out;
}

function qualityRefineGenerated(colors,preserveCount){
  const refined=cohesionPass(colors,preserveCount);
  return refined.map((hex,i)=>i<preserveCount?colors[i].toUpperCase():hex.toUpperCase());
}

function qualityMetrics(colors){
  if(!colors||colors.length<3)return{separation:0,contrast:0,gamut:true};
  const separation=(
    perceptualDistance(colors[0],colors[1])+
    perceptualDistance(colors[0],colors[2])+
    perceptualDistance(colors[1],colors[2])
  )/3;
  return {
    separation,
    contrast:contrastRatio(colors[0],colors[1]),
    gamut:colors.every(hex=>{
      const o=toOKLCH(hex);return isLinearSrgbInGamut(oklchLinearRgb(o.l,o.c,o.h));
    })
  };
}

function relationVector(colors){
  if(!colors||colors.length<3||colors.some(x=>!x))return null;
  const p=colors.map(toOKLCH),base=p[0];
  return {
    sL:p[1].l-base.l,
    sC:p[1].c-base.c,
    sH:signedHueDelta(base.h,p[1].h),
    aL:p[2].l-base.l,
    aC:p[2].c-base.c,
    aH:signedHueDelta(base.h,p[2].h)
  };
}

function relationVectorDistance(a,b){
  if(!a||!b)return 9;
  const hueDiff=(x,y)=>Math.abs(((x-y+540)%360)-180)/180;
  return Math.abs(a.sL-b.sL)*2.4+
    Math.abs(a.sC-b.sC)*2+
    hueDiff(a.sH,b.sH)*1.15+
    Math.abs(a.aL-b.aL)*2+
    Math.abs(a.aC-b.aC)*1.7+
    hueDiff(a.aH,b.aH)*1.35;
}
