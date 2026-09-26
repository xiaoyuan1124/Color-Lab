import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));

const fail=(msg)=>{console.error('FAIL:',msg);process.exitCode=1};
const pass=(msg)=>console.log('PASS:',msg);

const inline=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if(!inline) fail('inline app script missing');
else {
  try { new Function(inline[1]); pass('JavaScript syntax'); }
  catch(e){ fail('JavaScript syntax: '+e.message); }
}


const forbiddenPatterns=[
  {re:/\$\([^\n;]+\)\.forEach\(/g,label:'single-element helper $() used with forEach'},
  {re:/\$\([^\n;]+\)\.map\(/g,label:'single-element helper $() used with map'},
  {re:/\$\([^\n;]+\)\.filter\(/g,label:'single-element helper $() used with filter'}
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
  'setColorAtActive','reorderSlots','renderRelationshipExplanation','renderVision','renderContextPreview',
  'fallbackPhotoPalette','finishPhotoRegion','renderSaved','toggleSavedPin','editSavedFolder',
  'openSavedActions','exportBackup','importBackupFile','openResilienceDB','restoreResilienceIfNeeded','installApp'
];
for(const fn of requiredFunctions){
  if(!html.includes('function '+fn+'(')) fail('function missing: '+fn);
}
pass('core functions present');

const localScripts=['./vendor/poline.umd.js','./vendor/iro.min.js','./vendor/Sortable.min.js'];
for(const src of localScripts){
  if(!html.includes('<script src="'+src+'"></script>')) fail('local dependency missing: '+src);
  const asset=src.replace('./','./');
  if(!sw.includes(asset)) fail('offline cache missing: '+asset);
}
if(/<script[^>]+src="https?:\/\//.test(html)) fail('external runtime script detected');
else pass('runtime scripts are local');

if(!sw.includes("color-lab-v11")) fail('service worker cache version is not V1.1');
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
  'data-saved-action="pin"'
];
for(const marker of requiredMarkers){
  if(!html.includes(marker)) fail('feature marker missing: '+marker);
}
pass('V1.1 feature markers');

if(process.exitCode) process.exit(process.exitCode);
console.log('Color Lab V1.1 verification complete.');
