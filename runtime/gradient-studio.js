/* Color Lab V2.28.0 Gradient Studio
   Derived gradient previews from exact source roles. Never writes back to Compose. */

const GRADIENT_STUDIO_PAIRS={
  'base-structure':{label:'Base → Structure',keys:['base','structure']},
  'base-accent':{label:'Base → Accent',keys:['base','accent']},
  'structure-accent':{label:'Structure → Accent',keys:['structure','accent']},
  'system':{label:'三角色',keys:['base','structure','accent']}
};
const GRADIENT_STUDIO_ANGLES=[0,45,90,135];
let gradientStudioPair=localStorage.getItem('colorlab.gradientPair')||'base-accent';
let gradientStudioAngle=Number(localStorage.getItem('colorlab.gradientAngle')||135);
let gradientStudioBound=false;

if(!GRADIENT_STUDIO_PAIRS[gradientStudioPair])gradientStudioPair='base-accent';
if(!GRADIENT_STUDIO_ANGLES.includes(gradientStudioAngle))gradientStudioAngle=135;

function gradientStudioSource(){
  const source=paletteArtifactBase();
  return{...source,palette:{...source.palette},ratios:{...source.ratios}};
}
function gradientStudioStops(pair=gradientStudioPair,source=gradientStudioSource()){
  const def=GRADIENT_STUDIO_PAIRS[pair]||GRADIENT_STUDIO_PAIRS['base-accent'];
  const p=source.palette;
  if(def.keys.length===3){
    return[
      {role:'base',hex:p.base,stop:0},
      {role:'structure',hex:p.structure,stop:50},
      {role:'accent',hex:p.accent,stop:100}
    ];
  }
  return def.keys.map((role,index)=>({role,hex:p[role],stop:index===0?0:100}));
}
function gradientStudioGradient(pair=gradientStudioPair,angle=gradientStudioAngle,source=gradientStudioSource()){
  const safeAngle=GRADIENT_STUDIO_ANGLES.includes(Number(angle))?Number(angle):135;
  const stops=gradientStudioStops(pair,source);
  return 'linear-gradient('+safeAngle+'deg, '+stops.map(item=>item.hex+' '+item.stop+'%').join(', ')+')';
}
function gradientStudioCss(pair=gradientStudioPair,angle=gradientStudioAngle){
  return 'background: '+gradientStudioGradient(pair,angle)+';';
}
function gradientStudioEnsureUi(){
  const mount=document.getElementById('gradientStudioMount');if(!mount)return null;
  if(document.getElementById('gradientStudioDetails'))return document.getElementById('gradientStudioDetails');
  mount.innerHTML='<details class="gradient-studio" id="gradientStudioDetails"><summary><span><b>Gradient Studio</b><small>用 exact source colors 產生衍生漸層</small></span><span class="gst-mark" aria-hidden="true">＋</span></summary><div class="gst-body"><div class="gst-preview" id="gradientStudioPreview" role="img" aria-label="目前配色漸層預覽"></div><div class="gst-block"><div class="gst-label">角色組合</div><div class="gst-options" id="gradientStudioPairs" role="group" aria-label="選擇漸層角色組合"></div></div><div class="gst-block"><div class="gst-label">方向</div><div class="gst-options gst-angles" id="gradientStudioAngles" role="group" aria-label="選擇漸層方向"></div></div><div class="gst-source" id="gradientStudioSource"></div><div class="gst-code"><code id="gradientStudioCode"></code><button type="button" id="copyGradientCss">複製 CSS</button></div><p class="gst-note">Gradient 是衍生預覽，不代表 75 / 18 / 7 面積比例，也不會修改 Base / Structure / Accent 原色。</p></div></details>';
  return document.getElementById('gradientStudioDetails');
}
function gradientStudioRoleLabel(role){
  return role==='base'?'Base 75%':role==='structure'?'Structure 18%':'Accent 7%';
}
function renderGradientStudio(){
  const details=gradientStudioEnsureUi();if(!details)return;
  const source=gradientStudioSource();
  const preview=document.getElementById('gradientStudioPreview');
  const pairs=document.getElementById('gradientStudioPairs');
  const angles=document.getElementById('gradientStudioAngles');
  const sourceHost=document.getElementById('gradientStudioSource');
  const code=document.getElementById('gradientStudioCode');
  const gradient=gradientStudioGradient(gradientStudioPair,gradientStudioAngle,source);
  if(preview){
    preview.style.background=gradient;
    const def=GRADIENT_STUDIO_PAIRS[gradientStudioPair];
    preview.setAttribute('aria-label',(def?.label||'漸層')+'，'+gradientStudioAngle+' 度，使用目前 exact source colors');
  }
  if(pairs)pairs.innerHTML=Object.entries(GRADIENT_STUDIO_PAIRS).map(([key,item])=>
    '<button type="button" data-gradient-pair="'+key+'" aria-pressed="'+(key===gradientStudioPair?'true':'false')+'">'+item.label+'</button>'
  ).join('');
  if(angles)angles.innerHTML=GRADIENT_STUDIO_ANGLES.map(angle=>
    '<button type="button" data-gradient-angle="'+angle+'" aria-pressed="'+(angle===gradientStudioAngle?'true':'false')+'"><span aria-hidden="true" style="transform:rotate('+angle+'deg)">↑</span>'+angle+'°</button>'
  ).join('');
  if(sourceHost){
    sourceHost.innerHTML=gradientStudioStops(gradientStudioPair,source).map(item=>
      '<span><i style="background:'+item.hex+'"></i><b>'+gradientStudioRoleLabel(item.role)+'</b><code>'+item.hex+'</code></span>'
    ).join('');
  }
  if(code)code.textContent=gradientStudioCss(gradientStudioPair,gradientStudioAngle);
}
function setGradientStudioPair(next){
  if(!GRADIENT_STUDIO_PAIRS[next])return;
  gradientStudioPair=next;
  try{localStorage.setItem('colorlab.gradientPair',next)}catch(_){}
  renderGradientStudio();
}
function setGradientStudioAngle(next){
  const angle=Number(next);if(!GRADIENT_STUDIO_ANGLES.includes(angle))return;
  gradientStudioAngle=angle;
  try{localStorage.setItem('colorlab.gradientAngle',String(angle))}catch(_){}
  renderGradientStudio();
}
async function copyGradientStudioCss(){
  const value=gradientStudioCss();
  try{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);toast('已複製 Gradient CSS');return}
  }catch(_){}
  if(typeof copy==='function')copy(value);
}
function initGradientStudio(){
  const details=gradientStudioEnsureUi();if(!details||gradientStudioBound)return;
  gradientStudioBound=true;
  details.addEventListener('toggle',event=>{if(event.currentTarget.open)renderGradientStudio()});
  details.addEventListener('click',event=>{
    const pair=event.target.closest?.('[data-gradient-pair]');
    if(pair){setGradientStudioPair(pair.dataset.gradientPair);return}
    const angle=event.target.closest?.('[data-gradient-angle]');
    if(angle){setGradientStudioAngle(angle.dataset.gradientAngle);return}
    if(event.target.closest?.('#copyGradientCss'))copyGradientStudioCss();
  });
  renderGradientStudio();
}
