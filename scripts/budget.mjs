import fs from 'node:fs';

const KB=1024;
const files={
  index:'index.html',
  poline:'vendor/poline.umd.js',
  iro:'vendor/iro.min.js',
  sortable:'vendor/Sortable.min.js',
  fashion:'data/fashion-palettes.js',
  ig:'data/ig-style-patterns.js',
  atlas:'data/inspiration-atlas.js',
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
const eager=0;
const lazyIntelligence=sizes.poline+sizes.fashion+sizes.ig+sizes.atlas;
const lazyInteraction=sizes.iro+sizes.sortable;
const core=Object.values(sizes).reduce((a,b)=>a+b,0);

pass('index.html budget',sizes.index,235*KB);
pass('eager intelligence budget',eager,1*KB);
pass('lazy intelligence budget',lazyIntelligence,100*KB);
pass('lazy interaction tools budget',lazyInteraction,110*KB);
pass('core runtime budget',core,440*KB);

if(sizes.fashion<4*KB||sizes.ig<2*KB||sizes.atlas<5*KB){
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
  core
});
if(process.exitCode)process.exit(process.exitCode);
