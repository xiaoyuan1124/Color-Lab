/* Color Lab V2.14.0 local runtime
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
  const payload={schema:'color-lab-palette-v1',...data};
  return{name:safe+'.json',type:'application/json',text:JSON.stringify(payload,null,2)+'\n'};
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
  const p=themed?previewThemePalette():{...palette,derived:false};
  const note=$('#contextThemeNote');
  if(note)note.textContent=!themed?'此情境維持原色':p.derived?'Dark 預覽變體 · 不改原色':'使用目前三色';
  host.className='real-preview';
  host.removeAttribute('style');
  if(previewContext==='app'){
    host.style.background=p.base;host.style.color=p.structure;
    host.innerHTML='<div class="preview-app-shell"><div class="preview-app-nav"><span>COLOR LAB / UI</span><i style="background:'+p.accent+'"></i></div><div class="preview-app-hero"><div class="mock-kicker">PRODUCT PREVIEW</div><div class="mock-title">讓顏色真的進入介面</div><div class="mock-copy">檢查背景、文字、卡片與主要動作，而不只看色票。</div></div><div class="preview-app-grid"><div class="preview-app-card"><b>Structure</b><span>層級與閱讀</span></div><div class="preview-app-card"><b>Accent</b><button class="mock-cta" type="button" style="margin-top:4px;background:'+p.accent+';color:'+textFor(p.accent)+'">主要動作</button></div></div></div>';
  }else if(previewContext==='brand'){
    host.style.background=p.base;host.style.color=p.structure;
    host.innerHTML='<div><div class="preview-brand-logo">STUDIO / 01</div><div class="preview-brand-name">Quiet Objects</div></div><div class="mock-row"><div class="mock-copy">Brand system</div><div class="mock-dot" style="background:'+p.accent+'"></div></div>';
  }else if(previewContext==='room'){
    host.style.background='transparent';host.style.padding='0';
    host.innerHTML='<div class="preview-room"><div class="room-wall" style="background:'+p.base+'"></div><div class="room-floor" style="background:'+p.structure+'"></div><div class="room-sofa" style="background:'+p.structure+'"></div><div class="room-art" style="background:'+p.accent+'"></div></div>';
  }else if(previewContext==='outfit'){
    host.style.background=p.base;host.style.color=p.structure;
    host.innerHTML='<div class="preview-outfit"><div class="outfit-body"><div class="outfit-top" style="background:'+p.base+';box-shadow:0 0 0 1px '+p.structure+'33"></div><div class="outfit-bottom" style="background:'+p.structure+'"></div></div><div class="outfit-accent" style="background:'+p.accent+'"></div></div>';
  }else{
    host.style.background=p.structure;host.style.color=textFor(p.structure);
    host.innerHTML='<div class="preview-slide" style="background:'+p.base+';color:'+p.structure+'"><div><div class="slide-title">色彩讓重點被看見</div><div class="slide-line" style="background:'+p.structure+'"></div><div class="slide-line short" style="background:'+p.structure+'"></div></div><div class="mock-row"><span class="mock-kicker">PRESENTATION</span><div class="mock-dot" style="background:'+p.accent+'"></div></div></div>';
  }
}

document.addEventListener('click',event=>{
  const preview=event.target.closest?.('[data-accessibility-preview]');
  if(preview){previewAccessibilitySuggestion(preview.dataset.accessibilityPreview,preview.dataset.accessibilityColor);return}
  const apply=event.target.closest?.('[data-accessibility-apply]');
  if(apply){applyAccessibilitySuggestion(apply.dataset.accessibilityApply,apply.dataset.accessibilityColor);return}
  if(event.target.closest?.('[data-accessibility-clear]')){accessibilityPreview=null;renderPaletteValidation()}
});
