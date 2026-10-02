import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const WIDTH=1024,HEIGHT=1024;
const BASE=[242,237,228];
const STRUCTURE=[41,43,41];
const ACCENT=[104,112,94];
const BASE_WIDTH=768;
const STRUCTURE_WIDTH=184;
const CIRCLE={cx:293,cy:512,r:56};

function crc32(buffer){
  let crc=0xFFFFFFFF;
  for(const byte of buffer){
    crc^=byte;
    for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xEDB88320:0);
  }
  return (crc^0xFFFFFFFF)>>>0;
}
function pngChunk(type,data){
  const typeBuf=Buffer.from(type,'ascii');
  const length=Buffer.alloc(4);length.writeUInt32BE(data.length);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([typeBuf,data])));
  return Buffer.concat([length,typeBuf,data,crc]);
}
function pixelFor(x,y){
  let color=x<BASE_WIDTH?BASE:x<BASE_WIDTH+STRUCTURE_WIDTH?STRUCTURE:ACCENT;
  const dx=x-CIRCLE.cx,dy=y-CIRCLE.cy;
  if(x<BASE_WIDTH&&dx*dx+dy*dy<CIRCLE.r*CIRCLE.r)color=ACCENT;
  return color;
}
export function createColorLabAppIcon(){
  const stride=1+WIDTH*3;
  const raw=Buffer.alloc(stride*HEIGHT);
  for(let y=0;y<HEIGHT;y++){
    const row=y*stride;raw[row]=0;
    for(let x=0;x<WIDTH;x++){
      const [r,g,b]=pixelFor(x,y),i=row+1+x*3;
      raw[i]=r;raw[i+1]=g;raw[i+2]=b;
    }
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH,0);ihdr.writeUInt32BE(HEIGHT,4);
  ihdr[8]=8;ihdr[9]=2;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR',ihdr),
    pngChunk('IDAT',zlib.deflateSync(raw,{level:9})),
    pngChunk('IEND',Buffer.alloc(0))
  ]);
}
export function inspectPng(buffer){
  const signature=Buffer.from([137,80,78,71,13,10,26,10]);
  if(buffer.length<33||!buffer.subarray(0,8).equals(signature))throw new Error('Invalid PNG signature');
  if(buffer.subarray(12,16).toString('ascii')!=='IHDR')throw new Error('PNG IHDR missing');
  return{
    width:buffer.readUInt32BE(16),
    height:buffer.readUInt32BE(20),
    bitDepth:buffer[24],
    colorType:buffer[25],
    hasAlpha:[4,6].includes(buffer[25]),
    sha256:crypto.createHash('sha256').update(buffer).digest('hex')
  };
}
function selfTest(){
  const png=createColorLabAppIcon(),info=inspectPng(png);
  if(info.width!==1024||info.height!==1024||info.bitDepth!==8||info.colorType!==2||info.hasAlpha){
    throw new Error('App icon contract failed '+JSON.stringify(info));
  }
  console.log('Color Lab AppIcon self-test: PASS',info);
}
function install(){
  const root=process.cwd();
  const catalog=path.join(root,'ios','App','App','Assets.xcassets','AppIcon.appiconset');
  const contentsPath=path.join(catalog,'Contents.json');
  if(!fs.existsSync(contentsPath))throw new Error('AppIcon Contents.json missing; run cap add ios first');
  const contents=JSON.parse(fs.readFileSync(contentsPath,'utf8'));
  const target=contents.images?.find(x=>x.size==='1024x1024')?.filename;
  if(!target)throw new Error('1024x1024 AppIcon target missing');
  const png=createColorLabAppIcon(),info=inspectPng(png);
  fs.writeFileSync(path.join(catalog,target),png);
  const written=inspectPng(fs.readFileSync(path.join(catalog,target)));
  if(written.sha256!==info.sha256)throw new Error('AppIcon write verification failed');
  console.log('Color Lab native AppIcon installed',written);
}
if(process.argv.includes('--self-test'))selfTest();else install();
