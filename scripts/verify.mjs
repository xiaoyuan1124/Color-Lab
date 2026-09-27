import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const fashion=fs.readFileSync('data/fashion-palettes.js','utf8');
const igStyles=fs.readFileSync('data/ig-style-patterns.js','utf8');

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

const eagerScripts=['./vendor/poline.umd.js','./data/fashion-palettes.js','./data/ig-style-patterns.js'];
for(const src of eagerScripts){
  if(!html.includes('<script src="'+src+'"></script>')) fail('eager local dependency missing: '+src);
  if(!sw.includes(src)) fail('offline cache missing: '+src);
}
const lazyScripts=['./vendor/iro.min.js','./vendor/Sortable.min.js'];
for(const src of lazyScripts){
  if(html.includes('<script src="'+src+'"></script>')) fail('lazy dependency regressed to eager script: '+src);
  if(!html.includes("loadScriptOnce('"+src+"'")) fail('lazy dependency loader missing: '+src);
  if(!sw.includes(src)) fail('offline cache missing for lazy dependency: '+src);
}
if(/<script[^>]+src="https?:\/\//.test(html)) fail('external runtime script detected');
else pass('runtime scripts are local');

if(!sw.includes("color-lab-v21")) fail('service worker cache version is not V2.1');
else pass('service worker cache version');

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

if(!html.includes("Fashion × IG × Cohesion × 色域保護")) fail('fashion recommendation description missing');
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

if(!html.includes("Fashion × IG × Cohesion × 色域保護")) fail('IG styling recommendation description missing');
else pass('IG styling recommendation UI description');


for(const fn of ['gamutMapOKLCH','cohesionPass','qualityRefineGenerated','qualityMetrics','semanticPhotoSwatches','fallbackPhotoClusters']){
  if(!html.includes('function '+fn+'(')) fail('V1.5 quality function missing: '+fn);
}
pass('V1.5 quality engine functions present');

if(!html.includes('Fashion × IG × Cohesion × 色域保護')) fail('V1.5 intelligence description missing');
else pass('V1.5 intelligence description');

if(!html.includes('主體／鮮明／柔和／深色／淺色')) fail('semantic photo swatch UI missing');
else pass('semantic photo swatch UI');

if(!html.includes("if(chosen.length===3)return orderedPalette(chosen);")){
  fail('V1.5 must preserve all three user-selected colors');
}else pass('three user-selected colors remain untouched');

const recommendStart=html.indexOf('function recommendationCombos(){');
const recommendEnd=html.indexOf('function applyRecommendation',recommendStart);
const recommendBlock=recommendStart>=0&&recommendEnd>recommendStart?html.slice(recommendStart,recommendEnd):'';
if(!recommendBlock.includes('qualityRefineGenerated')) fail('recommendations bypass quality refinement');
else pass('recommendations use quality refinement');

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

if(!html.includes('const out=selectDiverseRecommendations(candidates,5)')){
  fail('recommendation diversity selector not active');
}else pass('recommendation diversity selector active');


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
  'emptyPreferenceModel','sanitizePreferenceModel','preferenceRoleAffinity',
  'preferenceAffinityFromModel','preferenceModelWithPalette','learnPalettePreference',
  'resetPreferenceModel'
]){
  if(!html.includes('function '+fn+'(')) fail('V2.1 preference function missing: '+fn);
}
pass('V2.1 local preference functions present');

if(!html.includes("colorlab.preferenceV1")||!html.includes('id="resetPreference"')){
  fail('V2.1 local preference storage or reset control missing');
}else pass('V2.1 preference storage and reset control');

if(!html.includes("learnPalettePreference(palette,1)")||
   !html.includes("learnPalettePreference(palette,.35)")||
   !html.includes("learnPalettePreference(r.palette,.25)")||
   !html.includes("learnPalettePreference(x.palette,.35)")){
  fail('V2.1 explicit preference learning signals missing');
}else pass('V2.1 explicit preference learning signals');

if(!html.includes("if(m.totalWeight<3")){
  fail('V2.1 preference maturity gate missing');
}else pass('V2.1 preference maturity gate');

if(!html.includes("personal*.45")||!html.includes("reference,accessibility,personal,gamut")){
  fail('V2.1 personal recommendation dimension missing');
}else pass('V2.1 personal recommendation dimension');

if(!html.includes("color-lab-backup-v3")||!html.includes("appVersion:'2.0'")||
   !html.includes("preference:sanitizePreferenceModel(preferenceState)")){
  fail('V2.1 backup v3 preference payload missing');
}else pass('V2.1 backup v3 preference payload');

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
  fail('V2.1 preference corruption bounds missing');
}else pass('V2.1 preference corruption bounds');

if(!html.includes("localStorage.setItem('colorlab.preferenceV1',JSON.stringify(preferenceState))")||
   resetBlock.includes("removeItem('colorlab.preferenceV1')")){
  fail('V2.1 intentional preference reset marker missing');
}else pass('V2.1 reset cannot be resurrected by stale shadow');

if(!html.includes("const needsPreference=rawPreference===null;")||
   !html.includes("if(needsPreference&&snap.preference)")){
  fail('V2.1 independent preference shadow restore missing');
}else pass('V2.1 independent preference shadow restore');

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
  fail('V2.1 preference maturity status missing');
}else pass('V2.1 preference maturity status');


for(const fn of [
  'readPreferenceEnabled','preferenceHueFamily','preferenceRoleDescriptor',
  'preferenceSummaryFromModel','preferenceAffinityForSetting',
  'setPreferenceEnabled','togglePreferenceModel'
]){
  if(!html.includes('function '+fn+'(')) fail('V2.1 personalization control missing: '+fn);
}
pass('V2.1 personalization control functions present');

for(const id of ['togglePreference','preferenceSummary']){
  if(!html.includes('id="'+id+'"')) fail('V2.1 personalization UI missing: '+id);
}
pass('V2.1 personalization UI present');

if(!html.includes("if(!preferenceEnabled)return;")){
  fail('preference learning does not stop when personalization is disabled');
}else pass('preference learning stops when disabled');

if(!html.includes("return enabled?preferenceAffinityFromModel(model,colors):0;")){
  fail('disabled personalization does not force zero affinity');
}else pass('disabled personalization forces zero affinity');

if(!html.includes("colorlab.preferenceEnabled")||!html.includes("color-lab-backup-v4")||!html.includes("appVersion:'2.1'")){
  fail('V2.1 personalization setting persistence or backup v4 missing');
}else pass('V2.1 setting persistence and backup v4');

if(!html.includes("schema:'color-lab-shadow-v3'")||!html.includes("preferenceEnabled,")){
  fail('V2.1 resilience shadow does not include personalization setting');
}else pass('V2.1 resilience shadow includes personalization setting');

if(!html.includes("typeof data.preferenceEnabled==='boolean'")){
  fail('backup v4 personalization setting validation missing');
}else pass('backup v4 personalization setting validation');

if(!html.includes("符合本機偏好")){
  fail('personalized recommendation explanation missing');
}else pass('personalized recommendation explanation');

const toggleStart=html.indexOf('function setPreferenceEnabled(next){');
const toggleEnd=html.indexOf('function togglePreferenceModel()',toggleStart);
const toggleBlock=toggleStart>=0&&toggleEnd>toggleStart?html.slice(toggleStart,toggleEnd):'';
if(toggleBlock.includes("removeItem('colorlab.preferenceV1')")||toggleBlock.includes('emptyPreferenceModel()')){
  fail('turning personalization off must preserve learned model');
}else pass('turning personalization off preserves learned model');

if(process.exitCode) process.exit(process.exitCode);
console.log('Color Lab V2.1 verification complete.');
