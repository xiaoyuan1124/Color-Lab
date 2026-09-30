/* Color Lab V2.24 Custom Design Preview — local SVG only */
const CUSTOM_SVG_MAX_BYTES=1500000;
const CUSTOM_SVG_MAX_ELEMENTS=5000;
const CUSTOM_SVG_ROLES=['keep','base','structure','accent'];
let customDesignSvgRoot=null;
let customDesignSourceColors=[];
let customDesignMappings=new Map();
let customDesignFileName='';

function customDesignColorToHex(value){
  const raw=String(value||'').trim();
  if(!raw||raw==='none'||raw==='currentColor'||raw.startsWith('url('))return null;
  const short=raw.match(/^#([0-9a-f]{3})$/i);
  if(short)return '#'+short[1].split('').map(x=>x+x).join('').toUpperCase();
  const full=raw.match(/^#([0-9a-f]{6})$/i);
  if(full)return '#'+full[1].toUpperCase();
  const rgb=raw.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if(rgb){
    if(rgb[4]&&rgb[4]!=='1'&&rgb[4]!=='100%')return null;
    const parts=rgb.slice(1,4).map(x=>Math.max(0,Math.min(255,Number(x))));
    return '#'+parts.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  return null;
}
function customDesignStyleColor(styleText,prop){
  const m=String(styleText||'').match(new RegExp('(?:^|;)\\s*'+prop+'\\s*:\\s*([^;]+)','i'));
  return m?customDesignColorToHex(m[1]):null;
}
function sanitizeCustomSvg(text){
  if(typeof text!=='string'||!text.trim()||text.length>CUSTOM_SVG_MAX_BYTES)return null;
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement?.localName!=='svg')return null;
  const root=doc.documentElement;
  const blocked='script,foreignObject,iframe,object,embed,image,feImage,audio,video,link,style,animate,animateMotion,animateTransform,set';
  root.querySelectorAll(blocked).forEach(x=>x.remove());
  const all=[root,...root.querySelectorAll('*')];
  if(all.length>CUSTOM_SVG_MAX_ELEMENTS)return null;
  for(const el of all){
    [...el.attributes].forEach(attr=>{
      const name=attr.name.toLowerCase(),value=attr.value.trim();
      if(name.startsWith('on'))el.removeAttribute(attr.name);
      else if(name==='href'||name==='xlink:href'){
        if(!value.startsWith('#'))el.removeAttribute(attr.name);
      }else if(/url\s*\(/i.test(value)&&!/url\s*\(\s*#[\w:.-]+\s*\)/i.test(value)){
        el.removeAttribute(attr.name);
      }
    });
  }
  return root;
}
function customDesignCollectColors(root){
  const counts=new Map(),order=[];
  const add=hex=>{if(!hex)return;if(!counts.has(hex)){counts.set(hex,0);order.push(hex)}counts.set(hex,counts.get(hex)+1)};
  for(const el of [root,...root.querySelectorAll('*')]){
    add(customDesignColorToHex(el.getAttribute('fill')));
    add(customDesignColorToHex(el.getAttribute('stroke')));
    const style=el.getAttribute('style');
    if(style&&!/url\s*\(/i.test(style)){add(customDesignStyleColor(style,'fill'));add(customDesignStyleColor(style,'stroke'))}
  }
  return order.map((hex,index)=>({hex,count:counts.get(hex),index}))
    .sort((a,b)=>b.count-a.count||a.index-b.index).slice(0,12);
}
function customDesignRoleColor(role){
  return role==='base'?palette.base:role==='structure'?palette.structure:role==='accent'?palette.accent:null;
}
function customDesignReplaceStyle(styleText,source,target){
  return String(styleText||'').replace(/(?:^|;)\s*(fill|stroke)\s*:\s*([^;]+)/gi,(whole,prop,value)=>{
    const lead=whole.startsWith(';')?';':'';
    return customDesignColorToHex(value)===source?lead+prop+':'+target:whole;
  });
}
function customDesignRecoloredRoot(){
  if(!customDesignSvgRoot)return null;
  const clone=customDesignSvgRoot.cloneNode(true);
  for(const el of [clone,...clone.querySelectorAll('*')]){
    for(const attrName of ['fill','stroke']){
      const value=el.getAttribute(attrName),source=customDesignColorToHex(value),role=source&&customDesignMappings.get(source),target=customDesignRoleColor(role);
      if(target)el.setAttribute(attrName,target);
    }
    const style=el.getAttribute('style');
    if(style&&!/url\s*\(/i.test(style)){
      let next=style;
      for(const [source,role] of customDesignMappings){
        const target=customDesignRoleColor(role);if(target)next=customDesignReplaceStyle(next,source,target);
      }
      el.setAttribute('style',next);
    }
  }
  clone.removeAttribute('width');clone.removeAttribute('height');
  clone.setAttribute('preserveAspectRatio',clone.getAttribute('preserveAspectRatio')||'xMidYMid meet');
  return clone;
}
function renderCustomDesignPreview(){
  const host=document.querySelector('#customDesignPreview');if(!host)return;
  if(!customDesignSvgRoot){host.innerHTML='<div class="cdp-empty">載入 flat-color SVG，直接看目前三色如何進入你的作品。</div>';return}
  const clone=customDesignRecoloredRoot();host.innerHTML='';if(clone)host.appendChild(document.importNode(clone,true));
  const label=document.querySelector('#customDesignFileLabel');if(label)label.textContent=customDesignFileName||'SVG';
}
function renderCustomDesignMappings(){
  const host=document.querySelector('#customDesignMappings');if(!host)return;
  if(!customDesignSourceColors.length){host.innerHTML='';return}
  host.innerHTML=customDesignSourceColors.map(item=>{
    const current=customDesignMappings.get(item.hex)||'keep';
    return '<label class="cdp-map-row"><i style="background:'+item.hex+'"></i><code>'+item.hex+'</code><span>'+item.count+'×</span><select data-custom-map="'+item.hex+'" aria-label="'+item.hex+' 映射角色">'+
      [['keep','保留原色'],['base','Base 75'],['structure','Structure 18'],['accent','Accent 7']].map(([value,label])=>'<option value="'+value+'"'+(value===current?' selected':'')+'>'+label+'</option>').join('')+
    '</select></label>';
  }).join('');
}
async function loadCustomDesignFile(file){
  if(!file||file.size>CUSTOM_SVG_MAX_BYTES){toast('SVG 檔案需小於 1.5 MB');return false}
  let text='';try{text=await file.text()}catch(_){toast('無法讀取 SVG');return false}
  const root=sanitizeCustomSvg(text);
  if(!root){toast('SVG 無法安全解析');return false}
  const colors=customDesignCollectColors(root);
  if(!colors.length){toast('找不到可映射的實色 fill / stroke');return false}
  customDesignSvgRoot=root;customDesignSourceColors=colors;customDesignFileName=file.name||'design.svg';customDesignMappings=new Map();
  const defaults=['base','structure','accent'];
  colors.slice(0,3).forEach((item,i)=>customDesignMappings.set(item.hex,defaults[i]));
  colors.slice(3).forEach(item=>customDesignMappings.set(item.hex,'keep'));
  renderCustomDesignMappings();renderCustomDesignPreview();
  toast('SVG 已在本機載入');
  return true;
}
function customDesignLoaded(){return !!customDesignSvgRoot}
function ensureCustomDesignUi(){
  if(document.querySelector('#customDesignDetails'))return;
  const anchor=document.querySelector('.real-preview-wrap');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend','<details class="custom-design-lab" id="customDesignDetails"><summary><span><b>Your Design / SVG</b><small>本機預覽 · 不上傳 · 不改 Compose</small></span><span class="cdp-mark" aria-hidden="true">＋</span></summary>'+
    '<div class="cdp-body"><div class="cdp-toolbar"><div><strong id="customDesignFileLabel">尚未載入</strong><span>支援 flat fill / stroke SVG · 最大 1.5 MB</span></div><button type="button" id="customDesignChoose">載入 SVG</button><input id="customDesignInput" type="file" accept=".svg,image/svg+xml" hidden></div>'+
    '<div class="cdp-preview" id="customDesignPreview"><div class="cdp-empty">載入 flat-color SVG，直接看目前三色如何進入你的作品。</div></div><div class="cdp-map" id="customDesignMappings"></div>'+
    '<p class="cdp-note">前三個主要來源色預設映射為 Base / Structure / Accent；你可以逐色改為保留。預覽永遠使用目前 exact source palette。</p></div></details>');
  const input=document.querySelector('#customDesignInput');
  document.querySelector('#customDesignChoose')?.addEventListener('click',()=>input?.click());
  input?.addEventListener('change',async()=>{const file=input.files?.[0];if(file)await loadCustomDesignFile(file);input.value=''});
  document.querySelector('#customDesignMappings')?.addEventListener('change',event=>{
    const select=event.target.closest?.('[data-custom-map]');if(!select||!CUSTOM_SVG_ROLES.includes(select.value))return;
    customDesignMappings.set(select.dataset.customMap,select.value);renderCustomDesignPreview();
  });
  document.querySelector('#customDesignDetails')?.addEventListener('toggle',event=>{if(event.currentTarget.open)renderCustomDesignPreview()});
}
ensureCustomDesignUi();
