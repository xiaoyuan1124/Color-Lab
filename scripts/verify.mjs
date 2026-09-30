import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const fashion=fs.readFileSync('data/fashion-palettes.js','utf8');
const igStyles=fs.readFileSync('data/ig-style-patterns.js','utf8');
const inspirationAtlas=fs.readFileSync('data/inspiration-atlas.js','utf8');
const toneFamilies=fs.readFileSync('data/tone-families.js','utf8');

const fail=(msg)=>{console.error('FAIL:',msg);process.exitCode=1};
const pass=(msg)=>console.log('PASS:',msg);

const inline=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if(!inline) fail('inline app script missing');
else {
  try { new Function(inline[1]); pass('JavaScript syntax'); }
  catch(e){ fail('JavaScript syntax: '+e.message); }
}


const forbiddenPatterns=[
  {re:/(?<!\$)\$\([^\n;]+\)\.forEach\(/g,label:'single-element helper $() used with forEach'},
  {re:/(?<!\$)\$\([^\n;]+\)\.map\(/g,label:'single-element helper $() used with map'},
  {re:/(?<!\$)\$\([^\n;]+\)\.filter\(/g,label:'single-element helper $() used with filter'}
];
for(const item of forbiddenPatterns){
  if(item.re.test(html)) fail(item.label);
}
pass('selector helper usage');

const duplicateIdMatches=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const idCounts=new Map();
for(const id of duplicateIdMatches) idCounts.set(id,(idCounts.get(id)||0)+1);
for(const [id,count] of idCounts){
  if(count>1) fail('duplicate id '+id+' count='+count);
}
pass('global ID uniqueness');

if(!html.includes("data-view=\"compose\"")||!html.includes("data-view=\"inspire\"")||!html.includes("data-view=\"photo\"")||!html.includes("data-view=\"library\"")){
  fail('one or more app tabs missing');
}else pass('four app views present');

const requiredIds=[
  'color','hex','comboSlots','generate','palette','relationshipExplain','visionPreview','uiPreview',
  'recommendations','ideas','photoTrigger','photoCanvas','regionBox','photoSwatches','saved',
  'librarySearch','librarySort','libraryFolderFilter','installCard','pickerBackdrop',
  'savedActionBackdrop','installBackdrop','undoBtn','redoBtn'
];
for(const id of requiredIds){
  const count=(html.match(new RegExp('id="'+id+'"','g'))||[]).length;
  if(count!==1) fail('id '+id+' count='+count);
}
pass('required unique IDs');

const requiredFunctions=[
  'setColorAtActive','reorderSlots','ensureComboSortable','renderRelationshipExplanation','renderVision','renderContextPreview',
  'fallbackPhotoPalette','finishPhotoRegion','setPhotoMode','renderSaved','toggleSavedPin','editSavedFolder',
  'openSavedActions','exportBackup','importBackupFile','sanitizeSavedRecord','sanitizeCompareRecord',
  'openResilienceDB','restoreResilienceIfNeeded','installApp'
];
for(const fn of requiredFunctions){
  if(!html.includes('function '+fn+'(')) fail('function missing: '+fn);
}
pass('core functions present');

const lazyScripts=[
  ['./vendor/iro.min.js','iro'],
  ['./vendor/Sortable.min.js','Sortable'],
  ['./vendor/poline.umd.js','poline'],
  ['./data/fashion-palettes.js','FASHION_PALETTES'],
  ['./data/ig-style-patterns.js','IG_STYLE_PATTERNS'],
  ['./data/inspiration-atlas.js','INSPIRATION_ATLAS'],
  ['./data/tone-families.js','TONE_FAMILIES']
];
for(const [src] of lazyScripts){
  if(html.includes('<script src="'+src+'"></script>')) fail('lazy dependency regressed to eager script: '+src);
  if(!html.includes("loadScriptOnce('"+src+"'")) fail('lazy dependency loader missing: '+src);
  if(!sw.includes(src)) fail('offline cache missing for lazy dependency: '+src);
}
if(!html.includes('function ensureRecommendationReferences(')||
   !html.includes('function ensureInspirationResources(')){
  fail('V2.11.0 lazy intelligence orchestration missing');
}else pass('V2.11.0 lazy intelligence orchestration');

if(!html.includes('function fastInitialPalette(')||
   html.includes('renderModes();renderComboSlots();renderRecentColors();generate(false);')){
  fail('V2.11.0 fast startup path missing');
}else pass('V2.11.0 fast startup path');

if(/<script[^>]+src="https?:\/\//.test(html)) fail('external runtime script detected');
else pass('runtime scripts are local');

if(!sw.includes("color-lab-v2111")) fail('service worker cache version is not V2.11.1');
else pass('service worker cache version');

if(pkg.version!=='2.11.1') fail('package version must be 2.11.1');
else pass('package version');
if(!html.includes('Color Lab V2.11.1')||!html.includes('<div class="version">V2.11.1</div>')||!html.includes("appVersion:'2.11.1'")) fail('V2.11.1 UI or backup version metadata missing');
else pass('V2.11.1 version metadata');


if(!html.includes("--app-gutter:clamp(20px,5.8vw,28px)")||
   !html.includes("margin:0 0 var(--space-7) calc(-1 * var(--app-gutter))")||
   !html.includes("padding:10px 0 16px var(--app-gutter)")){
  fail('top chrome edge-to-grid alignment missing');
}else pass('top chrome edge-to-grid alignment');

if(!html.includes('class="corner-nav" id="cornerNav"')||
   !html.includes('class="corner-fan"')||
   !html.includes('id="cornerNavToggle"')||
   html.includes('<nav class="edge-rail"')||
   html.includes('<nav class="bottom-nav"')){
  fail('V2.4.1 corner fan navigation contract missing');
}else pass('V2.4.1 corner fan navigation contract');

if(!html.includes('border-radius:100% 0 0 0')||
   !html.includes('transform-origin:100% 100%')||
   !html.includes('.corner-nav-item.active::after{')||
   !html.includes('min-height:50px')){
  fail('V2.4.1 fan geometry, touch target, or active marker missing');
}else pass('V2.4.1 fan geometry and touch targets');

if(!html.includes('function setCornerNavOpen(')||
   !html.includes("toggle.setAttribute('aria-expanded'")||
   !html.includes("b.tabIndex=cornerNavOpen?0:-1")||
   !html.includes("if(cornerNavOpen&&!e.target.closest('#cornerNav'))setCornerNavOpen(false)")){
  fail('V2.4.1 fan accessibility or dismissal behavior missing');
}else pass('V2.4.1 fan accessibility and dismissal');

if(!html.includes('.library-tools .utility-btn{')||
   !html.includes('.library-search{')||
   !html.includes('border-bottom:1px solid var(--hairline)')){
  fail('V2.4.1 library de-framing missing');
}else pass('V2.4.1 library utilities de-framed');


if(!html.includes('class="compose-deep-dive"')||
   !html.includes('<details class="compose-deep-dive"')||
   html.includes('<details class="compose-deep-dive" id="composeDeepDive" open')){
  fail('V2.5 Compose progressive disclosure missing');
}else pass('V2.5 Compose progressive disclosure');

if(!html.includes('saved-item library-piece')||
   !html.includes('data-load-saved=')||
   !html.includes('YOUR COLOR ARCHIVE')){
  fail('V2.5 Library editorial archive missing');
}else pass('V2.5 Library editorial archive');

if(!html.includes("root.classList.add('nav-scrolling')")||
   !html.includes("setTimeout(()=>root.classList.remove('nav-scrolling'),180)")){
  fail('V2.5 Corner Fan scroll retreat missing');
}else pass('V2.5 Corner Fan scroll retreat');

if(!fs.existsSync('scripts/visual-audit.mjs')) fail('V2.5 visual audit script missing');
else pass('V2.5 visual audit script present');


if(!html.includes('function recommendationDirection(')||!html.includes('rec-direction')||!html.includes('direction.reason')){
  fail('V2.6 recommendation direction explanation missing');
}else pass('V2.6 recommendation directions');

if(!html.includes('const LEARNING_CONCEPTS=')||!html.includes('data-learn="hierarchy"')||!html.includes('function showLearningConcept(')){
  fail('V2.6 contextual learning layer missing');
}else pass('V2.6 contextual learning layer');

if(!html.includes('function photoPaletteFromRoles(')||!html.includes('function usePhotoPalette(')||!html.includes('id="photoUsePalette"')){
  fail('V2.6 Photo to Compose bridge missing');
}else pass('V2.6 Photo to Compose bridge');

if(!html.includes('function photoCurrentRelationship(')||!html.includes('與目前三色')){
  fail('V2.6 Compose to Photo comparison missing');
}else pass('V2.6 Compose to Photo comparison');

if(!html.includes('class="preference-detail"')||!html.includes('只用來微調推薦排序，不改動你的三色')){
  fail('V2.6 quiet personalization disclosure missing');
}else pass('V2.6 quiet personalization disclosure');


if(!html.includes('--text-3:#716C66')||
   !html.includes('class="sr-only"')||
   html.includes("b.setAttribute('aria-label','加入推薦配色")){
  fail('V2.6.1 accessibility contrast or label hardening missing');
}else pass('V2.6.1 accessibility contrast and labels');

if(!html.includes("if(deep?.open){renderVision();renderContextPreview()}")||
   !html.includes("$('#composeDeepDive').addEventListener('toggle'")||
   !html.includes('color:var(--text-3);')){
  fail('V2.6.2 deferred deep-dive or contrast follow-up missing');
}else pass('V2.6.2 deferred deep-dive and contrast follow-up');

if(!html.includes("return contrastRatio(bg,dark)>=contrastRatio(bg,light)?dark:light")){
  fail('V2.6.3 contrast-aware preview text chooser missing');
}else pass('V2.6.3 contrast-aware preview text chooser');


if(!html.includes('background:transparent;\n  backdrop-filter:none;')||
   html.includes('background:rgba(255,255,255,.18);\n  backdrop-filter:blur(6px)')){
  fail('V2.6.3 direct-on-color preview labels missing');
}else pass('V2.6.3 direct-on-color preview labels');

try { new Function(inspirationAtlas); pass('inspiration atlas syntax'); }
catch(e){ fail('inspiration atlas syntax: '+e.message); }
try { new Function(toneFamilies); pass('tone families syntax'); }
catch(e){ fail('tone families syntax: '+e.message); }
const atlasCount=(inspirationAtlas.match(/\{id:/g)||[]).length;
if(atlasCount<40) fail('inspiration atlas too small: '+atlasCount);
else pass('inspiration atlas size '+atlasCount);

for(const fn of ['inspirationRefineGenerated','paletteSurpriseScore','paletteAestheticCore','paletteAestheticScore','laneAestheticFloor','archetypeCombos','inspirationUtility','inspirationVariations']){
  if(!html.includes('function '+fn+'(')) fail('V2.11.0 inspiration function missing: '+fn);
}
if(html.includes("const lanes=['editorial','atmospheric','fashion','expressive','unexpected']")){
  fail('V2.11.0 still forces one recommendation per lane');
}else if(!html.includes("item.aesthetic>=laneAestheticFloor(recommendationLane(item))")){
  fail('V2.11.0 aesthetic eligibility gate missing');
}else pass('V2.11.0 beauty-first diversity gate');
if(!html.includes('...archetypeCombos(inputs)')||!html.includes('inspirationRefineGenerated(x.colors,inputs.length)')){
  fail('V2.7 relation-first recommendation sources missing');
}else pass('V2.7 relation-first recommendation sources');
const v27IdeaStart=html.indexOf('function renderIdeas(){');
const v27IdeaEnd=html.indexOf('function renderModes()',v27IdeaStart);
const v27IdeaBlock=v27IdeaStart>=0&&v27IdeaEnd>v27IdeaStart?html.slice(v27IdeaStart,v27IdeaEnd):'';
if(!v27IdeaBlock.includes('inspirationVariations(original,6)')||v27IdeaBlock.includes('trioVariation(original')){
  fail('V2.7 inspiration ideas still use micro variations');
}else pass('V2.7 inspiration ideas use distinct routes');
if(!html.includes('function scheduleNonCriticalStartup(')||
   !html.includes("requestIdleCallback(run,{timeout:1400})")||
   html.includes('renderModes();renderRecentColors();palette=fastInitialPalette()')||
   html.includes('renderCompare();updateLockToggle();setPhotoMode')){
  fail('V2.11.0 non-critical startup deferral missing');
}else pass('V2.11.0 non-critical startup deferral');

const startupRenderStart=html.indexOf('function render(){');
const startupRenderEnd=html.indexOf('function scheduleSecondaryRender()',startupRenderStart);
const startupRenderBlock=startupRenderStart>=0&&startupRenderEnd>startupRenderStart?html.slice(startupRenderStart,startupRenderEnd):'';
if(startupRenderBlock.includes('renderRelationshipExplanation();scheduleSecondaryRender()')||
   !startupRenderBlock.includes("if(deep?.open)renderRelationshipExplanation()")){
  fail('V2.11.0 hidden relationship rendering still blocks startup');
}else pass('V2.11.0 hidden relationship rendering deferred');


if(!html.includes('const beautyGuard=clamp((aesthetic-.48)/.34)')||
   !html.includes('return aesthetic*3.85+tonal*2.10')||
   !html.includes('Tonal Cohesion × Aesthetic Gate × Atlas')){
  fail('V2.11.0 aesthetic-first utility or UI contract missing');
}else pass('V2.11.0 aesthetic-first utility');

if((inspirationAtlas.match(/tier:"core"/g)||[]).length<10){
  fail('V2.11.0 high-confidence core anchors missing');
}else pass('V2.11.0 high-confidence core anchors');


const toneFamilyCount=(toneFamilies.match(/id:"(?:morandi|pastel|earth|editorial|luxury|jewel|digital|airy)"/g)||[]).length;
if(toneFamilyCount!==8) fail('V2.11.0 tone family database count '+toneFamilyCount);
else pass('V2.11.0 tone family database size 8');

for(const fn of ['toneFamilyById','inferToneFamilyId','toneMixColor','tonalHarmonizeGenerated','tonalCohesionScore','toneFamilyLabel']){
  if(!html.includes('function '+fn+'(')) fail('V2.11.0 tonal function missing: '+fn);
}
if(!html.includes("item.tonal>=.52")||
   !html.includes("Tonal Cohesion × Aesthetic Gate")||
   !html.includes("loadScriptOnce('./data/tone-families.js','TONE_FAMILIES')")){
  fail('V2.11.0 tonal cohesion recommendation contract missing');
}else pass('V2.11.0 tonal cohesion recommendation contract');

if(!sw.includes('./data/tone-families.js')) fail('V2.11.0 tone family offline cache missing');
else pass('V2.11.0 tone family offline cache');


for(const fn of ['roleAlternativeContext','candidateExploreConfig','isPerceptualDuplicate','roleAlternativePool','prepareRoleCandidateSession','moveRoleAlternative','recommendationBatch','nextRecommendationBatch']){
  if(!html.includes('function '+fn+'(')) fail('V2.11.0 exploration function missing: '+fn);
}
if(html.includes("Math.floor(Math.random()*Math.min(5,opts.length))")){
  fail('V2.11.0 legacy five-color shuffle cap still active');
}else pass('V2.11.0 role shuffle five-color cap removed');

if(!html.includes('state.pool=roleAlternativePool(role,36,state.familyId)')||
   !html.includes('data-shuffle-dir="-1"')||
   !html.includes('class="candidate-progress"')){
  fail('V2.11.0 deep role alternative pool missing');
}else pass('V2.11.0 deep role alternative pool');

if(!html.includes('const recommendationBatchSize=5')||
   !html.includes('selectDiverseRecommendations(candidates,30)')||
   !html.includes('id="nextRecommendations"')){
  fail('V2.11.0 recommendation batching contract missing');
}else pass('V2.11.0 recommendation batching contract');

if(!html.includes("progress.textContent=recs.length?'第 '+batchNumber+' / '+recommendationBatchCount(recs)+' 批 · '+start+'–'+end+' / '+recs.length+' 組'")){
  fail('V2.11.1 recommendation batch progress missing');
}else pass('V2.11.1 recommendation batch progress');

if(!html.includes('id="previousRecommendations"')||
   !html.includes('function resetRecommendationBatchSession(')||
   !html.includes('function moveRecommendationBatch(direction=1)')||
   !html.includes('recommendationBatchHistory=[0]')||
   !html.includes("if(nextOffset>=recs.length){toast('已看完這輪所有候選');return}")){
  fail('V2.11.1 Inspire history or anti-repeat contract missing');
}else pass('V2.11.1 Inspire history and anti-repeat contract');


if(!html.includes("base:{key:'',pool:[],index:-1,familyId:'',origin:''}")||
   !html.includes("data-candidate-mode=\"harmony\"")||
   !html.includes("data-candidate-mode=\"variation\"")||
   !html.includes("data-candidate-mode=\"bold\"")||
   !html.includes('function moveRoleAlternative(role,direction=1)')||
   !html.includes("if(state.index===0){state.index=-1;return state.origin||null}")){
  fail('V2.11.0 reversible candidate session missing');
}else pass('V2.11.0 reversible candidate session');

if(!html.includes('function isPerceptualDuplicate(')||
   !html.includes('duplicateThreshold:.070')||
   !html.includes('duplicateThreshold:.074')){
  fail('V2.11.0 perceptual duplicate guard missing');
}else pass('V2.11.0 perceptual duplicate guard');

if(!html.includes('toneMixColor(hex,family,idx,cfg.toneStrength)')||
   !html.includes("if(candidateExploreMode==='variation')")||
   !html.includes("else if(candidateExploreMode==='bold')")){
  fail('V2.11.0 exploration mode scoring missing');
}else pass('V2.11.0 exploration mode scoring');

if(!html.includes("state.origin=palette[role]")||
   !html.includes("state.pool=roleAlternativePool(role,36,state.familyId)")){
  fail('V2.11.0 stable candidate session missing');
}else pass('V2.11.0 stable candidate session');

if(html.includes('state.seen=[]')||
   html.includes('nextRoleAlternative(role,pool)')){
  fail('V2.11.0 legacy recomputing shuffle session still present');
}else pass('V2.11.0 legacy shuffle session removed');

if(!html.includes("const progress=state.index<0?'原始色':'第 '+(state.index+1)+' / '+state.pool.length+' 個'")){
  fail('V2.11.0 sequential candidate progress missing');
}else pass('V2.11.0 sequential candidate progress');


if(manifest.display!=='standalone') fail('manifest display must be standalone');
if(manifest.orientation!=='portrait-primary') fail('manifest orientation must be portrait-primary');
pass('manifest app mode');

const requiredMarkers=[
  'data-photo-mode="region"',
  'window.Sortable.create',
  'indexedDB.open(\'color-lab-resilience\'',
  'beforeinstallprompt',
  'color-lab-backup-v1',
  'data-saved-action="folder"',
  'data-saved-action="pin"',
  'renderRelationshipExplanation()',
  'sanitizeSavedRecord',
  'librarySort',
  'libraryFolderFilter',
  'touch-action:none'
];
for(const marker of requiredMarkers){
  if(!html.includes(marker)) fail('feature marker missing: '+marker);
}
pass('V1.1 feature markers');


if(!sw.includes("request.method!=='GET'")) fail('service worker must ignore non-GET requests');
else pass('service worker GET guard');

if(!sw.includes("request.mode==='navigate'")||!sw.includes("caches.match('./index.html')")){
  fail('offline navigation fallback missing');
}else pass('offline navigation fallback');

if(html.includes("renderPaletteHealth();renderRelationshipExplanation();renderVision();renderContextPreview();renderIdeas();renderRecommendations();renderSaved();")){
  fail('palette render still redraws full saved library');
}else pass('palette render avoids full library redraw');

if(!html.includes("data.slice(0,300)")) fail('saved palette cap regression');
else pass('saved palette capacity');


if(html.includes('id="modes"')) fail('preset mood controls returned to Compose');
else pass('Compose preset mood controls removed');

if(html.includes('id="modeLabel"')) fail('visible preset mode label returned to result');
else pass('result preset mode label removed');

if(!html.includes('function orderedPalette(colors)')||!html.includes('if(chosen.length===3)return orderedPalette(chosen);')){
  fail('ordered Color 1/2/3 palette contract missing');
}else pass('Color 1/2/3 ordered palette contract');

const completeStart=html.indexOf('function completeCombo(inputs,style=mode){');
const completeEnd=html.indexOf('function syncEditor()',completeStart);
const completeBlock=completeStart>=0&&completeEnd>completeStart?html.slice(completeStart,completeEnd):'';
if(completeBlock.includes('bestRoleAssignment(')) fail('completeCombo still reassigns user color roles');
else pass('completeCombo never reassigns user roles');


try { new Function(fashion); pass('fashion reference library syntax'); }
catch(e){ fail('fashion reference library syntax: '+e.message); }

const fashionCount=(fashion.match(/\{house:/g)||[]).length;
if(fashionCount<50) fail('fashion reference library too small: '+fashionCount);
else pass('fashion reference library size '+fashionCount);

for(const fn of ['fashionAffinity','fashionTransferPool','fashionReferenceCombos','getFashionReferenceRows']){
  if(!html.includes('function '+fn+'(')) fail('fashion function missing: '+fn);
}
pass('fashion recommendation functions present');

if(!html.includes("Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG")) fail('fashion recommendation description missing');
else pass('fashion recommendation UI description');


try { new Function(igStyles); pass('IG style pattern library syntax'); }
catch(e){ fail('IG style pattern library syntax: '+e.message); }

const igPatternCount=(igStyles.match(/\{\s*id:/g)||[]).length;
if(igPatternCount<12) fail('IG style pattern library too small: '+igPatternCount);
else pass('IG style pattern library size '+igPatternCount);

for(const fn of ['igPatternAffinity','igStyleTransferPool','igStyleCombos','applyStyleDelta']){
  if(!html.includes('function '+fn+'(')) fail('IG style function missing: '+fn);
}
pass('IG style recommendation functions present');

if(!html.includes("Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG")) fail('IG styling recommendation description missing');
else pass('IG styling recommendation UI description');


for(const fn of ['gamutMapOKLCH','cohesionPass','qualityRefineGenerated','qualityMetrics','semanticPhotoSwatches','fallbackPhotoClusters']){
  if(!html.includes('function '+fn+'(')) fail('V1.5 quality function missing: '+fn);
}
pass('V1.5 quality engine functions present');

if(!html.includes('Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG')) fail('V1.5 intelligence description missing');
else pass('V1.5 intelligence description');

if(!html.includes('主體／鮮明／柔和／深色／淺色')) fail('semantic photo swatch UI missing');
else pass('semantic photo swatch UI');

if(!html.includes("if(chosen.length===3)return orderedPalette(chosen);")){
  fail('V1.5 must preserve all three user-selected colors');
}else pass('three user-selected colors remain untouched');

const recommendStart=html.indexOf('function recommendationCombos(){');
const recommendEnd=html.indexOf('function applyRecommendation',recommendStart);
const recommendBlock=recommendStart>=0&&recommendEnd>recommendStart?html.slice(recommendStart,recommendEnd):'';
if(!recommendBlock.includes('inspirationRefineGenerated')||!recommendBlock.includes('qualityRefineGenerated')){
  fail('recommendations missing inspiration or safety refinement paths');
}else pass('recommendations use inspiration and safety refinement paths');

if(!html.includes("added:inputs.length===1?[refined[1],refined[2]]:[refined[2]]")){
  fail('refined recommendation colors are not applied');
}else pass('recommendation preview and applied colors aligned');


for(const fn of ['getIGPatternRows','paletteSignature','librarySearchText','handleSlotKeyboard']){
  if(!html.includes('function '+fn+'(')) fail('V1.6 hardening function missing: '+fn);
}
pass('V1.6 hardening functions present');

if(!html.includes("recommendationCacheKey")||!html.includes("recommendationCacheValue")){
  fail('recommendation cache missing');
}else pass('recommendation cache present');

if(!html.includes("function ensureStructureContrast(")||!html.includes("out[1]=ensureStructureContrast(out[0],out[1],2.55)")){
  fail('adaptive structure contrast guard missing');
}else pass('adaptive structure contrast guard');

if(!html.includes("dh>38&&before.c>.035")){
  fail('generated accent chroma guard missing');
}else pass('generated accent chroma guard');

if(!html.includes("data.saved.length>1000")||!html.includes("color-lab-backup-v2")){
  fail('backup v2 validation missing');
}else pass('backup v2 validation');

if(!html.includes("這組配色已收藏 已移到最上方")){
  fail('duplicate save guard missing');
}else pass('duplicate save guard');

if(!html.includes("aria-keyshortcuts")){
  fail('keyboard slot reorder accessibility missing');
}else pass('keyboard slot reorder accessibility');

if(!html.includes("extremeNeutral")||!html.includes("function photoDominanceScore(")){
  fail('photo extreme-neutral suppression missing');
}else pass('photo extreme-neutral suppression');

if(manifest.lang!=='zh-Hant'||manifest.theme_color!=='#F3EFE8'||manifest.background_color!=='#F3EFE8'){
  fail('manifest language/theme mismatch');
}else pass('manifest language and theme');

if(!Array.isArray(manifest.categories)||!manifest.categories.includes('design')){
  fail('manifest categories missing');
}else pass('manifest categories');

if(!sw.includes("request.mode==='navigate'")||!sw.includes("if(sameOrigin)")){
  fail('V1.6 service worker routing strategy missing');
}else pass('V1.6 service worker routing strategy');


if(!html.includes("function safeJsonRead(")||!html.includes("function readRecentColors(")){
  fail('safe startup storage readers missing');
}else pass('safe startup storage readers');

const startupWindow=html.slice(0,html.indexOf("function openResilienceDB"));
if(startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.compareA')")||
   startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.compareB')")||
   startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.recent')")){
  fail('unsafe startup localStorage JSON parse returned');
}else pass('startup storage parsing hardened');

if(!html.includes("reader.onerror=()=>toast('備份檔讀取失敗')")){
  fail('backup FileReader error handling missing');
}else pass('backup FileReader error handling');

if(!html.includes("predicate=()=>true")||
   !html.includes("x=>x.c>=.05&&x.l>.16&&x.l<.88")||
   !html.includes("x=>x.l<=.52")||
   !html.includes("x=>x.l>=.58")){
  fail('semantic photo role thresholds missing');
}else pass('semantic photo role thresholds');

if(html.includes("sanitizeDraftRecord(JSON.parse(localStorage.getItem('colorlab.draft')")){
  fail('raw draft parse returned');
}else pass('draft restore uses safe JSON reader');


if(!html.includes('function loadScriptOnce(')||!html.includes('const oklchCache=new Map()')||!html.includes('const luminanceCache=new Map()')){
  fail('V1.9 lazy runtime or color caches missing');
}else pass('V1.9 lazy runtime and color caches');

if(!html.includes("requestIdleCallback(run,{timeout:180})")||!html.includes('content-visibility:auto')){
  fail('V1.9 deferred rendering optimization missing');
}else pass('V1.9 deferred rendering optimization');


if(!html.includes('function fastSingleColorTrios(')){
  fail('V1.9 compact single-color search missing');
}else pass('V1.9 compact single-color search');

const perfCompleteStart=html.indexOf('function completeCombo(inputs,style=mode){');
const perfCompleteEnd=html.indexOf('function syncEditor()',perfCompleteStart);
const completeBody=perfCompleteStart>=0&&perfCompleteEnd>perfCompleteStart?html.slice(perfCompleteStart,perfCompleteEnd):'';
if(completeBody.includes('for(let i=0;i<pool.length;i++){')&&completeBody.includes('for(let j=0;j<pool.length;j++){')){
  fail('quadratic single-color search returned');
}else pass('single-color startup avoids quadratic pool search');


for(const fn of ['paletteQualityProfile','recommendationDistance','selectDiverseRecommendations']){
  if(!html.includes('function '+fn+'(')) fail('V1.9 quality function missing: '+fn);
}
pass('V1.9 quality ranking functions present');

for(const key of ['hierarchy','distinctiveness','cohesion','focus','practicality','reference','accessibility','gamut']){
  if(!html.includes(key)) fail('V1.9 quality dimension missing: '+key);
}
pass('V1.9 quality dimensions present');

if(!html.includes('const out=selectDiverseRecommendations(candidates,30)')){
  fail('V2.11.0 deep recommendation selector not active');
}else pass('V2.11.0 deep recommendation selector active');


for(const fn of ['photoCompositionProfile','renderPhotoInsight']){
  if(!html.includes('function '+fn+'(')) fail('V1.9 photo intelligence function missing: '+fn);
}
pass('V1.9 photo intelligence functions present');

for(const id of ['photoInsight','photoInsightLead','photoInsightText']){
  if(!html.includes('id="'+id+'"')) fail('V1.9 photo insight UI missing: '+id);
}
pass('V1.9 photo insight UI present');

if(!html.includes("const clusters=fallbackPhotoClusters(region);")||!html.includes("renderPhotoInsight(clusters,roles);")){
  fail('photo extraction does not reuse one cluster analysis pass');
}else pass('photo extraction reuses cluster analysis');


for(const fn of ['photoDominanceScore','photoCompositionProfile','detectPhotoColorCapability','updatePhotoColorSpaceNote']){
  if(!html.includes('function '+fn+'(')) fail('V1.9 photo analysis function missing: '+fn);
}
pass('V1.9 edge-aware photo analysis functions present');

if(!html.includes('edgeShare:counts[i]?edgeCounts[i]/counts[i]:0')){
  fail('photo clusters do not track edge share');
}else pass('photo clusters track edge share');

if(!html.includes("邊緣色 '+profile.edgeHex+' 可能是背景")){
  fail('photo background-candidate explanation missing');
}else pass('photo background-candidate explanation');

if(!html.includes("P3 顯示可用 · 分析統一為 sRGB")){
  fail('photo color-space disclosure missing');
}else pass('photo color-space disclosure');


for(const fn of [
  'emptyPreferenceModel','emptyPreferenceRelation','sanitizePreferenceModel','sanitizePreferenceRelation',
  'preferenceRelationMetrics','preferenceRoleAffinity','preferenceRelationAffinity',
  'preferenceAffinityFromModel','preferenceModelWithPalette','learnPalettePreference',
  'resetPreferenceModel'
]){
  if(!html.includes('function '+fn+'(')) fail('V2.3 preference function missing: '+fn);
}
pass('V2.3 local preference functions present');

if(!html.includes("colorlab.preferenceV1")||!html.includes('id="resetPreference"')){
  fail('V2.3 local preference storage or reset control missing');
}else pass('V2.3 preference storage and reset control');

if(!html.includes("learnPalettePreference(palette,1)")||
   !html.includes("learnPalettePreference(palette,.35)")||
   !html.includes("learnPalettePreference(r.palette,.25)")||
   !html.includes("learnPalettePreference(x.palette,.35)")){
  fail('V2.3 explicit preference learning signals missing');
}else pass('V2.3 explicit preference learning signals');

if(!html.includes("if(m.totalWeight<3")){
  fail('V2.3 preference maturity gate missing');
}else pass('V2.3 preference maturity gate');

if(!html.includes("personal*.45")||!html.includes("reference,accessibility,personal,gamut")){
  fail('V2.3 personal recommendation dimension missing');
}else pass('V2.3 personal recommendation dimension');

if(!html.includes("color-lab-backup-v4")||!html.includes("appVersion:'2.11.0'")||
   !html.includes("preference:sanitizePreferenceModel(preferenceState)")||
   !html.includes("preferenceEnabled")){
  fail('V2.3 backup v4 personalization payload missing');
}else pass('V2.3 backup v4 personalization payload');

for(const schema of ['color-lab-backup-v1','color-lab-backup-v2','color-lab-backup-v3','color-lab-backup-v4']){
  if(!html.includes(schema)) fail('backup compatibility missing: '+schema);
}
pass('backup v1/v2/v3/v4 compatibility');

if(!html.includes("偏好只存在此裝置")){
  fail('local preference privacy copy missing');
}else pass('local preference privacy copy');

const resetStart=html.indexOf('function resetPreferenceModel(){');
const resetEnd=html.indexOf('function ',resetStart+10);
const resetBlock=resetStart>=0?html.slice(resetStart,resetEnd>resetStart?resetEnd:resetStart+1200):'';
if(resetBlock.includes("colorlab.saved")){
  fail('reset preference must not delete saved palettes');
}else pass('reset preference preserves saved palettes');


if(!html.includes("w>100")||!html.includes("totalWeight>100")){
  fail('V2.3 preference corruption bounds missing');
}else pass('V2.3 preference corruption bounds');

if(!html.includes("localStorage.setItem('colorlab.preferenceV1',JSON.stringify(preferenceState))")||
   resetBlock.includes("removeItem('colorlab.preferenceV1')")){
  fail('V2.3 intentional preference reset marker missing');
}else pass('V2.3 reset cannot be resurrected by stale shadow');

if(!html.includes("const needsPreference=rawPreference===null;")||
   !html.includes("if(needsPreference&&snap.preference)")){
  fail('V2.3 independent preference shadow restore missing');
}else pass('V2.3 independent preference shadow restore');

const generateStart=html.indexOf('function generate(');
const generateEnd=html.indexOf('function shuffle(',generateStart);
const generateBlock=generateStart>=0&&generateEnd>generateStart?html.slice(generateStart,generateEnd):'';
const renderStart=html.indexOf('function render(){');
const renderEnd=html.indexOf('function renderIdeas()',renderStart);
const renderBlock=renderStart>=0&&renderEnd>renderStart?html.slice(renderStart,renderEnd):'';
if(generateBlock.includes('learnPalettePreference(')||renderBlock.includes('learnPalettePreference(')){
  fail('passive rendering must not train local preference');
}else pass('preference learns only from explicit actions');

if(!html.includes("尚未建立本機偏好")||!html.includes("本機偏好學習中")||!html.includes("本機偏好已開始微調推薦")){
  fail('V2.3 preference maturity status missing');
}else pass('V2.3 preference maturity status');


for(const fn of [
  'readPreferenceEnabled','preferenceHueFamily','preferenceRoleDescriptor',
  'preferenceSummaryFromModel','preferenceAffinityForSetting',
  'setPreferenceEnabled','togglePreferenceModel'
]){
  if(!html.includes('function '+fn+'(')) fail('V2.3 personalization control missing: '+fn);
}
pass('V2.3 personalization control functions present');

for(const id of ['togglePreference','preferenceSummary']){
  if(!html.includes('id="'+id+'"')) fail('V2.3 personalization UI missing: '+id);
}
pass('V2.3 personalization UI present');

if(!html.includes("if(!preferenceEnabled)return;")){
  fail('preference learning does not stop when personalization is disabled');
}else pass('preference learning stops when disabled');

if(!html.includes("return enabled?preferenceAffinityFromModel(model,colors):0;")){
  fail('disabled personalization does not force zero affinity');
}else pass('disabled personalization forces zero affinity');

if(!html.includes("colorlab.preferenceEnabled")||!html.includes("color-lab-backup-v4")||!html.includes("appVersion:'2.11.0'")){
  fail('V2.3 personalization setting persistence or backup v4 missing');
}else pass('V2.3 setting persistence and backup v4');

if(!html.includes("schema:'color-lab-shadow-v3'")||!html.includes("preferenceEnabled,")){
  fail('V2.3 resilience shadow does not include personalization setting');
}else pass('V2.3 resilience shadow includes personalization setting');

if(!html.includes("typeof data.preferenceEnabled==='boolean'")){
  fail('backup v4 personalization setting validation missing');
}else pass('backup v4 personalization setting validation');

if(!html.includes("personalHint=preferenceIsMature()")||
   !html.includes("profile?.personal>=.52")||
   !html.includes("本機排序微調")){
  fail('personalized recommendation explanation missing');
}else pass('personalized recommendation explanation');

const toggleStart=html.indexOf('function setPreferenceEnabled(next){');
const toggleEnd=html.indexOf('function togglePreferenceModel()',toggleStart);
const toggleBlock=toggleStart>=0&&toggleEnd>toggleStart?html.slice(toggleStart,toggleEnd):'';
if(toggleBlock.includes("removeItem('colorlab.preferenceV1')")||toggleBlock.includes('emptyPreferenceModel()')){
  fail('turning personalization off must preserve learned model');
}else pass('turning personalization off preserves learned model');


if(!html.includes("hueCoherence=clamp(Math.hypot(role.sumX,role.sumY)/role.w,0,1)")||
   !html.includes("hueCoherence<.22")){
  fail('V2.3 mixed-hue preference coherence guard missing');
}else pass('V2.3 mixed-hue preference coherence guard');


const loadSavedStart=html.indexOf('function loadSaved(index){');
const loadSavedEnd=html.indexOf('function librarySearchText(',loadSavedStart);
const loadSavedBlock=loadSavedStart>=0&&loadSavedEnd>loadSavedStart?html.slice(loadSavedStart,loadSavedEnd):'';
if(!loadSavedBlock.includes("selectedColors=[x.palette.base,x.palette.structure,x.palette.accent]")||loadSavedBlock.includes('completeCombo(')){
  fail('V2.3 saved palette exact restore contract missing');
}else pass('V2.3 saved palette exact restore');

const useCompareStart=html.indexOf('function useCompare(which){');
const useCompareEnd=html.indexOf('function escapeHtml(',useCompareStart);
const useCompareBlock=useCompareStart>=0&&useCompareEnd>useCompareStart?html.slice(useCompareStart,useCompareEnd):'';
if(!useCompareBlock.includes("selectedColors=[x.palette.base,x.palette.structure,x.palette.accent]")||
   !useCompareBlock.includes("learnPalettePreference(x.palette,.2)")){
  fail('V2.3 compare exact restore or explicit learning missing');
}else pass('V2.3 compare exact restore and learning');

const ideaStart=html.indexOf('function renderIdeas(){');
const ideaEnd=html.indexOf('function renderModes()',ideaStart);
const ideaBlock=ideaStart>=0&&ideaEnd>ideaStart?html.slice(ideaStart,ideaEnd):'';
if((ideaBlock.match(/learnPalettePreference\(/g)||[]).length<2){
  fail('V2.3 explicit idea apply learning missing');
}else pass('V2.3 explicit idea apply learning');

if(!html.includes('function preferenceRelationMetrics(')||!html.includes('function preferenceRelationAffinity(')||
   !html.includes('roleScore*.82+relationScore*.18')){
  fail('V2.3 relationship preference ranking missing');
}else pass('V2.3 relationship preference ranking');

if(!fs.existsSync('scripts/budget.mjs')){
  fail('V2.3 size budget script missing');
}else pass('V2.3 size budget script present');

const workflows=[
  fs.readFileSync('.github/workflows/pages.yml','utf8'),
  fs.readFileSync('.github/workflows/quality.yml','utf8'),
  fs.readFileSync('.github/workflows/codeql.yml','utf8')
].join('\n');
for(const marker of [
  'actions/checkout@v7','actions/setup-node@v7','actions/upload-artifact@v7',
  'actions/upload-pages-artifact@v5','actions/configure-pages@v6','actions/deploy-pages@v5'
]){
  if(!workflows.includes(marker)) fail('modern GitHub Action missing: '+marker);
}
pass('V2.3 GitHub Actions modernized');

if(!workflows.includes('group: color-lab-codeql-')||!workflows.includes('cancel-in-progress: true')){
  fail('CodeQL superseded-run concurrency missing');
}else pass('CodeQL superseded-run concurrency');

if(process.exitCode) process.exit(process.exitCode);
console.log('Color Lab V2.11.0 verification complete.');
