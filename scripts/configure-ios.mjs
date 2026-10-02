import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const infoPath=path.join(root,'ios','App','App','Info.plist');
const privacySource=path.join(root,'appstore','PrivacyInfo.xcprivacy');
const privacyTarget=path.join(root,'ios','App','App','PrivacyInfo.xcprivacy');

if(!fs.existsSync(infoPath))throw new Error('Missing iOS Info.plist. Run npx cap add ios first.');
let plist=fs.readFileSync(infoPath,'utf8');

const entries=[
  ['NSCameraUsageDescription','string','Color Lab 使用相機拍攝照片並在裝置上取色；照片不會由 Color Lab 上傳到伺服器。'],
  ['NSPhotoLibraryUsageDescription','string','Color Lab 使用你選擇的照片在裝置上取色；照片不會由 Color Lab 上傳到伺服器。'],
  ['ITSAppUsesNonExemptEncryption','false','']
];

for(const [key,type,value] of entries){
  if(plist.includes('<key>'+key+'</key>'))continue;
  const xml=type==='false'
    ? '  <key>'+key+'</key>\n  <false/>\n'
    : '  <key>'+key+'</key>\n  <string>'+value+'</string>\n';
  plist=plist.replace('<dict>','<dict>\n'+xml);
}
fs.writeFileSync(infoPath,plist);

if(!fs.existsSync(privacySource))throw new Error('Missing app privacy manifest template.');
fs.copyFileSync(privacySource,privacyTarget);

console.log('iOS App Store configuration applied');
