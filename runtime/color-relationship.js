/* Color Lab V2.21 Color Relationship Map — read-only analysis */
const LEARNING_CONCEPTS={
  hierarchy:{title:'Hierarchy｜層級',text:'明暗差不是越大越好。它的作用是讓視線知道誰是背景、誰負責結構。75% 與 18% 有足夠差異時，畫面會更容易閱讀。'},
  hue:{title:'Hue Distance｜色相距離',text:'接近的色相帶來連續感，距離拉開則增加辨識與張力。7% Accent 可以離主體更遠，因為它只負責少量注意力。'},
  focus:{title:'Focus｜焦點',text:'焦點通常來自彩度、明暗或色相中的一到兩種差異，而不是全部一起拉滿。克制能讓 7% 真正有力量。'}
};
function showLearningConcept(key){
  const note=$('#learningNote'),title=$('#learningTitle'),text=$('#learningText'),item=LEARNING_CONCEPTS[key];
  if(!note||!title||!text||!item)return;
  note.hidden=false;title.textContent=item.title;text.textContent=item.text;
}
function relationshipRoleData(){
  const items=[
    {key:'base',label:'Base',ratio:75,hex:palette.base},
    {key:'structure',label:'Structure',ratio:18,hex:palette.structure},
    {key:'accent',label:'Accent',ratio:7,hex:palette.accent}
  ];
  return items.map(item=>({...item,oklch:toOKLCH(item.hex)}));
}
function relationshipHuePoint(h,r=43,c=50){
  const rad=((Number.isFinite(h)?h:0)-90)*Math.PI/180;
  return{x:c+Math.cos(rad)*r,y:c+Math.sin(rad)*r};
}
function relationshipVerdict(items){
  const [b,s,a]=items.map(x=>x.oklch);
  const bs=hueDistance(b.h,s.h),ba=hueDistance(b.h,a.h),sa=hueDistance(s.h,a.h);
  const supportHue=Math.min(bs,ba,sa);
  const lightGap=Math.abs(b.l-s.l);
  const supportC=(b.c+s.c)/2;
  const accentLift=a.c-supportC;
  const hueText=supportHue<28?'至少兩個角色共享接近色相，整體連續感較強。'
    :supportHue<72?'三色保留可辨識色相差異，但仍有共同方向。'
    :'三個角色的色相距離較開，畫面主要靠角色比例維持秩序。';
  const lightText=lightGap>.42?'Base / Structure 明暗跨度很大，主要層級會很明確。'
    :lightGap>.24?'Base / Structure 有足夠明暗節奏，可建立穩定層級。'
    :'Base / Structure 明度接近，整體會偏柔和、低衝突。';
  const accentText=accentLift>.055?'Accent 的彩度明顯高於支撐色，7% 小面積會有清楚焦點。'
    :accentLift<-.035?'Accent 彩度較安靜，焦點主要會來自色相或明暗，而非飽和度。'
    :'Accent 與支撐色彩度接近，焦點感較克制。';
  return{hueText,lightText,accentText};
}
function relationshipMetricRow(name,items,value,max,format){
  return '<div class="crm-metric"><div class="crm-metric-head"><strong>'+name+'</strong><span>'+items.map(x=>x.label+' '+format(value(x))).join(' · ')+'</span></div>'+
    '<div class="crm-bars">'+items.map(x=>'<i style="--crm:'+x.hex+';--w:'+Math.max(3,Math.min(100,(value(x)/max)*100)).toFixed(1)+'%"><span></span></i>').join('')+'</div></div>';
}
function renderColorRelationshipMap(){
  const host=document.querySelector('#colorRelationshipMap');if(!host)return;
  const items=relationshipRoleData();
  const points=items.map(x=>relationshipHuePoint(x.oklch.h));
  const verdict=relationshipVerdict(items);
  const lines=[[0,1],[1,2],[2,0]].map(([i,j])=>'<line x1="'+points[i].x+'" y1="'+points[i].y+'" x2="'+points[j].x+'" y2="'+points[j].y+'"/>').join('');
  const dots=items.map((x,i)=>'<span class="crm-point crm-'+x.key+'" style="left:'+points[i].x+'%;top:'+points[i].y+'%;--crm:'+x.hex+'" title="'+x.label+' '+x.hex+'"><b>'+(i+1)+'</b></span>').join('');
  host.innerHTML='<div class="crm-layout">'+
    '<div class="crm-wheel-wrap"><div class="crm-wheel" aria-label="三色 Hue relationship map">'+
      '<svg viewBox="0 0 100 100" aria-hidden="true">'+lines+'</svg>'+dots+
    '</div><div class="crm-wheel-key"><span>1 Base</span><span>2 Structure</span><span>3 Accent</span></div></div>'+
    '<div class="crm-analysis">'+
      relationshipMetricRow('Lightness',items,x=>x.oklch.l,1,v=>Math.round(v*100))+
      relationshipMetricRow('Chroma',items,x=>x.oklch.c,.35,v=>v.toFixed(3))+
      '<div class="crm-role-weight" aria-label="75 18 7 role weight">'+items.map(x=>'<i style="flex:'+x.ratio+';background:'+x.hex+';color:'+textFor(x.hex)+'"><b>'+x.ratio+'</b><span>'+x.label+'</span></i>').join('')+'</div>'+
    '</div></div>'+
    '<div class="crm-verdict"><p>'+verdict.hueText+'</p><p>'+verdict.lightText+'</p><p>'+verdict.accentText+'</p></div>'+
    '<div class="crm-source-note">只讀分析 · 使用目前 Base / Structure / Accent 原色，不重新排序、不寫回 Compose</div>';
}
