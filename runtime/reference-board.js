/* Color Lab V2.27.0 Reference Board Export
   Local-only presentation board using exact source palette + optional local photo. */

let referenceBoardBound=false;

function referenceBoardSafeName(value){
  return (String(value||'color-lab').trim().replace(/[^\w\u4e00-\u9fff-]+/g,'-').replace(/^-+|-+$/g,'')||'color-lab').slice(0,48);
}
function referenceBoardHasPhoto(){
  return typeof photoObjectURL!=='undefined'&&!!photoObjectURL&&
    typeof photoCanvas!=='undefined'&&photoCanvas&&photoCanvas.width>0&&photoCanvas.height>0;
}
async function referenceBoardData(){
  if(typeof ensureToneFamilies==='function')await ensureToneFamilies().catch(()=>null);
  const source=paletteArtifactBase();
  const colors=[source.palette.base,source.palette.structure,source.palette.accent];
  const toneId=typeof inferToneFamilyId==='function'?inferToneFamilyId(colors):'editorial';
  const toneLabel=typeof toneFamilyLabel==='function'?(toneFamilyLabel(toneId)||toneId):toneId;
  return{
    name:source.name,
    palette:{...source.palette},
    ratios:{...source.ratios},
    toneId,toneLabel,
    hasPhoto:referenceBoardHasPhoto()
  };
}
function referenceBoardRoundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.roundRect(x,y,w,h,rr);ctx.closePath();
}
function referenceBoardFitText(ctx,text,maxWidth,maxSize,minSize=20){
  let size=maxSize;
  while(size>minSize){
    ctx.font='700 '+size+'px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}
function referenceBoardDrawPhoto(ctx,canvas,x,y,w,h){
  const sw=canvas.width,sh=canvas.height;if(!sw||!sh)return false;
  const scale=Math.max(w/sw,h/sh),cropW=w/scale,cropH=h/scale;
  const sx=(sw-cropW)/2,sy=(sh-cropH)/2;
  ctx.save();referenceBoardRoundRect(ctx,x,y,w,h,24);ctx.clip();
  ctx.drawImage(canvas,sx,sy,cropW,cropH,x,y,w,h);ctx.restore();
  return true;
}
async function drawReferenceBoard(){
  const data=await referenceBoardData();
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1200;
  const x=canvas.getContext('2d');if(!x)throw new Error('canvas unavailable');
  const ink='#242624',muted='#77736D',paper='#F3EFE8',white='#FAF8F4',line='#DCD6CE';
  x.fillStyle=paper;x.fillRect(0,0,1600,1200);

  x.fillStyle=ink;x.font='700 28px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';x.fillText('COLOR LAB · REFERENCE BOARD',72,76);
  x.fillStyle=muted;x.font='600 20px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';x.fillText('75 / 18 / 7 · '+data.toneLabel,72,112);
  const titleSize=referenceBoardFitText(x,data.name,1000,64,32);
  x.fillStyle=ink;x.font='700 '+titleSize+'px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';x.fillText(data.name,72,188);

  const photoX=72,photoY=248,photoW=900,photoH=620;
  if(data.hasPhoto&&typeof photoCanvas!=='undefined'&&referenceBoardDrawPhoto(x,photoCanvas,photoX,photoY,photoW,photoH)){
    x.fillStyle='rgba(0,0,0,.62)';x.font='700 16px -apple-system, BlinkMacSystemFont, sans-serif';
    x.fillText('LOCAL PHOTO REFERENCE',photoX+22,photoY+photoH-24);
  }else{
    x.fillStyle=white;referenceBoardRoundRect(x,photoX,photoY,photoW,photoH,24);x.fill();
    const widths=[675,162,63],keys=['base','structure','accent'];
    let xx=photoX;
    keys.forEach((key,i)=>{x.fillStyle=data.palette[key];x.fillRect(xx,photoY,widths[i],photoH);xx+=widths[i]});
    x.fillStyle=textFor(data.palette.base);x.font='700 28px -apple-system, BlinkMacSystemFont, sans-serif';x.fillText('75',photoX+28,photoY+56);
    x.fillStyle=textFor(data.palette.structure);x.fillText('18',photoX+690,photoY+56);
    x.save();x.translate(photoX+850,photoY+56);x.rotate(Math.PI/2);x.fillStyle=textFor(data.palette.accent);x.fillText('7',0,0);x.restore();
  }

  const roles=[
    {key:'base',label:'BASE',meaning:'CALM',ratio:'75%'},
    {key:'structure',label:'STRUCTURE',meaning:'ORDER',ratio:'18%'},
    {key:'accent',label:'ACCENT',meaning:'FOCUS',ratio:'7%'}
  ];
  const rx=1024,rw=504;
  roles.forEach((role,i)=>{
    const top=248+i*206,hex=data.palette[role.key];
    x.fillStyle=hex;referenceBoardRoundRect(x,rx,top,rw,152,20);x.fill();
    x.fillStyle=textFor(hex);x.font='700 18px -apple-system, BlinkMacSystemFont, sans-serif';x.fillText(role.label+' · '+role.meaning,rx+22,top+34);
    x.font='700 44px -apple-system, BlinkMacSystemFont, sans-serif';x.fillText(role.ratio,rx+22,top+86);
    x.font='600 18px ui-monospace, SFMono-Regular, Menlo, monospace';x.fillText(hex,rx+22,top+122);
  });

  x.strokeStyle=line;x.lineWidth=1;x.beginPath();x.moveTo(72,924);x.lineTo(1528,924);x.stroke();
  const metrics=[
    ['TONE FAMILY',String(data.toneLabel).toUpperCase()],
    ['SOURCE',data.hasPhoto?'LOCAL PHOTO + EXACT PALETTE':'EXACT PALETTE'],
    ['SYSTEM','BASE 75 · STRUCTURE 18 · ACCENT 7']
  ];
  metrics.forEach((row,i)=>{
    const colX=72+i*486;
    x.fillStyle=muted;x.font='700 14px -apple-system, BlinkMacSystemFont, sans-serif';x.fillText(row[0],colX,970);
    x.fillStyle=ink;x.font='650 21px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';x.fillText(row[1],colX,1006);
  });

  let sx=72;const total=1456;
  [['base',.75],['structure',.18],['accent',.07]].forEach(([key,ratio])=>{
    const w=total*ratio;x.fillStyle=data.palette[key];x.fillRect(sx,1072,w,54);sx+=w;
  });
  x.fillStyle=muted;x.font='500 15px -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif';
  x.fillText('Exact source colors · preview variants are never exported',72,1164);
  return{canvas,data};
}
async function exportReferenceBoard(){
  const button=document.getElementById('exportReferenceBoard');
  const label=button?.textContent||'Reference Board';
  if(button){button.disabled=true;button.textContent='產生中…'}
  try{
    const {canvas,data}=await drawReferenceBoard();
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png',1));
    if(!blob)throw new Error('blob unavailable');
    const file=new File([blob],referenceBoardSafeName(data.name)+'-reference-board.png',{type:'image/png'});
    if(navigator.canShare?.({files:[file]})&&navigator.share){
      try{await navigator.share({files:[file],title:data.name+' · Color Lab Reference Board'});return}
      catch(error){if(error?.name==='AbortError')return}
    }
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast(data.hasPhoto?'已輸出照片 Reference Board':'已輸出配色 Reference Board');
  }catch(_){toast('Reference Board 產生失敗')}
  finally{if(button){button.disabled=false;button.textContent=label}}
}
function initReferenceBoardExport(){
  if(referenceBoardBound)return;
  const host=document.querySelector('#handoffMore .handoff-more-actions');if(!host)return;
  let button=document.getElementById('exportReferenceBoard');
  if(!button){
    button=document.createElement('button');button.type='button';button.className='utility-btn';
    button.id='exportReferenceBoard';button.textContent='Reference Board';
    host.appendChild(button);
  }
  button.addEventListener('click',exportReferenceBoard);
  referenceBoardBound=true;
}
