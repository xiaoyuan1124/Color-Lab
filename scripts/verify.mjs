import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const webkitConfig=fs.readFileSync('playwright.webkit.config.js','utf8');
const webkitCore=fs.readFileSync('tests/e2e/webkit-core.spec.js','utf8');
const qualityWorkflow=fs.readFileSync('.github/workflows/quality.yml','utf8');
const storageHardening=fs.readFileSync('runtime/storage-hardening.js','utf8');
const uxCleanup=fs.readFileSync('runtime/ux-cleanup.js','utf8');
const uxCleanupCss=fs.readFileSync('runtime/ux-cleanup.css','utf8');
const paletteTools=fs.readFileSync('runtime/palette-tools.js','utf8');
const toneExplorer=fs.readFileSync('runtime/tone-explorer.js','utf8');
const photoPalette=fs.readFileSync('runtime/photo-palette.js','utf8');
const photoPaletteCss=fs.readFileSync('runtime/photo-palette.css','utf8');
const colorRelationship=fs.readFileSync('runtime/color-relationship.js','utf8');
const colorRelationshipCss=fs.readFileSync('runtime/color-relationship.css','utf8');
const roleScale=fs.readFileSync('runtime/role-scale.js','utf8');
const roleScaleCss=fs.readFileSync('runtime/role-scale.css','utf8');
const shareSnapshot=fs.readFileSync('runtime/share-snapshot.js','utf8');
const shareSnapshotCss=fs.readFileSync('runtime/share-snapshot.css','utf8');
const customDesignPreview=fs.readFileSync('runtime/custom-design-preview.js','utf8');
const customDesignPreviewCss=fs.readFileSync('runtime/custom-design-preview.css','utf8');
const visionAccessibility=fs.readFileSync('runtime/vision-accessibility.js','utf8');
const visionAccessibilityCss=fs.readFileSync('runtime/vision-accessibility.css','utf8');
const localProjects=fs.readFileSync('runtime/local-projects.js','utf8');
const localProjectsCss=fs.readFileSync('runtime/local-projects.css','utf8');
const referenceBoard=fs.readFileSync('runtime/reference-board.js','utf8');
const gradientStudio=fs.readFileSync('runtime/gradient-studio.js','utf8');
const gradientStudioCss=fs.readFileSync('runtime/gradient-studio.css','utf8');
const qrVendor=fs.readFileSync('vendor/qrcode.min.js','utf8');
const qrLicense=fs.readFileSync('vendor/qrcode.LICENSE.txt','utf8');
const appSource=html+'\n'+storageHardening+'\n'+uxCleanup+'\n'+paletteTools+'\n'+toneExplorer+'\n'+photoPalette+'\n'+colorRelationship+'\n'+roleScale+'\n'+shareSnapshot+'\n'+customDesignPreview+'\n'+visionAccessibility+'\n'+localProjects+'\n'+referenceBoard+'\n'+gradientStudio;
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const fashion=fs.readFileSync('data/fashion-palettes.js','utf8');
const igStyles=fs.readFileSync('data/ig-style-patterns.js','utf8');
const inspirationAtlas=fs.readFileSync('data/inspiration-atlas.js','utf8');
const toneFamilies=fs.readFileSync('data/tone-families.js','utf8');

const fail=(msg)=>{console.error('FAIL:',msg);process.exitCode=1};
const pass=(msg)=>console.log('PASS:',msg);

const inlineScripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const inline=inlineScripts.at(-1);
if(!inline) fail('inline app script missing');
else {
  try { new Function(inline[1]); pass('inline JavaScript syntax'); }
  catch(e){ fail('inline JavaScript syntax: '+e.message); }
}
try { new Function(storageHardening); pass('storage hardening runtime syntax'); }
catch(e){ fail('storage hardening runtime syntax: '+e.message); }
try { new Function(uxCleanup); pass('ux cleanup runtime syntax'); }
catch(e){ fail('ux cleanup runtime syntax: '+e.message); }
try { new Function(paletteTools); pass('palette tools runtime syntax'); }
catch(e){ fail('palette tools runtime syntax: '+e.message); }
try { new Function(toneExplorer); pass('tone explorer runtime syntax'); }
catch(e){ fail('tone explorer runtime syntax: '+e.message); }
try { new Function(photoPalette); pass('photo palette runtime syntax'); }
catch(e){ fail('photo palette runtime syntax: '+e.message); }
try { new Function(colorRelationship); pass('color relationship runtime syntax'); }
catch(e){ fail('color relationship runtime syntax: '+e.message); }
try { new Function(roleScale); pass('role scale runtime syntax'); }
catch(e){ fail('role scale runtime syntax: '+e.message); }
try { new Function(shareSnapshot); pass('share snapshot runtime syntax'); }
catch(e){ fail('share snapshot runtime syntax: '+e.message); }
try { new Function(customDesignPreview); pass('custom design preview runtime syntax'); }
catch(e){ fail('custom design preview runtime syntax: '+e.message); }
try { new Function(visionAccessibility); pass('vision accessibility runtime syntax'); }
catch(e){ fail('vision accessibility runtime syntax: '+e.message); }
try { new Function(localProjects); pass('local projects runtime syntax'); }
catch(e){ fail('local projects runtime syntax: '+e.message); }
try { new Function(referenceBoard); pass('reference board runtime syntax'); }
catch(e){ fail('reference board runtime syntax: '+e.message); }
try { new Function(gradientStudio); pass('gradient studio runtime syntax'); }
catch(e){ fail('gradient studio runtime syntax: '+e.message); }
try { new Function(qrVendor); pass('local QR vendor syntax'); }
catch(e){ fail('local QR vendor syntax: '+e.message); }


const forbiddenPatterns=[
  {re:/(?<!\$)\$\([^\n;]+\)\.forEach\(/g,label:'single-element helper $() used with forEach'},
  {re:/(?<!\$)\$\([^\n;]+\)\.map\(/g,label:'single-element helper $() used with map'},
  {re:/(?<!\$)\$\([^\n;]+\)\.filter\(/g,label:'single-element helper $() used with filter'}
];
for(const item of forbiddenPatterns){
  if(item.re.test(appSource)) fail(item.label);
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
  if(!appSource.includes('function '+fn+'(')) fail('function missing: '+fn);
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

if(!sw.includes("color-lab-v2340")) fail('service worker cache version is not V2.34.0');
else pass('service worker cache version');

if(pkg.version!=='2.34.0') fail('package version must be 2.34.0');
else pass('package version');
if(!html.includes('Color Lab V2.34.0')||!html.includes('<div class="version">V2.34.0</div>')||!html.includes("appVersion:'2.34.0'")) fail('V2.34.0 UI or backup version metadata missing');
else pass('V2.34.0 version metadata');

if(!html.includes('<script src="./runtime/palette-tools.js"></script>')||
   !sw.includes('./runtime/palette-tools.js')||
   html.includes('function paletteArtifact(')||
   html.includes('function renderPaletteValidation(')||
   html.includes('function renderContextPreview(')){
  fail('V2.13.1 palette runtime modularization contract missing');
}else pass('V2.13.1 palette runtime modularization');

if(!html.includes('id="accessibilityFixes"')||
   !appSource.includes('function nearestAccessibleColor(')||
   !appSource.includes('function accessibilityChangeRole(')||
   !appSource.includes('function previewAccessibilitySuggestion(')||
   !appSource.includes('function applyAccessibilitySuggestion(')||
   !appSource.includes("ROLE_RATIOS={base:75,structure:18,accent:7}")||
   !appSource.includes("target=4.5")||
   !appSource.includes("accessibilityPreview=null")){
  fail('V2.14.0 actionable accessibility fix contract missing');
}else pass('V2.14.0 actionable accessibility fix contract');

if(!appSource.includes("validationTheme!=='original'")||
   !appSource.includes("Dark 為衍生預覽，不直接改原色")||
   !appSource.includes("只比較，不改原色")||
   !appSource.includes("data-accessibility-apply")||
   !appSource.includes("data-accessibility-preview")){
  fail('V2.14.0 preview-only before explicit apply contract missing');
}else pass('V2.14.0 preview before explicit apply');


if(!appSource.includes("recommendationRecentLimit=24")||
   !appSource.includes("function recommendationFingerprint(")||
   !appSource.includes("function readRecommendationRecent(")||
   !appSource.includes("function rememberRecommendationBatch(")||
   !appSource.includes("function prioritizeUnseenRecommendations(")||
   !appSource.includes("colorlab.inspireRecentV1")||
   !appSource.includes("prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30))")){
  fail('V2.15.0 Inspire recent-memory contract missing');
}else pass('V2.15.0 Inspire recent-memory anti-repeat');

if(!appSource.includes("function paletteAestheticCore(")||
   !appSource.includes("const chromaIntent=")||
   !appSource.includes("const roleClarity=")||
   !appSource.includes("const energyStructure=")||
   !appSource.includes("const vividIntent=")||
   !appSource.includes("expressive:.98")||
   !appSource.includes("unexpected:.96")||
   appSource.includes("const chromaDiscipline=")||
   appSource.includes("const supportCalm=")||
   appSource.includes("const highChroma=")){
  fail('V2.16.0 energy-aware Aesthetic Gate contract missing');
}else pass('V2.16.0 energy-aware Aesthetic Gate');

if(!appSource.includes("penalty+=clamp((averageChroma-.21)/.12)*(1-energyStructure)*.14")||
   !appSource.includes("if(roleClarity<.20)")||
   !appSource.includes("vividIntent*.04")){
  fail('V2.16.0 vivid-overload guard missing');
}else pass('V2.16.0 vivid palettes judged by structure, not saturation alone');

if(!appSource.includes("const supportChroma=Math.max(baseO.c,structureO.c)")||
   !appSource.includes("const accentControl=")||
   appSource.includes("const chromaUsability=")){
  fail('V2.16.0 role-aware practicality contract missing');
}else pass('V2.16.0 vivid Accent practicality is role-aware');

if(!html.includes('id="toneExplorer"')||
   !html.includes('id="toneExplorerModes"')||
   !html.includes('data-tone-mode="tone"')||
   !html.includes('data-tone-mode="hue"')||
   !html.includes('<script src="./runtime/tone-explorer.js"></script>')||
   !sw.includes('./runtime/tone-explorer.js')||
   !appSource.includes('function toneExplorerToneCandidate(')||
   !appSource.includes('Object.values(toneFamilies()).map')||
   !appSource.includes('function toneExplorerHueCandidate(')||
   !appSource.includes('function previewToneExplorer(')||
   !appSource.includes('function applyToneExplorer(')){
  fail('V2.17.0 Tone Explorer contract missing');
}else pass('V2.17.0 Tone Explorer runtime + UI');

if(!appSource.includes("toneExplorerMode='tone'")||
   !appSource.includes('TONE_EXPLORER_HUE_STEPS=[-90,-45,-20,20,45,90,180]')||
   !appSource.includes('gamutMapOKLCH(L,C,o.h)')||
   !appSource.includes('gamutMapOKLCH(o.l,o.c,o.h+delta)')||
   !appSource.includes("selectedColors=item.colors.map((hex,i)=>lockedSlots[i]?origin[i]:hex)")||
   !appSource.includes('toneExplorerPreview={...item,origin:toneExplorerColors()}')){
  fail('V2.17.0 Hue/Tone preservation or explicit apply contract missing');
}else pass('V2.17.0 Hue/Tone preservation + preview-only contract');

if(!appSource.includes('toneExplorerSignature(toneExplorerPreview.origin)!==toneExplorerSignature()')||
   !appSource.includes('toneExplorerPreview=null')){
  fail('V2.17.0 stale preview guard missing');
}else pass('V2.17.0 stale preview guard');

const contextPreviewCss=fs.readFileSync('runtime/context-preview.css','utf8');
if(!html.includes('<link rel="stylesheet" href="./runtime/context-preview.css">')||
   !sw.includes('./runtime/context-preview.css')||
   !contextPreviewCss.includes('.cp2-app{')||
   !contextPreviewCss.includes('.cp2-brand{')||
   !contextPreviewCss.includes('.cp2-room{')||
   !contextPreviewCss.includes('.cp2-outfit{')||
   !contextPreviewCss.includes('.cp2-slide{')){
  fail('V2.18.0 Context Preview 2.0 stylesheet contract missing');
}else pass('V2.18.0 Context Preview 2.0 stylesheet + offline cache');

if(!appSource.includes("labels={app:'App / Web',brand:'品牌',room:'室內',outfit:'穿搭',slides:'簡報'}")||
   !appSource.includes("class=\"cp2 cp2-app\"")||
   !appSource.includes("class=\"cp2 cp2-brand\"")||
   !appSource.includes("class=\"cp2 cp2-room\"")||
   !appSource.includes("class=\"cp2 cp2-outfit\"")||
   !appSource.includes("class=\"cp2 cp2-slide\"")||
   !appSource.includes("原色情境 · 75 / 18 / 7")||
   !appSource.includes("Dark 預覽變體 · 不改原色")){
  fail('V2.18.0 realistic context scene contract missing');
}else pass('V2.18.0 five realistic 75/18/7 contexts');

if(!html.includes('id="photoStrategyBar"')||
   !html.includes('data-photo-strategy="balanced"')||
   !html.includes('data-photo-strategy="muted"')||
   !html.includes('data-photo-strategy="vivid"')||
   !html.includes('id="photoPalettePreview"')||
   !html.includes('<script src="./runtime/photo-palette.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/photo-palette.css">')||
   !sw.includes('./runtime/photo-palette.js')||
   !sw.includes('./runtime/photo-palette.css')){
  fail('V2.19.0 Photo to Palette 2.0 UI/runtime contract missing');
}else pass('V2.19.0 Photo to Palette 2.0 UI + offline runtime');

if(!appSource.includes('function photoDistinctClusters(')||
   !appSource.includes('function photoPaletteSelection(')||
   !appSource.includes("style==='muted'")||
   !appSource.includes("style==='vivid'")||
   !appSource.includes("roles:[")||
   !appSource.includes("label:'主體'")||
   !appSource.includes("label:'結構'")||
   !appSource.includes("label:'焦點'")||
   !appSource.includes('photo-palette-ratio')||
   !photoPaletteCss.includes('.photo-palette-ratio{')){
  fail('V2.19.0 semantic photo trio contract missing');
}else pass('V2.19.0 Balanced / Muted / Vivid semantic trio');

if(!appSource.includes("selectedColors=[...colors]")||
   !appSource.includes("photoPaletteSelection(lastPhotoClusters,lastPhotoRoles,photoPaletteStyle)")||
   !appSource.includes("perceptualDistance(x.hex,item.hex)>=threshold")||
   !appSource.includes("localStorage.setItem('colorlab.photoPaletteStyle'")){
  fail('V2.19.0 explicit apply / perceptual dedupe contract missing');
}else pass('V2.19.0 explicit apply + perceptual dedupe');

if(!html.includes('id="handoffMore"')||
   !html.includes('data-export-format="tailwind"')||
   !html.includes('data-export-format="swiftui"')||
   !html.includes('data-export-format="svg"')||
   !appSource.includes("if(kind==='tailwind')")||
   !appSource.includes("if(kind==='swiftui')")||
   !appSource.includes("if(kind==='svg')")||
   !appSource.includes("function artifactSwiftColor(")||
   !appSource.includes("function artifactXmlEscape(")){
  fail('V2.20.0 Professional Export 2.0 format contract missing');
}else pass('V2.20.0 Tailwind / SwiftUI / SVG exports');

if(!appSource.includes("data.palette.base")||
   !appSource.includes("data.palette.structure")||
   !appSource.includes("data.palette.accent")||
   !appSource.includes("type:'image/svg+xml'")||
   !appSource.includes("type:'text/javascript'")||
   !appSource.includes("name:safe+'.swift'")){
  fail('V2.20.0 exact-color handoff contract missing');
}else pass('V2.20.0 exact source-color professional handoff');

if(!html.includes('id="colorRelationshipMap"')||
   !html.includes('<script src="./runtime/color-relationship.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/color-relationship.css">')||
   !sw.includes('./runtime/color-relationship.js')||!sw.includes('./runtime/color-relationship.css')||
   !appSource.includes('function renderColorRelationshipMap(')||
   !appSource.includes('function relationshipVerdict(')||
   !appSource.includes('function relationshipHuePoint(')||
   !colorRelationshipCss.includes('.crm-wheel{')||
   !colorRelationshipCss.includes('.crm-role-weight{')){
  fail('V2.21.0 Color Relationship Map contract missing');
}else pass('V2.21.0 Color Relationship Map runtime + UI');

if(!appSource.includes("ratio:75")||!appSource.includes("ratio:18")||!appSource.includes("ratio:7")||
   !appSource.includes("只讀分析 · 使用目前 Base / Structure / Accent 原色，不重新排序、不寫回 Compose")){
  fail('V2.21.0 read-only 75/18/7 relationship contract missing');
}else pass('V2.21.0 relationship map preserves exact role order');

if(!html.includes('id="roleScaleDetails"')||!html.includes('id="roleScale"')||!html.includes('id="copyRoleScaleCss"')||
   !html.includes('<script src="./runtime/role-scale.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/role-scale.css">')||
   !sw.includes('./runtime/role-scale.js')||!sw.includes('./runtime/role-scale.css')||
   !appSource.includes('function roleScaleFor(')||!appSource.includes('function roleScaleSystem(')||
   !appSource.includes('function roleScaleCssText(')||!appSource.includes('function renderRoleScale(')||
   !roleScaleCss.includes('.rscale-strip{')||!roleScaleCss.includes('.rscale-swatch.source{')){
  fail('V2.22.0 Role Scale runtime + UI contract missing');
}else pass('V2.22.0 Role Scale runtime + UI');

if(!appSource.includes('const ROLE_SCALE_STOPS=[50,100,200,300,400,500,600,700,800,900]')||
   !appSource.includes("if(i===anchor)return{stop,hex:source,source:true")||
   !appSource.includes("--color-'+key+'-source: '+normHex(system[key].source)")||
   roleScale.includes('selectedColors=')||roleScale.includes('palette.base=')||roleScale.includes('palette.structure=')||roleScale.includes('palette.accent=')){
  fail('V2.22.0 exact-source anchor or read-only scale contract missing');
}else pass('V2.22.0 exact source anchors + derived-only scales');

if(!html.includes('<script src="./runtime/share-snapshot.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/share-snapshot.css">')||
   !sw.includes('./runtime/share-snapshot.js')||!sw.includes('./runtime/share-snapshot.css')||!sw.includes('./vendor/qrcode.min.js')||
   !appSource.includes('function shareSnapshotHash(')||!appSource.includes('function parseShareSnapshot(')||
   !appSource.includes('function applyShareSnapshotFromLocation(')||!appSource.includes('function installShareSnapshotHashListener(')||!appSource.includes('function openShareSnapshot(')||
   !shareSnapshotCss.includes('.share-snapshot-panel{')||!shareSnapshotCss.includes('.share-snapshot-qr{')){
  fail('V2.23.0 Shareable Snapshot runtime + UI contract missing');
}else pass('V2.23.0 Shareable Snapshot runtime + UI');

if(!shareSnapshot.includes("'#clv=1&cl='")||
   !shareSnapshot.includes("colors:[palette.base,palette.structure,palette.accent].map(normHex)")||
   !shareSnapshot.includes("selectedColors=[...snap.colors]")||
   !shareSnapshot.includes("lockedSlots=[false,false,false]")||
   !html.includes('restoreDraft();applyShareSnapshotFromLocation();')||
   !html.includes('updateHistoryButtons();installShareSnapshotHashListener();')||
   !shareSnapshot.includes("window.addEventListener('hashchange',()=>applyShareSnapshotFromLocation(true))")||
   shareSnapshot.includes('fetch(')||shareSnapshot.includes('XMLHttpRequest')){
  fail('V2.23.0 exact-order stateless URL snapshot contract missing');
}else pass('V2.23.0 exact-order stateless URL snapshots');

if(!shareSnapshot.includes("loadScriptOnce('./vendor/qrcode.min.js','QRCode')")||
   !qrLicense.includes('MIT License')||!qrLicense.includes('Copyright (c) 2012 davidshimjs')||
   qrVendor.length>23000){
  fail('V2.23.0 local QR dependency contract missing or oversized');
}else pass('V2.23.0 local MIT QR runtime');

if(html.includes('const LEARNING_CONCEPTS=')||html.includes('function showLearningConcept(')||
   !colorRelationship.includes('const LEARNING_CONCEPTS=')||!colorRelationship.includes('function showLearningConcept(')){
  fail('V2.23.0 learning concept modularization missing');
}else pass('V2.23.0 learning concepts moved out of index budget');

if(!html.includes('id="customDesignMount"')||
   !customDesignPreview.includes('id="customDesignPreviewDetails"')||!customDesignPreview.includes('id="customDesignInput"')||
   !customDesignPreview.includes('id="customDesignMappings"')||!customDesignPreview.includes('id="customDesignCanvas"')||
   !html.includes('<script src="./runtime/custom-design-preview.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/custom-design-preview.css">')||
   !sw.includes('./runtime/custom-design-preview.js')||!sw.includes('./runtime/custom-design-preview.css')||
   !customDesignPreview.includes('function customDesignEnsureUi(')||!customDesignPreview.includes('function customDesignSanitizeSvg(')||
   !customDesignPreview.includes('function customDesignMappedMarkup(')||
   !customDesignPreview.includes('function renderCustomDesignPreview(')||
   !customDesignPreviewCss.includes('.cdp-canvas{')){
  fail('V2.24.0 Custom Design Preview runtime + UI contract missing');
}else pass('V2.24.0 Custom Design Preview runtime + UI');

if(!customDesignPreview.includes("CUSTOM_SVG_MAX_BYTES=1024*1024")||
   !customDesignPreview.includes("CUSTOM_SVG_MAX_ELEMENTS=2500")||
   !customDesignPreview.includes("name.startsWith('on')")||
   !customDesignPreview.includes("/javascript\\s*:|data\\s*:|url\\s*\\(/i")||
   !customDesignPreview.includes("CUSTOM_SVG_ALLOWED_TAGS")||
   !customDesignPreview.includes("el.setAttribute(name,palette[role])")||
   customDesignPreview.includes('selectedColors=')||
   customDesignPreview.includes('palette.base=')||
   customDesignPreview.includes('palette.structure=')||
   customDesignPreview.includes('palette.accent=')){
  fail('V2.24.0 safe local SVG or preview-only source-color contract missing');
}else pass('V2.24.0 sanitized local SVG + exact source-color preview-only contract');

if(!html.includes('<script src="./runtime/vision-accessibility.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/vision-accessibility.css">')||
   !sw.includes('./runtime/vision-accessibility.js')||!sw.includes('./runtime/vision-accessibility.css')||
   !visionAccessibility.includes('function transformVision(')||
   !visionAccessibility.includes('function visionAnalysis(')||
   !visionAccessibility.includes('function visionMinimalFix(')||
   !visionAccessibility.includes('function setVisionMode(')||
   !visionAccessibility.includes('function renderVision(')||
   !visionAccessibilityCss.includes('.vision-v2-pair{')){
  fail('V2.25.0 Accessibility Vision runtime + UI contract missing');
}else pass('V2.25.0 Accessibility Vision runtime + UI');

if(!visionAccessibility.includes('VISION_CONFLICT_LIMIT=.055')||
   !visionAccessibility.includes('VISION_WATCH_LIMIT=.09')||
   !visionAccessibility.includes('VISION_FIX_TARGET=.095')||
   !visionAccessibility.includes("role=visionChangeRole(pair.a,pair.b)")||
   !visionAccessibility.includes("gamutMapOKLCH(o.l+(endpoint-o.l)*t,o.c,o.h)")||
   !visionAccessibility.includes("selectedColors=next")||
   !visionAccessibility.includes("if(lockedSlots[idx]&&selectedColors[idx]")||
   !paletteTools.includes("visionContextPalette(sourceP,visionMode)")||
   !paletteTools.includes("近似模擬 · ")||
   html.includes('function transformVision(')||
   html.includes('function renderVision()')){
  fail('V2.25.0 conflict detection, minimal-fix, context-sync or modularization contract missing');
}else pass('V2.25.0 CVD conflict detection + preview-first minimal fixes + context sync');

if(!visionAccessibility.includes("mode==='normal'")||
   !visionAccessibility.includes("這不是醫療診斷")||
   !visionAccessibility.includes("僅供設計比較，不代表臨床色覺測試")||
   !visionAccessibility.includes("visionFixPreview=null")||
   !visionAccessibility.includes("previewVisionSuggestion(")||
   !visionAccessibility.includes("applyVisionSuggestion(")){
  fail('V2.25.0 approximate-simulation disclosure or explicit-apply contract missing');
}else pass('V2.25.0 approximation disclosure + explicit apply');

if(!html.includes('<script src="./runtime/local-projects.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/local-projects.css">')||
   !sw.includes('./runtime/local-projects.js')||!sw.includes('./runtime/local-projects.css')||
   !localProjects.includes("LOCAL_PROJECTS_KEY='colorlab.projectsV1'")||
   !localProjects.includes('function createLocalProject(')||
   !localProjects.includes('function openProjectPicker(')||
   !localProjects.includes('function assignSavedProject(')||
   !localProjects.includes('function mergeImportedProjectData(')||
   !localProjectsCss.includes('.local-project-chips{')){
  fail('V2.26.0 Local Projects runtime + UI contract missing');
}else pass('V2.26.0 Local Projects runtime + UI');

if(!html.includes("schema:'color-lab-backup-v5'")||
   !storageHardening.includes("projects:readLocalProjects()")||
   !storageHardening.includes("schema:'color-lab-shadow-v4'")||
   !html.includes("projectId:sanitizeProjectId(x.projectId)")||
   !html.includes("localProjectMatches(x)")||
   !localProjects.includes("function localProjectSearchText(")||
   !localProjects.includes("localProjectSearchText(x)")||
   !html.includes("initLocalProjects()")||
   !localProjects.includes("配色不會被刪除，只會變成未歸類")||
   !localProjects.includes("item.projectId=id")){
  fail('V2.26.0 project persistence / backup / non-destructive delete contract missing');
}else pass('V2.26.0 project persistence + Backup V5 + non-destructive delete');

if(!html.includes('<script src="./runtime/reference-board.js"></script>')||
   !sw.includes('./runtime/reference-board.js')||
   !html.includes('initReferenceBoardExport()')||
   !referenceBoard.includes('function referenceBoardData(')||
   !referenceBoard.includes('function drawReferenceBoard(')||
   !referenceBoard.includes('function exportReferenceBoard(')||
   !referenceBoard.includes('function initReferenceBoardExport(')||
   !referenceBoard.includes("button.id='exportReferenceBoard'")||
   !referenceBoard.includes("canvas.width=1600")||
   !referenceBoard.includes("canvas.height=1200")){
  fail('V2.27.0 Reference Board runtime + export contract missing');
}else pass('V2.27.0 Reference Board runtime + export');

if(!referenceBoard.includes('const source=paletteArtifactBase()')||
   !referenceBoard.includes("ratios:{...source.ratios}")||
   !referenceBoard.includes("await ensureToneFamilies()")||
   !referenceBoard.includes("photoCanvas")||
   !referenceBoard.includes("referenceBoardHasPhoto()")||
   referenceBoard.includes('previewThemePalette(')||
   referenceBoard.includes('visionPalette(')||
   referenceBoard.includes('accessibilityPreview')||
   referenceBoard.includes('toneExplorerPreview')||
   referenceBoard.includes('selectedColors=')||
   referenceBoard.includes('palette.base=')||
   referenceBoard.includes('palette.structure=')||
   referenceBoard.includes('palette.accent=')){
  fail('V2.27.0 exact-source / local-photo / preview-isolation contract missing');
}else pass('V2.27.0 exact source + local photo + preview isolation');

if(!html.includes('id="gradientStudioMount"')||
   !html.includes('<script src="./runtime/gradient-studio.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/gradient-studio.css">')||
   !html.includes('initGradientStudio()')||
   !sw.includes('./runtime/gradient-studio.js')||!sw.includes('./runtime/gradient-studio.css')||
   !gradientStudio.includes('function gradientStudioSource(')||
   !gradientStudio.includes('function gradientStudioGradient(')||
   !gradientStudio.includes('function gradientStudioCss(')||
   !gradientStudio.includes('function renderGradientStudio(')||
   !gradientStudio.includes('function initGradientStudio(')||
   !gradientStudioCss.includes('.gst-preview{')){
  fail('V2.28.0 Gradient Studio runtime + UI contract missing');
}else pass('V2.28.0 Gradient Studio runtime + UI');

if(!gradientStudio.includes('const source=paletteArtifactBase()')||
   !gradientStudio.includes("'base-structure'")||
   !gradientStudio.includes("'base-accent'")||
   !gradientStudio.includes("'structure-accent'")||
   !gradientStudio.includes("'system'")||
   !gradientStudio.includes('GRADIENT_STUDIO_ANGLES=[0,45,90,135]')||
   !gradientStudio.includes("return 'background: '+gradientStudioGradient(pair,angle)+';'")||
   !gradientStudio.includes('Gradient 是衍生預覽，不代表 75 / 18 / 7 面積比例')||
   gradientStudio.includes('selectedColors=')||
   gradientStudio.includes('palette.base=')||
   gradientStudio.includes('palette.structure=')||
   gradientStudio.includes('palette.accent=')||
   gradientStudio.includes('fetch(')||gradientStudio.includes('XMLHttpRequest')){
  fail('V2.28.0 exact-source / preview-only / local Gradient contract missing');
}else pass('V2.28.0 exact source gradients + preview-only CSS handoff');

if(!html.includes('initCrossPlatformHandoff();')||
   !paletteTools.includes('function initCrossPlatformHandoff(')||
   !paletteTools.includes("[['scss','SCSS'],['flutter','Flutter'],['jetpack','Jetpack']]")||
   !paletteTools.includes("button.dataset.exportFormat=kind")||
   !paletteTools.includes("if(kind==='scss')")||
   !paletteTools.includes("if(kind==='flutter')")||
   !paletteTools.includes("if(kind==='jetpack')")||
   !paletteTools.includes("name:safe+'.scss'")||
   !paletteTools.includes("name:safe+'.dart'")||
   !paletteTools.includes("name:safe+'.kt'")){
  fail('V2.29.0 cross-platform handoff format contract missing');
}else pass('V2.29.0 SCSS / Flutter / Jetpack formats');

if(!paletteTools.includes("'$color-base: '+data.palette.base")||
   !paletteTools.includes("'  static const Color base = Color(0xFF'+data.palette.base.slice(1)")||
   !paletteTools.includes("'val ColorLabBase = Color(0xFF'+data.palette.base.slice(1)")||
   !paletteTools.includes("const data=paletteArtifactBase()")){
  fail('V2.29.0 exact-source framework handoff contract missing');
}else pass('V2.29.0 framework handoff uses exact source palette');

if(!html.includes('<script src="./runtime/storage-hardening.js"></script>')||
   !sw.includes('./runtime/storage-hardening.js')||
   !storageHardening.includes('function storageReadRaw(')||
   !storageHardening.includes('function storageWriteJson(')||
   !storageHardening.includes('function storageJsonState(')||
   !storageHardening.includes('function storageTransaction(')||
   !storageHardening.includes('function storageRestore(')){
  fail('V2.30.0 storage hardening runtime contract missing');
}else pass('V2.30.0 safe local storage runtime + offline cache');

if(!storageHardening.includes('function storageNeedsRecovery(')||
   !storageHardening.includes("const needsProjects=storageNeedsRecovery(LOCAL_PROJECTS_KEY,Array.isArray)")||
   !storageHardening.includes("const needsSaved=storageNeedsRecovery('colorlab.saved',Array.isArray)")||
   storageHardening.includes('const needsSaved=currentSaved.length===0')||
   !storageHardening.includes("storageTransaction(keys,()=>")||
   !localProjects.includes("storageTransaction(['colorlab.saved',LOCAL_PROJECTS_KEY]")||
   !localProjects.includes("if(!storageWriteJson('colorlab.saved',data))return")){
  fail('V2.30.0 resilience tombstone or rollback-safe write contract missing');
}else pass('V2.30.0 intentional-empty preservation + rollback-safe writes');

if(!html.includes("storageReadRaw('colorlab.previewTheme','light')")||
   !html.includes("storageReadRaw('colorlab.librarySort','recent')")||
   !html.includes("storageReadRaw('colorlab.candidateExploreMode','harmony')")||
   !html.includes("switchTab(storageReadRaw('colorlab.tab','compose'),false)")||
   !gradientStudio.includes("storageReadRaw('colorlab.gradientPair','base-accent')")){
  fail('V2.30.0 startup safe-storage fallback contract missing');
}else pass('V2.30.0 storage-restricted startup fallbacks');

if(!sw.includes("const codeAsset=/\\/(?:runtime|data|vendor)\\//")||
   !sw.includes("if(codeAsset){")||
   !sw.includes(".catch(()=>caches.match(request))")){
  fail('V2.30.0 service worker code freshness contract missing');
}else pass('V2.30.0 network-first code assets + offline fallback');

if(!html.includes('<script src="./runtime/ux-cleanup.js"></script>')||
   !html.includes('<link rel="stylesheet" href="./runtime/ux-cleanup.css">')||
   !sw.includes('./runtime/ux-cleanup.js')||!sw.includes('./runtime/ux-cleanup.css')||
   !html.includes('id="deepUnderstanding"')||
   !html.includes('id="deepValidation"')||
   !html.includes('id="deepApplication"')||
   !uxCleanup.includes("const DEEP_DIVE_SECTIONS=['deepUnderstanding','deepValidation','deepApplication']")||
   !uxCleanup.includes('function renderDeepDiveVisible(')||
   !uxCleanup.includes('function openDeepDiveSection(')||
   !uxCleanup.includes('function initDeepDiveUx(')||
   !uxCleanupCss.includes('.deep-section>summary{')){
  fail('V2.31.0 Deep Dive information architecture contract missing');
}else pass('V2.31.0 three-section Deep Dive UX + offline runtime');

if(!uxCleanup.includes("if(section==='deepUnderstanding')")||
   !uxCleanup.includes("}else if(section==='deepValidation')")||
   !uxCleanup.includes("}else if(section==='deepApplication')")||
   !uxCleanup.includes("storageWriteRaw(DEEP_DIVE_SECTION_KEY,id,{silent:true})")||
   !uxCleanup.includes("storageReadRaw(DEEP_DIVE_SECTION_KEY,'deepUnderstanding')")||
   uxCleanup.includes('selectedColors=')||
   uxCleanup.includes('palette.base=')||
   uxCleanup.includes('palette.structure=')||
   uxCleanup.includes('palette.accent=')){
  fail('V2.31.0 visible-section render or source immutability contract missing');
}else pass('V2.31.0 visible-section-only render + remembered section + source immutability');

if(!html.includes("if(deep?.open)renderDeepDiveVisible()")||
   html.includes("if(deep?.open){renderRelationshipExplanation();renderColorRelationshipMap();renderToneExplorer();renderPaletteValidation();")||
   !html.includes("if(name==='compose'&&$('#composeDeepDive')?.open)requestAnimationFrame(renderDeepDiveVisible)")||
   !html.includes('initDeepDiveUx();')){
  fail('V2.31.0 deep-dive render integration contract missing');
}else pass('V2.31.0 deep-dive render integration avoids hidden-section work');

if(!storageHardening.includes('function openResilienceDB(')||
   !storageHardening.includes('async function writeResilienceSnapshot(')||
   !storageHardening.includes('function scheduleResilienceBackup(')||
   !storageHardening.includes('async function restoreResilienceIfNeeded(')||
   html.includes('function openResilienceDB(')||
   html.includes('async function writeResilienceSnapshot(')||
   html.includes('function scheduleResilienceBackup(')||
   html.includes('async function restoreResilienceIfNeeded(')||
   html.includes('let resilienceTimer=')){
  fail('V2.32.0 storage architecture modularization contract missing');
}else pass('V2.32.0 IndexedDB resilience lifecycle moved out of index');

if(!appSource.includes('function openResilienceDB(')||
   !appSource.includes("schema:'color-lab-shadow-v4'")||
   !appSource.includes('storageNeedsRecovery(')||
   !appSource.includes('storageTransaction(keys,()=>')||
   !appSource.includes("reader.onerror=()=>toast('備份檔讀取失敗')")){
  fail('V2.32.0 storage behavior continuity contract missing');
}else pass('V2.32.0 storage behavior continuity preserved through runtime boundary');

if(!photoPalette.includes('function photoCompositionProfile(')||
   !photoPalette.includes('function photoCurrentRelationship(')||
   html.includes('function photoCompositionProfile(')||
   html.includes('function photoCurrentRelationship(')){
  fail('V2.33.0 photo analysis modularization contract missing');
}else pass('V2.33.0 photo analysis helpers moved into photo runtime');

if(!photoPalette.includes("const edgeCandidate=[...usable]")||
   !photoPalette.includes("const focusBand=vivid")||
   !photoPalette.includes("return distance<.10?'與目前三色關係接近':distance<.22?'與目前三色有可見差異':'與目前三色方向差異明顯'")||
   photoPalette.includes('selectedColors=')||
   photoPalette.includes('palette.base=')||
   photoPalette.includes('palette.structure=')||
   photoPalette.includes('palette.accent=')){
  fail('V2.33.0 pure photo analysis behavior contract missing');
}else pass('V2.33.0 photo analysis remains pure and behavior-equivalent');

if(!webkitConfig.includes("browserName: 'webkit'")||
   !webkitConfig.includes("viewport: { width: 390, height: 844 }")||
   !webkitConfig.includes("isMobile: true")||
   !webkitConfig.includes("hasTouch: true")||
   !webkitConfig.includes("outputFolder: 'playwright-report-webkit'")||
   !webkitConfig.includes("outputDir: 'test-results-webkit'")){
  fail('V2.34.0 WebKit mobile config contract missing');
}else pass('V2.34.0 WebKit mobile config');

if(pkg.scripts?.['test:webkit:core']!=='playwright test --config=playwright.webkit.config.js'||
   !qualityWorkflow.includes('webkit:')||
   !qualityWorkflow.includes('npx playwright install --with-deps webkit')||
   !qualityWorkflow.includes('npm run test:webkit:core')||
   !qualityWorkflow.includes('name: webkit-quality')){
  fail('V2.34.0 WebKit GitHub Actions gate missing');
}else pass('V2.34.0 WebKit CI gate wired separately');

for(const marker of [
  '75 / 18 / 7 visible',
  'deepValidation',
  "localStorage.getItem('colorlab.deepSection')",
  '#clv=1&cl=112233-445566-AABBCC&ctx=room&theme=dark',
  '#photoInput',
  'lastPhotoClusters.length'
]){
  if(!webkitCore.includes(marker))fail('V2.34.0 WebKit core coverage missing: '+marker);
}
pass('V2.34.0 WebKit core risk coverage');

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

if(!appSource.includes('const LEARNING_CONCEPTS=')||!appSource.includes('data-learn="hierarchy"')||!appSource.includes('function showLearningConcept(')){
  fail('V2.6 contextual learning layer missing');
}else pass('V2.6 contextual learning layer');

if(!appSource.includes('function photoPaletteFromRoles(')||!appSource.includes('function usePhotoPalette(')||!html.includes('id="photoUsePalette"')){
  fail('V2.6 Photo to Compose bridge missing');
}else pass('V2.6 Photo to Compose bridge');

if(!appSource.includes('function photoCurrentRelationship(')||!appSource.includes('與目前三色')){
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

if(!html.includes("if(deep?.open)renderDeepDiveVisible()")||
   !uxCleanup.includes("deep.addEventListener('toggle'")||
   !uxCleanup.includes('requestAnimationFrame(renderDeepDiveVisible)')||
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
   !startupRenderBlock.includes("if(deep?.open)renderDeepDiveVisible()")){
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


for(const fn of ['paletteArtifactBase','paletteArtifact','exportPaletteArtifact','previewThemePalette','setPreviewTheme']){
  if(!appSource.includes('function '+fn+'(')) fail('V2.12.0 professional handoff function missing: '+fn);
}
if(!appSource.includes('data-export-format="css"')||
   !appSource.includes('data-export-format="json"')||
   !appSource.includes('data-export-format="tokens"')||
   !appSource.includes("format:'color-lab-design-tokens-v1'")||
   !appSource.includes("schema:'color-lab-palette-v1'")){
  fail('V2.12.0 CSS / JSON / Tokens handoff contract missing');
}else pass('V2.12.0 professional handoff formats');

if(!appSource.includes("--color-base: '+data.palette.base")||
   !appSource.includes("--color-structure: '+data.palette.structure")||
   !appSource.includes("--color-accent: '+data.palette.accent")||
   !appSource.includes("ratios:{base:75,structure:18,accent:7}")){
  fail('V2.12.0 export does not preserve exact role colors and 75/18/7');
}else pass('V2.12.0 exact role export contract');

if(!appSource.includes('id="contextThemeModes"')||
   !appSource.includes('data-preview-theme="light"')||
   !appSource.includes('data-preview-theme="dark"')||
   !appSource.includes("accent:palette.accent")||
   !appSource.includes("Dark 預覽變體 · 不改原色")){
  fail('V2.12.0 Light / Dark preview contract missing');
}else pass('V2.12.0 Light / Dark preview contract');

if(!appSource.includes('id="accessibilityMatrix"')||
   !appSource.includes('id="validationThemeModes"')||
   !appSource.includes('data-validation-theme="original"')||
   !appSource.includes('data-validation-theme="dark"')||
   !appSource.includes('function contrastGrade(')||
   !appSource.includes('function paletteValidationData(')||
   !appSource.includes('function renderPaletteValidation(')||
   !appSource.includes("r>=7?['aaa'")||
   !appSource.includes("r>=4.5?['aa'")||
   !appSource.includes("r>=3?['large'")){
  fail('V2.13.0 three-color accessibility matrix contract missing');
}else pass('V2.13.0 three-color accessibility matrix');

if(!appSource.includes("function previewThemePalette(theme=previewTheme)")||
   !appSource.includes("previewThemePalette('dark')")||
   !appSource.includes("$$('#validationThemeModes [data-validation-theme]').forEach")||
   !appSource.includes("$$('[data-validation-theme]').forEach")){
  fail('V2.13.0 validation theme integration missing');
}else pass('V2.13.0 original / dark validation integration');

if(!appSource.includes("$$('#contextTabs [data-context]').forEach")||
   !appSource.includes("$$('#contextThemeModes [data-preview-theme]').forEach")||
   !appSource.includes("$$('[data-preview-theme]').forEach")||
   !appSource.includes("$$('[data-export-format]').forEach")){
  fail('V2.12.0 collection controls are not bound with querySelectorAll helper');
}else pass('V2.12.0 collection controls use querySelectorAll helper');

if(appSource.includes('$$$(')) fail('invalid triple-dollar selector helper detected');
else pass('selector helper arity');


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
  if(!appSource.includes(marker)) fail('feature marker missing: '+marker);
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
  if(!appSource.includes('function '+fn+'(')) fail('V1.6 hardening function missing: '+fn);
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

if(!storageHardening.includes("data.saved.length>1000")||!storageHardening.includes("color-lab-backup-v2")){
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

const startupWindow=html.slice(0,html.indexOf("function snapshotState(){"));
if(startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.compareA')")||
   startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.compareB')")||
   startupWindow.includes("JSON.parse(localStorage.getItem('colorlab.recent')")){
  fail('unsafe startup localStorage JSON parse returned');
}else pass('startup storage parsing hardened');

if(!storageHardening.includes("reader.onerror=()=>toast('備份檔讀取失敗')")){
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

if(!html.includes('selectDiverseRecommendations(candidates,30)')||
   !html.includes('prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30))')){
  fail('V2.15.0 deep recommendation selector / fresh-first wrapper not active');
}else pass('V2.15.0 deep recommendation selector + fresh-first wrapper');


for(const fn of ['photoCompositionProfile','renderPhotoInsight']){
  if(!appSource.includes('function '+fn+'(')) fail('V1.9 photo intelligence function missing: '+fn);
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
  if(!appSource.includes('function '+fn+'(')) fail('V1.9 photo analysis function missing: '+fn);
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

if(!html.includes("color-lab-backup-v5")||!html.includes("appVersion:'"+pkg.version+"'")||
   !html.includes("preference:sanitizePreferenceModel(preferenceState)")||
   !html.includes("preferenceEnabled")){
  fail('personalization backup payload missing');
}else pass('personalization backup payload');

for(const schema of ['color-lab-backup-v1','color-lab-backup-v2','color-lab-backup-v3','color-lab-backup-v4','color-lab-backup-v5']){
  if(!appSource.includes(schema)) fail('backup compatibility missing: '+schema);
}
pass('backup v1/v2/v3/v4/v5 compatibility');

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

if(!storageHardening.includes("const needsPreference=rawPreference===null;")||
   !storageHardening.includes("if(needsPreference&&snap.preference)")){
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

if(!html.includes("colorlab.preferenceEnabled")||!html.includes("color-lab-backup-v5")||!html.includes("appVersion:'"+pkg.version+"'")){
  fail('V2.3 personalization setting persistence or current backup missing');
}else pass('V2.3 setting persistence in current backup');

if(!storageHardening.includes("schema:'color-lab-shadow-v4'")||!storageHardening.includes("preferenceEnabled,")){
  fail('V2.3 resilience shadow does not include personalization setting');
}else pass('V2.3 resilience shadow includes personalization setting');

if(!storageHardening.includes("typeof data.preferenceEnabled==='boolean'")){
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
const loadSavedEnd=html.indexOf('function renderSaved(){',loadSavedStart);
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
