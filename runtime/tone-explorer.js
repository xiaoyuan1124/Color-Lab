/* Color Lab V2.17 Tone Explorer
   Preview-only exploration until explicit apply. */
let toneExplorerMode='tone',toneExplorerPreview=null;
const TONE_EXPLORER_HUE_STEPS=[-90,-45,-20,20,45,90,180];

function toneExplorerColors(){
  return [palette.base,palette.structure,palette.accent].map(x=>String(x).toUpperCase());
}
function toneExplorerSignature(colors=toneExplorerColors()){return colors.join('|')}
function toneExplorerToneCandidate(colors,familyId){
  const family=toneFamilyById(familyId);if(!family)return colors.slice();
  return colors.map((hex,i)=>{
    const o=toOKLCH(hex);
    const targetL=family.light?.[i]??o.l,targetC=family.chroma?.[i]??o.c;
    const L=clamp(o.l*.35+targetL*.65,.05,.97);
    const C=clamp(o.c*.35+targetC*.65,.008,.32);
    return gamutMapOKLCH(L,C,o.h);
  });
}
function toneExplorerHueCandidate(colors,delta){
  return colors.map(hex=>{
    const o=toOKLCH(hex);
    return gamutMapOKLCH(o.l,o.c,o.h+delta);
  });
}
function toneExplorerCandidates(){
  const origin=toneExplorerColors();
  if(toneExplorerMode==='hue'){
    return TONE_EXPLORER_HUE_STEPS.map(delta=>({
      key:'hue-'+delta,label:(delta>0?'+':'')+delta+'°',
      sub:'保留明度 / 彩度節奏',colors:toneExplorerHueCandidate(origin,delta)
    }));
  }
  return Object.values(toneFamilies()).map(family=>({
    key:'tone-'+family.id,label:toneFamilyLabel(family.id),
    sub:'Hue 固定 · '+family.label,
    colors:toneExplorerToneCandidate(origin,family.id),familyId:family.id
  }));
}
function setToneExplorerMode(next){
  if(!['tone','hue'].includes(next))return;
  toneExplorerMode=next;toneExplorerPreview=null;renderToneExplorer();
}
function previewToneExplorer(key){
  const item=toneExplorerCandidates().find(x=>x.key===key);if(!item)return;
  toneExplorerPreview={...item,origin:toneExplorerColors()};
  renderToneExplorer();
}
function clearToneExplorerPreview(){toneExplorerPreview=null;renderToneExplorer()}
function applyToneExplorer(key){
  const item=toneExplorerCandidates().find(x=>x.key===key);if(!item)return;
  const origin=toneExplorerColors();
  selectedColors=item.colors.map((hex,i)=>lockedSlots[i]?origin[i]:hex);
  activeSlot=0;seed=selectedColors[0];toneExplorerPreview=null;
  resetRoleCandidateSessions();syncEditor();generate(false);pushHistory();
  toast('已套用 '+item.label);
}
function toneExplorerCard(item){
  const p=item.colors;
  return '<div class="tone-explorer-card">'+
    '<div class="tone-explorer-swatches"><i style="background:'+p[0]+'"></i><i style="background:'+p[1]+'"></i><i style="background:'+p[2]+'"></i></div>'+
    '<div class="tone-explorer-copy"><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.sub)+'</span></div>'+
    '<div class="tone-explorer-actions"><button type="button" class="text-action" data-tone-preview="'+item.key+'">預覽</button><button type="button" class="text-action" data-tone-apply="'+item.key+'">套用</button></div>'+
  '</div>';
}
async function renderToneExplorer(){
  const host=$('#toneExplorer');if(!host)return;
  if(!window.TONE_FAMILIES||!Object.keys(window.TONE_FAMILIES).length){
    host.innerHTML='<div class="tone-explorer-note">正在載入 Tone Family…</div>';
    try{await ensureToneFamilies()}catch(_){}
    if(window.TONE_FAMILIES)renderToneExplorer();
    return;
  }
  $$('#toneExplorerModes [data-tone-mode]').forEach(b=>{
    const on=b.dataset.toneMode===toneExplorerMode;
    b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');
  });
  const candidates=toneExplorerCandidates();
  if(toneExplorerPreview&&toneExplorerSignature(toneExplorerPreview.origin)!==toneExplorerSignature())toneExplorerPreview=null;
  let preview='';
  if(toneExplorerPreview){
    const o=toneExplorerPreview.origin,p=toneExplorerPreview.colors;
    preview='<div class="tone-explorer-preview"><div class="tone-explorer-preview-head"><strong>'+escapeHtml(toneExplorerPreview.label)+'</strong><span>只比較，不改原色</span><button type="button" class="text-action" data-tone-clear>取消</button></div>'+
      '<div class="tone-explorer-compare"><div><small>目前</small><div class="tone-explorer-swatches"><i style="background:'+o[0]+'"></i><i style="background:'+o[1]+'"></i><i style="background:'+o[2]+'"></i></div></div>'+
      '<div><small>預覽</small><div class="tone-explorer-swatches"><i style="background:'+p[0]+'"></i><i style="background:'+p[1]+'"></i><i style="background:'+p[2]+'"></i></div></div></div></div>';
  }
  host.innerHTML=preview+'<div class="tone-explorer-grid">'+candidates.map(toneExplorerCard).join('')+'</div>';
}

document.addEventListener('click',event=>{
  const mode=event.target.closest?.('[data-tone-mode]');
  if(mode){setToneExplorerMode(mode.dataset.toneMode);return}
  const preview=event.target.closest?.('[data-tone-preview]');
  if(preview){previewToneExplorer(preview.dataset.tonePreview);return}
  const apply=event.target.closest?.('[data-tone-apply]');
  if(apply){applyToneExplorer(apply.dataset.toneApply);return}
  if(event.target.closest?.('[data-tone-clear]'))clearToneExplorerPreview();
});
