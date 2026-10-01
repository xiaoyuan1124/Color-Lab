/* Color Lab V2.35.0 PWA / iPhone Update Hardening
   User-mediated service worker activation prevents mixed-version sessions. */

const COLORLAB_APP_VERSION='2.35.0';
const PWA_UPDATE_CHECK_INTERVAL=20*60*1000;
let pwaRegistration=null;
let pwaUpdateReady=false;
let pwaUpdateRequested=false;
let pwaControllerReloaded=false;
let pwaLastUpdateCheck=0;
let pwaBound=false;

function pwaHealthEnsureUi(){
  const mount=document.getElementById('pwaHealthMount');
  if(!mount)return null;
  if(document.getElementById('pwaHealthCard'))return document.getElementById('pwaHealthCard');
  mount.innerHTML='<aside class="pwa-health" id="pwaHealthCard" hidden role="status" aria-live="polite"><div><b id="pwaHealthTitle"></b><span id="pwaHealthText"></span></div><button type="button" id="pwaHealthAction" hidden></button></aside>';
  return document.getElementById('pwaHealthCard');
}
function pwaHealthShow(kind,title,text,actionLabel=''){
  const card=pwaHealthEnsureUi();if(!card)return;
  card.dataset.state=kind;
  document.getElementById('pwaHealthTitle').textContent=title;
  document.getElementById('pwaHealthText').textContent=text;
  const action=document.getElementById('pwaHealthAction');
  action.hidden=!actionLabel;
  action.textContent=actionLabel||'';
  card.hidden=false;
}
function pwaHealthHide(){
  const card=document.getElementById('pwaHealthCard');if(card)card.hidden=true;
}
function pwaConnectivityState(){
  if(navigator.onLine===false){
    pwaHealthShow('offline','離線使用中','配色與收藏仍保存在此裝置');
    return'offline';
  }
  if(pwaUpdateReady){
    pwaHealthShow('update','新版已準備好','更新前會先保存目前工作','更新');
    return'update';
  }
  pwaHealthHide();return'online';
}
function pwaMarkUpdateReady(registration=pwaRegistration){
  if(!registration?.waiting)return false;
  pwaRegistration=registration;
  pwaUpdateReady=true;
  pwaConnectivityState();
  return true;
}
async function pwaApplyUpdate(){
  const waiting=pwaRegistration?.waiting;
  if(!waiting)return false;
  const action=document.getElementById('pwaHealthAction');
  if(action){action.disabled=true;action.textContent='更新中…'}
  try{
    if(typeof persistDraft==='function')persistDraft();
    if(typeof writeResilienceSnapshot==='function')await writeResilienceSnapshot();
  }catch(_){}
  pwaUpdateRequested=true;
  waiting.postMessage({type:'SKIP_WAITING'});
  return true;
}
function pwaObserveRegistration(registration){
  pwaRegistration=registration;
  if(registration.waiting&&navigator.serviceWorker?.controller)pwaMarkUpdateReady(registration);
  registration.addEventListener?.('updatefound',()=>{
    const worker=registration.installing;if(!worker)return;
    worker.addEventListener('statechange',()=>{
      if(worker.state==='installed'&&navigator.serviceWorker?.controller)pwaMarkUpdateReady(registration);
    });
  });
}
async function pwaCheckForUpdate(force=false){
  if(!pwaRegistration||navigator.onLine===false)return false;
  const now=Date.now();
  if(!force&&now-pwaLastUpdateCheck<PWA_UPDATE_CHECK_INTERVAL)return false;
  pwaLastUpdateCheck=now;
  try{await pwaRegistration.update();return true}catch(_){return false}
}
async function initPwaHealth(){
  pwaHealthEnsureUi();
  if(pwaBound){pwaConnectivityState();return pwaRegistration}
  pwaBound=true;

  window.addEventListener('online',()=>{pwaConnectivityState();pwaCheckForUpdate(true)});
  window.addEventListener('offline',pwaConnectivityState);
  window.addEventListener('pageshow',()=>pwaCheckForUpdate());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pwaCheckForUpdate()});
  document.getElementById('pwaHealthAction')?.addEventListener('click',pwaApplyUpdate);

  if(!('serviceWorker'in navigator)){pwaConnectivityState();return null}
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!pwaUpdateRequested||pwaControllerReloaded)return;
    pwaControllerReloaded=true;
    location.reload();
  });
  try{
    const registration=await navigator.serviceWorker.register('./sw.js');
    pwaObserveRegistration(registration);
    pwaConnectivityState();
    pwaCheckForUpdate();
    return registration;
  }catch(_){
    pwaConnectivityState();
    return null;
  }
}
