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
function storageNeedsRecovery(key,validator=null){
  return storageJsonState(key,validator).status!=='valid';
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

function importBackupFile(file){
  if(!file)return;
  if(file.size>5*1024*1024){toast('備份檔過大');return}
  const reader=new FileReader();
  reader.onerror=()=>toast('備份檔讀取失敗');
  reader.onload=()=>{
    try{
      const data=JSON.parse(String(reader.result||''));
      if(!['color-lab-backup-v1','color-lab-backup-v2','color-lab-backup-v3','color-lab-backup-v4','color-lab-backup-v5'].includes(data.schema)||!Array.isArray(data.saved)||data.saved.length>1000)throw new Error('invalid');
      if(['color-lab-backup-v3','color-lab-backup-v4','color-lab-backup-v5'].includes(data.schema)&&(!data.preference||Number(data.preference.version)!==1))throw new Error('invalid');
      if(['color-lab-backup-v4','color-lab-backup-v5'].includes(data.schema)&&typeof data.preferenceEnabled!=='boolean')throw new Error('invalid');
      if(data.schema==='color-lab-backup-v5'&&(!Array.isArray(data.projects)||data.projects.length>60))throw new Error('invalid');

      const current=readSavedData().map(sanitizeSavedRecord).filter(Boolean);
      const importedSaved=data.saved.map(sanitizeSavedRecord).filter(Boolean);
      const projectMerge=data.schema==='color-lab-backup-v5'
        ?mergeImportedProjectData(data.projects,importedSaved,readLocalProjects())
        :{projects:readLocalProjects(),saved:importedSaved};
      const merged=mergeSavedPaletteRecords(current,projectMerge.saved).slice(0,300);
      const nextRecent=Array.isArray(data.recent)
        ?[...new Set([...recentColors,...data.recent.filter(x=>typeof x==='string'&&normHex(x)).map(x=>normHex(x))])].slice(0,20)
        :null;
      const nextCompareA=data.compareA?sanitizeCompareRecord(data.compareA):null;
      const nextCompareB=data.compareB?sanitizeCompareRecord(data.compareB):null;
      const nextDraft=data.draft?sanitizeDraftRecord(data.draft):null;
      const nextPreference=data.preference?sanitizePreferenceModel(data.preference):null;
      const hasPreferenceEnabled=typeof data.preferenceEnabled==='boolean';

      const keys=['colorlab.saved'];
      if(data.schema==='color-lab-backup-v5')keys.push(LOCAL_PROJECTS_KEY);
      if(nextRecent)keys.push('colorlab.recent');
      if(nextCompareA)keys.push('colorlab.compareA');
      if(nextCompareB)keys.push('colorlab.compareB');
      if(nextDraft)keys.push('colorlab.draft');
      if(nextPreference)keys.push('colorlab.preferenceV1');
      if(hasPreferenceEnabled)keys.push('colorlab.preferenceEnabled');

      const tx=storageTransaction(keys,()=>{
        if(data.schema==='color-lab-backup-v5')localStorage.setItem(LOCAL_PROJECTS_KEY,JSON.stringify(sanitizeLocalProjects(projectMerge.projects)));
        localStorage.setItem('colorlab.saved',JSON.stringify(merged));
        if(nextRecent)localStorage.setItem('colorlab.recent',JSON.stringify(nextRecent));
        if(nextCompareA)localStorage.setItem('colorlab.compareA',JSON.stringify(nextCompareA));
        if(nextCompareB)localStorage.setItem('colorlab.compareB',JSON.stringify(nextCompareB));
        if(nextDraft)localStorage.setItem('colorlab.draft',JSON.stringify(nextDraft));
        if(nextPreference)localStorage.setItem('colorlab.preferenceV1',JSON.stringify(nextPreference));
        if(hasPreferenceEnabled)localStorage.setItem('colorlab.preferenceEnabled',JSON.stringify(data.preferenceEnabled));
      });
      if(!tx.ok)return;

      if(nextRecent)recentColors=nextRecent;
      if(nextCompareA)compareA=nextCompareA;
      if(nextCompareB)compareB=nextCompareB;
      if(nextPreference)preferenceState=nextPreference;
      if(hasPreferenceEnabled)preferenceEnabled=data.preferenceEnabled;
      if(nextPreference||hasPreferenceEnabled){invalidatePreferenceScoring();updatePreferenceStatus(false)}
      scheduleResilienceBackup();renderSaved();renderRecentColors();renderCompare();toast('備份已匯入');
    }catch(_){toast('不是有效的 Color Lab 備份')}
  };
  reader.readAsText(file);
}
