import fs from 'node:fs';
import vm from 'node:vm';
import fc from 'fast-check';

const html=fs.readFileSync('index.html','utf8');
const scriptMatch=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if(!scriptMatch){
  console.error('FAIL inline app script not found');
  process.exit(1);
}
const source=scriptMatch[1];

function extractFunction(name){
  const start=source.indexOf('function '+name+'(');
  if(start<0)throw new Error('missing function '+name);
  const open=source.indexOf('{',start);
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<source.length;i++){
    const ch=source[i],next=source[i+1];
    if(lineComment){if(ch==='\n')lineComment=false;continue}
    if(blockComment){if(ch==='*'&&next==='/'){blockComment=false;i++}continue}
    if(quote){
      if(escape){escape=false;continue}
      if(ch==='\\'){escape=true;continue}
      if(ch===quote)quote=null;
      continue;
    }
    if(ch==='/'&&next==='/'){lineComment=true;i++;continue}
    if(ch==='/'&&next==='*'){blockComment=true;i++;continue}
    if(ch==="'"||ch==='"'||ch==='\`'){quote=ch;continue}
    if(ch==='{')depth++;
    else if(ch==='}'){
      depth--;
      if(depth===0)return source.slice(start,i+1);
    }
  }
  throw new Error('unterminated function '+name);
}

const functionNames=[
  'clamp','normHex','hexToRgb','rgbToHex','boundedCacheSet','lum','srgbToLinear','linearToSrgb',
  'toOKLCH','fromOKLCH','perceptualDistance','oklchLinearRgb',
  'isLinearSrgbInGamut','gamutMapOKLCH','hueDistance','signedHueDelta',
  'hueToward','contrastRatio','ensureStructureContrast','cohesionPass',
  'qualityRefineGenerated','qualityMetrics','relationVector','relationVectorDistance',
  'photoDominanceScore','semanticRolesFromClusters','photoCompositionProfile',
  'emptyPreferenceRole','emptyPreferenceModel','sanitizePreferenceRole','sanitizePreferenceModel',
  'preferenceRoleAffinity','preferenceRoleDescriptor','preferenceSummaryFromModel','preferenceAffinityFromModel','preferenceAffinityForSetting','preferenceModelWithPalette','preferenceHueFamily'
];

const sandbox={console};
vm.createContext(sandbox);
vm.runInContext(
  'const oklchCache=new Map();const luminanceCache=new Map();\n'+functionNames.map(extractFunction).join('\n')+
  '\nthis.API={'+functionNames.join(',')+'};',
  sandbox,
  {timeout:2000}
);
const A=sandbox.API;

const hexArb=fc
  .tuple(
    fc.integer({min:0,max:255}),
    fc.integer({min:0,max:255}),
    fc.integer({min:0,max:255})
  )
  .map(([r,g,b])=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase());

const finiteDouble=(min,max)=>fc.double({min,max,noNaN:true,noDefaultInfinity:true});

let assertions=0;
function property(name,arb,predicate,options={}){
  fc.assert(fc.property(...arb,(...args)=>{
    assertions++;
    return predicate(...args);
  }),{numRuns:250,...options});
  console.log('PASS',name);
}

property('OKLCH round-trip stays perceptually close',[hexArb],hex=>{
  const o=A.toOKLCH(hex);
  const back=A.fromOKLCH(o.l,o.c,o.h);
  return /^#[0-9A-F]{6}$/.test(back)&&A.perceptualDistance(hex,back)<.016;
});

property('perceptual distance is symmetric',[hexArb,hexArb],(a,b)=>{
  const ab=A.perceptualDistance(a,b),ba=A.perceptualDistance(b,a);
  return Number.isFinite(ab)&&Math.abs(ab-ba)<1e-12;
});

property('distance to self is zero',[hexArb],hex=>Math.abs(A.perceptualDistance(hex,hex))<1e-12);

property(
  'signed hue delta is normalized',
  [finiteDouble(-5000,5000),finiteDouble(-5000,5000)],
  (a,b)=>{
    const d=A.signedHueDelta(a,b);
    return Number.isFinite(d)&&d>=-180&&d<180;
  }
);

property(
  'gamut map always emits valid HEX',
  [finiteDouble(-2,3),finiteDouble(-1,2),finiteDouble(-5000,5000)],
  (l,c,h)=>/^#[0-9A-F]{6}$/.test(A.gamutMapOKLCH(l,c,h))
);

property('contrast ratio is symmetric',[hexArb,hexArb],(a,b)=>{
  const ab=A.contrastRatio(a,b),ba=A.contrastRatio(b,a);
  return Number.isFinite(ab)&&ab>=1&&ab<=21.0001&&Math.abs(ab-ba)<1e-12;
});

property('quality refinement preserves Color 1',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const out=A.qualityRefineGenerated([a,b,c],1);
  return out[0]===a;
});

property('quality refinement preserves first two user colors',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const out=A.qualityRefineGenerated([a,b,c],2);
  return out[0]===a&&out[1]===b;
});

property('quality refinement preserves all user colors',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const out=A.qualityRefineGenerated([a,b,c],3);
  return out[0]===a&&out[1]===b&&out[2]===c;
});

property('generated structure contrast reaches guard target when possible',[hexArb,hexArb],(base,structure)=>{
  const out=A.ensureStructureContrast(base,structure,2.55);
  const ratio=A.contrastRatio(base,out);
  return /^#[0-9A-F]{6}$/.test(out)&&ratio>=2.50;
},{numRuns:400});

property('relation distance to self is zero',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const v=A.relationVector([a,b,c]);
  const d=A.relationVectorDistance(v,v);
  return Number.isFinite(d)&&Math.abs(d)<1e-12;
});


property('photo composition profile stays finite and bounded',
  [hexArb,hexArb,hexArb,fc.integer({min:1,max:100}),fc.integer({min:1,max:100}),fc.integer({min:1,max:100})],
  (a,b,c,wa,wb,wc)=>{
    const total=wa+wb+wc;
    const colors=[a,b,c],weights=[wa,wb,wc];
    const clusters=colors.map((hex,i)=>{
      const o=A.toOKLCH(hex);
      return{hex,proportion:weights[i]/total,l:o.l,c:o.c,h:o.h,edgeShare:i===0?.8:.1};
    });
    const roles=A.semanticRolesFromClusters(clusters);
    const profile=A.photoCompositionProfile(clusters,roles);
    return !!profile &&
      Number.isFinite(profile.avgL) &&
      Number.isFinite(profile.avgC) &&
      Number.isFinite(profile.lightnessSpan) &&
      profile.primaryShare>=0 && profile.primaryShare<=1 &&
      profile.lightnessSpan>=0 && profile.lightnessSpan<=1.01;
  },
  {numRuns:300}
);

property('photo dominance score is finite',
  [hexArb,fc.integer({min:1,max:100}),fc.integer({min:0,max:100})],
  (hex,w,edge)=>{
    const o=A.toOKLCH(hex);
    const score=A.photoDominanceScore({hex,proportion:w/100,l:o.l,c:o.c,h:o.h,edgeShare:edge/100});
    return Number.isFinite(score);
  }
);


property('preference affinity stays bounded after learning',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const model=A.preferenceModelWithPalette(A.emptyPreferenceModel(),[a,b,c],3);
  const affinity=A.preferenceAffinityFromModel(model,[a,b,c]);
  return Number.isFinite(affinity)&&affinity>=0&&affinity<=1;
});

property('preference model keeps role weights aligned',[hexArb,hexArb,hexArb],(a,b,c)=>{
  const model=A.preferenceModelWithPalette(A.emptyPreferenceModel(),[a,b,c],3);
  return model.totalWeight===3&&
    model.roles.base.w===3&&model.roles.structure.w===3&&model.roles.accent.w===3;
});

property('repeated preference learning remains finite and bounded',
  [hexArb,hexArb,hexArb,fc.integer({min:20,max:160})],
  (a,b,c,steps)=>{
    let model=A.emptyPreferenceModel();
    for(let i=0;i<steps;i++)model=A.preferenceModelWithPalette(model,[a,b,c],3);
    const roles=Object.values(model.roles);
    return Number.isFinite(model.totalWeight)&&model.totalWeight>=0&&model.totalWeight<=80.0001&&
      roles.every(r=>Object.values(r).every(Number.isFinite)&&Math.abs(r.w-model.totalWeight)<1e-6);
  },
  {numRuns:180}
);

property('preference model update is immutable',
  [hexArb,hexArb,hexArb,hexArb,hexArb,hexArb],
  (a,b,c,d,e,f)=>{
    const model=A.preferenceModelWithPalette(A.emptyPreferenceModel(),[a,b,c],3);
    const before=JSON.stringify(model);
    A.preferenceModelWithPalette(model,[d,e,f],1);
    return JSON.stringify(model)===before;
  }
);

property('sanitized preference affinity is always bounded',
  [hexArb,hexArb,hexArb,fc.integer({min:3,max:80})],
  (a,b,c,w)=>{
    let model=A.emptyPreferenceModel();
    model=A.preferenceModelWithPalette(model,[a,b,c],Math.min(3,w));
    while(model.totalWeight<Math.min(w,20))model=A.preferenceModelWithPalette(model,[a,b,c],1);
    const value=A.preferenceAffinityFromModel(model,[a,b,c]);
    return Number.isFinite(value)&&value>=0&&value<=1;
  }
);



property('disabled personalization always contributes zero',
  [hexArb,hexArb,hexArb],
  (a,b,c)=>{
    const model=A.preferenceModelWithPalette(A.emptyPreferenceModel(),[a,b,c],3);
    return A.preferenceAffinityForSetting(false,model,[a,b,c])===0;
  }
);

property('preference summaries stay bounded strings',
  [hexArb,hexArb,hexArb],
  (a,b,c)=>{
    const model=A.preferenceModelWithPalette(A.emptyPreferenceModel(),[a,b,c],3);
    const summary=A.preferenceSummaryFromModel(model);
    return typeof summary==='string'&&summary.length>0&&summary.length<100;
  }
);

console.log('Color Lab property tests:',assertions,'generated cases passed');
