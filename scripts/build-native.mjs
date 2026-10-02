import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const rootFiles=['index.html','manifest.json','apple-touch-icon.png','icon-192.png','icon-512.png','privacy.html'];
const dirs=['core','data','runtime','vendor'];

fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});

for(const file of rootFiles){
  const src=path.join(root,file);
  if(!fs.existsSync(src))throw new Error('Missing native asset: '+file);
  fs.copyFileSync(src,path.join(dist,file));
}
for(const dir of dirs){
  const src=path.join(root,dir);
  if(!fs.existsSync(src))throw new Error('Missing native asset directory: '+dir);
  fs.cpSync(src,path.join(dist,dir),{recursive:true});
}

const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const meta={
  nativeShellVersion:'1.0.0',
  colorLabEngineVersion:pkg.version,
  generatedAt:new Date().toISOString(),
  source:'bundled-local-assets'
};
fs.writeFileSync(path.join(dist,'native-build.json'),JSON.stringify(meta,null,2)+'\n');

const forbidden=['tests','scripts','docs','.github','node_modules'];
for(const name of forbidden){
  if(fs.existsSync(path.join(dist,name)))throw new Error('Forbidden native bundle path: '+name);
}

console.log('Native web bundle ready',meta);
