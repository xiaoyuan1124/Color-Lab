import fs from 'node:fs';

const KB=1024;
const files={
  index:'index.html',
  poline:'vendor/poline.umd.js',
  iro:'vendor/iro.min.js',
  sortable:'vendor/Sortable.min.js',
  fashion:'data/fashion-palettes.js',
  ig:'data/ig-style-patterns.js',
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
const eager=sizes.poline+sizes.fashion+sizes.ig;
const lazy=sizes.iro+sizes.sortable;
const core=Object.values(sizes).reduce((a,b)=>a+b,0);

pass('index.html budget',sizes.index,230*KB);
pass('eager script budget',eager,80*KB);
pass('lazy interaction tools budget',lazy,110*KB);
pass('core runtime budget',core,420*KB);

if(sizes.fashion<4*KB||sizes.ig<2*KB){
  console.error('FAIL reference color libraries unexpectedly small');
  process.exitCode=1;
}else{
  console.log('PASS reference color libraries present');
}

console.log('Color Lab size budget',{
  index:sizes.index,
  eager,
  lazy,
  core
});
if(process.exitCode)process.exit(process.exitCode);
