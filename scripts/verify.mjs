import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const webkitConfig=fs.readFileSync('playwright.webkit.config.js','utf8');
const webkitCore=fs.readFileSync('tests/e2e/webkit-core.spec.js','utf8');
const qualityWorkflow=fs.readFileSync('.github/workflows/quality.yml','utf8');
const lighthouseSummary=fs.readFileSync('scripts/lighthouse-summary.mjs','utf8');
const lighthouseSummaryTest=fs.readFileSync('scripts/lighthouse-summary-test.mjs','utf8');
const storageHardening=fs.readFileSync('runtime/storage-hardening.js','utf8');
const nativeAppLifecycle=fs.readFileSync('runtime/native-app-lifecycle.js','utf8');
const colorQuality=fs.readFileSync('core/color-quality.js','utf8');
const colorHandoff=fs.readFileSync('core/color-handoff.js','utf8');
const librarySearchCore=fs.readFileSync('core/library-search.js','utf8');
const pwaStart=html.indexOf('/* Color Lab V2.35.0 PWA / iPhone Update Hardening');
const pwaEnd=html.indexOf('\nconst MODES={',pwaStart);
const pwaHealth=pwaStart>=0&&pwaEnd>pwaStart?html.slice(pwaStart,pwaEnd):'';
const pwaHealthCss=html;
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
const recommendationEngine=fs.readFileSync('data/recommendation-engine.js','utf8');
const qrVendor=fs.readFileSync('vendor/qrcode.min.js','utf8');
const qrLicense=fs.readFileSync('vendor/qrcode.LICENSE.txt','utf8');
const appSource=html+'\n'+storageHardening+'\n'+colorQuality+'\n'+colorHandoff+'\n'+librarySearchCore+'\n'+uxCleanup+'\n'+paletteTools+'\n'+toneExplorer+'\n'+photoPalette+'\n'+colorRelationship+'\n'+roleScale+'\n'+shareSnapshot+'\n'+customDesignPreview+'\n'+visionAccessibility+'\n'+localProjects+'\n'+referenceBoard+'\n'+gradientStudio+'\n'+recommendationEngine;
const sw=fs.readFileSync('sw.js','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const fashion=fs.readFileSync('data/fashion-palettes.js','utf8');
const igStyles=fs.readFileSync('data/ig-style-patterns.js','utf8');
const inspirationAtlas=fs.readFileSync('data/inspiration-atlas.js','utf8');
const toneFamilies=fs.readFileSync('data/tone-families.js','utf8');
const nativeConfig=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const nativeBuild=fs.readFileSync('scripts/build-native.mjs','utf8');
const nativePreflight=fs.readFileSync('scripts/native-preflight.mjs','utf8');
const nativePatch=fs.readFileSync('scripts/patch-ios-project.mjs','utf8');
const nativeWorkflow=fs.readFileSync('.github/workflows/native-ios.yml','utf8');
const nativeSimulatorSmoke=fs.readFileSync('scripts/ios-simulator-smoke.mjs','utf8');
const privacyPolicy=fs.readFileSync('privacy.html','utf8');
const appStorePacket=JSON.parse(fs.readFileSync('app-store/submission.v1.0.json','utf8'));
const appStoreMetadataCheck=fs.readFileSync('scripts/app-store-metadata-check.mjs','utf8');

const fail=(msg)=>{console.error('FAIL:',msg);process.exitCode=1};
const pass=(msg)=>console.log('PASS:',msg);

const appStoreKeywordBytes=Buffer.byteLength(appStorePacket.keywords||'','utf8');
if(pkg.scripts?.['test:app-store-metadata']!=='node scripts/app-store-metadata-check.mjs --self-test && node scripts/app-store-metadata-check.mjs'||
   !appStoreMetadataCheck.includes('Buffer.byteLength')||
   !appStoreMetadataCheck.includes('keywordsFit')||
   appStorePacket.version!=='1.0.0'||
   appStorePacket.webEngine!=='2.53.0'||
   appStorePacket.bundleId!=='com.sy1124.colorlab'||
   appStorePacket.locale!=='zh-Hant'||
   appStoreKeywordBytes>100||
   !appStoreMetadataCheck.includes('External blockers remaining:')||
   !qualityWorkflow.includes('npm run test:app-store-metadata')||
   !fs.readFileSync('.github/workflows/pages.yml','utf8').includes('npm run test:app-store-metadata')){
  fail('App Store submission packet/metadata gate missing or invalid');
}else pass('App Store submission packet metadata gate');

const pagesWorkflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
if(!pagesWorkflow.includes('deploy-info.json')||
   !pagesWorkflow.includes('GITHUB_SHA')||
   !pagesWorkflow.includes('GITHUB_REF')||
   !pagesWorkflow.includes('GITHUB_REPOSITORY')){
  fail('Pages deployment SHA proof missing');
}else pass('Pages deployment SHA proof');

if(!nativeWorkflow.includes('node scripts/ios-simulator-smoke.mjs')||
   !nativeWorkflow.includes('timeout-minutes: 18')||
   !nativeWorkflow.includes('color-lab-native-launch.png')||
   !nativeSimulatorSmoke.includes('function simulatorProfiles(')||
   !nativeSimulatorSmoke.includes('function createFreshSimulator(')||
   !nativeSimulatorSmoke.includes('async function runFreshSession(')||
   !nativeSimulatorSmoke.includes("['create',name,profile.deviceTypeIdentifier,profile.runtimeIdentifier]")||
   !nativeSimulatorSmoke.includes("['delete',udid]")||
   !nativeSimulatorSmoke.includes('for(let session=1;session<=2;session++)')||
   !nativeSimulatorSmoke.includes("['install',udid,APP_PATH],120000")||
   !nativeSimulatorSmoke.includes("spawn('xcrun',['simctl','launch',udid,BUNDLE_ID]")||
   !nativeSimulatorSmoke.includes('function launchPidFromSimctlOutput(')||
   !nativeSimulatorSmoke.includes('waitForLaunchProof(udid,launchRequest,8)')||
   !nativeSimulatorSmoke.includes("'UIKitApplication:'+BUNDLE_ID")||
   !nativeSimulatorSmoke.includes('captureScreenshotWithRetry(udid,3)')){
  fail('App Store iOS fresh-simulator install/launch gate missing or unbounded');
}else pass('App Store iOS fresh-simulator install/launch gate');

if(nativeConfig.appId!=='com.sy1124.colorlab'||nativeConfig.appName!=='Color Lab'||nativeConfig.webDir!=='dist'||nativeConfig.server?.url){
  fail('App Store native config must use local bundled assets and stable bundle id');
}else pass('App Store local Capacitor config');

if(pkg.dependencies?.['@capacitor/core']!=='8.5.2'||
   pkg.devDependencies?.['@capacitor/cli']!=='8.5.2'||
   pkg.devDependencies?.['@capacitor/ios']!=='8.5.2'||
   pkg.scripts?.['build:native']!=='node scripts/build-native.mjs'||
   !pkg.scripts?.['ios:init']?.includes('patch-ios-project.mjs')){
  fail('Capacitor 8.5.2 iOS toolchain contract missing');
}else pass('Capacitor 8.5.2 pinned native toolchain');

if(!html.includes('function isNativeAppShell(')||
   !html.includes("location.protocol==='capacitor:'")||
   !html.includes('if(isNativeAppShell()){pwaHealthHide();return null}')||
   !html.includes('return isNativeAppShell()||window.matchMedia')){
  fail('native shell PWA/install bypass contract missing');
}else pass('native shell keeps PWA-only behavior out of iOS app');

if(!nativeBuild.includes("const dirs=['core','data','runtime','vendor']")||
   !nativeBuild.includes("'privacy.html'")||
   !nativePreflight.includes("server.url is forbidden for App Store build")||
   !nativePreflight.includes("all runtime script/style assets bundled locally")){
  fail('native local-asset build/preflight contract missing');
}else pass('native bundle excludes remote runtime dependency');

if(!nativePatch.includes('NSCameraUsageDescription')||
   !nativePatch.includes('NSPhotoLibraryUsageDescription')||
   !nativePatch.includes('ITSAppUsesNonExemptEncryption')||
   !nativePatch.includes('TARGETED_DEVICE_FAMILY = 1;')||
   !nativePatch.includes('MARKETING_VERSION = 1.0.0;')||
   !nativePatch.includes('CURRENT_PROJECT_VERSION = 1;')){
  fail('iOS permissions/version/target patch contract missing');
}else pass('iOS permissions + version + iPhone target patch');

if(!nativeWorkflow.includes('runs-on: macos-15-intel')||
   !nativeWorkflow.includes('sudo xcode-select -s /Applications/Xcode_26.3.app/Contents/Developer')||
   !nativeWorkflow.includes("grep -E '^Xcode 26")||
   !nativeWorkflow.includes('npm run test:native')||
   !nativeWorkflow.includes('npm run ios:init')||
   !nativeWorkflow.includes('CODE_SIGNING_ALLOWED=NO')||
   !nativeWorkflow.includes('xcodebuild')){
  fail('Xcode 26 unsigned iOS CI gate missing');
}else pass('Xcode 26 native compile CI gate');

if(!privacyPolicy.includes('Color Lab 隱私權政策')||
   !privacyPolicy.includes('Local-first')||
   !privacyPolicy.includes('不要求註冊帳號')||
   !privacyPolicy.includes('不使用廣告追蹤')){
  fail('App Store privacy policy contract missing');
}else pass('App Store privacy policy page');


const inlineScripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const inline=inlineScripts.at(-1);
if(!inline) fail('inline app script missing');
else {
  try { new Function(inline[1]); pass('inline JavaScript syntax'); }
  catch(e){ fail('inline JavaScript syntax: '+e.message); }
}
try { new Function(storageHardening); pass('storage hardening runtime syntax'); }
catch(e){ fail('storage hardening runtime syntax: '+e.message); }
try { new Function(colorQuality); pass('core color quality syntax'); }
catch(e){ fail('core color quality syntax: '+e.message); }
try { new Function(colorHandoff); pass('core color handoff syntax'); }
catch(e){ fail('core color handoff syntax: '+e.message); }
try { new Function(librarySearchCore); pass('core library search syntax'); }
catch(e){ fail('core library search syntax: '+e.message); }
try { new Function(pwaHealth); pass('pwa health runtime syntax'); }
catch(e){ fail('pwa health runtime syntax: '+e.message); }
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
try { new Function(recommendationEngine); pass('recommendation engine syntax'); }
catch(e){ fail('recommendation engine syntax: '+e.message); }
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
  ['./data/tone-families.js','TONE_FAMILIES'],
  ['./data/recommendation-engine.js','recommendationCombos']
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

if(!sw.includes("color-lab-v2530")) fail('service worker cache version is not V2.53.0');
else pass('service worker cache version');

if(pkg.version!=='2.53.0') fail('package version must be 2.53.0');
else pass('package version');
if(!html.includes('Color Lab V2.53.0')||!html.includes('<div class="version">V2.53.0</div>')||!html.includes("appVersion:'2.53.0'")) fail('V2.53.0 UI or backup version metadata missing');
else pass('V2.53.0 version metadata');

if(!html.includes('<script src="./runtime/native-app-lifecycle.js"></script>')||
   !html.includes('initPwaHealth();initNativeAppLifecycle();')||
   !sw.includes('./runtime/native-app-lifecycle.js')||
   !nativeAppLifecycle.includes('Plugins?.App')||
   !nativeAppLifecycle.includes("'appStateChange'")||
   !nativeAppLifecycle.includes('!state?.isActive')||
   /selectedColors\s*=|palette\s*=/.test(nativeAppLifecycle)){
  fail('App Store native lifecycle bridge contract missing or source-mutating');
}else pass('App Store native lifecycle bridge preserves source state and offline Web cache');

if(!html.includes('id="compareMore"')||
   !html.includes('<b>匯出</b>')||
   !html.includes('<b>比較配色</b>')||
   !html.includes('data-export-format="tokens">Design Tokens</button>')||
   !html.includes('data-export-format="svg">SVG 色票</button>')||
   !html.includes('id="openStudioPicker">精準選色</button>')||
   !html.includes('主體 75% · 結構 18% · 點綴 7%')||
   !html.includes('<b>進階分析</b><small>理解 · 可用性 · 情境</small>')||
   !html.includes('function updateGenerateActionLabel(')||
   !html.includes("complete?'分析這組配色':'補齊配色'")||
   !photoPalette.includes("return style==='muted'?'柔和':style==='vivid'?'鮮明':'平衡'")||
   html.includes('id="openStudioPicker">Color Lab 色盤</button>')||
   html.includes('id="generate">完成三色組合')){
  fail('V2.43.0 UX consolidation contract missing');
}else pass('V2.43.0 consolidated actions + task language');

if(!html.includes('id="togglePreference" aria-pressed="true">關閉個人化</button>')||
   !html.includes("toggle.textContent=preferenceEnabled?'關閉個人化':'開啟個人化'")||
   !html.includes('id="installAppBtn">加入主畫面</button>')||
   !html.includes('id="photoUsePalette" hidden>帶入配色 →</button>')||
   !html.includes('data-jump="compose">回到配色</button>')){
  fail('V2.43.0 explicit action wording contract missing');
}else pass('V2.43.0 explicit mobile action wording');

if(!html.includes('id="firstRunGuide" aria-label="第一次使用 Color Lab" hidden')||
   !html.includes('id="dismissFirstRunGuide">知道了</button>')||
   !html.includes('選 1–3 色')||
   !html.includes('看 75 / 18 / 7')||
   !html.includes('分析、收藏或匯出')||
   !html.includes("const FIRST_RUN_GUIDE_KEY='colorlab.firstRunGuideV1'")||
   !html.includes('function initFirstRunGuide(')||
   !html.includes("const hadDraft=storageReadRaw('colorlab.draft',null)!==null")||
   !html.includes('const hadSaved=readSavedData().length>0')||
   !html.includes('const hadRecent=recentColors.length>0')||
   !html.includes("storageWriteRaw(FIRST_RUN_GUIDE_KEY,'done',{silent:true})")||
   !html.includes('initFirstRunGuide();')){
  fail('V2.44.0 first-run guidance contract missing');
}else pass('V2.44.0 local first-run guidance');

if(html.includes('driver.js')||html.includes('intro.js')||html.includes('shepherd.js')){
  fail('V2.44.0 onboarding must not add a third-party runtime dependency');
}else pass('V2.44.0 zero-dependency onboarding');

if(!html.includes('id="resultSummary" aria-live="polite"')||
   !html.includes('id="resultQuickSave">收藏</button>')||
   !html.includes('id="resultQuickCompare">比較</button>')||
   !html.includes('id="resultQuickAnalyze">進階分析</button>')||
   !html.includes('id="resultQuickExport">匯出</button>')||
   !html.includes('function paletteResultSummaryData(')||
   !html.includes('function renderResultSummary(')||
   !html.includes('function openResultDisclosure(')||
   !html.includes("$('#resultQuickSave').onclick=()=>$('#save').click()")||
   !html.includes("$('#resultQuickCompare').onclick=()=>openResultDisclosure('compareMore')")||
   !html.includes("$('#resultQuickAnalyze').onclick=()=>openResultDisclosure('composeDeepDive')")||
   !html.includes("$('#resultQuickExport').onclick=()=>openResultDisclosure('handoffMore')")||
   !html.includes('右下角四點可切換配色、靈感、相片與收藏')){
  fail('V2.45.0 result-first decision layer contract missing');
}else pass('V2.45.0 result-first summary + four primary actions');

if(!html.includes("const tone=avgC<.055?'沉穩柔和':avgC>.145?'鮮明有張力':'平衡自然'")||
   !html.includes("const hierarchy=lightSpread>.46?'明暗清楚':lightSpread>.28?'層級穩定':'明暗柔和'")||
   !html.includes("const readability=validation.normal>=2?'可讀性良好':validation.large>=2?'大字可用':'需檢查可讀性'")){
  fail('V2.45.0 concise result language contract missing');
}else pass('V2.45.0 concise evidence-derived result language');

if(!html.includes('id="photoCameraTrigger"')||
   !html.includes('id="photoCameraInput" type="file" accept="image/*" capture="environment" hidden')||
   !html.includes('id="photoTrigger" type="button">從相簿選擇</button>')||
   !html.includes('function openPhotoCamera(){photoCameraInput.click()}')||
   !html.includes("$('#photoCameraTrigger').onclick=openPhotoCamera")||
   !html.includes('photoCameraInput.addEventListener(\'change\',handlePhotoInputChange)')){
  fail('V2.46.0 camera-first Photo entry contract missing');
}else pass('V2.46.0 camera + gallery Photo entry');

if(!html.includes('id="photoSourceActions" role="group" aria-label="照片來源"')||
   !html.includes('id="photoModeBar" hidden')||
   !html.includes('id="photoRetake" type="button">重拍</button>')||
   !html.includes('id="photoChange" type="button">相簿更換</button>')||
   !html.includes('function syncPhotoWorkflowUi(')||
   !html.includes("sources.hidden=photoLoaded")||
   !html.includes("modes.hidden=!photoLoaded")||
   !html.includes("photoLoaded=true;finish();syncPhotoWorkflowUi()")||
   !html.includes("$('#photoRetake').onclick=openPhotoCamera")||
   !html.includes("if(name==='photo'){setPhotoMode(photoMode);updatePhotoColorSpaceNote();syncPhotoWorkflowUi()}")||
   !html.includes('.photo-source-actions[hidden],.photo-mode-bar[hidden]{display:none!important}')){
  fail('V2.48.0 Photo task-first workflow contract missing');
}else pass('V2.48.0 Photo task-first progressive disclosure');

if(!html.includes('<details class="library-settings" id="librarySettings">')||
   !html.includes('<span>資料與設定</span>')||
   !html.includes('<small>備份 · 個人化 · 使用說明</small>')||
   !html.includes('id="openHelpGuide">使用說明</button>')||
   !html.includes('function dismissFirstRunGuide(')||
   !html.includes('function showFirstRunGuide(')||
   !html.includes("dismiss.onclick=dismissFirstRunGuide")||
   !html.includes("$('#openHelpGuide').onclick=showFirstRunGuide")||
   !html.includes("switchTab('compose',true)")||
   !html.includes("guide.scrollIntoView({block:'start',behavior:'auto'})")||
   !html.includes('.library-settings .library-tools{')){
  fail('V2.49.0 reopenable help / compact Library settings contract missing');
}else pass('V2.49.0 reopenable help + compact Library settings');

if(!html.includes('<script src="./core/color-handoff.js"></script>')||
   !sw.includes('./core/color-handoff.js')||
   !colorHandoff.includes('function hexToLabD50(')||
   !colorHandoff.includes('function hexToCmykReference(')||
   !colorHandoff.includes('function professionalColorValues(')||
   !colorHandoff.includes('HANDOFF_D65_TO_D50')){
  fail('V2.50.0 professional handoff color core missing');
}else pass('V2.50.0 LAB D50 + CMYK reference core');

if(/localStorage|sessionStorage|fetch\(|XMLHttpRequest|selectedColors\s*=|palette\s*=/.test(colorHandoff)){
  fail('V2.50.0 handoff core must remain pure and source-safe');
}else pass('V2.50.0 handoff core is storage/network/source mutation free');

if(!html.includes('id="professionalHandoff" aria-labelledby="professionalHandoffTitle"')||
   !html.includes('id="copyProfessionalHandoff">複製規格</button>')||
   !html.includes('id="professionalColorValues"')||
   !html.includes('LAB 使用 CIELAB D50')||
   !html.includes('ICC profile')||
   !html.includes('function professionalHandoffRows(')||
   !html.includes('function professionalHandoffText(')||
   !html.includes('function renderProfessionalHandoff(')||
   !html.includes("$('#copyProfessionalHandoff').onclick=()=>copy(professionalHandoffText())")||
   !html.includes("if($('#handoffMore')?.open)renderProfessionalHandoff()")){
  fail('V2.50.0 professional handoff UI/copy contract missing');
}else pass('V2.50.0 professional handoff UI + copy contract');

if(!colorHandoff.includes('HANDOFF_XYZ_D65_TO_P3')||
   !colorHandoff.includes('function hexToDisplayP3(')||
   !colorHandoff.includes('function displayP3CssFromHex(')||
   !colorHandoff.includes("space:'display-p3'")||
   !colorHandoff.includes('p3:hexToDisplayP3(h)')){
  fail('V2.51.0 Display-P3 conversion core missing');
}else pass('V2.51.0 exact sRGB to Display-P3 conversion core');

if(!html.includes('id="copyP3Css">複製 P3 CSS</button>')||
   !html.includes('id="p3Capability" role="status"')||
   !html.includes('function displayP3Capability(')||
   !html.includes("CSS?.supports?.('color','color(display-p3 1 0 0)')")||
   !html.includes("matchMedia?.('(color-gamut: p3)')")||
   !html.includes('function professionalP3Css(')||
   !html.includes('@supports (color: color(display-p3 1 1 1))')||
   !html.includes('@media (color-gamut: p3)')||
   !html.includes('Source = exact sRGB HEX')||
   !html.includes("$('#copyP3Css').onclick=copyProfessionalP3Css")){
  fail('V2.51.0 P3 capability + fallback handoff contract missing');
}else pass('V2.51.0 P3 capability detection + fallback CSS handoff');

if(!html.includes('Display-P3 是目前 sRGB HEX 的等色換算')||
   !html.includes('目前 source 仍是 sRGB HEX')||
   !html.includes('not gamut expansion')){
  fail('V2.51.0 truthful sRGB-source P3 wording missing');
}else pass('V2.51.0 P3 handoff does not claim synthetic gamut expansion');

if(!html.includes('id="exportContextPreview">輸出 SVG</button>')||
   !html.includes('function contextPreviewSnapshotCss(')||
   !html.includes('function contextPreviewSnapshotSvg(')||
   !html.includes('function exportContextPreviewSvg(')||
   !html.includes('document.styleSheets')||
   !html.includes('sheet.cssRules')||
   !html.includes("css.includes('.cp2')||css.includes('.real-preview')")||
   !html.includes('new XMLSerializer().serializeToString(host)')||
   !html.includes('<foreignObject x="0" y="0" width="390" height="292">')||
   !html.includes("$('#exportContextPreview').onclick=exportContextPreviewSvg")){
  fail('V2.52.0 Context Preview SVG snapshot contract missing');
}else pass('V2.52.0 current-DOM Context Preview SVG export');

if(html.includes('html2canvas')||html.includes('dom-to-image')||html.includes('html-to-image')){
  fail('V2.52.0 Context Preview export must remain dependency-free');
}else pass('V2.52.0 Context Preview snapshot adds no capture dependency');

if(!pkg.scripts?.['test:lighthouse-summary']||
   !qualityWorkflow.includes('name: Test Lighthouse summary')||
   !qualityWorkflow.includes('run: npm run test:lighthouse-summary')||
   !lighthouseSummary.includes('function median(')||
   !lighthouseSummary.includes('summarizeLighthouseReports')||
   !lighthouseSummary.includes('function isLighthouseReport(')||
   !lighthouseSummary.includes('performanceRange')||
   !lighthouseSummary.includes('Lighthouse performance outliers')||
   !lighthouseSummary.includes('Lighthouse representative report')||
   !lighthouseSummaryTest.includes('assert.equal(median([79,93,93]),93)')||
   !lighthouseSummaryTest.includes('isLighthouseReport({}),false')||
   !lighthouseSummaryTest.includes('summary.outliers.map')){
  fail('V2.53.0 median Lighthouse baseline reporting contract missing');
}else pass('V2.53.0 Lighthouse median + outlier reporting');

if(customDesignPreview.includes('function customDesignEscape(')||
   customDesignPreview.includes('function customDesignMappedRoles(')||
   localProjects.includes('function librarySearchText(')||
   toneExplorer.includes('function toneExplorerHueDrift(')||
   toneExplorer.includes('function toneExplorerToneDelta(')){
  fail('V2.53.0 dead runtime helpers were not removed');
}else pass('V2.53.0 dead runtime helper trim');

if(!customDesignPreview.includes('function customDesignMappedMarkup(')||
   !localProjects.includes('function librarySearchMatches(')||
   !toneExplorer.includes('function toneExplorerToneCandidate(')||
   !toneExplorer.includes('function toneExplorerHueCandidate(')){
  fail('V2.53.0 runtime trim removed active behavior');
}else pass('V2.53.0 active runtime behavior preserved');

if(!html.includes('搜尋名稱、HEX、標籤、色系或調性')||
   !html.includes('可搜尋：藍、紅、柔和、鮮明、深色、淺色')||
   !librarySearchCore.includes('function libraryColorSemanticTerms(')||
   !librarySearchCore.includes('function libraryPaletteSemanticTerms(')||
   !librarySearchCore.includes('function librarySearchDocument(')||
   !librarySearchCore.includes('function librarySearchDocumentMatches(')||
   !localProjects.includes('function librarySearchMatches(')||
   !html.includes('return librarySearchMatches(x,q);')){
  fail('V2.46.0 semantic Library search contract missing');
}else pass('V2.46.0 local semantic Library search');

if(!html.includes('id="libraryQuickSearch" role="group" aria-label="快速搜尋收藏"')||
   !html.includes('id="libraryQuickClear" hidden>清除搜尋</button>')||
   !html.includes('data-library-quick-term="藍" aria-pressed="false"')||
   !html.includes('data-library-quick-term="室內" aria-pressed="false"')||
   !html.includes("const LIBRARY_QUICK_TERMS=['藍','柔和','深色','品牌','室內','簡報']")||
   !html.includes('function syncLibraryQuickSearch(')||
   !html.includes("document.querySelectorAll('#libraryQuickSearch [data-library-quick-term]').forEach")||
   !html.includes('function toggleLibraryQuickSearch(')||
   !html.includes('function clearLibraryQuickSearch(')||
   !html.includes("input.value=terms.join(' ')")||
   !html.includes("$('#libraryQuickClear').onclick=clearLibraryQuickSearch")||
   !html.includes('.library-quick-chips button[aria-pressed="true"]')){
  fail('V2.47.0 Library quick-filter UX contract missing');
}else pass('V2.47.0 Library quick filters + AND search UX');

if(!librarySearchCore.includes("terms.push('中性','灰','灰色','neutral')")||
   !librarySearchCore.includes("terms.push('藍','藍色','blue')")||
   !librarySearchCore.includes("terms.push('柔和','低彩度','muted')")||
   !librarySearchCore.includes("terms.push('鮮明','高彩度','vivid')")||
   !librarySearchCore.includes("terms.push('app','網頁','介面','ui','簡報')")||
   !librarySearchCore.includes("terms.push('室內','穿搭','interior','fashion')")||
   !librarySearchCore.includes("terms.push('品牌','brand','海報')")||
   !librarySearchCore.includes("return terms.every(term=>haystack.includes(term))")||
   !html.includes('品牌、室內、穿搭、簡報')){
  fail('V2.46.0 color-family / tone / context / multi-token search semantics missing');
}else pass('V2.46.0 color family + tone + context + AND search semantics');

if(!html.includes('<script src="./core/library-search.js"></script>')||
   !sw.includes('./core/library-search.js')){
  fail('V2.46.0 semantic Library core load/offline contract missing');
}else pass('V2.46.0 semantic Library core load + offline cache');

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

if(!html.includes("if(deep?.open)scheduleDeepDiveVisibleRender()")||
   html.includes("if(deep?.open){renderRelationshipExplanation();renderColorRelationshipMap();renderToneExplorer();renderPaletteValidation();")||
   !html.includes("if(name==='compose'&&$('#composeDeepDive')?.open)scheduleDeepDiveVisibleRender()")||
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

if(!html.includes('id="pwaHealthMount"')||
   !html.includes('initPwaHealth();')||
   html.includes('<script src="./runtime/pwa-health.js"></script>')||
   html.includes('<link rel="stylesheet" href="./runtime/pwa-health.css">')||
   html.includes("navigator.serviceWorker.register('./sw.js').catch(()=>{})")||
   sw.includes('./runtime/pwa-health.js')||
   sw.includes('./runtime/pwa-health.css')||
   !pwaHealth.includes("const COLORLAB_APP_VERSION='"+pkg.version+"'")||
   !pwaHealthCss.includes('.pwa-health{')){
  fail('V2.35.0 shell-integrated PWA health / UI contract missing');
}else pass('V2.35.0 shell-integrated PWA controller + compact UI');

if(sw.includes(".then(()=>self.skipWaiting())")||
   !sw.includes("if(event.data?.type==='SKIP_WAITING')self.skipWaiting()")||
   !pwaHealth.includes("registration.waiting&&navigator.serviceWorker?.controller")||
   !pwaHealth.includes("waiting.postMessage({type:'SKIP_WAITING'})")||
   !pwaHealth.includes("navigator.serviceWorker.addEventListener('controllerchange'")||
   !pwaHealth.includes("if(!pwaUpdateRequested||pwaControllerReloaded)return")||
   !pwaHealth.includes("location.reload()")){
  fail('V2.35.0 user-mediated service worker activation contract missing');
}else pass('V2.35.0 user-mediated activation + single reload guard');

if(!pwaHealth.includes("if(typeof persistDraft==='function')persistDraft()")||
   !pwaHealth.includes("if(typeof writeResilienceSnapshot==='function')await writeResilienceSnapshot()")||
   !pwaHealth.includes("window.addEventListener('offline',pwaConnectivityState)")||
   !pwaHealth.includes("window.addEventListener('online',()=>{pwaConnectivityState();pwaCheckForUpdate(true)})")||
   !pwaHealth.includes("PWA_UPDATE_CHECK_INTERVAL=20*60*1000")||
   !pwaHealth.includes("document.visibilityState==='visible'")||
   !webkitCore.includes('WebKit PWA update prompt remains explicit')){
  fail('V2.35.0 safe-update persistence / connectivity / WebKit coverage contract missing');
}else pass('V2.35.0 save-before-update + offline state + throttled checks + WebKit coverage');

if(html.includes('function recommendationCombos(')||
   html.includes('function renderRecommendations(')||
   !recommendationEngine.includes('function recommendationCombos(')||
   !recommendationEngine.includes('function renderRecommendations(')||
   !recommendationEngine.includes('function selectDiverseRecommendations(')||
   !recommendationEngine.includes('function archetypeCombos(')||
   !html.includes("loadScriptOnce('./data/recommendation-engine.js','recommendationCombos')")||
   !sw.includes('./data/recommendation-engine.js')){
  fail('V2.36.0 lazy recommendation engine extraction contract missing');
}else pass('V2.36.0 recommendation engine moved out of index + offline cached');

if(html.includes('<script src="./data/recommendation-engine.js"></script>')||
   !html.includes('function ensureInspirationResources(')||
   !html.includes("loadScriptOnce('./data/recommendation-engine.js','recommendationCombos')")||
   !recommendationEngine.includes('prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30))')||
   !recommendationEngine.includes('recommendationBatchHistoryIndex')||
   !recommendationEngine.includes('learnPalettePreference(r.palette,.25)')||
   html.includes("$('#previousRecommendations').onclick=previousRecommendationBatch")||
   html.includes("$('#nextRecommendations').onclick=nextRecommendationBatch")||
   !html.includes("$('#previousRecommendations').onclick=()=>runInspirationAction(previousRecommendationBatch)")||
   !html.includes("$('#nextRecommendations').onclick=()=>runInspirationAction(nextRecommendationBatch)")){
  fail('V2.36.0 lazy-load or recommendation behavior-preservation contract missing');
}else pass('V2.36.0 Inspire-only lazy load + anti-repeat/batch/personalization semantics preserved');


const v237CoreFunctions=['boundedCacheSet','clamp','hexToRgb','rgbToHex','lum','textFor','normHex','contrastRatio','hueDistance','srgbToLinear','linearToSrgb','toOKLCH','fromOKLCH','perceptualDistance','oklchLinearRgb','isLinearSrgbInGamut','gamutMapOKLCH','signedHueDelta','hueToward','ensureStructureContrast','cohesionPass','qualityRefineGenerated','qualityMetrics','relationVector','relationVectorDistance'];
if(!html.includes('<script src="./core/color-quality.js"></script>')||
   html.indexOf('./core/color-quality.js')>html.indexOf('./runtime/palette-tools.js')||
   !sw.includes('./core/color-quality.js')||
   v237CoreFunctions.some(fn=>!colorQuality.includes('function '+fn+'(')||html.includes('function '+fn+'('))||
   !colorQuality.includes('const oklchCache=new Map()')||
   !colorQuality.includes('const luminanceCache=new Map()')){
  fail('V2.37.0 core color quality ownership / load-order contract missing');
}else pass('V2.37.0 color quality core extracted before dependent runtimes + offline cached');

if(/\bselectedColors\s*=/.test(colorQuality)||
   /\bpalette\.(?:base|structure|accent)\s*=/.test(colorQuality)||
   /localStorage|indexedDB|fetch\(/.test(colorQuality)){
  fail('V2.37.0 core color quality must stay pure and local-state agnostic');
}else pass('V2.37.0 color quality core is source-palette immutable and side-effect bounded');

if(!uxCleanup.includes('let deepDiveRenderFrame=0')||
   !uxCleanup.includes('function scheduleDeepDiveVisibleRender(')||
   !uxCleanup.includes('if(deepDiveRenderFrame)return')||
   !uxCleanup.includes('deepDiveRenderFrame=requestAnimationFrame(')||
   !html.includes('let secondaryRenderPending=false')||
   !html.includes('if(secondaryRenderPending)return')||
   !html.includes('secondaryRenderPending=true')||
   !html.includes('secondaryRenderPending=false')||
   !html.includes('function inspirationRouteActive(')||
   !html.includes("if(!inspirationRouteActive())return")||
   !html.includes("if(token!==secondaryRenderToken||!inspirationRouteActive())return")||
   !html.includes("if(name==='inspire')renderCompare();\n  scheduleSecondaryRender();")){
  fail('V2.38.0 render scheduling coalescing / stale-route invalidation contract missing');
}else pass('V2.38.0 Deep Dive + Inspire render scheduling is coalesced and route-aware');

if(!html.includes('let photoObjectURL=null,photoLoadToken=0,photoLoadImage=null,photoLoaded=false')||
   !html.includes('function releasePhotoObjectURL(')||
   !html.includes('function cancelPendingPhotoLoad(')||
   !html.includes('photoLoadToken++')||
   !html.includes('photoLoadImage.onload=null;photoLoadImage.onerror=null;photoLoadImage=null')||
   !html.includes('const token=photoLoadToken,objectURL=URL.createObjectURL(file),img=new Image()')||
   !html.includes('const isCurrent=()=>token===photoLoadToken&&photoLoadImage===img&&photoObjectURL===objectURL')||
   !html.includes('photoLoaded=true;finish()')||
   !html.includes('img.src=objectURL')||
   !html.includes("window.addEventListener('pagehide',()=>{cancelPendingPhotoLoad();cancelPhotoPointerInteraction();persistDraft();writeResilienceSnapshot()})")||
   !referenceBoard.includes("typeof photoLoaded!=='undefined'&&photoLoaded")||
   referenceBoard.includes("typeof photoObjectURL!=='undefined'&&!!photoObjectURL")||
   html.includes('URL.revokeObjectURL(photoObjectURL);photoObjectURL=null')){
  fail('V2.39.0 photo load lifecycle / stale callback isolation contract missing');
}else pass('V2.39.0 photo load uses request-local URLs, stale guards, pagehide cleanup, and canvas-backed photo presence');

if(!html.includes('function inspirationRouteActive(')||
   !html.includes('function runInspirationAction(')||
   !html.includes('const token=secondaryRenderToken')||
   !html.includes("if(!inspirationRouteActive())return Promise.resolve(false)")||
   !html.includes("if(token!==secondaryRenderToken||!inspirationRouteActive())return false")||
   !html.includes("$('#previousRecommendations').onclick=()=>runInspirationAction(previousRecommendationBatch)")||
   !html.includes("$('#nextRecommendations').onclick=()=>runInspirationAction(nextRecommendationBatch)")||
   (html.match(/ensureInspirationResources\(\)\.then\(\(\)=>\{renderIdeas\(\);renderRecommendations\(\)\}\)/g)||[]).length){
  fail('V2.40.0 Inspire async action lifecycle contract missing');
}else pass('V2.40.0 Inspire actions are route/token guarded and preference refreshes use the scheduler');

if(!html.includes('photoPointerId=null,photoMagnifierHideTimer=0')||
   !html.includes('function cancelPhotoPointerInteraction(')||
   !html.includes("if(photoPointerId!==null&&photoPointerId!==e.pointerId)return")||
   !html.includes("if(!photoPicking||photoPointerId!==e.pointerId)return")||
   !html.includes('photoPicking=false;photoPointerId=null')||
   !html.includes('photoMagnifierHideTimer=setTimeout(()=>')||
   !html.includes("if(!photoPicking)magnifier.style.display='none'")||
   !html.includes("photoCanvas.addEventListener('pointercancel',e=>{")||
   !html.includes('cancelPendingPhotoLoad();cancelPhotoPointerInteraction();')||
   !html.includes("cancelPhotoPointerInteraction();persistDraft();writeResilienceSnapshot()")){
  fail('V2.41.0 photo pointer lifecycle / multi-touch isolation contract missing');
}else pass('V2.41.0 Photo pointer lifecycle is single-owner, timer-safe, and cleaned on replacement/pagehide');

if(!visionAccessibility.includes("if(document.getElementById('composeDeepDive')?.open&&document.getElementById('deepApplication')?.open)renderContextPreview();")||
   /renderVision\(\);\s*renderContextPreview\(\);/.test(visionAccessibility)){
  fail('V2.43.0 hidden Context Preview render isolation contract missing');
}else pass('V2.43.0 Vision updates only rerender Context Preview when Application is visible');

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


if(!recommendationEngine.includes('function recommendationDirection(')||!recommendationEngine.includes('rec-direction')||!recommendationEngine.includes('direction.reason')){
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

if(!html.includes("if(deep?.open)scheduleDeepDiveVisibleRender()")||
   !uxCleanup.includes("deep.addEventListener('toggle'")||
   !uxCleanup.includes('function scheduleDeepDiveVisibleRender(')||
   !uxCleanup.includes('deepDiveRenderFrame=requestAnimationFrame(')||
   !html.includes('color:var(--text-3);')){
  fail('V2.6.2 deferred deep-dive or contrast follow-up missing');
}else pass('V2.6.2 deferred deep-dive and contrast follow-up');

if(!colorQuality.includes("return contrastRatio(bg,dark)>=contrastRatio(bg,light)?dark:light")){
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
  if(!appSource.includes('function '+fn+'(')) fail('V2.11.0 inspiration function missing: '+fn);
}
if(appSource.includes("const lanes=['editorial','atmospheric','fashion','expressive','unexpected']")){
  fail('V2.11.0 still forces one recommendation per lane');
}else if(!appSource.includes("item.aesthetic>=laneAestheticFloor(recommendationLane(item))")){
  fail('V2.11.0 aesthetic eligibility gate missing');
}else pass('V2.11.0 beauty-first diversity gate');
if(!recommendationEngine.includes('...archetypeCombos(inputs)')||!recommendationEngine.includes('inspirationRefineGenerated(x.colors,inputs.length)')){
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
   !startupRenderBlock.includes("if(deep?.open)scheduleDeepDiveVisibleRender()")){
  fail('V2.11.0 hidden relationship rendering still blocks startup');
}else pass('V2.11.0 hidden relationship rendering deferred');


if(!recommendationEngine.includes('const beautyGuard=clamp((aesthetic-.48)/.34)')||
   !recommendationEngine.includes('return aesthetic*3.85+tonal*2.10')||
   !appSource.includes('Tonal Cohesion × Aesthetic Gate × Atlas')){
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
if(!recommendationEngine.includes("item.tonal>=.52")||
   !appSource.includes("Tonal Cohesion × Aesthetic Gate")||
   !html.includes("loadScriptOnce('./data/tone-families.js','TONE_FAMILIES')")){
  fail('V2.11.0 tonal cohesion recommendation contract missing');
}else pass('V2.11.0 tonal cohesion recommendation contract');

if(!sw.includes('./data/tone-families.js')) fail('V2.11.0 tone family offline cache missing');
else pass('V2.11.0 tone family offline cache');


for(const fn of ['roleAlternativeContext','candidateExploreConfig','isPerceptualDuplicate','roleAlternativePool','prepareRoleCandidateSession','moveRoleAlternative','recommendationBatch','nextRecommendationBatch']){
  if(!appSource.includes('function '+fn+'(')) fail('V2.11.0 exploration function missing: '+fn);
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
   !recommendationEngine.includes('selectDiverseRecommendations(candidates,30)')||
   !html.includes('id="nextRecommendations"')){
  fail('V2.11.0 recommendation batching contract missing');
}else pass('V2.11.0 recommendation batching contract');

if(!recommendationEngine.includes("progress.textContent=recs.length?'第 '+batchNumber+' / '+recommendationBatchCount(recs)+' 批 · '+start+'–'+end+' / '+recs.length+' 組'")){
  fail('V2.11.1 recommendation batch progress missing');
}else pass('V2.11.1 recommendation batch progress');

if(!html.includes('id="previousRecommendations"')||
   !recommendationEngine.includes('function resetRecommendationBatchSession(')||
   !recommendationEngine.includes('function moveRecommendationBatch(direction=1)')||
   !recommendationEngine.includes('recommendationBatchHistory=[0]')||
   !recommendationEngine.includes("if(nextOffset>=recs.length){toast('已看完這輪所有候選');return}")){
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
   !appSource.includes("document.querySelectorAll('[data-export-format]').forEach")){
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
  if(!appSource.includes('function '+fn+'(')) fail('fashion function missing: '+fn);
}
pass('fashion recommendation functions present');

if(!appSource.includes("Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG")) fail('fashion recommendation description missing');
else pass('fashion recommendation UI description');


try { new Function(igStyles); pass('IG style pattern library syntax'); }
catch(e){ fail('IG style pattern library syntax: '+e.message); }

const igPatternCount=(igStyles.match(/\{\s*id:/g)||[]).length;
if(igPatternCount<12) fail('IG style pattern library too small: '+igPatternCount);
else pass('IG style pattern library size '+igPatternCount);

for(const fn of ['igPatternAffinity','igStyleTransferPool','igStyleCombos','applyStyleDelta']){
  if(!appSource.includes('function '+fn+'(')) fail('IG style function missing: '+fn);
}
pass('IG style recommendation functions present');

if(!appSource.includes("Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG")) fail('IG styling recommendation description missing');
else pass('IG styling recommendation UI description');


for(const fn of ['gamutMapOKLCH','cohesionPass','qualityRefineGenerated','qualityMetrics','semanticPhotoSwatches','fallbackPhotoClusters']){
  if(!appSource.includes('function '+fn+'(')) fail('V1.5 quality function missing: '+fn);
}
pass('V1.5 quality engine functions present');

if(!appSource.includes('Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG')) fail('V1.5 intelligence description missing');
else pass('V1.5 intelligence description');

if(!html.includes('主體／鮮明／柔和／深色／淺色')) fail('semantic photo swatch UI missing');
else pass('semantic photo swatch UI');

if(!html.includes("if(chosen.length===3)return orderedPalette(chosen);")){
  fail('V1.5 must preserve all three user-selected colors');
}else pass('three user-selected colors remain untouched');

const recommendStart=recommendationEngine.indexOf('function recommendationCombos(){');
const recommendEnd=recommendationEngine.indexOf('function applyRecommendation',recommendStart);
const recommendBlock=recommendStart>=0&&recommendEnd>recommendStart?recommendationEngine.slice(recommendStart,recommendEnd):'';
if(!recommendBlock.includes('inspirationRefineGenerated')||!recommendBlock.includes('qualityRefineGenerated')){
  fail('recommendations missing inspiration or safety refinement paths');
}else pass('recommendations use inspiration and safety refinement paths');

if(!recommendationEngine.includes("added:inputs.length===1?[refined[1],refined[2]]:[refined[2]]")){
  fail('refined recommendation colors are not applied');
}else pass('recommendation preview and applied colors aligned');


for(const fn of ['getIGPatternRows','paletteSignature','localProjectSearchText','handleSlotKeyboard']){
  if(!appSource.includes('function '+fn+'(')) fail('V1.6 hardening function missing: '+fn);
}
pass('V1.6 hardening functions present');

if(!html.includes("recommendationCacheKey")||!html.includes("recommendationCacheValue")){
  fail('recommendation cache missing');
}else pass('recommendation cache present');

if(!colorQuality.includes("function ensureStructureContrast(")||!colorQuality.includes("out[1]=ensureStructureContrast(out[0],out[1],2.55)")){
  fail('adaptive structure contrast guard missing');
}else pass('adaptive structure contrast guard');

if(!colorQuality.includes("dh>38&&before.c>.035")){
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


if(!html.includes('function loadScriptOnce(')||!colorQuality.includes('const oklchCache=new Map()')||!colorQuality.includes('const luminanceCache=new Map()')){
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
  if(!appSource.includes('function '+fn+'(')) fail('V1.9 quality function missing: '+fn);
}
pass('V1.9 quality ranking functions present');

for(const key of ['hierarchy','distinctiveness','cohesion','focus','practicality','reference','accessibility','gamut']){
  if(!html.includes(key)) fail('V1.9 quality dimension missing: '+key);
}
pass('V1.9 quality dimensions present');

if(!recommendationEngine.includes('selectDiverseRecommendations(candidates,30)')||
   !recommendationEngine.includes('prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30))')){
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

if(!appSource.includes("learnPalettePreference(palette,1)")||
   !appSource.includes("learnPalettePreference(palette,.35)")||
   !appSource.includes("learnPalettePreference(r.palette,.25)")||
   !appSource.includes("learnPalettePreference(x.palette,.35)")){
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

if(!recommendationEngine.includes("personalHint=preferenceIsMature()")||
   !recommendationEngine.includes("profile?.personal>=.52")||
   !recommendationEngine.includes("本機排序微調")){
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
