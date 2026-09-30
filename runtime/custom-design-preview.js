const CUSTOM_SVG_MAX_BYTES=1024*1024;
const CUSTOM_SVG_MAX_ELEMENTS=2500;
const CUSTOM_SVG_ALLOWED_TAGS=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','text','tspan']);
const CUSTOM_SVG_ALLOWED_ATTRS=new Set([
  'xmlns','viewbox','preserveaspectratio','width','height','x','y','x1','y1','x2','y2','cx','cy','r','rx','ry',
  'd','points','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset',
  'fill-rule','clip-rule','opacity','fill-opacity','stroke-opacity','transform','font-size','font-family','font-weight',
  'text-anchor','dominant-baseline','dx','dy','rotate','letter-spacing'
]);
const CUSTOM_SVG_STYLE_ATTRS=new Set(['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset','fill-rule','opacity','fill-opacity','stroke-opacity']);
let customDesignState=null;
let customDesignBound=false;
let customDesignColorCanvas=null;

function customDesignEscape(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function customDesignNormalizeColor(value){
  const raw=String(value||'').trim();
  if(!raw||/^(none|transparent|currentcolor|inherit)$/i.test(raw)||/url\s*\(/i.test(raw))return null;
  if(!customDesignColorCanvas)customDesignColorCanvas=document.createElement('canvas');
  const ctx=customDesignColorCanvas.getContext('2d');
  if(!ctx)return null;
  const sentinel='#010203';
  ctx.fillStyle=sentinel;
  try{ctx.fillStyle=raw}catch(_){return null}
  const parsed=String(ctx.fillStyle||'').trim();
  if(parsed===sentinel&&raw.toLowerCase()!==sentinel)return null;
  const hex=parsed.match(/^#([0-9a-f]{6})$/i);
  if(hex)return('#'+hex[1]).toUpperCase();
  const short=parsed.match(/^#([0-9a-f]{3})$/i);
  if(short)return('#'+short[1].split('').map(x=>x+x).join('')).toUpperCase();
  const rgb=parsed.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if(!rgb)return null;
  if(rgb[4]!=null&&Number(rgb[4])===0)return null;
  const part=n=>Math.max(0,Math.min(255,Math.round(Number(n)))).toString(16).padStart(2,'0');
  return('#'+part(rgb[1])+part(rgb[2])+part(rgb[3])).toUpperCase();
}
function customDesignSafeAttribute(name,value){
  const v=String(value||'').trim();
  if(!v)return false;
  if(/javascript\s*:|data\s*:|url\s*\(/i.test(v))return false;
  if(name==='fill'||name==='stroke')return v.toLowerCase()==='none'||!!customDesignNormalizeColor(v);
  if(['opacity','fill-opacity','stroke-opacity','stroke-width','stroke-dashoffset','font-size','font-weight','letter-spacing'].includes(name)){
    return /^[\d.+\-%\s]+$/.test(v);
  }
  if(['stroke-linecap','stroke-linejoin','fill-rule','clip-rule','text-anchor','dominant-baseline'].includes(name)){
    return /^[a-z-]+$/i.test(v);
  }
  return true;
}
function customDesignApplyStyleAttributes(el,styleText){
  String(styleText||'').split(';').forEach(part=>{
    const colon=part.indexOf(':');if(colon<1)return;
    const name=part.slice(0,colon).trim().toLowerCase();
    const value=part.slice(colon+1).trim();
    if(!CUSTOM_SVG_STYLE_ATTRS.has(name)||!customDesignSafeAttribute(name,value))return;
    el.setAttribute(name,value);
  });
}
function customDesignSanitizeSvg(text){
  if(typeof text!=='string'||!text.trim())throw new Error('SVG 是空白檔案');
  if(new Blob([text]).size>CUSTOM_SVG_MAX_BYTES)throw new Error('SVG 超過 1 MB 上限');
  const doc=new DOMParser().parseFromString(text,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement?.localName?.toLowerCase()!=='svg')throw new Error('不是有效的 SVG');
  const root=doc.documentElement;
  const all=[root,...root.querySelectorAll('*')];
  if(all.length>CUSTOM_SVG_MAX_ELEMENTS)throw new Error('SVG 元件過多，請簡化後再試');
  all.forEach(el=>{
    if(el!==root&&!CUSTOM_SVG_ALLOWED_TAGS.has(el.localName.toLowerCase())){el.remove();return}
    const style=el.getAttribute('style');
    [...el.attributes].forEach(attr=>{
      const name=attr.name.toLowerCase();
      if(name==='style'){el.removeAttribute(attr.name);return}
      if(name.startsWith('on')||!CUSTOM_SVG_ALLOWED_ATTRS.has(name)||!customDesignSafeAttribute(name,attr.value))el.removeAttribute(attr.name);
    });
    if(style)customDesignApplyStyleAttributes(el,style);
    [...el.childNodes].forEach(node=>{
      if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.TEXT_NODE)node.remove();
    });
  });
  root.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const counts=new Map();
  [root,...root.querySelectorAll('*')].forEach(el=>{
    ['fill','stroke'].forEach(name=>{
      const hex=customDesignNormalizeColor(el.getAttribute(name));
      if(hex)counts.set(hex,(counts.get(hex)||0)+1);
    });
  });
  const colors=[...counts.entries()].map(([hex,count])=>({hex,count})).sort((a,b)=>b.count-a.count||a.hex.localeCompare(b.hex));
  if(!colors.length)throw new Error('找不到可替換的 flat fill / stroke 顏色');
  return{markup:new XMLSerializer().serializeToString(root),colors};
}
function customDesignDefaultMapping(colors){
  const roles=['base','structure','accent'],mapping={};
  colors.slice(0,3).forEach((item,i)=>{mapping[item.hex]=roles[i]});
  return mapping;
}
function customDesignMappedMarkup(){
  if(!customDesignState)return'';
  const doc=new DOMParser().parseFromString(customDesignState.markup,'image/svg+xml');
  const root=doc.documentElement;
  [root,...root.querySelectorAll('*')].forEach(el=>{
    ['fill','stroke'].forEach(name=>{
      const source=customDesignNormalizeColor(el.getAttribute(name));
      const role=source&&customDesignState.mapping[source];
      if(role&&palette?.[role])el.setAttribute(name,palette[role]);
    });
  });
  return new XMLSerializer().serializeToString(root);
}
function customDesignMappedRoles(){
  if(!customDesignState)return{};
  const out={};
  Object.entries(customDesignState.mapping).forEach(([source,role])=>{if(role)out[source]=palette?.[role]||null});
  return out;
}
function renderCustomDesignPreview(){
  const status=document.getElementById('customDesignStatus');
  const mappingHost=document.getElementById('customDesignMappings');
  const canvas=document.getElementById('customDesignCanvas');
  const clear=document.getElementById('customDesignClear');
  const exportBtn=document.getElementById('customDesignExport');
  if(!status||!mappingHost||!canvas)return;
  if(!customDesignState){
    status.textContent='尚未載入 SVG · 檔案只在此裝置解析';
    mappingHost.innerHTML='';
    canvas.innerHTML='<div class="cdp-empty">載入 flat-color SVG 後，在這裡直接比較目前 Base / Structure / Accent。</div>';
    if(clear)clear.hidden=true;if(exportBtn)exportBtn.hidden=true;
    return;
  }
  const shown=customDesignState.colors.slice(0,16);
  status.textContent=customDesignState.name+' · '+customDesignState.colors.length+' 個 flat colors · 已安全清洗';
  mappingHost.innerHTML=shown.map(item=>{
    const current=customDesignState.mapping[item.hex]||'keep';
    return '<label class="cdp-map-row"><span class="cdp-source"><i style="background:'+item.hex+'"></i><b>'+item.hex+'</b><small>'+item.count+'×</small></span><select data-custom-design-color="'+item.hex+'" aria-label="'+item.hex+' 對應角色"><option value="keep"'+(current==='keep'?' selected':'')+'>保留原色</option><option value="base"'+(current==='base'?' selected':'')+'>Base 75%</option><option value="structure"'+(current==='structure'?' selected':'')+'>Structure 18%</option><option value="accent"'+(current==='accent'?' selected':'')+'>Accent 7%</option></select></label>';
  }).join('')+(customDesignState.colors.length>shown.length?'<div class="cdp-more">只列出出現次數最高的 16 色，其餘維持原色。</div>':'');
  const mapped=customDesignMappedMarkup();
  const doc=new DOMParser().parseFromString(mapped,'image/svg+xml');
  canvas.innerHTML='';
  if(doc.documentElement?.localName?.toLowerCase()==='svg')canvas.appendChild(document.importNode(doc.documentElement,true));
  if(clear)clear.hidden=false;if(exportBtn)exportBtn.hidden=false;
}
async function customDesignLoadFile(file){
  if(!file)return;
  if(!/\.svg$/i.test(file.name)&&file.type!=='image/svg+xml'){toast('請選擇 SVG 檔');return}
  if(file.size>CUSTOM_SVG_MAX_BYTES){toast('SVG 必須小於 1 MB');return}
  try{
    const parsed=customDesignSanitizeSvg(await file.text());
    customDesignState={name:file.name.replace(/[^\w\-.\u4e00-\u9fff]+/g,' ').trim().slice(0,60)||'design.svg',markup:parsed.markup,colors:parsed.colors,mapping:customDesignDefaultMapping(parsed.colors)};
    renderCustomDesignPreview();toast('SVG 已載入 · 預覽不改原色');
  }catch(error){
    customDesignState=null;renderCustomDesignPreview();toast(error?.message||'SVG 無法解析');
  }
}
function customDesignClear(){
  customDesignState=null;
  const input=document.getElementById('customDesignInput');if(input)input.value='';
  renderCustomDesignPreview();
}
async function customDesignExport(){
  if(!customDesignState)return;
  const safe=(customDesignState.name.replace(/\.svg$/i,'').replace(/[^\w\u4e00-\u9fff-]+/g,'-').replace(/^-+|-+$/g,'')||'color-lab-design').slice(0,48);
  const blob=new Blob([customDesignMappedMarkup()],{type:'image/svg+xml'});
  const file=new File([blob],safe+'-color-lab.svg',{type:'image/svg+xml'});
  if(navigator.canShare?.({files:[file]})&&navigator.share){
    try{await navigator.share({files:[file],title:'Color Lab SVG 預覽'});return}catch(error){if(error?.name==='AbortError')return}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('已輸出安全清洗後的 SVG');
}
function initCustomDesignPreview(){
  if(customDesignBound)return;customDesignBound=true;
  const choose=document.getElementById('customDesignChoose'),input=document.getElementById('customDesignInput');
  const mappings=document.getElementById('customDesignMappings');
  choose?.addEventListener('click',()=>input?.click());
  input?.addEventListener('change',event=>{const file=event.target.files?.[0];if(file)customDesignLoadFile(file);event.target.value=''});
  document.getElementById('customDesignClear')?.addEventListener('click',customDesignClear);
  document.getElementById('customDesignExport')?.addEventListener('click',customDesignExport);
  mappings?.addEventListener('change',event=>{
    const select=event.target.closest?.('[data-custom-design-color]');if(!select||!customDesignState)return;
    const source=select.dataset.customDesignColor,role=select.value;
    if(role==='keep')delete customDesignState.mapping[source];else customDesignState.mapping[source]=role;
    renderCustomDesignPreview();
  });
  renderCustomDesignPreview();
}
