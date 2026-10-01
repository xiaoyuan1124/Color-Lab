/* Color Lab V2.46 pure Library semantic search helpers.
   No storage, network, or source-palette ownership. Depends only on shared color math. */
function libraryColorSemanticTerms(hex){
  const h=normHex(String(hex||''));if(!h)return[];
  const o=toOKLCH(h),hue=((o.h%360)+360)%360;
  const terms=[];
  if(o.c<.035)terms.push('中性','灰','灰色','neutral');
  else if(hue<45||hue>=350)terms.push('紅','紅色','red');
  else if(hue<75)terms.push('橘','橙','橘色','orange');
  else if(hue<120)terms.push('黃','黃色','yellow');
  else if(hue<180)terms.push('綠','綠色','green');
  else if(hue<230)terms.push('青','藍綠','cyan','teal');
  else if(hue<285)terms.push('藍','藍色','blue');
  else if(hue<330)terms.push('紫','紫色','purple');
  else terms.push('粉','粉色','桃紅','pink');
  if(o.l>.82)terms.push('淺色','明亮','light');
  else if(o.l<.32)terms.push('深色','暗色','dark');
  if(o.c>.15)terms.push('鮮明','高彩度','vivid');
  else if(o.c<.075)terms.push('柔和','低彩度','muted');
  return terms;
}
function libraryPaletteSemanticTerms(x){
  const colors=[x?.palette?.base,x?.palette?.structure,x?.palette?.accent].map(normHex).filter(Boolean);
  if(!colors.length)return[];
  const values=colors.map(toOKLCH);
  const avgC=values.reduce((sum,v)=>sum+v.c,0)/values.length;
  const lightSpread=Math.max(...values.map(v=>v.l))-Math.min(...values.map(v=>v.l));
  const terms=colors.flatMap(libraryColorSemanticTerms);
  terms.push(avgC<.055?'沉穩':avgC>.145?'有張力':'平衡');
  terms.push(lightSpread>.46?'高對比':lightSpread<.25?'低對比':'層級穩定');
  return [...new Set(terms)];
}
