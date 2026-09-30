/* Color Lab V2.20.0 local runtime
   Professional Handoff + Palette Validation + Context Preview.
   No network/runtime dependencies. Source palette remains authoritative. */

const VALIDATION_ROLES=[['base','Base'],['structure','Structure'],['accent','Accent']];
const ROLE_RATIOS={base:75,structure:18,accent:7};
let accessibilityPreview=null;
function contrastGrade(r){return r>=7?['aaa','AAA']:r>=4.5?['aa','AA']:r>=3?['large','大字/UI']:['fail','Accent/裝飾']}
function nearestAccessibleColor(fg,bg,target=4.5){
  const current=normHex(fg),back=normHex(bg);if(!current||!back)return null;
  const initial=contrastRatio(current,back);
  if(initial>=target)return{color:current,ratio:initial,distance:0};
  const o=toOKLCH(current),candidates=[];
  for(const endpoint of [0,1]){
    let lo=0,hi=null;
    for(let i=1;i<=48;i++){
      const t=i/48;
      const color=gamutMapOKLCH(o.l+(endpoint-o.l)*t,o.c,o.h);
      if(contrastRatio(color,back)>=target){lo=(i-1)/48;hi=t;break}
    }
    if(hi==null)continue;
    for(let i=0;i<20;i++){
      const mid=(lo+hi)/2;
      const color=gamutMapOKLCH(o.l+(endpoint-o.l)*mid,o.c,o.h);
      if(contrastRatio(color,back)>=target)hi=mid;else lo=mid;
    }
    const color=gamutMapOKLCH(o.l+(endpoint-o.l)*hi,o.c,o.h);
    const ratio=contrastRatio(color,back);
    if(ratio>=target)candidates.push({color,ratio,distance:perceptualDistance(current,color)});
  }
  if(!candidates.length){
    for(const color of ['#000000','#FFFFFF']){
      const ratio=contrastRatio(color,back);
      if(ratio>=target)candidates.push({color,ratio,distance:perceptualDistance(current,color)});
    }
  }
  candidates.sort((a,b)=>a.distance-b.distance||Math.abs(a.ratio-target)-Math.abs(b.ratio-target));
  return candidates[0]||null;
}
function paletteValidationData(theme='original'){
  const colors=theme==='dark'?previewThemePalette('dark'):{...palette,derived:false};
  const pairs=[['base','structure'],['base','accent'],['structure','accent']].map(([a,b])=>({a,b,ratio:contrastRatio(colors[a],colors[b])}));
  return{colors,pairs,normal:pairs.filter(x=>x.ratio>=4.5).length,large:pairs.filter(x=>x.ratio>=3).length};
}
function validationPair(d,a,b){return d.pairs.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a))}
function accessibilityChangeRole(a,b){return ROLE_RATIOS[a]<=ROLE_RATIOS[b]?a:b}
function accessibilityFixes(d){
  if(validationTheme!=='original')return[];
  return d.pairs.filter(x=>x.ratio<4.5).map(pair=>{
    const role=accessibilityChangeRole(pair.a,pair.b),fixed=role===pair.a?pair.b:pair.a;
    const suggestion=nearestAccessibleColor(d.colors[role],d.colors[fixed],4.5);
    return suggestion?{...pair,role,fixed,current:d.colors[role],fixedColor:d.colors[fixed],suggestion}:null;
  }).filter(Boolean);
}
function setValidationTheme(next){
  if(!['original','dark'].includes(next))return;
  validationTheme=next;accessibilityPreview=null;renderPaletteValidation();
}
function previewAccessibilitySuggestion(role,color){
  const h=normHex(color);if(!h||!ROLE_RATIOS[role])return;
  accessibilityPreview=accessibilityPreview?.role===role&&accessibilityPreview?.color===h?null:{role,color:h};
  renderPaletteValidation();
}
function applyAccessibilitySuggestion(role,color){
  const h=normHex(color),idx=role==='base'?0:role==='structure'?1:role==='accent'?2:-1;
  if(!h||idx<0)return;
  if(lockedSlots[idx]&&selectedColors[idx]&&selectedColors[idx]!==h){toast('先解除這個角色的鎖定');return}
  const next=[palette.base,palette.structure,palette.accent];next[idx]=h;
  selectedColors=next;activeSlot=idx;seed=h;accessibilityPreview=null;
  resetRoleCandidateSessions();syncEditor();generate(false);rememberColor(h);pushHistory();
  toast('已套用 '+VALIDATION_ROLES[idx][1]+' AA 建議');
}
function renderAccessibilityFixes(d){
  const host=$('#accessibilityFixes');if(!host)return;
  if(validationTheme==='dark'){
    host.innerHTML='<div class="accessibility-note">Dark 為衍生預覽，不直接改原色。切回 Light / 原色可取得可套用建議。</div>';
    return;
  }
  const fixes=accessibilityFixes(d);
  if(!fixes.length){
    accessibilityPreview=null;
    host.innerHTML='<div class="accessibility-note good">三組角色都已達 AA 一般文字門檻。</div>';
    return;
  }
  let preview='';
  if(accessibilityPreview){
    const p={base:palette.base,structure:palette.structure,accent:palette.accent,[accessibilityPreview.role]:accessibilityPreview.color};
    preview='<div class="accessibility-preview"><div class="accessibility-preview-head"><strong>套用前預覽</strong><span>只比較，不改原色</span><button type="button" class="text-action" data-accessibility-clear>取消</button></div><div class="accessibility-preview-strip" aria-label="75 18 7 建議配色預覽"><i style="background:'+p.base+'"></i><i style="background:'+p.structure+'"></i><i style="background:'+p.accent+'"></i></div></div>';
  }
  host.innerHTML=preview+fixes.map(f=>{
    const roleLabel=VALIDATION_ROLES.find(x=>x[0]===f.role)?.[1]||f.role;
    return '<div class="accessibility-fix"><div class="accessibility-fix-head"><strong>'+roleLabel+' 建議</strong><span>'+f.ratio.toFixed(1)+':1 → '+f.suggestion.ratio.toFixed(1)+':1</span></div><div class="accessibility-fix-values"><span><i style="background:'+f.current+'"></i>目前 '+f.current+'</span><span>→</span><span><i style="background:'+f.suggestion.color+'"></i>建議 '+f.suggestion.color+'</span></div><div class="accessibility-fix-actions"><button type="button" class="text-action" data-accessibility-preview="'+f.role+'" data-accessibility-color="'+f.suggestion.color+'">預覽</button><button type="button" class="text-action" data-accessibility-apply="'+f.role+'" data-accessibility-color="'+f.suggestion.color+'">套用建議</button></div></div>';
  }).join('');
}
function renderPaletteValidation(){
  const host=$('#accessibilityMatrix'),summary=$('#validationSummary');if(!host||!summary)return;
  const d=paletteValidationData(validationTheme);
  $$('#validationThemeModes [data-validation-theme]').forEach(b=>{const on=b.dataset.validationTheme===validationTheme;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  summary.innerHTML='<span><strong>'+d.normal+' / 3</strong> 組可作一般文字</span><span><strong>'+d.large+' / 3</strong> 組達 3:1</span>';
  const head='<thead><tr><th scope="col">文字 ↓ / 背景 →</th>'+VALIDATION_ROLES.map(x=>'<th scope="col">'+x[1]+'</th>').join('')+'</tr></thead>';
  const body='<tbody>'+VALIDATION_ROLES.map(row=>'<tr><th scope="row" class="row-head">'+row[1]+'</th>'+VALIDATION_ROLES.map(col=>{if(row[0]===col[0])return'<td>—</td>';const p=validationPair(d,row[0],col[0]),g=contrastGrade(p.ratio);return'<td class="validation-cell '+g[0]+'"><strong>'+p.ratio.toFixed(1)+':1</strong><span>'+g[1]+'</span></td>'}).join('')+'</tr>').join('')+'</tbody>';
  host.innerHTML='<table class="validation-table" aria-label="三色對比矩陣">'+head+body+'</table>';
  renderAccessibilityFixes(d);
}

function paletteText(){
  const name=($('#comboName')?.value||currentComboName||'Color Lab 配色').trim()||'Color Lab 配色';
  return name+'\nBase '+palette.base+'\nStructure '+palette.structure+'\nAccent '+palette.accent;
}
function paletteArtifactBase(){
  const name=($('#comboName')?.value||currentComboName||'Color Lab 配色').trim()||'Color Lab 配色';
  return{name,palette:{base:palette.base,structure:palette.structure,accent:palette.accent},ratios:{base:75,structure:18,accent:7}};
}
function artifactHexRgb(hex){
  const h=String(hex||'').replace('#','');
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
}
function artifactSwiftColor(hex){
  const [r,g,b]=artifactHexRgb(hex).map(v=>(v/255).toFixed(6));
  return 'Color(red: '+r+', green: '+g+', blue: '+b+')';
}
function artifactXmlEscape(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
}
function paletteArtifact(kind){
  const data=paletteArtifactBase();
  const safe=(data.name.replace(/[^\w\u4e00-\u9fff-]+/g,'-')||'color-lab').slice(0,40);
  if(kind==='css'){
    const text='/* '+data.name+' · Color Lab 75 / 18 / 7 */\n:root {\n  --color-base: '+data.palette.base+';\n  --color-structure: '+data.palette.structure+';\n  --color-accent: '+data.palette.accent+';\n  --color-base-ratio: 75%;\n  --color-structure-ratio: 18%;\n  --color-accent-ratio: 7%;\n}\n';
    return{name:safe+'.css',type:'text/css',text};
  }
  if(kind==='tokens'){
    const payload={format:'color-lab-design-tokens-v1',name:data.name,color:{
      base:{$type:'color',$value:data.palette.base,$description:'75% Base / Calm'},
      structure:{$type:'color',$value:data.palette.structure,$description:'18% Structure / Order'},
      accent:{$type:'color',$value:data.palette.accent,$description:'7% Accent / Focus'}
    },ratio:{base:75,structure:18,accent:7}};
    return{name:safe+'.tokens.json',type:'application/json',text:JSON.stringify(payload,null,2)+'\n'};
  }
  if(kind==='tailwind'){
    const text='// '+data.name+' · Color Lab 75 / 18 / 7\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        base: \''+data.palette.base+'\',\n        structure: \''+data.palette.structure+'\',\n        accent: \''+data.palette.accent+'\'\n      }\n    }\n  }\n};\n';
    return{name:safe+'.tailwind.js',type:'text/javascript',text};
  }
  if(kind==='swiftui'){
    const text='// '+data.name+' · Color Lab 75 / 18 / 7\nimport SwiftUI\n\nextension Color {\n  static let paletteBase = '+artifactSwiftColor(data.palette.base)+' // 75%\n  static let paletteStructure = '+artifactSwiftColor(data.palette.structure)+' // 18%\n  static let paletteAccent = '+artifactSwiftColor(data.palette.accent)+' // 7%\n}\n';
    return{name:safe+'.swift',type:'text/plain',text};
  }
  if(kind==='scss'){
    const text='// '+data.name+' · Color Lab 75 / 18 / 7\n'+
      '$color-base: '+data.palette.base+'; // 75% Base / Calm\n'+
      '$color-structure: '+data.palette.structure+'; // 18% Structure / Order\n'+
      '$color-accent: '+data.palette.accent+'; // 7% Accent / Focus\n';
    return{name:safe+'.scss',type:'text/x-scss',text};
  }
  if(kind==='flutter'){
    const text='// '+data.name+' · Color Lab 75 / 18 / 7\n'+
      "import 'package:flutter/material.dart';\n\n"+
      'abstract final class ColorLabPalette {\n'+
      '  static const Color base = Color(0xFF'+data.palette.base.slice(1)+'); // 75%\n'+
      '  static const Color structure = Color(0xFF'+data.palette.structure.slice(1)+'); // 18%\n'+
      '  static const Color accent = Color(0xFF'+data.palette.accent.slice(1)+'); // 7%\n'+
      '}\n';
    return{name:safe+'.dart',type:'text/plain',text};
  }
  if(kind==='jetpack'){
    const text='// '+data.name+' · Color Lab 75 / 18 / 7\n'+
      'import androidx.compose.ui.graphics.Color\n\n'+
      'val ColorLabBase = Color(0xFF'+data.palette.base.slice(1)+') // 75%\n'+
      'val ColorLabStructure = Color(0xFF'+data.palette.structure.slice(1)+') // 18%\n'+
      'val ColorLabAccent = Color(0xFF'+data.palette.accent.slice(1)+') // 7%\n';
    return{name:safe+'.kt',type:'text/plain',text};
  }
  if(kind==='svg'){
    const title=artifactXmlEscape(data.name);
    const baseText=textFor(data.palette.base),structureText=textFor(data.palette.structure),accentText=textFor(data.palette.accent);
    const text='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">\n'+
      '  <title id="title">'+title+' · Color Lab</title>\n'+
      '  <desc id="desc">75 percent Base, 18 percent Structure, 7 percent Accent palette sheet.</desc>\n'+
      '  <rect width="1200" height="720" fill="#F3EFE8"/>\n'+
      '  <text x="72" y="82" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#242624">COLOR LAB · 75 / 18 / 7</text>\n'+
      '  <text x="72" y="132" font-family="system-ui, sans-serif" font-size="38" font-weight="700" fill="#242624">'+title+'</text>\n'+
      '  <rect x="72" y="190" width="792" height="360" rx="24" fill="'+data.palette.base+'"/>\n'+
      '  <rect x="864" y="190" width="190" height="360" fill="'+data.palette.structure+'"/>\n'+
      '  <rect x="1054" y="190" width="74" height="360" rx="0" fill="'+data.palette.accent+'"/>\n'+
      '  <text x="96" y="230" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="'+baseText+'">75 · BASE</text>\n'+
      '  <text x="888" y="230" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="'+structureText+'">18</text>\n'+
      '  <text x="1070" y="230" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="'+accentText+'">7</text>\n'+
      '  <text x="72" y="620" font-family="ui-monospace, monospace" font-size="22" fill="#242624">BASE '+data.palette.base+'   STRUCTURE '+data.palette.structure+'   ACCENT '+data.palette.accent+'</text>\n'+
      '</svg>\n';
    return{name:safe+'.palette.svg',type:'image/svg+xml',text};
  }
  const payload={schema:'color-lab-palette-v1',...data};
  return{name:safe+'.json',type:'application/json',text:JSON.stringify(payload,null,2)+'\n'};
}
function initCrossPlatformHandoff(){
  const host=document.querySelector('#handoffMore .handoff-more-actions');if(!host)return;
  [['scss','SCSS'],['flutter','Flutter'],['jetpack','Jetpack']].forEach(([kind,label])=>{
    if(host.querySelector('[data-export-format="'+kind+'"]'))return;
    const button=document.createElement('button');button.type='button';button.className='utility-btn';
    button.dataset.exportFormat=kind;button.textContent=label;host.appendChild(button);
  });
}
async function exportPaletteArtifact(kind){
  const artifact=paletteArtifact(kind);
  const file=new File([artifact.text],artifact.name,{type:artifact.type});
  if(navigator.canShare?.({files:[file]})&&navigator.share){
    try{await navigator.share({files:[file],title:'Color Lab '+kind.toUpperCase()});return}catch(e){if(e?.name==='AbortError')return}
  }
  const blob=new Blob([artifact.text],{type:artifact.type}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=artifact.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  toast('已輸出 '+kind.toUpperCase());
}
async function sharePalette(){
  const text=paletteText();
  if(navigator.share){
    try{await navigator.share({title:'Color Lab 配色',text});return}catch(e){if(e?.name==='AbortError')return}
  }
  try{await navigator.clipboard.writeText(text);toast('已複製分享內容')}catch(_){toast('無法分享')}
}

function previewThemePalette(theme=previewTheme){
  if(theme!=='dark')return{...palette,derived:false};
  const b=toOKLCH(palette.base),s=toOKLCH(palette.structure);
  return{
    base:gamutMapOKLCH(clamp(Math.min(.22,b.l*.28),.08,.22),Math.min(b.c*.62,.08),b.h),
    structure:gamutMapOKLCH(clamp(Math.max(.84,.76+s.l*.18),.84,.96),Math.min(s.c*.55,.07),s.h),
    accent:palette.accent,
    derived:true
  };
}
function setPreviewTheme(next){
  if(!['light','dark'].includes(next))return;
  const changed=next!==previewTheme;
  previewTheme=next;
  if(changed){
    try{localStorage.setItem('colorlab.previewTheme',previewTheme)}catch(_){}
  }
  renderContextPreview();
}
function renderContextPreview(){
  const host=$('#uiPreview');if(!host)return;
  $$('#contextTabs [data-context]').forEach(b=>b.classList.toggle('active',b.dataset.context===previewContext));
  $$('#contextThemeModes [data-preview-theme]').forEach(b=>{
    const active=b.dataset.previewTheme===previewTheme;
    b.classList.toggle('active',active);b.setAttribute('aria-pressed',active?'true':'false');
  });
  const themed=['app','brand','slides'].includes(previewContext);
  const sourceP=themed?previewThemePalette():{...palette,derived:false};
  const p=typeof visionContextPalette==='function'?visionContextPalette(sourceP,visionMode):sourceP;
  const note=$('#contextThemeNote');
  const visionActive=typeof VISION_MODE_META!=='undefined'&&visionMode!=='normal';
  if(note){
    if(visionActive){
      const visionLabel=VISION_MODE_META[visionMode]?.short||'色覺';
      note.textContent=visionLabel+'近似模擬 · '+(sourceP.derived?'Dark 預覽 · ':'')+'原色不變';
    }else{
      note.textContent=!themed?'原色情境 · 75 / 18 / 7':sourceP.derived?'Dark 預覽變體 · 不改原色':'使用目前三色 · 75 / 18 / 7';
    }
  }
  const labels={app:'App / Web',brand:'品牌',room:'室內',outfit:'穿搭',slides:'簡報'};
  host.className='real-preview';
  host.removeAttribute('style');
  host.setAttribute('role','img');
  host.setAttribute('aria-label',(labels[previewContext]||'配色')+'情境預覽，依 75 / 18 / 7 '+(visionActive?'顯示'+(VISION_MODE_META[visionMode]?.short||'色覺')+'近似模擬':'使用目前配色'));

  if(previewContext==='app'){
    const baseText=textFor(p.base),structureText=textFor(p.structure),accentText=textFor(p.accent);
    host.style.background=p.base;host.style.color=baseText;
    host.innerHTML='<div class="cp2 cp2-app" aria-hidden="true" style="background:'+p.base+';color:'+baseText+'">'+
      '<aside class="cp2-app-rail" style="background:'+p.structure+';color:'+structureText+'"><div class="cp2-app-logo" style="background:'+p.accent+';color:'+accentText+'">CL</div><div class="cp2-app-navline" style="background:'+structureText+'"></div><div class="cp2-app-navline short" style="background:'+structureText+'"></div><div class="cp2-app-navline" style="background:'+structureText+'"></div><div class="cp2-app-navline short" style="background:'+structureText+'"></div></aside>'+
      '<div class="cp2-app-main"><div class="cp2-app-top"><small>Workspace / Overview</small><div class="cp2-app-user" style="background:'+p.structure+';color:'+structureText+'">SY</div></div>'+
      '<section class="cp2-app-hero" style="border:1px solid '+p.structure+'33"><div><small class="muted">PRODUCT SYSTEM</small><h4>顏色進入真實介面後，層級才看得出來。</h4><p class="muted">Base 承載空間，Structure 建立閱讀秩序，Accent 只負責主要動作。</p></div><span class="cp2-app-cta" style="background:'+p.accent+';color:'+accentText+'">Create report</span></section>'+
      '<div class="cp2-app-grid"><div class="cp2-app-card" style="background:'+p.structure+';color:'+structureText+'"><small>Monthly usage</small><strong>72%</strong><span class="muted" style="font-size:9px">Structure 承擔資訊密度</span></div>'+
      '<div class="cp2-app-card" style="border:1px solid '+p.structure+'33"><small>Recent activity</small><div class="cp2-task" style="border-color:'+p.structure+'22"><i style="background:'+p.accent+'"></i><span>Palette approved</span><b>Now</b></div><div class="cp2-task" style="border-color:'+p.structure+'22"><i style="background:'+p.structure+'"></i><span>Tokens exported</span><b>8m</b></div></div></div></div></div>';
  }else if(previewContext==='brand'){
    const baseText=textFor(p.base),structureText=textFor(p.structure),accentText=textFor(p.accent);
    host.style.background=p.base;host.style.color=baseText;
    host.innerHTML='<div class="cp2 cp2-brand" aria-hidden="true" style="background:'+p.base+';color:'+baseText+'">'+
      '<div class="cp2-brand-left"><div class="cp2-brand-poster" style="background:'+p.base+';border:1px solid '+p.structure+'33"><div class="cp2-brand-mark" style="color:'+p.structure+'">Q/O</div><div><small>OBJECTS FOR DAILY LIFE</small><h4>Quiet Objects</h4><p class="muted">一個品牌不只需要 Logo 色，而需要可以維持比例與層級的色彩系統。</p></div></div><div class="cp2-brand-strip"><i style="background:'+p.base+'"></i><i style="background:'+p.structure+'"></i><i style="background:'+p.accent+'"></i></div></div>'+
      '<div class="cp2-brand-right"><div class="cp2-brand-pack" style="background:'+p.structure+';color:'+structureText+'"><strong>Q/O — 01</strong><span>Packaging / 250 ml</span><span style="display:inline-block;margin-top:12px;padding:5px 7px;border-radius:999px;background:'+p.accent+';color:'+accentText+'">SIGNATURE</span></div>'+
      '<div class="cp2-brand-card" style="background:'+p.accent+';color:'+accentText+'"><span>Social / Campaign</span><b>MAKE<br>LESS<br>MATTER</b><span>75 / 18 / 7 system</span></div></div></div>';
  }else if(previewContext==='room'){
    host.style.background='transparent';host.style.padding='0';
    host.innerHTML='<div class="cp2 cp2-room" aria-hidden="true">'+
      '<div class="cp2-room-wall" style="background:'+p.base+'"></div><div class="cp2-room-floor" style="background:'+p.structure+'"></div>'+
      '<div class="cp2-room-window"></div><div class="cp2-room-sofa" style="background:'+p.structure+'"></div><div class="cp2-room-art" style="background:'+p.accent+'"></div>'+
      '<div class="cp2-room-table"></div><div class="cp2-room-vase" style="background:'+p.accent+'"></div><span class="cp2-room-note">牆 75 · 家具 18 · 點綴 7</span></div>';
  }else if(previewContext==='outfit'){
    const baseText=textFor(p.base);
    host.style.background=p.base;host.style.color=baseText;
    host.innerHTML='<div class="cp2 cp2-outfit" aria-hidden="true" style="background:'+p.base+';color:'+baseText+'">'+
      '<div class="cp2-outfit-copy"><div><small>LOOK / 01</small><h4>比例比單色更接近穿搭。</h4><p class="muted">主體色形成整體印象，Structure 負責輪廓，Accent 留給包袋與小面積焦點。</p></div><div class="cp2-outfit-ratio"><i style="background:'+p.base+'"></i><i style="background:'+p.structure+'"></i><i style="background:'+p.accent+'"></i></div></div>'+
      '<div class="cp2-look"><div class="cp2-look-head"></div><div class="cp2-look-top" style="background:'+p.base+';box-shadow:inset 0 0 0 1px '+p.structure+'44"></div><div class="cp2-look-bottom" style="background:'+p.structure+'"></div><div class="cp2-look-bag" style="background:'+p.accent+';color:'+p.accent+'"></div><div class="cp2-look-shoe" style="background:'+p.structure+'"></div></div></div>';
  }else{
    const baseText=textFor(p.base),structureText=textFor(p.structure),accentText=textFor(p.accent);
    host.style.background=p.structure;host.style.color=structureText;
    host.innerHTML='<div class="cp2 cp2-slide" aria-hidden="true" style="background:'+p.structure+';color:'+structureText+'">'+
      '<section class="cp2-slide-main" style="background:'+p.base+';color:'+baseText+'"><div><small>STRATEGY / 2027</small><h4>Color creates hierarchy before decoration.</h4><p class="muted">標題、圖表、註解與留白共同建立簡報節奏。</p></div><div class="cp2-slide-bars"><i style="height:36%;background:'+p.structure+'"></i><i style="height:58%;background:'+p.structure+'"></i><i style="height:86%;background:'+p.accent+'"></i><i style="height:64%;background:'+p.structure+'"></i></div></section>'+
      '<aside class="cp2-slide-side" style="background:'+p.structure+';color:'+structureText+'"><div><small>PAGE</small><div class="cp2-slide-num">07</div></div><div><b>Key signal</b><span class="muted">Accent 只標示需要被記住的資訊。</span><span style="display:block;width:20px;height:20px;border-radius:50%;margin-top:9px;background:'+p.accent+';color:'+accentText+'"></span></div></aside></div>';
  }
}
document.addEventListener('click',event=>{
  const preview=event.target.closest?.('[data-accessibility-preview]');
  if(preview){previewAccessibilitySuggestion(preview.dataset.accessibilityPreview,preview.dataset.accessibilityColor);return}
  const apply=event.target.closest?.('[data-accessibility-apply]');
  if(apply){applyAccessibilitySuggestion(apply.dataset.accessibilityApply,apply.dataset.accessibilityColor);return}
  if(event.target.closest?.('[data-accessibility-clear]')){accessibilityPreview=null;renderPaletteValidation()}
});
