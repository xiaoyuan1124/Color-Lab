import fs from 'node:fs';
import vm from 'node:vm';

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

    if(lineComment){
      if(ch==='\n')lineComment=false;
      continue;
    }
    if(blockComment){
      if(ch==='*'&&next==='/'){blockComment=false;i++}
      continue;
    }
    if(quote){
      if(escape){escape=false;continue}
      if(ch==='\\'){escape=true;continue}
      if(ch===quote){quote=null}
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
  'hueToward','contrastRatio','ensureStructureContrast','cohesionPass','qualityRefineGenerated',
  'qualityMetrics','relationVector','relationVectorDistance',
  'photoDominanceScore','semanticRolesFromClusters','photoCompositionProfile',
  'emptyPreferenceRole','emptyPreferenceRelation','emptyPreferenceModel','sanitizePreferenceRole','sanitizePreferenceRelation','preferenceRelationMetrics','sanitizePreferenceModel',
  'preferenceRoleAffinity','preferenceRelationAffinity','preferenceRoleDescriptor','preferenceSummaryFromModel','preferenceAffinityFromModel','preferenceAffinityForSetting','preferenceModelWithPalette','preferenceHueFamily'
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

let passed=0,failed=0;
function check(name,condition,detail=''){
  if(condition){
    passed++;
    console.log('PASS',name);
  }else{
    failed++;
    console.error('FAIL',name,detail);
  }
}
function approx(a,b,t=.01){return Math.abs(a-b)<=t}
function validHex(x){return /^#[0-9A-F]{6}$/.test(x)}
function finiteObject(o){return Object.values(o).every(Number.isFinite)}

const edgeHexes=[
  '#000000','#FFFFFF','#010101','#FEFEFE','#808080',
  '#FF0000','#00FF00','#0000FF','#FFFF00','#00FFFF','#FF00FF',
  '#7F0000','#007F7F','#F3EFE8','#111827','#BADA55',
  '#F7E7CE','#2A2A28','#68705E','#C8433D'
];

for(const hex of edgeHexes){
  const o=A.toOKLCH(hex);
  const back=A.fromOKLCH(o.l,o.c,o.h);
  check('roundtrip '+hex,validHex(back)&&A.perceptualDistance(hex,back)<.012,back);
}

const Ls=[-1,0,.01,.14,.5,.9,.99,1,2,NaN];
const Cs=[-1,0,.01,.05,.2,.5,1,Infinity,NaN];
const Hs=[-720,-1,0,1,180,359,360,721,NaN];
let gamutFailures=0,lightnessFailures=0,chromaFailures=0;
for(const l of Ls){
  for(const c of Cs){
    for(const h of Hs){
      const hex=A.gamutMapOKLCH(l,c,h);
      if(!validHex(hex)){gamutFailures++;continue}
      const o=A.toOKLCH(hex);
      if(!finiteObject(o))gamutFailures++;
      if(Number.isFinite(l)&&l>=.05&&l<=.95&&Math.abs(o.l-l)>.025)lightnessFailures++;
      if(Number.isFinite(c)&&c>=0&&o.c>c+.02)chromaFailures++;
    }
  }
}
check('gamut torture grid emits valid finite sRGB',gamutFailures===0,'failures='+gamutFailures);
check('gamut mapping preserves lightness',lightnessFailures===0,'failures='+lightnessFailures);
check('gamut mapping never meaningfully increases chroma',chromaFailures===0,'failures='+chromaFailures);

check('contrast black white',approx(A.contrastRatio('#000000','#FFFFFF'),21,.05),A.contrastRatio('#000000','#FFFFFF'));
check('contrast identity',approx(A.contrastRatio('#68705E','#68705E'),1,.0001),A.contrastRatio('#68705E','#68705E'));

for(const a of edgeHexes.slice(0,10)){
  for(const b of edgeHexes.slice(10,16)){
    const ab=A.perceptualDistance(a,b),ba=A.perceptualDistance(b,a);
    check('distance symmetry '+a+' '+b,Number.isFinite(ab)&&approx(ab,ba,1e-10),ab+' / '+ba);
  }
}
for(const hex of edgeHexes){
  check('distance identity '+hex,approx(A.perceptualDistance(hex,hex),0,1e-12),A.perceptualDistance(hex,hex));
}

const huePairs=[[350,10],[10,350],[0,180],[180,0],[721,-721],[-20,380]];
for(const [a,b] of huePairs){
  const d=A.signedHueDelta(a,b);
  check('signed hue range '+a+' '+b,Number.isFinite(d)&&d>=-180&&d<180,d);
  check('hue distance range '+a+' '+b,A.hueDistance(a,b)>=0&&A.hueDistance(a,b)<=180,A.hueDistance(a,b));
}

const original=['#123456','#ABCDEF','#FF00FF'];
const p3=A.qualityRefineGenerated(original,3);
check('preserve all three',JSON.stringify(p3)===JSON.stringify(original),JSON.stringify(p3));
const p2=A.qualityRefineGenerated(original,2);
check('preserve first two',p2[0]===original[0]&&p2[1]===original[1],JSON.stringify(p2));
const p1=A.qualityRefineGenerated(original,1);
check('preserve Color 1',p1[0]===original[0],JSON.stringify(p1));

const dark=A.qualityRefineGenerated(['#080808','#101010','#FF5A6F'],1);
check('dark primary gets visible structure',A.toOKLCH(dark[1]).l>A.toOKLCH(dark[0]).l&&A.contrastRatio(dark[0],dark[1])>=2.2,JSON.stringify(dark)+' ratio='+A.contrastRatio(dark[0],dark[1]));

const light=A.qualityRefineGenerated(['#FAFAFA','#F4F4F4','#5677D8'],1);
check('light primary gets darker structure',A.toOKLCH(light[1]).l<A.toOKLCH(light[0]).l&&A.contrastRatio(light[0],light[1])>=2.2,JSON.stringify(light)+' ratio='+A.contrastRatio(light[0],light[1]));

const accentExtreme=A.qualityRefineGenerated(['#808080','#777777','#FFFFFF'],1);
const accentO=A.toOKLCH(accentExtreme[2]);
check('accent lightness bounded',accentO.l>=.12&&accentO.l<=.92,JSON.stringify(accentExtreme)+' L='+accentO.l);

const vivid=A.qualityRefineGenerated(['#68705E','#2B3028','#E93362'],1);
check('vivid accent retains chroma',A.toOKLCH(vivid[2]).c>=.05,JSON.stringify(vivid)+' C='+A.toOKLCH(vivid[2]).c);

for(const trio of [
  ['#000000','#FFFFFF','#FF0000'],
  ['#FFFFFF','#000000','#00FF00'],
  ['#808080','#888888','#909090'],
  ['#FF00FF','#00FFFF','#FFFF00'],
  ['#111827','#F9FAFB','#F59E0B']
]){
  const m=A.qualityMetrics(trio);
  check('quality metrics finite '+trio.join(','),Number.isFinite(m.separation)&&Number.isFinite(m.contrast)&&typeof m.gamut==='boolean',JSON.stringify(m));
  const v=A.relationVector(trio);
  check('relation vector finite '+trio.join(','),v&&finiteObject(v),JSON.stringify(v));
  check('relation identity zero '+trio.join(','),approx(A.relationVectorDistance(v,v),0,1e-12),A.relationVectorDistance(v,v));
}

const greyClusters=[
  {hex:'#777777',proportion:.4,l:.57,c:.002,h:0},
  {hex:'#AAAAAA',proportion:.3,l:.72,c:.003,h:0},
  {hex:'#444444',proportion:.2,l:.38,c:.002,h:0},
  {hex:'#E0E0E0',proportion:.1,l:.89,c:.002,h:0}
];
const greyRoles=A.semanticRolesFromClusters(greyClusters);
check('grey photo does not invent vivid role',!greyRoles.some(x=>x.label==='鮮明'),JSON.stringify(greyRoles));
const greyProfile=A.photoCompositionProfile(greyClusters,greyRoles);
check('grey photo profile is low chroma',greyProfile?.chromaBand==='低彩度',JSON.stringify(greyProfile));

const lightClusters=[
  {hex:'#F5F0E8',proportion:.45,l:.96,c:.015,h:80},
  {hex:'#E8DED3',proportion:.35,l:.90,c:.025,h:60},
  {hex:'#D9CEC3',proportion:.20,l:.84,c:.03,h:55}
];
const lightRoles=A.semanticRolesFromClusters(lightClusters);
check('light photo does not invent dark role',!lightRoles.some(x=>x.label==='深色'),JSON.stringify(lightRoles));

const darkClusters=[
  {hex:'#171717',proportion:.5,l:.22,c:.005,h:0},
  {hex:'#292929',proportion:.3,l:.31,c:.004,h:0},
  {hex:'#403A38',proportion:.2,l:.39,c:.018,h:40}
];
const darkRoles=A.semanticRolesFromClusters(darkClusters);
check('dark photo does not invent light role',!darkRoles.some(x=>x.label==='淺色'),JSON.stringify(darkRoles));
const darkProfile=A.photoCompositionProfile(darkClusters,darkRoles);
check('dark photo profile is dark',darkProfile?.lightnessBand==='偏深',JSON.stringify(darkProfile));

const vividClusters=[
  {hex:'#F8F8F8',proportion:.60,l:.98,c:.004,h:0},
  {hex:'#D43C5A',proportion:.40,l:.57,c:.19,h:18}
];
const vividRoles=A.semanticRolesFromClusters(vividClusters);
check('white background can yield to meaningful subject',vividRoles[0]?.hex==='#D43C5A',JSON.stringify(vividRoles));
const vividProfile=A.photoCompositionProfile(vividClusters,vividRoles);
check('photo profile exposes primary share',Number.isFinite(vividProfile?.primaryShare)&&vividProfile.primaryShare>0,JSON.stringify(vividProfile));
check('vivid subject represented semantically',vividRoles.some(x=>x.hex==='#D43C5A'&&['主體','鮮明'].includes(x.label)),JSON.stringify(vividRoles));

const mixedClusters=[
  {hex:'#8A8178',proportion:.50,l:.62,c:.025,h:55},
  {hex:'#D43C5A',proportion:.30,l:.57,c:.19,h:18},
  {hex:'#EEE8DE',proportion:.20,l:.92,c:.018,h:70}
];
const mixedRoles=A.semanticRolesFromClusters(mixedClusters);
check('distinct vivid secondary gets vivid role',mixedRoles.some(x=>x.label==='鮮明'&&x.hex==='#D43C5A'),JSON.stringify(mixedRoles));


const edgeBackgroundClusters=[
  {hex:'#EEEAE4',proportion:.58,l:.94,c:.018,h:78,edgeShare:.92},
  {hex:'#8A8178',proportion:.27,l:.62,c:.025,h:55,edgeShare:.10},
  {hex:'#D43C5A',proportion:.15,l:.57,c:.19,h:18,edgeShare:.08}
];
const edgeRoles=A.semanticRolesFromClusters(edgeBackgroundClusters);
check('edge-heavy neutral does not steal primary role',edgeRoles[0]?.hex!=='#EEEAE4',JSON.stringify(edgeRoles));
const edgeProfile=A.photoCompositionProfile(edgeBackgroundClusters,edgeRoles);
check('edge background candidate identified',edgeProfile?.edgeHex==='#EEEAE4',JSON.stringify(edgeProfile));
check('photo dominance band present',typeof edgeProfile?.dominanceBand==='string'&&edgeProfile.dominanceBand.length>0,JSON.stringify(edgeProfile));

const balancedClusters=[
  {hex:'#6D7FA4',proportion:.34,l:.60,c:.08,h:245,edgeShare:.15},
  {hex:'#C88069',proportion:.33,l:.67,c:.10,h:35,edgeShare:.12},
  {hex:'#D7C8AD',proportion:.33,l:.84,c:.04,h:80,edgeShare:.18}
];
const balancedRoles=A.semanticRolesFromClusters(balancedClusters);
const balancedProfile=A.photoCompositionProfile(balancedClusters,balancedRoles);
check('balanced photo classified as distributed',balancedProfile?.dominanceBand==='多色分布較平均',JSON.stringify(balancedProfile));

for(const roles of [greyRoles,lightRoles,darkRoles,vividRoles,mixedRoles,edgeRoles,balancedRoles]){
  check('semantic roles unique',new Set(roles.map(x=>x.hex)).size===roles.length,JSON.stringify(roles));
  check('semantic roles max five',roles.length<=5,roles.length);
}


const prefPalette=['#8C8378','#292B29','#C8433D'];
const prefEmpty=A.emptyPreferenceModel();
check('empty preference model starts immature',prefEmpty.totalWeight===0,JSON.stringify(prefEmpty));

const immature=A.preferenceModelWithPalette(prefEmpty,prefPalette,1);
check('immature preference does not affect ranking',A.preferenceAffinityFromModel(immature,prefPalette)===0,A.preferenceAffinityFromModel(immature,prefPalette));

const mature=A.preferenceModelWithPalette(prefEmpty,prefPalette,3);
check('mature preference captures relation evidence',mature.relation.w===3&&finiteObject(mature.relation),JSON.stringify(mature.relation));
const sameRelation=A.preferenceRelationAffinity(mature.relation,prefPalette);
check('relation preference affinity stays bounded',sameRelation>=0&&sameRelation<=1,sameRelation);
const legacyMigrated=A.sanitizePreferenceModel({version:1,totalWeight:3,roles:mature.roles});
check('legacy preference model migrates with neutral relation evidence',legacyMigrated.relation.w===0,JSON.stringify(legacyMigrated));
const sameAffinity=A.preferenceAffinityFromModel(mature,prefPalette);
const farAffinity=A.preferenceAffinityFromModel(mature,['#F4F1E8','#4E66D8','#49B86D']);
check('mature preference activates',sameAffinity>0&&sameAffinity<=1,sameAffinity);
check('learned palette outranks far palette',sameAffinity>farAffinity,JSON.stringify({sameAffinity,farAffinity}));

const malformedPref=A.sanitizePreferenceModel({
  version:1,totalWeight:5,
  roles:{
    base:{w:5,sumL:99,sumC:0,sumX:0,sumY:0},
    structure:{w:5,sumL:1,sumC:0,sumX:0,sumY:0},
    accent:{w:5,sumL:1,sumC:0,sumX:0,sumY:0}
  }
});
check('malformed preference model resets safely',malformedPref.totalWeight===0,JSON.stringify(malformedPref));

const oversizedPref=A.sanitizePreferenceModel({
  version:1,totalWeight:500,
  roles:{
    base:{w:500,sumL:250,sumC:20,sumX:0,sumY:0},
    structure:{w:500,sumL:200,sumC:15,sumX:0,sumY:0},
    accent:{w:500,sumL:280,sumC:30,sumX:0,sumY:0}
  }
});
check('oversized preference model resets safely',oversizedPref.totalWeight===0,JSON.stringify(oversizedPref));

let longPreference=A.emptyPreferenceModel();
for(let i=0;i<300;i++)longPreference=A.preferenceModelWithPalette(longPreference,prefPalette,3);
check('long-running preference remains bounded',longPreference.totalWeight<=80.0001,JSON.stringify(longPreference));
check('long-running role weights stay aligned',
  ['base','structure','accent'].every(k=>Math.abs(longPreference.roles[k].w-longPreference.totalWeight)<1e-6),
  JSON.stringify(longPreference)
);
check('long-running relation evidence remains finite and bounded',
  finiteObject(longPreference.relation)&&longPreference.relation.w<=longPreference.totalWeight+1e-6,
  JSON.stringify(longPreference.relation)
);

const sourceModel=A.preferenceModelWithPalette(A.emptyPreferenceModel(),prefPalette,3);
const sourceSnapshot=JSON.stringify(sourceModel);
A.preferenceModelWithPalette(sourceModel,['#F0E6D2','#304050','#DA8C35'],1);
check('preference update does not mutate source model',JSON.stringify(sourceModel)===sourceSnapshot,JSON.stringify(sourceModel));



const explainModel=A.preferenceModelWithPalette(
  A.preferenceModelWithPalette(A.emptyPreferenceModel(),['#F3EFE8','#2A2A28','#C8433D'],2),
  ['#DDD2C4','#252525','#A33E55'],2
);
check('disabled preference affinity is exactly zero',
  A.preferenceAffinityForSetting(false,explainModel,['#F3EFE8','#2A2A28','#C8433D'])===0,
  A.preferenceAffinityForSetting(false,explainModel,['#F3EFE8','#2A2A28','#C8433D'])
);
check('enabled preference affinity remains bounded',
  A.preferenceAffinityForSetting(true,explainModel,['#F3EFE8','#2A2A28','#C8433D'])>=0&&
  A.preferenceAffinityForSetting(true,explainModel,['#F3EFE8','#2A2A28','#C8433D'])<=1
);
const explainSummary=A.preferenceSummaryFromModel(explainModel);
check('mature preference summary is concise and role based',
  typeof explainSummary==='string'&&explainSummary.includes('主體')&&explainSummary.includes('結構')&&explainSummary.includes('點綴')&&explainSummary.length<90,
  explainSummary
);


const incoherentRole={w:2,sumL:1.1,sumC:.28,sumX:0,sumY:0};
const incoherentLabel=A.preferenceRoleDescriptor(incoherentRole);
check('mixed hue preference does not invent hue family',
  typeof incoherentLabel==='string'&&!incoherentLabel.includes('系'),
  incoherentLabel
);

console.log('Color Lab torture tests:',passed,'passed,',failed,'failed');
if(failed)process.exit(1);
