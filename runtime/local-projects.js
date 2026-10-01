/* Color Lab V2.26.0 Local Projects
   Local-only project layer for saved palettes. Folders/tags remain secondary organization. */

const LOCAL_PROJECTS_KEY='colorlab.projectsV1';
const LOCAL_PROJECT_NONE='__unassigned__';
let libraryProjectFilter='';
let projectPickerSavedIndex=null;

function sanitizeProjectId(value){
  const id=String(value||'').trim();
  return /^[a-z0-9][a-z0-9-]{5,63}$/i.test(id)?id:'';
}
function sanitizeLocalProject(item){
  if(!item||typeof item!=='object')return null;
  const id=sanitizeProjectId(item.id);
  const name=typeof item.name==='string'?item.name.trim().replace(/\s+/g,' ').slice(0,28):'';
  if(!id||!name)return null;
  return{id,name,createdAt:Number.isFinite(Number(item.createdAt))?Number(item.createdAt):Date.now()};
}
function sanitizeLocalProjects(value){
  if(!Array.isArray(value))return[];
  const seen=new Set(),names=new Set(),out=[];
  for(const raw of value){
    const item=sanitizeLocalProject(raw);if(!item)continue;
    const key=item.name.toLocaleLowerCase('zh-Hant');
    if(seen.has(item.id)||names.has(key))continue;
    seen.add(item.id);names.add(key);out.push(item);
    if(out.length>=60)break;
  }
  return out;
}
function readLocalProjects(){
  const state=storageJsonState(LOCAL_PROJECTS_KEY,Array.isArray);
  return state.status==='valid'?sanitizeLocalProjects(state.value):[];
}
function writeLocalProjects(projects,{silent=false}={}){
  const clean=sanitizeLocalProjects(projects);
  return storageWriteJson(LOCAL_PROJECTS_KEY,clean,{silent})?clean:null;
}
function localProjectNewId(){
  const raw=globalThis.crypto?.randomUUID?.().replace(/-/g,'').slice(0,18)||Date.now().toString(36)+Math.random().toString(36).slice(2,10);
  return'prj-'+raw.toLowerCase();
}
function localProjectName(id){
  if(!id)return'';
  return readLocalProjects().find(x=>x.id===id)?.name||'';
}
function renderFolderFilter(data){
  const select=$('#libraryFolderFilter');if(!select)return;
  const folders=[...new Set(data.map(x=>(x.folder||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-Hant'));
  const current=libraryFolderFilter;
  select.innerHTML='<option value="">全部分類</option>'+folders.map(f=>'<option value="'+escapeHtml(f)+'">'+escapeHtml(f)+'</option>').join('');
  if(folders.includes(current))select.value=current;else{libraryFolderFilter='';select.value=''}
}
function localProjectCountMap(data=readSavedData()){
  const counts=new Map();
  data.forEach(item=>{const id=sanitizeProjectId(item.projectId);if(id)counts.set(id,(counts.get(id)||0)+1)});
  return counts;
}
function localProjectMatches(item){
  if(!libraryProjectFilter)return true;
  const id=sanitizeProjectId(item?.projectId);
  return libraryProjectFilter===LOCAL_PROJECT_NONE?!id:id===libraryProjectFilter;
}
function localProjectSearchText(item){
  const id=sanitizeProjectId(item?.projectId);
  return id?localProjectName(id):'';
}
function librarySearchText(x){return librarySearchDocument(x,localProjectSearchText(x))}
function librarySearchMatches(x,query){return librarySearchDocumentMatches(x,query,localProjectSearchText(x))}
function createLocalProject(){
  const raw=prompt('新專案名稱');if(raw===null)return;
  const name=raw.trim().replace(/\s+/g,' ').slice(0,28);
  if(!name){toast('專案名稱不能是空白');return}
  const projects=readLocalProjects();
  if(projects.some(x=>x.name.toLocaleLowerCase('zh-Hant')===name.toLocaleLowerCase('zh-Hant'))){toast('已經有同名專案');return}
  const project={id:localProjectNewId(),name,createdAt:Date.now()};
  if(!writeLocalProjects([project,...projects]))return;
  libraryProjectFilter=project.id;scheduleResilienceBackup();renderSaved();toast('已建立專案 '+name);
}
function renameLocalProject(id){
  const projects=readLocalProjects(),project=projects.find(x=>x.id===id);if(!project)return;
  const raw=prompt('專案名稱',project.name);if(raw===null)return;
  const name=raw.trim().replace(/\s+/g,' ').slice(0,28);
  if(!name){toast('專案名稱不能是空白');return}
  if(projects.some(x=>x.id!==id&&x.name.toLocaleLowerCase('zh-Hant')===name.toLocaleLowerCase('zh-Hant'))){toast('已經有同名專案');return}
  project.name=name;if(!writeLocalProjects(projects))return;scheduleResilienceBackup();renderSaved();toast('專案已改名');
}
function deleteLocalProject(id){
  const projects=readLocalProjects(),project=projects.find(x=>x.id===id);if(!project)return;
  if(!confirm('刪除專案「'+project.name+'」？配色不會被刪除，只會變成未歸類。'))return;
  const saved=readSavedData().map(item=>sanitizeProjectId(item.projectId)===id?{...item,projectId:''}:item);
  const nextProjects=sanitizeLocalProjects(projects.filter(x=>x.id!==id));
  const tx=storageTransaction(['colorlab.saved',LOCAL_PROJECTS_KEY],()=>{
    localStorage.setItem('colorlab.saved',JSON.stringify(saved));
    localStorage.setItem(LOCAL_PROJECTS_KEY,JSON.stringify(nextProjects));
  });
  if(!tx.ok)return;
  if(libraryProjectFilter===id)libraryProjectFilter='';
  scheduleResilienceBackup();renderSaved();toast('專案已刪除，配色仍保留');
}
function ensureLocalProjectsUi(){
  const library=document.querySelector('.tab-view[data-view="library"] .app-section');if(!library)return;
  if(!document.getElementById('localProjectsPanel')){
    const panel=document.createElement('section');panel.id='localProjectsPanel';panel.className='local-projects';
    panel.innerHTML='<div class="local-project-head"><div><strong>專案</strong><span>把收藏依實際工作分組</span></div><button type="button" id="localProjectCreate">＋ 新專案</button></div><div class="local-project-chips" id="localProjectChips"></div><div class="local-project-manage" id="localProjectManage" hidden></div>';
    const target=library.querySelector('.library-search-wrap');
    target?.insertAdjacentElement('afterend',panel);
  }
  if(!document.getElementById('projectPickerBackdrop')){
    const wrap=document.createElement('div');wrap.className='sheet-backdrop';wrap.id='projectPickerBackdrop';wrap.hidden=true;
    wrap.innerHTML='<section class="picker-sheet action-sheet" role="dialog" aria-modal="true" aria-labelledby="projectPickerTitle"><div class="sheet-handle"></div><div class="picker-head"><div><div class="eyebrow">PROJECT</div><h2 id="projectPickerTitle">移動到專案</h2></div><button type="button" class="sheet-close" id="closeProjectPicker"><span aria-hidden="true">×</span><span class="sr-only">關閉</span></button></div><div class="project-picker-list" id="projectPickerList"></div></section>';
    document.body.appendChild(wrap);
  }
  const actionList=document.querySelector('#savedActionBackdrop .action-list');
  if(actionList&&!actionList.querySelector('[data-saved-action="project"]')){
    const deleteRow=actionList.querySelector('[data-saved-action="delete"]');
    const btn=document.createElement('button');btn.type='button';btn.className='action-row';btn.dataset.savedAction='project';btn.innerHTML='<span>移動專案</span><span>▦</span>';
    actionList.insertBefore(btn,deleteRow);
  }
}
function renderLocalProjects(data=readSavedData()){
  ensureLocalProjectsUi();
  const projects=readLocalProjects(),counts=localProjectCountMap(data),chips=document.getElementById('localProjectChips'),manage=document.getElementById('localProjectManage');
  if(!chips||!manage)return;
  const unassigned=data.filter(x=>!sanitizeProjectId(x.projectId)).length;
  if(libraryProjectFilter!==LOCAL_PROJECT_NONE&&libraryProjectFilter&&!projects.some(x=>x.id===libraryProjectFilter))libraryProjectFilter='';
  const chip=(value,label,count)=>'<button type="button" data-project-filter="'+value+'" aria-pressed="'+(libraryProjectFilter===value?'true':'false')+'"><span>'+escapeHtml(label)+'</span><small>'+count+'</small></button>';
  chips.innerHTML=chip('','全部',data.length)+chip(LOCAL_PROJECT_NONE,'未歸類',unassigned)+projects.map(p=>chip(p.id,p.name,counts.get(p.id)||0)).join('');
  const active=projects.find(x=>x.id===libraryProjectFilter);
  manage.hidden=!active;
  manage.innerHTML=active?'<span>'+escapeHtml(active.name)+'</span><div><button type="button" data-project-rename="'+active.id+'">重新命名</button><button type="button" data-project-delete="'+active.id+'">刪除專案</button></div>':'';
}
function openProjectPicker(index){
  const data=readSavedData(),item=data[index];if(!item)return;
  ensureLocalProjectsUi();projectPickerSavedIndex=index;
  const projects=readLocalProjects(),current=sanitizeProjectId(item.projectId),list=document.getElementById('projectPickerList');
  list.innerHTML='<button type="button" class="action-row" data-project-pick=""><span>未歸類</span><span>'+(current?'':'✓')+'</span></button>'+
    projects.map(p=>'<button type="button" class="action-row" data-project-pick="'+p.id+'"><span>'+escapeHtml(p.name)+'</span><span>'+(current===p.id?'✓':'')+'</span></button>').join('');
  document.getElementById('projectPickerBackdrop').hidden=false;document.body.style.overflow='hidden';
}
function closeProjectPicker(){
  projectPickerSavedIndex=null;
  const backdrop=document.getElementById('projectPickerBackdrop');if(backdrop)backdrop.hidden=true;
  document.body.style.overflow='';
}
function assignSavedProject(index,projectId){
  const data=readSavedData(),item=data[index];if(!item)return;
  const id=sanitizeProjectId(projectId);
  if(id&&!readLocalProjects().some(x=>x.id===id))return;
  item.projectId=id;
  if(!storageWriteJson('colorlab.saved',data))return;
  scheduleResilienceBackup();renderSaved();
  toast(id?'已移到 '+localProjectName(id):'已移到未歸類');
}
function mergeSavedPaletteRecords(current,imported){
  const merged=[...current],sig=x=>[x.name,x.palette.base,x.palette.structure,x.palette.accent].join('|');
  const bySig=new Map(merged.map((x,i)=>[sig(x),i]));
  imported.forEach(item=>{
    const key=sig(item),index=bySig.get(key);
    if(index===undefined){bySig.set(key,merged.length);merged.push(item);return}
    if(!sanitizeProjectId(merged[index].projectId)&&sanitizeProjectId(item.projectId)){
      merged[index]={...merged[index],projectId:sanitizeProjectId(item.projectId)};
    }
  });
  return merged;
}
function mergeImportedProjectData(rawProjects,importedSaved,currentProjects=readLocalProjects()){
  const imported=sanitizeLocalProjects(rawProjects),current=sanitizeLocalProjects(currentProjects),used=new Set(current.map(x=>x.id));
  const map=new Map(),merged=[...current];
  imported.forEach(project=>{
    let id=project.id;
    const same=current.find(x=>x.id===id);
    if(same&&same.name!==project.name){id=localProjectNewId();while(used.has(id))id=localProjectNewId()}
    if(!same||same.name!==project.name){
      if(!merged.some(x=>x.name.toLocaleLowerCase('zh-Hant')===project.name.toLocaleLowerCase('zh-Hant'))){
        merged.push({...project,id});used.add(id);
      }else{
        id=merged.find(x=>x.name.toLocaleLowerCase('zh-Hant')===project.name.toLocaleLowerCase('zh-Hant')).id;
      }
    }
    map.set(project.id,id);
  });
  const saved=importedSaved.map(item=>{
    const old=sanitizeProjectId(item.projectId);
    return old?{...item,projectId:map.get(old)||''}:item;
  });
  return{projects:sanitizeLocalProjects(merged),saved};
}
function initLocalProjects(){
  ensureLocalProjectsUi();
  document.getElementById('localProjectCreate')?.addEventListener('click',createLocalProject);
  document.getElementById('localProjectChips')?.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-project-filter]');if(!button)return;
    libraryProjectFilter=button.dataset.projectFilter||'';renderSaved();
  });
  document.getElementById('localProjectManage')?.addEventListener('click',event=>{
    const rename=event.target.closest?.('[data-project-rename]');if(rename){renameLocalProject(rename.dataset.projectRename);return}
    const del=event.target.closest?.('[data-project-delete]');if(del)deleteLocalProject(del.dataset.projectDelete);
  });
  document.getElementById('closeProjectPicker')?.addEventListener('click',closeProjectPicker);
  document.getElementById('projectPickerBackdrop')?.addEventListener('click',event=>{if(event.target.id==='projectPickerBackdrop')closeProjectPicker()});
  document.getElementById('projectPickerList')?.addEventListener('click',event=>{
    const pick=event.target.closest?.('[data-project-pick]');if(!pick||projectPickerSavedIndex===null)return;
    const index=projectPickerSavedIndex;assignSavedProject(index,pick.dataset.projectPick||'');closeProjectPicker();
  });
  renderLocalProjects();
}
