import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const plistPath=path.join(root,'ios','App','App','Info.plist');
const projectPath=path.join(root,'ios','App','App.xcodeproj','project.pbxproj');

if(!fs.existsSync(plistPath))throw new Error('Info.plist not found; run npx cap add ios first');
if(!fs.existsSync(projectPath))throw new Error('Xcode project not found; run npx cap add ios first');

let plist=fs.readFileSync(plistPath,'utf8');
const plistEntries=[
  ['NSCameraUsageDescription','<string>拍攝照片以在此裝置上取色與分析配色。</string>'],
  ['NSPhotoLibraryUsageDescription','<string>選擇照片以在此裝置上取色與分析配色。</string>'],
  ['ITSAppUsesNonExemptEncryption','<false/>']
];
// Older generated projects placed these app keys inside a scene dictionary.
// Remove those copies before inserting exactly once at the root closing tag.
for(const [key] of plistEntries){
  const entry=new RegExp('\\s*<key>'+key+'</key>\\s*(?:<string>[\\s\\S]*?</string>|<(?:true|false)\\s*/>)','g');
  plist=plist.replace(entry,'');
}
const rootClosing=/\s*<\/dict>\s*<\/plist>\s*$/;
if(!rootClosing.test(plist))throw new Error('Info.plist root dictionary closing tag not found');
const appEntries=plistEntries.map(([key,value])=>'\t<key>'+key+'</key>\n\t'+value).join('\n');
plist=plist.replace(rootClosing,'\n'+appEntries+'\n</dict>\n</plist>\n');
fs.writeFileSync(plistPath,plist);

let project=fs.readFileSync(projectPath,'utf8');
project=project.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g,'TARGETED_DEVICE_FAMILY = 1;');
project=project.replace(/MARKETING_VERSION = [^;]+;/g,'MARKETING_VERSION = 1.0.0;');
project=project.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g,'CURRENT_PROJECT_VERSION = 1;');
fs.writeFileSync(projectPath,project);

for(const [key] of plistEntries){
  if(!plist.includes('<key>'+key+'</key>'))throw new Error('Failed to set '+key);
}
if(!plist.includes('<key>ITSAppUsesNonExemptEncryption</key>'))throw new Error('Failed export compliance setting');
if(!project.includes('TARGETED_DEVICE_FAMILY = 1;'))throw new Error('Failed iPhone-only target setting');
if(!project.includes('MARKETING_VERSION = 1.0.0;'))throw new Error('Failed marketing version');
if(!project.includes('CURRENT_PROJECT_VERSION = 1;'))throw new Error('Failed build number');

console.log('iOS project patch: PASS');
