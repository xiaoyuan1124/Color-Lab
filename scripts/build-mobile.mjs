import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist-mobile');
const files=['index.html','manifest.json','apple-touch-icon.png','icon-192.png','icon-512.png','sw.js','privacy.html','support.html'];
const dirs=['core','data','runtime','vendor'];

fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

for(const file of files){
  const src=path.join(root,file);
  if(!fs.existsSync(src))throw new Error('Missing mobile asset: '+file);
  fs.copyFileSync(src,path.join(out,file));
}
for(const dir of dirs){
  const src=path.join(root,dir);
  if(!fs.existsSync(src))throw new Error('Missing mobile asset directory: '+dir);
  fs.cpSync(src,path.join(out,dir),{recursive:true});
}

const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
if(/server\.url|https:\/\/xiaoyuan1124\.github\.io\/Color-Lab\//i.test(html)){
  throw new Error('Mobile bundle must not depend on a remote Color Lab runtime URL');
}
console.log('Mobile bundle ready:',out);
