import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=msg=>{console.error('FAIL native preflight:',msg);process.exitCode=1};
const pass=msg=>console.log('PASS native preflight:',msg);

const pkg=JSON.parse(read('package.json'));
const config=JSON.parse(read('capacitor.config.json'));

if(config.appId!=='com.sy1124.colorlab')fail('unexpected appId '+config.appId);else pass('bundle id '+config.appId);
if(config.appName!=='Color Lab')fail('unexpected appName');else pass('app name');
if(config.webDir!=='dist')fail('webDir must be dist');else pass('local bundled webDir');
if(config.server?.url)fail('server.url is forbidden for App Store build');else pass('no remote server.url');

for(const dep of ['@capacitor/core']){
  if(pkg.dependencies?.[dep]!=='8.5.2')fail(dep+' must be pinned to 8.5.2');else pass(dep+' 8.5.2');
}
if(pkg.dependencies?.['@capacitor/app']!=='8.1.1')fail('@capacitor/app must be pinned to 8.1.1');else pass('@capacitor/app 8.1.1');
for(const dep of ['@capacitor/cli','@capacitor/ios']){
  if(pkg.devDependencies?.[dep]!=='8.5.2')fail(dep+' must be pinned to 8.5.2');else pass(dep+' 8.5.2');
}

function findFilesNamed(dir,name,out=[]){
  if(!fs.existsSync(dir))return out;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())findFilesNamed(full,name,out);
    else if(entry.isFile()&&entry.name===name)out.push(full);
  }
  return out;
}
const capacitorIosRoot=path.join(root,'node_modules','@capacitor','ios');
const capacitorPrivacyPaths=findFilesNamed(capacitorIosRoot,'PrivacyInfo.xcprivacy');
if(!capacitorPrivacyPaths.length){
  fail('Capacitor PrivacyInfo.xcprivacy missing');
}else{
  const valid=capacitorPrivacyPaths.some(file=>{
    const manifest=fs.readFileSync(file,'utf8');
    return ['NSPrivacyAccessedAPITypes','NSPrivacyCollectedDataTypes','NSPrivacyTrackingDomains','NSPrivacyTracking']
      .every(key=>manifest.includes('<key>'+key+'</key>'));
  });
  if(!valid)fail('Capacitor privacy manifest keys incomplete');
  else pass('Capacitor privacy manifest present ('+capacitorPrivacyPaths.length+')');
}

const required=[
  'dist/index.html','dist/manifest.json','dist/privacy.html','dist/native-build.json',
  'dist/core/color-quality.js','dist/core/color-handoff.js','dist/runtime/palette-tools.js',
  'dist/runtime/native-app-lifecycle.js'
];
for(const file of required){
  if(!fs.existsSync(path.join(root,file)))fail('missing '+file);else pass(file);
}
for(const forbidden of ['dist/tests','dist/scripts','dist/docs','dist/.github','dist/node_modules','dist/sw.js']){
  if(fs.existsSync(path.join(root,forbidden)))fail('forbidden bundle content '+forbidden);
}

const index=read('dist/index.html');
if(!index.includes('function isNativeAppShell(')||!index.includes("location.protocol==='capacitor:'")){
  fail('native shell detection missing');
}else pass('native shell detection');
if(!index.includes('if(isNativeAppShell()){pwaHealthHide();return null}')){
  fail('native service-worker bypass missing');
}else pass('native service-worker bypass');
if(!index.includes('return isNativeAppShell()||window.matchMedia')){
  fail('native install-card suppression missing');
}else pass('native install-card suppression');
if(!index.includes('<script src="./runtime/native-app-lifecycle.js"></script>')||!index.includes('initNativeAppLifecycle();')){
  fail('native lifecycle bootstrap missing');
}else pass('native lifecycle bootstrap');
const nativeLifecycle=read('dist/runtime/native-app-lifecycle.js');
if(!nativeLifecycle.includes('Plugins?.App')||!nativeLifecycle.includes("'appStateChange'")||!nativeLifecycle.includes('!state?.isActive')){
  fail('Capacitor App lifecycle persistence bridge missing');
}else pass('Capacitor App lifecycle persistence bridge');

const remoteScripts=[...index.matchAll(/<script[^>]+src=["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
const remoteStyles=[...index.matchAll(/<link[^>]+href=["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
if(remoteScripts.length||remoteStyles.length)fail('remote runtime assets: '+[...remoteScripts,...remoteStyles].join(', '));
else pass('all runtime script/style assets bundled locally');

const privacy=read('dist/privacy.html');
for(const phrase of ['Local-first','不要求註冊帳號','不使用廣告追蹤','照片會在裝置上']){
  if(!privacy.includes(phrase))fail('privacy disclosure missing: '+phrase);
}
if(!process.exitCode)pass('privacy disclosure');

const meta=JSON.parse(read('dist/native-build.json'));
if(meta.nativeShellVersion!=='1.0.0'||meta.colorLabEngineVersion!==pkg.version||meta.source!=='bundled-local-assets'){
  fail('native build metadata mismatch');
}else pass('native build metadata');

if(!process.exitCode)console.log('Native App Store preflight: PASS');
