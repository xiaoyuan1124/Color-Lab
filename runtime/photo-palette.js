/* Color Lab V2.19 Photo -> Palette 2.0 */
let photoPaletteStyle=(()=>{try{return localStorage.getItem('colorlab.photoPaletteStyle')||'balanced'}catch(_){return'balanced'}})();
if(!['balanced','muted','vivid'].includes(photoPaletteStyle))photoPaletteStyle='balanced';

function photoPaletteStyleLabel(style=photoPaletteStyle){
  return style==='muted'?'Muted / 柔和':style==='vivid'?'Vivid / 鮮明':'Balanced / 平衡';
}
function photoDistinctClusters(clusters,threshold=.06){
  const sorted=(clusters||[]).filter(x=>x&&normHex(x.hex))
    .sort((a,b)=>(b.proportion||0)-(a.proportion||0));
  const out=[];
  for(const item of sorted){
    if(out.every(x=>perceptualDistance(x.hex,item.hex)>=threshold))out.push(item);
    if(out.length>=9)break;
  }
  return out;
}
function photoClusterByHex(clusters,hex){
  const h=normHex(String(hex||''));return h?(clusters||[]).find(x=>normHex(x.hex)===h)||null:null;
}
function photoDistinctFrom(item,chosen,min=.05){
  return item&&!chosen.some(x=>perceptualDistance(x.hex,item.hex)<min);
}
function photoBestCluster(pool,score,chosen=[],predicate=()=>true){
  let best=null,bestScore=-Infinity;
  for(const item of pool){
    if(!predicate(item)||!photoDistinctFrom(item,chosen))continue;
    const value=score(item);
    if(Number.isFinite(value)&&value>bestScore){bestScore=value;best=item}
  }
  return best;
}
function photoPaletteSelection(clusters,roles=[],style=photoPaletteStyle){
  const pool=photoDistinctClusters(clusters,style==='muted'?.052:.06);
  if(pool.length<3)return null;
  const roleHex=label=>roles.find(x=>x.label===label)?.hex||null;
  let base=photoClusterByHex(pool,roleHex('主體'));
  if(!base||((base.edgeShare||0)>.72&&base.c<.055)){
    base=photoBestCluster(pool,x=>photoDominanceScore(x),[]);
  }
  if(!base)return null;
  const chosen=[base];
  const structureScore=style==='muted'
    ?x=>Math.abs(x.l-base.l)*1.55+perceptualDistance(base.hex,x.hex)*1.05+(x.proportion||0)*.28-Math.max(0,x.c-.12)*1.8
    :style==='vivid'
      ?x=>Math.abs(x.l-base.l)*1.65+perceptualDistance(base.hex,x.hex)*.85+(x.proportion||0)*.32-x.c*.18
      :x=>Math.abs(x.l-base.l)*1.45+perceptualDistance(base.hex,x.hex)*1.1+(x.proportion||0)*.34-x.c*.08;
  let structure=photoBestCluster(pool,structureScore,chosen,x=>x.l>.06&&x.l<.96);
  if(!structure)structure=photoBestCluster(pool,x=>perceptualDistance(base.hex,x.hex),chosen);
  if(!structure)return null;
  chosen.push(structure);

  const minPairDistance=x=>Math.min(perceptualDistance(base.hex,x.hex),perceptualDistance(structure.hex,x.hex));
  const accentScore=style==='muted'
    ?x=>minPairDistance(x)*1.8+(x.proportion||0)*.16-Math.max(0,x.c-.12)*2.4+Math.min(x.c,.10)*.7
    :style==='vivid'
      ?x=>x.c*4.2+minPairDistance(x)*1.75+(x.proportion<=.24?.18:0)-Math.max(0,(x.edgeShare||0)-.72)*.25
      :x=>x.c*2.35+minPairDistance(x)*1.7+(x.proportion<=.24?.14:0)+(x.proportion||0)*.08;
  let accent=photoBestCluster(pool,accentScore,chosen,x=>x.l>.10&&x.l<.92);
  if(!accent)accent=photoBestCluster(pool,x=>minPairDistance(x),chosen);
  if(!accent)return null;

  const colors=[base.hex,structure.hex,accent.hex].map(x=>normHex(x));
  const minDistance=Math.min(
    perceptualDistance(colors[0],colors[1]),
    perceptualDistance(colors[0],colors[2]),
    perceptualDistance(colors[1],colors[2])
  );
  return{
    style,colors,minDistance,
    roles:[
      {role:'base',label:'主體',hex:colors[0],source:base},
      {role:'structure',label:'結構',hex:colors[1],source:structure},
      {role:'accent',label:'焦點',hex:colors[2],source:accent}
    ]
  };
}
function renderPhotoStrategyPreview(clusters=lastPhotoClusters,roles=lastPhotoRoles){
  const host=$('#photoPalettePreview');if(!host)return;
  $$('#photoStrategyBar [data-photo-strategy]').forEach(b=>{
    const active=b.dataset.photoStrategy===photoPaletteStyle;
    b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');
  });
  const selected=photoPaletteSelection(clusters,roles,photoPaletteStyle);
  if(!selected){host.hidden=true;host.innerHTML='';const use=$('#photoUsePalette');if(use)use.hidden=true;return}
  host.hidden=false;
  const [base,structure,accent]=selected.colors;
  host.innerHTML='<div class="photo-palette-preview-head"><strong>'+escapeHtml(photoPaletteStyleLabel())+'</strong><span>主體 / 結構 / 焦點 · 套用前預覽</span></div>'+
    '<div class="photo-palette-ratio" aria-label="照片三色 75 18 7 預覽"><i style="background:'+base+';color:'+textFor(base)+'"><b>75</b></i><i style="background:'+structure+';color:'+textFor(structure)+'"><b>18</b></i><i style="background:'+accent+';color:'+textFor(accent)+'"><b>7</b></i></div>'+
    '<div class="photo-palette-role-row"><span>主體 '+base+'</span><span>結構 '+structure+'</span><span>焦點 '+accent+'</span></div>';
  const use=$('#photoUsePalette');if(use){use.hidden=false;use.textContent='使用 '+photoPaletteStyleLabel()+' 三色 →'}
}
function setPhotoPaletteStyle(next){
  if(!['balanced','muted','vivid'].includes(next))return;
  photoPaletteStyle=next;
  try{localStorage.setItem('colorlab.photoPaletteStyle',next)}catch(_){}
  renderPhotoStrategyPreview();
  if(typeof renderPhotoInsight==='function')renderPhotoInsight(lastPhotoClusters,lastPhotoRoles);
}
document.addEventListener('click',event=>{
  const strategy=event.target.closest?.('[data-photo-strategy]');
  if(strategy)setPhotoPaletteStyle(strategy.dataset.photoStrategy);
});
if(typeof renderPhotoStrategyPreview==='function'&&Array.isArray(lastPhotoClusters)&&lastPhotoClusters.length)renderPhotoStrategyPreview();


/* V2.33 pure photo analysis helpers */
function photoCompositionProfile(clusters,roles=[]){
  if(!Array.isArray(clusters)||!clusters.length)return null;
  const usable=clusters.filter(x=>x&&Number.isFinite(x.proportion)&&Number.isFinite(x.l)&&Number.isFinite(x.c));
  if(!usable.length)return null;
  const total=usable.reduce((sum,x)=>sum+x.proportion,0)||1;
  const avgL=usable.reduce((sum,x)=>sum+x.l*x.proportion,0)/total;
  const avgC=usable.reduce((sum,x)=>sum+x.c*x.proportion,0)/total;
  const minL=Math.min(...usable.map(x=>x.l)),maxL=Math.max(...usable.map(x=>x.l));
  const lightnessSpan=maxL-minL;
  const primary=roles.find(x=>x.label==='主體')||roles[0]||null;
  const vivid=roles.find(x=>x.label==='鮮明')||null;
  const edgeCandidate=[...usable]
    .filter(x=>(x.edgeShare||0)>=.58&&x.proportion>=.14&&x.c<.075)
    .sort((a,b)=>(b.edgeShare*b.proportion)-(a.edgeShare*a.proportion))[0]||null;

  const primaryShare=Number.isFinite(primary?.proportion)?primary.proportion:usable[0].proportion;
  const subjectClusters=edgeCandidate&&edgeCandidate.hex!==primary?.hex
    ?usable.filter(x=>x!==edgeCandidate)
    :usable;
  const subjectTotal=subjectClusters.reduce((sum,x)=>sum+x.proportion,0)||1;
  const normalizedShares=subjectClusters.map(x=>x.proportion/subjectTotal).sort((a,b)=>b-a);
  const normalizedPrimary=primaryShare/subjectTotal;
  const secondShare=normalizedShares.find(x=>x<normalizedPrimary-.0001)??normalizedShares[1]??0;
  const dominanceGap=Math.max(0,normalizedPrimary-secondShare);

  const chromaBand=avgC<.045?'低彩度':avgC<.105?'中彩度':'高彩度';
  const lightnessBand=avgL>.72?'偏明亮':avgL<.38?'偏深':'中等明度';
  const contrastBand=lightnessSpan>.48?'明暗跨度大':lightnessSpan>.28?'明暗層次中等':'明暗較柔和';
  const dominanceBand=normalizedPrimary>=.58?'單一主色明確'
    :(normalizedPrimary>=.40&&dominanceGap>=.10?'主次清楚':'多色分布較平均');
  const focusBand=vivid
    ?(vivid.proportion<=.22?'少量高彩度形成焦點':'高彩度顏色占比明顯')
    :'沒有強烈高彩度焦點';

  return{
    avgL,avgC,lightnessSpan,chromaBand,lightnessBand,contrastBand,dominanceBand,focusBand,
    primaryHex:primary?.hex||usable[0].hex,
    primaryShare,
    accentHex:vivid?.hex||null,
    accentShare:Number.isFinite(vivid?.proportion)?vivid.proportion:0,
    edgeHex:edgeCandidate?.hex||null,
    edgeProportion:edgeCandidate?.proportion||0,
    edgeShare:edgeCandidate?.edgeShare||0
  };
}
function photoCurrentRelationship(photoColors){
  const current=chosenColors();
  if(current.length!==3||!photoColors)return'';
  const distance=current.reduce((sum,hex,i)=>sum+perceptualDistance(hex,photoColors[i]),0)/3;
  return distance<.10?'與目前三色關係接近':distance<.22?'與目前三色有可見差異':'與目前三色方向差異明顯';
}
