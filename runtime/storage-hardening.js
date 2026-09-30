/* Color Lab V2.30.0 Storage Hardening
   Safe localStorage access + rollback helpers for local-first reliability. */

const COLORLAB_STORAGE_FAILURE_COPY='本機儲存失敗，這次變更未保存';
let colorLabStorageNoticeAt=0;

function storageNotifyFailure(message=COLORLAB_STORAGE_FAILURE_COPY){
  const now=Date.now();
  if(now-colorLabStorageNoticeAt<900)return;
  colorLabStorageNoticeAt=now;
  if(typeof toast==='function')toast(message);
  else if(globalThis.console?.warn)console.warn(message);
}
function storageReadRaw(key,fallback=null){
  try{
    const value=localStorage.getItem(key);
    return value===null?fallback:value;
  }catch(_){return fallback}
}
function storageWriteRaw(key,value,{silent=false,message=COLORLAB_STORAGE_FAILURE_COPY}={}){
  try{localStorage.setItem(key,String(value));return true}
  catch(_){if(!silent)storageNotifyFailure(message);return false}
}
function storageRemoveRaw(key,{silent=false,message=COLORLAB_STORAGE_FAILURE_COPY}={}){
  try{localStorage.removeItem(key);return true}
  catch(_){if(!silent)storageNotifyFailure(message);return false}
}
function storageWriteJson(key,value,options={}){
  let text;
  try{text=JSON.stringify(value)}
  catch(_){if(!options.silent)storageNotifyFailure(options.message||COLORLAB_STORAGE_FAILURE_COPY);return false}
  return storageWriteRaw(key,text,options);
}
function storageJsonState(key,validator=null){
  let raw;
  try{raw=localStorage.getItem(key)}
  catch(error){return{status:'unavailable',value:null,error}}
  if(raw===null)return{status:'missing',value:null};
  try{
    const value=JSON.parse(raw);
    if(typeof validator==='function'&&!validator(value))return{status:'invalid',value:null};
    return{status:'valid',value};
  }catch(error){return{status:'corrupt',value:null,error}}
}
function storageCapture(keys){
  const snapshot=new Map();
  try{
    [...new Set(keys)].forEach(key=>snapshot.set(key,localStorage.getItem(key)));
    return{ok:true,snapshot};
  }catch(error){return{ok:false,snapshot,error}}
}
function storageRestore(snapshot){
  let ok=true;
  for(const [key,value] of snapshot){
    try{
      if(value===null)localStorage.removeItem(key);
      else localStorage.setItem(key,value);
    }catch(_){ok=false}
  }
  return ok;
}
function storageTransaction(keys,fn){
  const captured=storageCapture(keys);
  if(!captured.ok){
    storageNotifyFailure();
    return{ok:false,error:captured.error,rolledBack:false};
  }
  try{return{ok:true,value:fn()}}
  catch(error){
    const rolledBack=storageRestore(captured.snapshot);
    storageNotifyFailure(rolledBack?'本機儲存失敗，變更已取消':'本機儲存失敗，請立即匯出備份');
    return{ok:false,error,rolledBack};
  }
}
