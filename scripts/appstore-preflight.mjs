import fs from 'node:fs';

const fail=message=>{console.error('FAIL',message);process.exitCode=1};
const pass=message=>console.log('PASS',message);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const config=JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const metadata=JSON.parse(fs.readFileSync('appstore/metadata.zh-Hant.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const privacy=fs.readFileSync('appstore/PrivacyInfo.xcprivacy','utf8');

if(config.appId!=='com.sy1124.colorlab')fail('bundle id');else pass('bundle id com.sy1124.colorlab');
if(config.appName!=='Color Lab')fail('app name');else pass('app name');
if(config.webDir!=='dist-mobile')fail('bundled webDir');else pass('bundled webDir');
if(JSON.stringify(config).includes('server')||JSON.stringify(config).includes('github.io'))fail('remote runtime config prohibited');else pass('no remote runtime URL');

for(const [name,version] of [['@capacitor/core','8.5.2'],['@capacitor/ios','8.5.2']]){
  if(pkg.dependencies?.[name]!==version)fail(name+' version');else pass(name+' '+version);
}
if(pkg.devDependencies?.['@capacitor/cli']!=='8.5.2')fail('@capacitor/cli version');else pass('@capacitor/cli 8.5.2');

if(!index.includes('function colorLabIsNativeApp(')||!index.includes('if(colorLabIsNativeApp()){pwaHealthHide();return null}')){
  fail('native service-worker guard');
}else pass('native service-worker guard');

for(const file of ['privacy.html','support.html','appstore/PrivacyInfo.xcprivacy','appstore/metadata.zh-Hant.json']){
  if(!fs.existsSync(file))fail('missing '+file);else pass(file);
}
if(!privacy.includes('<key>NSPrivacyTracking</key>')||!privacy.includes('<false/>')||
   !privacy.includes('<key>NSPrivacyCollectedDataTypes</key>')){
  fail('privacy manifest baseline');
}else pass('privacy manifest baseline');

const lengths=[
  ['appName',metadata.appName,30],
  ['subtitle',metadata.subtitle,30],
  ['promotionalText',metadata.promotionalText,170],
  ['keywords',metadata.keywords,100],
  ['description',metadata.description,4000]
];
for(const [name,value,max] of lengths){
  const length=[...String(value||'')].length;
  if(length>max)fail(name+' exceeds '+max+' characters: '+length);
  else pass(name+' length '+length+'/'+max);
}
if(metadata.bundleId!==config.appId)fail('metadata bundle id mismatch');else pass('metadata bundle id');
if(metadata.privacyPolicyUrl!=='https://xiaoyuan1124.github.io/Color-Lab/privacy.html')fail('privacy policy URL');else pass('privacy policy URL');
if(metadata.supportUrl!=='https://xiaoyuan1124.github.io/Color-Lab/support.html')fail('support URL');else pass('support URL');

if(process.exitCode)process.exit(process.exitCode);
console.log('App Store preflight: PASS');
