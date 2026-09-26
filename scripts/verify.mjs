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

const localScripts=['./vendor/poline.umd.js','./vendor/iro.min.js','./vendor/Sortable.min.js','./data/fashion-palettes.js','./data/ig-style-patterns.js'];
for(const src of localScripts){
  if(!html.includes('<script src="'+src+'"></script>')) fail('local dependency missing: '+src);
  const asset=src.replace('./','./');
  if(!sw.includes(asset)) fail('offline cache missing: '+asset);
}
if(/<script[^>]+src="https?:\/\//.test(html)) fail('external runtime script detected');
else pass('runtime scripts are local');

if(!sw.includes("color-lab-v14")) fail('service worker cache version is not V1.4');
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

if(!html.includes("Fashion Library")) fail('fashion recommendation description missing');
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

if(!html.includes("IG 穿搭關係")) fail('IG styling recommendation description missing');
else pass('IG styling recommendation UI description');

if(process.exitCode) process.exit(process.exitCode);
console.log('Color Lab V1.4 verification complete.');
