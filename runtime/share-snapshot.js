/* Color Lab V2.23 Shareable Snapshot — URL fragment only, no backend */
const SHARE_SNAPSHOT_CONTEXTS=['app','brand','room','outfit','slides'];
const SHARE_SNAPSHOT_THEMES=['light','dark'];

function shareSnapshotPayload(){
  return{
    version:1,
    colors:[palette.base,palette.structure,palette.accent].map(normHex),
    context:SHARE_SNAPSHOT_CONTEXTS.includes(previewContext)?previewContext:'app',
    theme:SHARE_SNAPSHOT_THEMES.includes(previewTheme)?previewTheme:'light'
  };
}
function shareSnapshotHash(){
  const p=shareSnapshotPayload();
  return '#clv=1&cl='+p.colors.map(x=>x.slice(1)).join('-')+'&ctx='+p.context+'&theme='+p.theme;
}
function shareSnapshotUrl(){
  const url=new URL(location.href);
  url.hash=shareSnapshotHash().slice(1);
  return url.href;
}
function parseShareSnapshot(hash=location.hash){
  try{
    const raw=String(hash||'').replace(/^#/,'');
    if(!raw)return null;
    const params=new URLSearchParams(raw);
    if(params.get('clv')!=='1')return null;
    const parts=(params.get('cl')||'').split('-');
    if(parts.length!==3)return null;
    const colors=parts.map(x=>normHex('#'+x));
    if(colors.some(x=>!x))return null;
    const context=SHARE_SNAPSHOT_CONTEXTS.includes(params.get('ctx'))?params.get('ctx'):'app';
    const theme=SHARE_SNAPSHOT_THEMES.includes(params.get('theme'))?params.get('theme'):'light';
    return{version:1,colors,context,theme};
  }catch(_){return null}
}
function applyShareSnapshotFromLocation(renderNow=false){
  const snap=parseShareSnapshot();
  if(!snap)return false;
  selectedColors=[...snap.colors];
  lockedSlots=[false,false,false];
  activeSlot=0;
  seed=selectedColors[0];
  currentComboName='';
  previewContext=snap.context;
  previewTheme=snap.theme;
  if(renderNow){
    const name=document.querySelector('#comboName');if(name)name.value='';
    const color=document.querySelector('#color');if(color)color.value=seed;
    const hex=document.querySelector('#hex');if(hex)hex.value=seed;
    generate(false);
    updateLockToggle();
    updatePhotoTarget();
    pushHistory();
    toast('已套用分享配色');
  }
  return true;
}
function installShareSnapshotHashListener(){
  if(window.__colorLabShareHashListener)return;
  window.__colorLabShareHashListener=true;
  window.addEventListener('hashchange',()=>applyShareSnapshotFromLocation(true));
}
function ensureShareSnapshotUi(){
  if(document.querySelector('#shareSnapshotPanel'))return;
  const anchor=document.querySelector('.palette-actions');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',
    '<section class="share-snapshot-panel" id="shareSnapshotPanel" hidden aria-label="跨裝置分享">'+
      '<div class="share-snapshot-head"><div><strong>Share Snapshot</strong><span>URL fragment · 零後端</span></div><button type="button" id="closeShareSnapshot" aria-label="關閉分享面板">×</button></div>'+
      '<div class="share-snapshot-content"><div class="share-snapshot-qr" id="shareSnapshotQr" role="img" aria-label="配色分享 QR Code"></div>'+
      '<div class="share-snapshot-meta"><div class="share-snapshot-ratio" id="shareSnapshotRatio"></div><label for="shareSnapshotUrl">可還原配色的連結</label><input id="shareSnapshotUrl" readonly spellcheck="false">'+
      '<div class="share-snapshot-actions"><button type="button" id="copyShareSnapshot">複製連結</button><button type="button" id="nativeShareSnapshot">系統分享</button></div>'+
      '<p>連結只包含三個原色與 Context / Light-Dark 預覽狀態；不包含收藏、照片、偏好或任何帳號資料。</p></div></div>'+
    '</section>');
  document.querySelector('#closeShareSnapshot')?.addEventListener('click',()=>{document.querySelector('#shareSnapshotPanel').hidden=true});
  document.querySelector('#copyShareSnapshot')?.addEventListener('click',copyShareSnapshotUrl);
  document.querySelector('#nativeShareSnapshot')?.addEventListener('click',nativeShareSnapshot);
}
async function renderShareSnapshotQr(url){
  const host=document.querySelector('#shareSnapshotQr');if(!host)return;
  host.innerHTML='<span class="share-qr-loading">QR</span>';
  try{
    await loadScriptOnce('./vendor/qrcode.min.js','QRCode');
    host.innerHTML='';
    new QRCode(host,{text:url,width:156,height:156,colorDark:'#111111',colorLight:'#FFFFFF',correctLevel:QRCode.CorrectLevel.M});
  }catch(_){
    host.innerHTML='<span class="share-qr-fail">QR 無法產生<br>仍可複製連結</span>';
  }
}
async function openShareSnapshot(){
  ensureShareSnapshotUi();
  const panel=document.querySelector('#shareSnapshotPanel');if(!panel)return;
  const url=shareSnapshotUrl(),p=shareSnapshotPayload();
  panel.hidden=false;
  const input=document.querySelector('#shareSnapshotUrl');if(input)input.value=url;
  const ratio=document.querySelector('#shareSnapshotRatio');
  if(ratio)ratio.innerHTML=p.colors.map((hex,i)=>'<i style="background:'+hex+';color:'+textFor(hex)+';flex:'+[75,18,7][i]+'"><b>'+[75,18,7][i]+'</b></i>').join('');
  await renderShareSnapshotQr(url);
}
async function copyShareSnapshotUrl(){
  const url=shareSnapshotUrl();
  try{await navigator.clipboard.writeText(url);toast('已複製可還原連結')}catch(_){toast('無法複製連結')}
}
async function nativeShareSnapshot(){
  const url=shareSnapshotUrl();
  if(navigator.share){
    try{await navigator.share({title:'Color Lab 配色',text:paletteText(),url});return}catch(e){if(e?.name==='AbortError')return}
  }
  await copyShareSnapshotUrl();
}
ensureShareSnapshotUi();
