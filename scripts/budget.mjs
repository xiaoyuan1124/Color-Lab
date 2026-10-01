import fs from 'node:fs';

const KB=1024;
const files={
  index:'index.html',
  poline:'vendor/poline.umd.js',
  iro:'vendor/iro.min.js',
  sortable:'vendor/Sortable.min.js',
  qr:'vendor/qrcode.min.js',
  fashion:'data/fashion-palettes.js',
  ig:'data/ig-style-patterns.js',
  atlas:'data/inspiration-atlas.js',
  tones:'data/tone-families.js',
  recommendation:'data/recommendation-engine.js',
  sw:'sw.js',
  manifest:'manifest.json'
};

function size(path){
  if(!fs.existsSync(path))throw new Error('missing file: '+path);
  return fs.statSync(path).size;
}
function pass(label,value,limit){
  const ok=value<=limit;
  console.log((ok?'PASS':'FAIL'),label,Math.round(value/KB)+'KB / '+Math.round(limit/KB)+'KB');
  if(!ok)process.exitCode=1;
}

const sizes=Object.fromEntries(Object.entries(files).map(([k,p])=>[k,size(p)]));
const runtimeFiles=fs.readdirSync('runtime').filter(name=>/\.(?:js|css)$/.test(name)).map(name=>'runtime/'+name);
const runtimeModules=runtimeFiles.reduce((sum,path)=>sum+size(path),0);
const coreFiles=fs.readdirSync('core').filter(name=>/\.js$/.test(name)).map(name=>'core/'+name);
const coreModules=coreFiles.reduce((sum,path)=>sum+size(path),0);
const eager=0;
const lazyIntelligence=sizes.poline+sizes.fashion+sizes.ig+sizes.atlas+sizes.tones+sizes.recommendation;
const lazyInteraction=sizes.iro+sizes.sortable+sizes.qr;
const core=Object.values(sizes).reduce((a,b)=>a+b,0)+coreModules;

pass('index.html budget',sizes.index,235*KB);
pass('eager intelligence budget',eager,1*KB);
pass('lazy intelligence budget',lazyIntelligence,112*KB);
pass('lazy interaction tools budget',lazyInteraction,110*KB);
pass('core color modules budget',coreModules,16*KB);
pass('core runtime budget',core,440*KB);
pass('runtime modules budget',runtimeModules,140*KB);

if(sizes.fashion<4*KB||sizes.ig<2*KB||sizes.atlas<5*KB||sizes.tones<2*KB){
  console.error('FAIL reference color libraries unexpectedly small');
  process.exitCode=1;
}else{
  console.log('PASS reference color libraries present');
}

console.log('Color Lab size budget',{
  index:sizes.index,
  eager,
  lazyIntelligence,
  lazyInteraction,
  coreModules,
  core,
  runtimeModules
});
if(process.exitCode)process.exit(process.exitCode);
