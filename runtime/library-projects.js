/* Color Lab V2.26.0 Local Projects
   Backward-compatible project layer over the existing saved-palette folder field.
   Project metadata stays local and deleting a project never deletes palettes. */

const PROJECT_STORAGE_KEY='colorlab.projectsV1';
const PROJECT_LIMIT=40;
const PROJECT_NAME_LIMIT=28;

function sanitizeProjectName(value){
  return String(value??'').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,PROJECT_NAME_LIMIT);
}
function sanitizeProjectList(value){
  if(!Array.isArray(value))return[];
  const out=[];
  for(const item of value){
    const name=sanitizeProjectName(typeof item==='string'?item:item?.name);
    if(name&&!out.includes(name))out.push(name);
    if(out.length>=PROJECT_LIMIT)break;
  }
  return out;
}
function storedProjectNames(){
  try{return sanitizeProjectList(JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY)||'[]'))}
  catch(_){return[]}
}
function readProjectNames(saved){
  const data=Array.isArray(saved)?saved:(typeof readSavedData==='function'?readSavedData():[]);
  const folders=data.map(x=>sanitizeProjectName(x?.folder)).filter(Boolean);
  return sanitizeProjectList([...storedProjectNames(),...folders]);
}
function writeProjectNames(names){
  const clean=sanitizeProjectList(names);
  localStorage.setItem(PROJECT_STORAGE_KEY,JSON.stringify(clean));
  return clean;
}
function ensureProjectName(name){
  const clean=sanitizeProjectName(name);if(!clean)return'';
  const names=readProjectNames();
  if(!names.includes(clean))writeProjectNames([...names,clean]);
  return clean;
}
function projectPaletteSample(name,data){
  const item=data.find(x=>(x.folder||'')===name);
  return item?.palette||null;
}
function projectCount(name,data){
  return data.filter(x=>(x.folder||'')===name).length;
}
function renderLibraryProjects(data){
  const host=document.getElementById('libraryProjectsMount');if(!host)return;
  const names=readProjectNames(data),active=libraryFolderFilter||'';
  const chip=(name,label,count,palette,all=false)=>{
    const selected=active===name;
    const colors=palette?'<span class="project-mini"><i style="background:'+palette.base+'"></i><i style="background:'+palette.structure+'"></i><i style="background:'+palette.accent+'"></i></span>':'';
    return '<button type="button" class="project-chip'+(selected?' active':'')+'" data-project-filter="'+escapeHtml(name)+'" aria-pressed="'+(selected?'true':'false')+'">'+colors+'<span><b>'+escapeHtml(label)+'</b><small>'+count+(all?' 組':' 組配色')+'</small></span></button>';
  };
  const chips=[
    chip('','全部',data.length,data[0]?.palette||null,true),
    ...names.map(name=>chip(name,name,projectCount(name,data),projectPaletteSample(name,data)))
  ].join('');
  const manage=names.length?'<details class="project-manage"><summary>管理專案</summary><div class="project-manage-list">'+
    names.map(name=>'<div class="project-manage-row"><span><b>'+escapeHtml(name)+'</b><small>'+projectCount(name,data)+' 組配色</small></span><div><button type="button" data-project-rename="'+escapeHtml(name)+'">改名</button><button type="button" data-project-delete="'+escapeHtml(name)+'">刪除</button></div></div>').join('')+
    '</div></details>':'';
  host.innerHTML='<div class="project-head"><div><span>PROJECTS</span><strong>色彩專案</strong></div><button type="button" data-project-create>＋ 新增專案</button></div><div class="project-strip">'+chips+'</div>'+manage;
}
function renderFolderFilter(data){
  const select=document.getElementById('libraryFolderFilter');if(!select)return;
  const projects=readProjectNames(data),current=libraryFolderFilter;
  select.innerHTML='<option value="">全部專案</option>'+projects.map(name=>'<option value="'+escapeHtml(name)+'">'+escapeHtml(name)+'</option>').join('');
  if(projects.includes(current))select.value=current;
  else{libraryFolderFilter='';select.value=''}
}
function createLibraryProject(){
  if(readProjectNames().length>=PROJECT_LIMIT){toast('最多 '+PROJECT_LIMIT+' 個專案');return}
  const next=prompt('新專案名稱');if(next===null)return;
  const name=sanitizeProjectName(next);if(!name){toast('請輸入專案名稱');return}
  const names=readProjectNames();
  if(names.includes(name)){libraryFolderFilter=name;renderSaved();toast('已切換到 '+name);return}
  writeProjectNames([...names,name]);libraryFolderFilter=name;scheduleResilienceBackup();renderSaved();toast('已建立 '+name);
}
function renameLibraryProject(oldName){
  const old=sanitizeProjectName(oldName);if(!old)return;
  const next=prompt('重新命名專案',old);if(next===null)return;
  const name=sanitizeProjectName(next);if(!name){toast('專案名稱不能空白');return}
  const names=readProjectNames();
  if(name!==old&&names.includes(name)){toast('已有同名專案');return}
  const renamed=names.map(x=>x===old?name:x);
  writeProjectNames(renamed);
  const data=readSavedData();
  let changed=false;
  data.forEach(item=>{if((item.folder||'')===old){item.folder=name;changed=true}});
  if(changed)localStorage.setItem('colorlab.saved',JSON.stringify(data));
  if(libraryFolderFilter===old)libraryFolderFilter=name;
  scheduleResilienceBackup();renderSaved();toast('已改名為 '+name);
}
function deleteLibraryProject(name){
  const clean=sanitizeProjectName(name);if(!clean)return;
  const count=projectCount(clean,readSavedData());
  if(!confirm('刪除專案「'+clean+'」？\n'+(count?count+' 組配色會移到未分組，不會被刪除。':'這不會刪除任何配色。')))return;
  writeProjectNames(readProjectNames().filter(x=>x!==clean));
  const data=readSavedData();
  let changed=false;
  data.forEach(item=>{if((item.folder||'')===clean){item.folder='';changed=true}});
  if(changed)localStorage.setItem('colorlab.saved',JSON.stringify(data));
  if(libraryFolderFilter===clean)libraryFolderFilter='';
  scheduleResilienceBackup();renderSaved();toast('已刪除專案，配色仍保留');
}
function editSavedFolder(index){
  const data=readSavedData(),item=data[index];if(!item)return;
  const names=readProjectNames(data);
  const hint=names.length?'\n現有專案：'+names.join('、'):'';
  const next=prompt('移動到專案（留空代表未分組）'+hint,item.folder||'');if(next===null)return;
  const name=sanitizeProjectName(next);
  if(name)ensureProjectName(name);
  item.folder=name;
  localStorage.setItem('colorlab.saved',JSON.stringify(data));
  scheduleResilienceBackup();renderSaved();toast(name?'已移到 '+name:'已移出專案');
}
function mergeImportedProjects(projects){
  const merged=sanitizeProjectList([...readProjectNames(),...sanitizeProjectList(projects)]);
  writeProjectNames(merged);
  return merged;
}

document.addEventListener('click',event=>{
  const filter=event.target.closest?.('[data-project-filter]');
  if(filter){
    libraryFolderFilter=filter.dataset.projectFilter||'';
    const select=document.getElementById('libraryFolderFilter');if(select)select.value=libraryFolderFilter;
    renderSaved();return;
  }
  if(event.target.closest?.('[data-project-create]')){createLibraryProject();return}
  const rename=event.target.closest?.('[data-project-rename]');
  if(rename){renameLibraryProject(rename.dataset.projectRename);return}
  const del=event.target.closest?.('[data-project-delete]');
  if(del){deleteLibraryProject(del.dataset.projectDelete)}
});
