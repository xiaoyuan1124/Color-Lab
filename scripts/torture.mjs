import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');
const storageHardening=fs.readFileSync('runtime/storage-hardening.js','utf8');
const colorQuality=fs.readFileSync('core/color-quality.js','utf8');
const librarySearchCore=fs.readFileSync('core/library-search.js','utf8');
const pwaStart=html.indexOf('/* Color Lab V2.35.0 PWA / iPhone Update Hardening');
const pwaEnd=html.indexOf('\nconst MODES={',pwaStart);
const pwaHealth=pwaStart>=0&&pwaEnd>pwaStart?html.slice(pwaStart,pwaEnd):'';
const uxCleanup=fs.readFileSync('runtime/ux-cleanup.js','utf8');
const paletteTools=fs.readFileSync('runtime/palette-tools.js','utf8');
const toneExplorer=fs.readFileSync('runtime/tone-explorer.js','utf8');
const photoPalette=fs.readFileSync('runtime/photo-palette.js','utf8');
const colorRelationship=fs.readFileSync('runtime/color-relationship.js','utf8');
const roleScale=fs.readFileSync('runtime/role-scale.js','utf8');
const shareSnapshot=fs.readFileSync('runtime/share-snapshot.js','utf8');
const visionAccessibility=fs.readFileSync('runtime/vision-accessibility.js','utf8');
const localProjects=fs.readFileSync('runtime/local-projects.js','utf8');
const referenceBoard=fs.readFileSync('runtime/reference-board.js','utf8');
const gradientStudio=fs.readFileSync('runtime/gradient-studio.js','utf8');
const recommendationEngine=fs.readFileSync('data/recommendation-engine.js','utf8');
const appText=html+'\n'+storageHardening+'\n'+colorQuality+'\n'+librarySearchCore+'\n'+uxCleanup+'\n'+paletteTools+'\n'+toneExplorer+'\n'+photoPalette+'\n'+colorRelationship+'\n'+roleScale+'\n'+shareSnapshot+'\n'+visionAccessibility+'\n'+localProjects+'\n'+referenceBoard+'\n'+gradientStudio+'\n'+recommendationEngine;
const toneSource=fs.readFileSync('data/tone-families.js','utf8');
const inlineScripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const scriptMatch=inlineScripts.at(-1);
if(!scriptMatch){
  console.error('FAIL inline app script not found');
  process.exit(1);
}
const source=scriptMatch[1];
const testSource=colorQuality+'\n'+librarySearchCore+'\n'+source;
try{new Function(storageHardening)}
catch(e){console.error('FAIL storage hardening runtime syntax',e.message);process.exit(1)}
try{new Function(colorQuality)}
catch(e){console.error('FAIL core color quality syntax',e.message);process.exit(1)}
try{new Function(librarySearchCore)}
catch(e){console.error('FAIL core library search syntax',e.message);process.exit(1)}
try{new Function(pwaHealth)}
catch(e){console.error('FAIL pwa health runtime syntax',e.message);process.exit(1)}
try{new Function(uxCleanup)}
catch(e){console.error('FAIL ux cleanup runtime syntax',e.message);process.exit(1)}
try{new Function(paletteTools)}
catch(e){console.error('FAIL palette tools runtime syntax',e.message);process.exit(1)}
try{new Function(toneExplorer)}
catch(e){console.error('FAIL tone explorer runtime syntax',e.message);process.exit(1)}
try{new Function(photoPalette)}
catch(e){console.error('FAIL photo palette runtime syntax',e.message);process.exit(1)}
try{new Function(colorRelationship)}
catch(e){console.error('FAIL color relationship runtime syntax',e.message);process.exit(1)}
try{new Function(roleScale)}
catch(e){console.error('FAIL role scale runtime syntax',e.message);process.exit(1)}
try{new Function(shareSnapshot)}
catch(e){console.error('FAIL share snapshot runtime syntax',e.message);process.exit(1)}
try{new Function(visionAccessibility)}
catch(e){console.error('FAIL vision accessibility runtime syntax',e.message);process.exit(1)}
try{new Function(localProjects)}
catch(e){console.error('FAIL local projects runtime syntax',e.message);process.exit(1)}
try{new Function(referenceBoard)}
catch(e){console.error('FAIL reference board runtime syntax',e.message);process.exit(1)}
try{new Function(gradientStudio)}
catch(e){console.error('FAIL gradient studio runtime syntax',e.message);process.exit(1)}
try{new Function(recommendationEngine)}
catch(e){console.error('FAIL recommendation engine syntax',e.message);process.exit(1)}

function findFunctionBodyOpen(start,code=source){
  const paramsOpen=code.indexOf('(',start);
  if(paramsOpen<0)throw new Error('missing parameter list');
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=paramsOpen;i<code.length;i++){
    const ch=code[i],next=code[i+1];
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
    if(ch==='(')depth++;
    else if(ch===')'){
      depth--;
      if(depth===0){
        const body=code.indexOf('{',i+1);
        if(body<0)throw new Error('missing function body');
        return body;
      }
    }
  }
  throw new Error('unterminated parameter list');
}

function extractFunction(name,code=source){
  const start=code.indexOf('function '+name+'(');
  if(start<0)throw new Error('missing function '+name);
  const open=findFunctionBodyOpen(start,code);
  let depth=0,quote=null,escape=false,lineComment=false,blockComment=false;
  for(let i=open;i<code.length;i++){
    const ch=code[i],next=code[i+1];

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
      if(depth===0)return code.slice(start,i+1);
    }
  }
  throw new Error('unterminated function '+name);
}

const functionNames=[
  'clamp','normHex','hexToRgb','rgbToHex','boundedCacheSet','lum','srgbToLinear','linearToSrgb','textFor',
  'toOKLCH','fromOKLCH','perceptualDistance','oklchLinearRgb',
  'isLinearSrgbInGamut','gamutMapOKLCH','hueDistance','signedHueDelta',
  'hueToward','contrastRatio','ensureStructureContrast','cohesionPass','qualityRefineGenerated',
  'qualityMetrics','relationVector','relationVectorDistance',
  'photoDominanceScore','semanticRolesFromClusters','photoPaletteFromRoles','paletteSurpriseScore','paletteAestheticCore','laneAestheticFloor',
  'toneFamilies','toneArchetypeMap','toneFamilyById','toneFamilyLabel','inferToneFamilyId','toneMixColor','tonalHarmonizeGenerated','tonalCohesionScore',
  'emptyPreferenceRole','emptyPreferenceRelation','emptyPreferenceModel','sanitizePreferenceRole','sanitizePreferenceRelation','preferenceRelationMetrics','sanitizePreferenceModel',
  'preferenceRoleAffinity','preferenceRelationAffinity','preferenceRoleDescriptor','preferenceSummaryFromModel','preferenceAffinityFromModel','preferenceAffinityForSetting','preferenceModelWithPalette','preferenceHueFamily'
];

const photoRuntimeFunctionNames=['photoCompositionProfile'];
const recommendationRuntimeFunctionNames=['recommendationDirection'];
const sandbox={console};
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(toneSource,sandbox,{timeout:1000});
vm.runInContext(
  'const oklchCache=new Map();const luminanceCache=new Map();\n'+
  functionNames.map(name=>extractFunction(name,testSource)).join('\n')+'\n'+
  photoRuntimeFunctionNames.map(name=>extractFunction(name,photoPalette)).join('\n')+'\n'+
  recommendationRuntimeFunctionNames.map(name=>extractFunction(name,recommendationEngine)).join('\n')+
  '\nthis.API={'+[...functionNames,...photoRuntimeFunctionNames,...recommendationRuntimeFunctionNames].join(',')+'};',
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

for(const bgHex of edgeHexes){
  const chosen=A.textFor(bgHex);
  const dark=A.contrastRatio(bgHex,'#000000'),light=A.contrastRatio(bgHex,'#FFFFFF');
  check('textFor chooses stronger contrast '+bgHex,
    (chosen==='#000000'||chosen==='#FFFFFF')&&A.contrastRatio(bgHex,chosen)>=Math.max(dark,light)-1e-10,
    chosen+' '+dark+' / '+light);
}
const midText=A.textFor('#838A7B');
check('textFor fixes medium olive contrast regression',
  A.contrastRatio('#838A7B',midText)>=4.5,
  midText+' ratio='+A.contrastRatio('#838A7B',midText));




check('V2.11 exploration hue scaffold has at least 20 directions',
  html.includes("const hueOffsets=[0,10,-10,20,-20,32,-32,46,-46,62,-62,82,-82,104,-104,128,-128,154,-154,180]"),
  '20 hue directions');
check('V2.10 recommendation pool is deeper than visible batch',
  recommendationEngine.includes('selectDiverseRecommendations(candidates,30)')&&html.includes('const recommendationBatchSize=5'),
  '30 candidate pool / 5 visible');
check('V2.10 legacy random five-option shuffle removed',
  !html.includes('Math.floor(Math.random()*Math.min(5,opts.length))'),
  'legacy cap removed');


check('V2.11.1 Inspire batches are reversible',
  html.includes('id="previousRecommendations"')&&
  recommendationEngine.includes('function previousRecommendationBatch()')&&
  recommendationEngine.includes('recommendationBatchHistoryIndex--'),
  'previous batch + history cursor');
check('V2.11.1 Inspire does not wrap rejected batches',
  recommendationEngine.includes("if(nextOffset>=recs.length){toast('已看完這輪所有候選');return}")&&
  !recommendationEngine.includes('if(recommendationBatchOffset>=recs.length)recommendationBatchOffset=0;'),
  'stop at end instead of wrap');


check('V2.12 professional exports keep exact palette roles',
  appText.includes("palette:{base:palette.base,structure:palette.structure,accent:palette.accent}")&&
  appText.includes("ratios:{base:75,structure:18,accent:7}")&&
  appText.includes("data-export-format=\"tokens\""),
  'exact palette + ratios + tokens');
check('V2.12 dark preview is preview-only',
  appText.includes("function previewThemePalette(theme=previewTheme)")&&
  appText.includes("accent:palette.accent")&&
  appText.includes("function setPreviewTheme(next)")&&
  !appText.includes("palette=previewThemePalette()"),
  'derived preview does not replace palette');

check('V2.12 multi-control selectors return collections',
  appText.includes("$$('#contextTabs [data-context]').forEach")&&
  appText.includes("$$('#contextThemeModes [data-preview-theme]').forEach")&&
  appText.includes("$$('[data-preview-theme]').forEach")&&
  appText.includes("$$('[data-export-format]').forEach"),
  'querySelectorAll helper for preview/export controls');

check('selector helper never grows beyond querySelectorAll',
  !appText.includes('$$$('),
  'no $$$ helper');

check('V2.13 accessibility matrix covers all role pairs',
  appText.includes("const VALIDATION_ROLES=[['base','Base'],['structure','Structure'],['accent','Accent']]")&&
  appText.includes("['base','structure'],['base','accent'],['structure','accent']")&&
  appText.includes("r>=7?['aaa'")&&appText.includes("r>=4.5?['aa'")&&appText.includes("r>=3?['large'"),
  '3 role pairs + WCAG thresholds');
check('V2.13 dark validation is derived only',
  appText.includes("previewThemePalette('dark')")&&
  appText.includes("data-validation-theme=\"dark\"")&&
  !appText.includes("palette=paletteValidationData("),
  'dark matrix never overwrites palette');

const quietAesthetic=A.paletteAestheticCore(['#E9E1D2','#25313A','#4D739B']);
const vividAesthetic=A.paletteAestheticCore(['#286B69','#D0A32E','#A94B38']);
const noisyAesthetic=A.paletteAestheticCore(['#FF4B55','#FF5A4D','#FF6A45']);
check('V2.20 professional export formats are present',
  appText.includes("if(kind==='tailwind')")&&
  appText.includes("if(kind==='swiftui')")&&
  appText.includes("if(kind==='svg')")&&
  appText.includes("data-export-format=\"tailwind\"")&&
  appText.includes("data-export-format=\"swiftui\"")&&
  appText.includes("data-export-format=\"svg\""),
  'tailwind swiftui svg');
check('V2.20 SwiftUI export derives only from exact HEX channels',
  appText.includes("function artifactHexRgb(hex)")&&
  appText.includes("v/255")&&
  appText.includes("artifactSwiftColor(data.palette.base)"),
  'exact sRGB conversion');
check('V2.20 SVG sheet uses exact semantic colors and 75/18/7 geometry',
  appText.includes('width="792"')&&
  appText.includes('width="190"')&&
  appText.includes('width="74"')&&
  appText.includes("fill=\"'+data.palette.base+'")&&
  appText.includes("fill=\"'+data.palette.structure+'")&&
  appText.includes("fill=\"'+data.palette.accent+'"),
  'exact palette SVG sheet');
check('V2.20 export never reads derived preview palette',
  !appText.includes("paletteArtifactBase(previewThemePalette")&&
  !appText.includes("artifactSwiftColor(previewThemePalette"),
  'source palette only');

check('V2.21 relationship map is read-only analysis',
  appText.includes('function renderColorRelationshipMap(')&&
  appText.includes('function relationshipRoleData(')&&
  !colorRelationship.includes('selectedColors=')&&
  !colorRelationship.includes('palette.base=')&&
  !colorRelationship.includes('palette.structure=')&&
  !colorRelationship.includes('palette.accent='),
  'no source palette mutation');
check('V2.21 relationship map keeps semantic 75/18/7 order',
  colorRelationship.includes("{key:'base',label:'Base',ratio:75")&&
  colorRelationship.includes("{key:'structure',label:'Structure',ratio:18")&&
  colorRelationship.includes("{key:'accent',label:'Accent',ratio:7"),
  'base structure accent ratios');

check('V2.22 role scale preserves exact source anchors',
  roleScale.includes("if(i===anchor)return{stop,hex:source,source:true")&&
  roleScale.includes("source:palette[key]")&&
  roleScale.includes("--color-'+key+'-source: '+normHex(system[key].source)"),
  'exact Base Structure Accent anchors');
check('V2.22 role scale never mutates source palette',
  !roleScale.includes('selectedColors=')&&
  !roleScale.includes('palette.base=')&&
  !roleScale.includes('palette.structure=')&&
  !roleScale.includes('palette.accent='),
  'derived-only role scale');

check('V2.23 share snapshot preserves semantic source order',
  shareSnapshot.includes("colors:[palette.base,palette.structure,palette.accent].map(normHex)")&&
  shareSnapshot.includes("selectedColors=[...snap.colors]")&&
  shareSnapshot.includes("lockedSlots=[false,false,false]"),
  'Base Structure Accent round trip');
check('V2.23 share snapshot stays fragment-only and network-free',
  shareSnapshot.includes("url.hash=shareSnapshotHash().slice(1)")&&
  shareSnapshot.includes("window.addEventListener('hashchange',()=>applyShareSnapshotFromLocation(true))")&&
  !shareSnapshot.includes('fetch(')&&
  !shareSnapshot.includes('XMLHttpRequest')&&
  !shareSnapshot.includes('localStorage.setItem'),
  'URL fragment only + live hash restore');

check('V2.19 photo palette uses perceptual dedupe',
  appText.includes('function photoDistinctClusters(')&&
  appText.includes('perceptualDistance(x.hex,item.hex)>=threshold'),
  'perceptual duplicate threshold');
check('V2.19 photo palette keeps three explicit strategies',
  appText.includes("localStorage.getItem('colorlab.photoPaletteStyle')||'balanced'")&&
  appText.includes("style==='muted'")&&
  appText.includes("style==='vivid'"),
  'balanced muted vivid');
check('V2.19 photo trio maps semantic 75/18/7 roles',
  appText.includes("label:'主體'")&&appText.includes("label:'結構'")&&appText.includes("label:'焦點'")&&
  appText.includes('photo-palette-ratio'),
  'base structure accent preview');
check('V2.19 strategy apply stays explicit',
  appText.includes('function usePhotoPalette()')&&
  appText.includes('photoPaletteSelection(lastPhotoClusters,lastPhotoRoles,photoPaletteStyle)')&&
  !appText.includes('selectedColors=photoPaletteSelection('),
  'selection only writes inside usePhotoPalette');

check('V2.25 vision simulation remains preview-first',
  visionAccessibility.includes('function visionAnalysis(')&&
  visionAccessibility.includes('function visionMinimalFix(')&&
  visionAccessibility.includes('visionFixPreview=')&&
  visionAccessibility.includes('function applyVisionSuggestion(')&&
  paletteTools.includes('visionContextPalette(sourceP,visionMode)'),
  'conflict detection, preview state, explicit apply and context sync present');
check('V2.25 vision thresholds remain explicit and bounded',
  visionAccessibility.includes('VISION_CONFLICT_LIMIT=.055')&&
  visionAccessibility.includes('VISION_WATCH_LIMIT=.09')&&
  visionAccessibility.includes('VISION_FIX_TARGET=.095'),
  'CVD separation thresholds stay explicit');

check('V2.26 local projects stay separate from palette source colors',
  localProjects.includes("LOCAL_PROJECTS_KEY='colorlab.projectsV1'")&&
  localProjects.includes('function assignSavedProject(')&&
  localProjects.includes('item.projectId=id')&&
  !localProjects.includes('palette.base=')&&
  !localProjects.includes('palette.structure=')&&
  !localProjects.includes('palette.accent='),
  'project assignment only changes projectId');
check('V2.26 project deletion is non-destructive',
  localProjects.includes("配色不會被刪除，只會變成未歸類")&&
  localProjects.includes("{...item,projectId:''}")&&
  !localProjects.includes("splice(index,1)"),
  'deleting a project unassigns palettes instead of deleting them');
check('V2.26 project backup and resilience stay local',
  appText.includes("schema:'color-lab-backup-v5'")&&
  appText.includes("schema:'color-lab-shadow-v4'")&&
  appText.includes("projects:readLocalProjects()")&&
  !localProjects.includes('fetch(')&&
  !localProjects.includes('XMLHttpRequest'),
  'projects are persisted in local backup paths without network IO');

check('V2.27 reference board exports exact source palette only',
  referenceBoard.includes('const source=paletteArtifactBase()')&&
  referenceBoard.includes("ratios:{...source.ratios}")&&
  referenceBoard.includes("canvas.width=1600")&&referenceBoard.includes("canvas.height=1200")&&
  !referenceBoard.includes('previewThemePalette(')&&
  !referenceBoard.includes('visionPalette(')&&
  !referenceBoard.includes('toneExplorerPreview')&&
  !referenceBoard.includes('accessibilityPreview'),
  'reference board reads the exact source handoff and excludes preview transforms');
check('V2.27 optional photo reference remains local',
  referenceBoard.includes("typeof photoLoaded!=='undefined'&&photoLoaded")&&
  referenceBoard.includes("referenceBoardDrawPhoto(x,photoCanvas")&&
  !referenceBoard.includes('fetch(')&&
  !referenceBoard.includes('XMLHttpRequest'),
  'loaded photo is drawn from local photoCanvas without retaining a blob URL');
check('V2.27 export cannot mutate source palette',
  !referenceBoard.includes('selectedColors=')&&
  !referenceBoard.includes('palette.base=')&&
  !referenceBoard.includes('palette.structure=')&&
  !referenceBoard.includes('palette.accent='),
  'reference board export is read-only');
check('V2.28 gradient studio reads exact source handoff only',
  gradientStudio.includes('const source=paletteArtifactBase()')&&
  gradientStudio.includes("linear-gradient(")&&
  !gradientStudio.includes('previewThemePalette(')&&
  !gradientStudio.includes('visionPalette(')&&
  !gradientStudio.includes('accessibilityPreview')&&
  !gradientStudio.includes('toneExplorerPreview'),
  'gradient derives from exact source handoff, not preview transforms');
check('V2.28 gradient studio cannot mutate palette',
  !gradientStudio.includes('selectedColors=')&&
  !gradientStudio.includes('palette.base=')&&
  !gradientStudio.includes('palette.structure=')&&
  !gradientStudio.includes('palette.accent='),
  'gradient studio stays preview-only');
check('V2.28 gradient studio remains local-only',
  !gradientStudio.includes('fetch(')&&
  !gradientStudio.includes('XMLHttpRequest')&&
  gradientStudio.includes("colorlab.gradientPair")&&
  gradientStudio.includes("colorlab.gradientAngle"),
  'only UI preferences are stored locally');
check('V2.29 cross-platform handoff formats are present',
  paletteTools.includes("if(kind==='scss')")&&
  paletteTools.includes("if(kind==='flutter')")&&
  paletteTools.includes("if(kind==='jetpack')")&&
  paletteTools.includes("name:safe+'.scss'")&&
  paletteTools.includes("name:safe+'.dart'")&&
  paletteTools.includes("name:safe+'.kt'"),
  'scss flutter and jetpack exports ship together');
check('V2.29 framework handoff stays exact-source',
  paletteTools.includes('function paletteArtifact(kind){')&&
  paletteTools.includes('const data=paletteArtifactBase()')&&
  paletteTools.includes("'$color-base: '+data.palette.base")&&
  paletteTools.includes("'  static const Color base = Color(0xFF'+data.palette.base.slice(1)")&&
  paletteTools.includes("'val ColorLabBase = Color(0xFF'+data.palette.base.slice(1)"),
  'framework formats read the source handoff directly');
check('V2.30 storage writes fail closed instead of throwing through UI paths',
  storageHardening.includes('function storageWriteRaw(')&&
  storageHardening.includes('catch(_){if(!silent)storageNotifyFailure(message);return false}')&&
  appText.includes("if(!storageWriteJson('colorlab.saved',data))return"),
  'critical saved-palette writes stop before success UI when storage fails');
check('V2.30 intentional empty saved library is not treated as missing',
  storageHardening.includes('function storageNeedsRecovery(')&&
  appText.includes("const needsSaved=storageNeedsRecovery('colorlab.saved',Array.isArray)")&&
  !appText.includes('const needsSaved=currentSaved.length===0'),
  'valid [] remains authoritative and stale shadow data cannot resurrect it');
check('V2.30 backup and project multi-key writes have rollback boundaries',
  storageHardening.includes('function storageTransaction(keys,fn)')&&
  appText.includes("storageTransaction(keys,()=>")&&
  localProjects.includes("storageTransaction(['colorlab.saved',LOCAL_PROJECTS_KEY]"),
  'multi-key writes restore captured local state on failure');
check('V2.31 deep dive exposes exactly three editorial sections',
  uxCleanup.includes("const DEEP_DIVE_SECTIONS=['deepUnderstanding','deepValidation','deepApplication']")&&
  html.includes('id="deepUnderstanding"')&&
  html.includes('id="deepValidation"')&&
  html.includes('id="deepApplication"'),
  'understand validate apply');
check('V2.31 deep dive renders only the visible section family',
  uxCleanup.includes("if(section==='deepUnderstanding')")&&
  uxCleanup.includes("}else if(section==='deepValidation')")&&
  uxCleanup.includes("}else if(section==='deepApplication')")&&
  uxCleanup.includes('renderRelationshipExplanation();')&&
  uxCleanup.includes('renderPaletteValidation();')&&
  uxCleanup.includes('renderContextPreview();'),
  'section-specific renderer dispatch');
check('V2.31 deep dive state stays local and non-mutating',
  uxCleanup.includes("DEEP_DIVE_SECTION_KEY='colorlab.deepSection'")&&
  uxCleanup.includes("storageWriteRaw(DEEP_DIVE_SECTION_KEY,id,{silent:true})")&&
  !uxCleanup.includes('selectedColors=')&&
  !uxCleanup.includes('palette.base=')&&
  !uxCleanup.includes('palette.structure=')&&
  !uxCleanup.includes('palette.accent='),
  'remembered section only; source palette untouched');
check('V2.31 compose render avoids duplicate deep-dive work',
  html.includes("if(deep?.open)scheduleDeepDiveVisibleRender();")&&
  !html.includes("if(active==='compose'){\n      const deep=$('#composeDeepDive');\n      if(deep?.open)renderDeepDiveVisible()"),
  'visible section is routed through the coalesced Deep Dive scheduler');
check('V2.35 update activation is user-mediated',
  !fs.readFileSync('sw.js','utf8').includes(".then(()=>self.skipWaiting())")&&
  fs.readFileSync('sw.js','utf8').includes("if(event.data?.type==='SKIP_WAITING')self.skipWaiting()")&&
  pwaHealth.includes("waiting.postMessage({type:'SKIP_WAITING'})"),
  'new worker waits until explicit user update');
check('V2.35 update path saves local state before worker activation',
  pwaHealth.includes("if(typeof persistDraft==='function')persistDraft()")&&
  pwaHealth.includes("if(typeof writeResilienceSnapshot==='function')await writeResilienceSnapshot()")&&
  pwaHealth.indexOf("persistDraft()")<pwaHealth.indexOf("waiting.postMessage({type:'SKIP_WAITING'})")&&
  pwaHealth.indexOf("writeResilienceSnapshot()")<pwaHealth.indexOf("waiting.postMessage({type:'SKIP_WAITING'})"),
  'draft and resilience snapshot happen before SKIP_WAITING');
check('V2.35 update reload cannot loop',
  pwaHealth.includes('let pwaControllerReloaded=false')&&
  pwaHealth.includes('if(!pwaUpdateRequested||pwaControllerReloaded)return')&&
  pwaHealth.includes('pwaControllerReloaded=true')&&
  pwaHealth.includes('location.reload()'),
  'controllerchange reload is guarded');
check('V2.35 offline state preserves update readiness',
  pwaHealth.includes("if(navigator.onLine===false)")&&
  pwaHealth.includes("if(pwaUpdateReady)")&&
  pwaHealth.includes("window.addEventListener('online',()=>{pwaConnectivityState();pwaCheckForUpdate(true)})"),
  'offline status wins temporarily and update prompt returns online');
check('V2.36 recommendation engine is lazy and absent from startup HTML',
  !html.includes('<script src="./data/recommendation-engine.js"></script>')&&
  html.includes("loadScriptOnce('./data/recommendation-engine.js','recommendationCombos')")&&
  !html.includes('function recommendationCombos(')&&
  recommendationEngine.includes('function recommendationCombos('),
  'Inspire engine is fetched only through lazy orchestration');
check('V2.36 recommendation semantics survive extraction',
  recommendationEngine.includes('prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30))')&&
  recommendationEngine.includes('recommendationBatchHistoryIndex')&&
  recommendationEngine.includes('learnPalettePreference(r.palette,.25)')&&
  recommendationEngine.includes("fresh.concat(seen)"),
  'anti-repeat, batch history and preference signal preserved');
check('V2.36 core two-color completion stays in startup path',
  html.includes('function intelligentPool(')&&
  html.includes('const pool=intelligentPool(chosen,style)')&&
  !recommendationEngine.includes('function intelligentPool('),
  'Compose two-color completion does not depend on lazy Inspire engine');
check('V2.37 core color quality ownership is isolated',
  html.includes('<script src="./core/color-quality.js"></script>')&&
  html.indexOf('./core/color-quality.js')<html.indexOf('./runtime/palette-tools.js')&&
  colorQuality.includes('function qualityRefineGenerated(')&&
  colorQuality.includes('function gamutMapOKLCH(')&&
  !html.includes('function qualityRefineGenerated(')&&
  !html.includes('function gamutMapOKLCH('),
  'pure color quality helpers live in the eager core module only');
check('V2.37 color quality core cannot write source palette or storage',
  !/\bselectedColors\s*=/.test(colorQuality)&&
  !/\bpalette\.(?:base|structure|accent)\s*=/.test(colorQuality)&&
  !/localStorage|indexedDB|fetch\(/.test(colorQuality),
  'core is deterministic color math, not product state ownership');
check('V2.38 Deep Dive rendering is frame-coalesced',
  uxCleanup.includes('let deepDiveRenderFrame=0')&&
  uxCleanup.includes('function scheduleDeepDiveVisibleRender(')&&
  uxCleanup.includes('if(deepDiveRenderFrame)return')&&
  uxCleanup.includes('deepDiveRenderFrame=requestAnimationFrame(')&&
  uxCleanup.includes('deepDiveRenderFrame=0')&&
  appText.includes("if(deep?.open)scheduleDeepDiveVisibleRender()"),
  'repeated Deep Dive triggers share one animation-frame render');
check('V2.38 Inspire rendering is pending-coalesced and route-invalidated',
  appText.includes('let secondaryRenderPending=false')&&
  appText.includes('secondaryRenderToken++')&&
  appText.includes('if(secondaryRenderPending)return')&&
  appText.includes('function inspirationRouteActive(')&&
  appText.includes("if(!inspirationRouteActive())return")&&
  appText.includes("if(token!==secondaryRenderToken||!inspirationRouteActive())return")&&
  appText.includes("if(name==='inspire')renderCompare();\n  scheduleSecondaryRender();")&&
  !appText.includes("ensureInspirationResources().then(()=>requestAnimationFrame(()=>{renderIdeas();renderRecommendations()}))"),
  'rapid route switches invalidate stale async Inspire work without changing recommendation semantics');
check('V2.39 photo decode owns request-local object URLs',
  appText.includes('let photoObjectURL=null,photoLoadToken=0,photoLoadImage=null,photoLoaded=false')&&
  appText.includes('function releasePhotoObjectURL(')&&
  appText.includes('function cancelPendingPhotoLoad(')&&
  appText.includes('photoLoadToken++')&&
  appText.includes('const token=photoLoadToken,objectURL=URL.createObjectURL(file),img=new Image()')&&
  appText.includes('const isCurrent=()=>token===photoLoadToken&&photoLoadImage===img&&photoObjectURL===objectURL')&&
  appText.includes('img.src=objectURL')&&
  !appText.includes('URL.revokeObjectURL(photoObjectURL);photoObjectURL=null'),
  'stale image callbacks cannot revoke or draw through a newer load');
check('V2.39 photo presence is canvas-backed and pending loads clean up on pagehide',
  referenceBoard.includes("typeof photoLoaded!=='undefined'&&photoLoaded")&&
  !referenceBoard.includes("typeof photoObjectURL!=='undefined'&&!!photoObjectURL")&&
  appText.includes('photoLoaded=true;finish()')&&
  appText.includes("window.addEventListener('pagehide',()=>{cancelPendingPhotoLoad();cancelPhotoPointerInteraction();persistDraft();writeResilienceSnapshot()})"),
  'successful decode releases its blob URL while preserving local canvas availability');
check('V2.40 Inspire explicit actions are route-token guarded',
  appText.includes('function inspirationRouteActive(')&&
  appText.includes('function runInspirationAction(')&&
  appText.includes('const token=secondaryRenderToken')&&
  appText.includes("if(!inspirationRouteActive())return Promise.resolve(false)")&&
  appText.includes("if(token!==secondaryRenderToken||!inspirationRouteActive())return false")&&
  appText.includes("$('#previousRecommendations').onclick=()=>runInspirationAction(previousRecommendationBatch)")&&
  appText.includes("$('#nextRecommendations').onclick=()=>runInspirationAction(nextRecommendationBatch)"),
  'delayed batch actions cannot mutate recommendation state after leaving Inspire');
check('V2.40 preference refreshes reuse the coalesced Inspire scheduler',
  appText.includes('if(inspirationRouteActive())scheduleSecondaryRender();')&&
  !appText.includes("ensureInspirationResources().then(()=>{renderIdeas();renderRecommendations()})"),
  'preference changes no longer bypass route-aware render scheduling');

check('V2.41 Photo pointer ownership ignores unrelated touch pointers',
  appText.includes('photoPointerId=null,photoMagnifierHideTimer=0')&&
  appText.includes("if(photoPointerId!==null&&photoPointerId!==e.pointerId)return")&&
  appText.includes("if(!photoPicking||photoPointerId!==e.pointerId)return")&&
  appText.includes('photoPicking=false;photoPointerId=null')&&
  appText.includes("photoCanvas.addEventListener('pointercancel',e=>{")&&
  appText.includes('function cancelPhotoPointerInteraction('),
  'only the active pointer can move, commit, cancel, or end a Photo pick');
check('V2.41 magnifier hide timer cannot cancel a newer Photo interaction',
  appText.includes('if(photoMagnifierHideTimer){clearTimeout(photoMagnifierHideTimer);photoMagnifierHideTimer=0}')&&
  appText.includes('photoMagnifierHideTimer=setTimeout(()=>')&&
  appText.includes("if(!photoPicking)magnifier.style.display='none'")&&
  appText.includes('cancelPendingPhotoLoad();cancelPhotoPointerInteraction();')&&
  appText.includes("cancelPhotoPointerInteraction();persistDraft();writeResilienceSnapshot()"),
  'new loads and pagehide clear pointer state and stale delayed magnifier work');

check('V2.42 Vision mode does not rerender hidden Application previews',
  visionAccessibility.includes("if(document.getElementById('composeDeepDive')?.open&&document.getElementById('deepApplication')?.open)renderContextPreview();")&&
  !/renderVision\(\);\s*renderContextPreview\(\);/.test(visionAccessibility),
  'Validation-only vision changes defer Context Preview work until Application becomes visible');

check('V2.43 primary action surface uses progressive disclosure',
  html.includes('class="action-disclosures"')&&
  html.includes('id="handoffMore"')&&
  html.includes('id="compareMore"')&&
  html.includes('<b>匯出</b>')&&
  html.includes('<b>比較配色</b>')&&
  !html.includes('<div class="handoff-actions">'),
  'developer handoff and A/B setup are no longer permanent peer buttons');

check('V2.43 generate CTA describes the current task without mutating palette state',
  appText.includes('function updateGenerateActionLabel(')&&
  appText.includes("complete?'分析這組配色':'補齊配色'")&&
  appText.includes('updateGenerateActionLabel();')&&
  !/function updateGenerateActionLabel\([\s\S]{0,500}selectedColors\s*=/.test(appText)&&
  !/function updateGenerateActionLabel\([\s\S]{0,500}palette\.(?:base|structure|accent)\s*=/.test(appText),
  '1–2 colors say 補齊配色, complete trios say 分析這組配色, label updates stay view-only');

check('V2.43 user-facing action labels are concise and localized',
  html.includes('id="openStudioPicker">精準選色</button>')&&
  html.includes('data-photo-strategy="balanced" aria-pressed="true">平衡</button>')&&
  html.includes('data-photo-strategy="muted" aria-pressed="false">柔和</button>')&&
  html.includes('data-photo-strategy="vivid" aria-pressed="false">鮮明</button>')&&
  html.includes('id="photoUsePalette" hidden>帶入配色 →</button>')&&
  html.includes('id="installAppBtn">加入主畫面</button>'),
  'high-frequency mobile actions no longer require product-specific or mixed-language interpretation');

check('V2.44 first-run guidance is local, dismissible, and non-blocking',
  html.includes('id="firstRunGuide" aria-label="第一次使用 Color Lab" hidden')&&
  html.includes('id="dismissFirstRunGuide">知道了</button>')&&
  appText.includes("const FIRST_RUN_GUIDE_KEY='colorlab.firstRunGuideV1'")&&
  appText.includes('function initFirstRunGuide(')&&
  appText.includes("storageWriteRaw(FIRST_RUN_GUIDE_KEY,'done',{silent:true})")&&
  !html.includes('aria-modal="true" aria-labelledby="firstRun')&&
  !html.includes('driver.js')&&!html.includes('intro.js')&&!html.includes('shepherd.js'),
  'new-user guidance stays inline, local-only, and dependency-free');

check('V2.44 returning users are not forced through onboarding',
  appText.includes("const hadDraft=storageReadRaw('colorlab.draft',null)!==null")&&
  appText.includes('const hadSaved=readSavedData().length>0')&&
  appText.includes('const hadRecent=recentColors.length>0')&&
  appText.includes('const returning=hadDraft||hadSaved||hadRecent')&&
  appText.includes('if(seen||returning)'),
  'existing draft, library, or recent-color state suppresses the first-run guide');

check('V2.44 onboarding cannot mutate source palette state',
  !/function initFirstRunGuide\([\s\S]{0,1400}selectedColors\s*=/.test(appText)&&
  !/function initFirstRunGuide\([\s\S]{0,1400}palette\.(?:base|structure|accent)\s*=/.test(appText),
  'first-run UI only reads storage and toggles its own visibility');

check('V2.45 result-first summary is derived from the current palette only',
  appText.includes('function paletteResultSummaryData(')&&
  appText.includes('const values=[palette.base,palette.structure,palette.accent].map(toOKLCH)')&&
  appText.includes("const validation=paletteValidationData('original')")&&
  !/function paletteResultSummaryData\([\s\S]{0,1600}selectedColors\s*=/.test(appText)&&
  !/function paletteResultSummaryData\([\s\S]{0,1600}palette\.(?:base|structure|accent)\s*=/.test(appText),
  'summary reads the active palette and validation signals without mutating source state');

check('V2.45 quick actions delegate to existing flows instead of duplicating state',
  appText.includes("$('#resultQuickSave').onclick=()=>$('#save').click()")&&
  appText.includes("$('#resultQuickCompare').onclick=()=>openResultDisclosure('compareMore')")&&
  appText.includes("$('#resultQuickAnalyze').onclick=()=>openResultDisclosure('composeDeepDive')")&&
  appText.includes("$('#resultQuickExport').onclick=()=>openResultDisclosure('handoffMore')")&&
  appText.includes('function openResultDisclosure('),
  'four first-layer actions reuse the established save / compare / analysis / export surfaces');

check('V2.45 first-run copy makes Corner Fan discoverable without adding permanent navigation',
  html.includes('右下角四點可切換配色、靈感、相片與收藏')&&
  html.includes('class="corner-nav" id="cornerNav"')&&
  !html.includes('class="bottom-tab'),
  'navigation remains on-demand while first use explains the entry point');

check('V2.46 camera and gallery inputs share one Photo load path',
  html.includes('id="photoCameraInput" type="file" accept="image/*" capture="environment" hidden')&&
  appText.includes('function handlePhotoInputChange(')&&
  appText.includes("photoInput.addEventListener('change',handlePhotoInputChange)")&&
  appText.includes("photoCameraInput.addEventListener('change',handlePhotoInputChange)")&&
  appText.includes('if(file)loadPhoto(file)'),
  'camera capture and gallery selection converge on the existing loadPhoto lifecycle');

check('V2.46 semantic Library search is derived and schema-free',
  librarySearchCore.includes('function libraryColorSemanticTerms(')&&
  librarySearchCore.includes('function libraryPaletteSemanticTerms(')&&
  appText.includes('function librarySearchMatches(')&&
  appText.includes('return terms.every(term=>haystack.includes(term))')&&
  !/function libraryPaletteSemanticTerms\([\s\S]{0,1800}storageWrite/.test(librarySearchCore)&&
  !/function libraryPaletteSemanticTerms\([\s\S]{0,1800}selectedColors\s*=/.test(librarySearchCore),
  'search terms are derived from saved colors without mutating storage or Compose source state');

check('V2.46 semantic search keeps exact legacy fields in the index',
  appText.includes('(x.name&&x.name.trim())')&&
  appText.includes('x.seed,x.palette?.base,x.palette?.structure,x.palette?.accent')&&
  appText.includes('...tags,x.folder||\'\',localProjectSearchText(x)'),
  'name, HEX, tags, folders, and project names remain searchable alongside semantic color terms');

check('V2.46 use-case search terms are derived from measurable palette relationships',
  librarySearchCore.includes("if(baseStructureContrast>=4.5)terms.push('app','網頁','介面','ui','簡報')")&&
  librarySearchCore.includes("if(avgC<.11)terms.push('室內','穿搭','interior','fashion')")&&
  librarySearchCore.includes("if(accent.c>Math.max(.08,roleC*1.25))terms.push('品牌','brand','海報')")&&
  librarySearchCore.includes('const baseStructureContrast=contrastRatio(colors[0],colors[1])'),
  'context terms reuse local contrast/chroma evidence instead of stored profile metadata or remote classification');

check('V2.32 resilience lifecycle lives inside the storage runtime',
  storageHardening.includes('function openResilienceDB(')&&
  storageHardening.includes('async function writeResilienceSnapshot(')&&
  storageHardening.includes('function scheduleResilienceBackup(')&&
  storageHardening.includes('async function restoreResilienceIfNeeded(')&&
  !html.includes('function openResilienceDB(')&&
  !html.includes('async function writeResilienceSnapshot(')&&
  !html.includes('function scheduleResilienceBackup(')&&
  !html.includes('async function restoreResilienceIfNeeded('),
  'IndexedDB lifecycle is modularized without duplicate ownership');
check('V2.32 storage runtime still carries V2.30 recovery safeguards',
  storageHardening.includes("schema:'color-lab-shadow-v4'")&&
  storageHardening.includes("const needsSaved=storageNeedsRecovery('colorlab.saved',Array.isArray)")&&
  storageHardening.includes("const needsProjects=storageNeedsRecovery(LOCAL_PROJECTS_KEY,Array.isArray)")&&
  storageHardening.includes("storageTransaction(keys,()=>")&&
  storageHardening.includes("reader.onerror=()=>toast('備份檔讀取失敗')"),
  'recovery, rollback, and backup compatibility stay intact');
check('V2.33 photo profile moved into photo runtime without duplicate ownership',
  photoPalette.includes('function photoCompositionProfile(')&&
  !html.includes('function photoCompositionProfile(')&&
  photoPalette.includes('function photoCurrentRelationship(')&&
  !html.includes('function photoCurrentRelationship('),
  'photo analysis helpers have one runtime owner');
check('V2.33 photo analysis stays read-only',
  !photoPalette.includes('selectedColors=')&&
  !photoPalette.includes('palette.base=')&&
  !photoPalette.includes('palette.structure=')&&
  !photoPalette.includes('palette.accent='),
  'moved analysis helpers cannot mutate source palette');

check('V2.18 context preview ships five realistic scene contracts',
  appText.includes('class="cp2 cp2-app"')&&
  appText.includes('class="cp2 cp2-brand"')&&
  appText.includes('class="cp2 cp2-room"')&&
  appText.includes('class="cp2 cp2-outfit"')&&
  appText.includes('class="cp2 cp2-slide"'),
  'app brand room outfit slides');
check('V2.18 room and outfit remain source-color previews',
  appText.includes("const themed=['app','brand','slides'].includes(previewContext)")&&
  appText.includes("!themed?'原色情境 · 75 / 18 / 7'"),
  'only app/brand/slides use derived theme');
const contextPreviewStart=paletteTools.indexOf('function renderContextPreview(){');
const contextPreviewEnd=paletteTools.indexOf('\ndocument.addEventListener',contextPreviewStart);
const contextPreviewBlock=contextPreviewStart>=0&&contextPreviewEnd>contextPreviewStart
  ?paletteTools.slice(contextPreviewStart,contextPreviewEnd):'';
check('V2.18 context preview stays non-mutating',
  contextPreviewBlock.includes("const sourceP=themed?previewThemePalette():{...palette,derived:false}")&&
  contextPreviewBlock.includes("visionContextPalette(sourceP,visionMode)")&&
  !/\bpalette\s*=/.test(contextPreviewBlock)&&
  !/\bselectedColors\s*=/.test(contextPreviewBlock),
  'context render may transform previews but never writes source palette');

check('V2.17 Tone Explorer keeps preview separate from palette',
  appText.includes("toneExplorerPreview={...item,origin:toneExplorerColors()}")&&
  appText.includes("function clearToneExplorerPreview()")&&
  !appText.includes("palette=toneExplorerPreview"),
  'preview state only');
check('V2.17 fixed-Hue path keeps original hue input',
  appText.includes("Object.values(toneFamilies()).map")&&
  appText.includes("gamutMapOKLCH(L,C,o.h)")&&
  appText.includes("family.light?.[i]")&&appText.includes("family.chroma?.[i]"),
  'tone family changes L/C while preserving H');
check('V2.17 fixed-Tone path rotates all hues by one delta',
  appText.includes("TONE_EXPLORER_HUE_STEPS=[-90,-45,-20,20,45,90,180]")&&
  appText.includes("gamutMapOKLCH(o.l,o.c,o.h+delta)"),
  'shared hue rotation preserves L/C intent');
check('V2.17 explicit apply respects locked roles',
  appText.includes("selectedColors=item.colors.map((hex,i)=>lockedSlots[i]?origin[i]:hex)")&&
  appText.includes("pushHistory()"),
  'locked roles + undo history');

check('V2.16 quiet and vivid palettes can both clear the beauty gate',
  quietAesthetic.score>=.48&&vividAesthetic.score>=.48,
  'quiet='+quietAesthetic.score+' vivid='+vividAesthetic.score);
check('V2.16 vivid intent rewards controlled energy',
  vividAesthetic.vividIntent>0&&vividAesthetic.energyStructure>.45,
  JSON.stringify(vividAesthetic));
check('V2.16 uncontrolled high-energy palette scores below structured vivid palette',
  noisyAesthetic.score<vividAesthetic.score,
  'noisy='+noisyAesthetic.score+' vivid='+vividAesthetic.score);
check('V2.16 no absolute high-chroma punishment remains',
  !appText.includes('const highChroma=')&&!appText.includes('const supportCalm=')&&!appText.includes('const chromaDiscipline='),
  'energy-aware scoring only');

check('V2.15 Inspire recent memory is bounded and non-destructive',
  appText.includes("recommendationRecentLimit=24")&&
  appText.includes("slice(-recommendationRecentLimit)")&&
  appText.includes("fresh.concat(seen)")&&
  appText.includes("colorlab.inspireRecentV1"),
  'recent palettes move behind fresh palettes instead of being deleted');
check('V2.14 accessibility fix changes smaller visual role',
  appText.includes("ROLE_RATIOS={base:75,structure:18,accent:7}")&&
  appText.includes("function accessibilityChangeRole(a,b)")&&
  appText.includes("ROLE_RATIOS[a]<=ROLE_RATIOS[b]?a:b"),
  '75/18/7 role priority');
check('V2.14 preview remains non-mutating until explicit apply',
  appText.includes("function previewAccessibilitySuggestion(role,color)")&&
  appText.includes("accessibilityPreview=")&&
  appText.includes("function applyAccessibilitySuggestion(role,color)")&&
  !appText.includes("palette[role]=accessibilityPreview"),
  'preview state + explicit apply');
check('V2.14 AA suggestion target is explicit',
  appText.includes("function nearestAccessibleColor(fg,bg,target=4.5)")&&
  appText.includes("contrastRatio(color,back)>=target")&&
  appText.includes("perceptualDistance(current,color)"),
  '4.5:1 + nearest perceptual change');


check('V2.11 candidate session stores original color',
  html.includes("state.origin=palette[role]")&&
  html.includes("if(state.index===0){state.index=-1;return state.origin||null}"),
  'origin + previous restoration');
check('V2.11 candidate progress is inline and reversible',
  html.includes('class="candidate-progress"')&&
  html.includes('data-shuffle-dir="-1"')&&
  html.includes('data-shuffle-dir="1"'),
  'previous / progress / next');
check('V2.11 exploration modes keep beauty gate while changing depth',
  html.includes("candidateExploreMode==='variation'")&&
  html.includes("candidateExploreMode==='bold'")&&
  html.includes('aesthetic<cfg.aestheticFloor'),
  'mode-specific ranking + aesthetic floor');
check('V2.11 perceptual duplicate guard is explicit',
  html.includes('function isPerceptualDuplicate(')&&
  html.includes('duplicateThreshold:.070')&&html.includes('duplicateThreshold:.074'),
  'visual duplicate threshold');
check('V2.11 shuffle no longer rebuilds the pool after every color',
  !html.includes('const pool=roleAlternativePool(role,36,state.familyId);'),
  'pool built only when context changes');

const tonalRaw=['#C84335','#315EAA','#5E6648'];
const tonalMorandi=A.tonalHarmonizeGenerated(tonalRaw,0,'morandi');
check('tonal harmonizer emits valid Morandi trio',
  tonalMorandi.length===3&&tonalMorandi.every(validHex),
  JSON.stringify(tonalMorandi));
check('tonal harmonizer improves family cohesion',
  A.tonalCohesionScore(tonalMorandi,'morandi')>A.tonalCohesionScore(tonalRaw,'morandi')+.12,
  A.tonalCohesionScore(tonalRaw,'morandi')+' -> '+A.tonalCohesionScore(tonalMorandi,'morandi'));
const tonalPreserve=A.tonalHarmonizeGenerated(tonalRaw,1,'morandi');
check('tonal harmonizer preserves user Color 1',
  tonalPreserve[0]===tonalRaw[0],
  JSON.stringify(tonalPreserve));
check('tonal harmonizer keeps hue identity recognizable',
  A.hueDistance(A.toOKLCH(tonalRaw[1]).h,A.toOKLCH(tonalMorandi[1]).h)<35&&
  A.hueDistance(A.toOKLCH(tonalRaw[2]).h,A.toOKLCH(tonalMorandi[2]).h)<35,
  JSON.stringify(tonalMorandi));
check('tone family inference maps muted atmosphere to Morandi or Earth',
  ['morandi','earth'].includes(A.inferToneFamilyId(['#D9D0C2','#5A4133','#B75635'],'atmospheric')),
  A.inferToneFamilyId(['#D9D0C2','#5A4133','#B75635'],'atmospheric'));

const elegantEditorial=A.paletteAestheticCore(['#EFE8DC','#25282A','#C84335']).score;
const elegantMaterial=A.paletteAestheticCore(['#D8C7A7','#275C64','#B95A37']).score;
const rgbChaos=A.paletteAestheticCore(['#FF0000','#00FF00','#0000FF']).score;
const neonChaos=A.paletteAestheticCore(['#FF00FF','#00FF00','#00FFFF']).score;
check('aesthetic gate keeps disciplined editorial benchmark strong',
  elegantEditorial>=.78,
  'editorial='+elegantEditorial);
check('aesthetic gate keeps material benchmark strong',
  elegantMaterial>=.76,
  'material='+elegantMaterial);
check('high-energy reference palettes remain finite and bounded',
  [rgbChaos,neonChaos].every(x=>Number.isFinite(x)&&x>=0&&x<=1),
  'rgb='+rgbChaos+' neon='+neonChaos);
check('unexpected lane still has a lower but real beauty floor',
  A.laneAestheticFloor('unexpected')<A.laneAestheticFloor('editorial')&&A.laneAestheticFloor('unexpected')>=.5,
  A.laneAestheticFloor('unexpected')+' / '+A.laneAestheticFloor('editorial'));

const quietSurprise=A.paletteSurpriseScore(['#E8E4DC','#CEC8BE','#B6B0A8']);
const vividSurprise=A.paletteSurpriseScore(['#1F2224','#B7A2D7','#B4D63B']);
check('surprise score separates quiet and unexpected relationships',
  vividSurprise>quietSurprise+.18,
  'quiet='+quietSurprise+' vivid='+vividSurprise);
const photoTrio=A.photoPaletteFromRoles([
  {label:'主體',hex:'#F3EFE8'},
  {label:'鮮明',hex:'#C8433D'},
  {label:'深色',hex:'#242624'},
  {label:'柔和',hex:'#DCD6CE'}
]);
check('photo role bridge preserves semantic order',
  Array.isArray(photoTrio)&&photoTrio.join('|')==='#F3EFE8|#242624|#C8433D',
  JSON.stringify(photoTrio));

const direction=A.recommendationDirection({base:'#F3EFE8',structure:'#242624',accent:'#C8433D'},{});
check('recommendation direction is explanatory',
  direction&&typeof direction.label==='string'&&direction.label.length>0&&typeof direction.reason==='string'&&direction.reason.length>8,
  JSON.stringify(direction));

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
