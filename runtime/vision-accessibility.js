/* Color Lab V2.25.0 Accessibility Vision 2.0
   Approximate CVD simulation + role conflict detection + explicit minimal fixes.
   Source palette stays authoritative until the user explicitly applies a suggestion. */

const VISION_ROLE_META={
  base:{label:'Base',ratio:75},
  structure:{label:'Structure',ratio:18},
  accent:{label:'Accent',ratio:7}
};
const VISION_MODE_META={
  normal:{label:'一般視覺',short:'一般'},
  protan:{label:'紅色弱近似模擬',short:'紅色弱'},
  deutan:{label:'綠色弱近似模擬',short:'綠色弱'},
  tritan:{label:'藍色弱近似模擬',short:'藍色弱'}
};
const VISION_CONFLICT_LIMIT=.055;
const VISION_WATCH_LIMIT=.09;
const VISION_FIX_TARGET=.095;
let visionFixPreview=null;

function transformVision(hex,mode){
  if(mode==='normal')return normHex(hex)||hex;
  const matrices={
    protan:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],
    deutan:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],
    tritan:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.3039]]
  };
  const M=matrices[mode],source=normHex(hex);
  if(!M||!source)return source||hex;
  const rgb=hexToRgb(source).map(srgbToLinear);
  const out=M.map(row=>row[0]*rgb[0]+row[1]*rgb[1]+row[2]*rgb[2]).map(linearToSrgb);
  return rgbToHex(...out);
}
function visionPalette(input,mode=visionMode){
  if(!input)return input;
  if(mode==='normal')return{...input,visionDerived:false};
  return{
    ...input,
    base:transformVision(input.base,mode),
    structure:transformVision(input.structure,mode),
    accent:transformVision(input.accent,mode),
    visionDerived:true
  };
}
function visionContextPalette(input,mode=visionMode){
  return visionPalette(input,mode);
}
function visionPairStatus(distance){
  if(distance<VISION_CONFLICT_LIMIT)return{key:'conflict',label:'容易混淆'};
  if(distance<VISION_WATCH_LIMIT)return{key:'watch',label:'差異偏低'};
  return{key:'clear',label:'可辨識'};
}
function visionAnalysis(mode=visionMode,source=palette){
  const original={
    base:normHex(source.base),
    structure:normHex(source.structure),
    accent:normHex(source.accent)
  };
  const perceived=visionPalette(original,mode);
  const pairs=[['base','structure'],['base','accent'],['structure','accent']].map(([a,b])=>{
    const distance=perceptualDistance(perceived[a],perceived[b]);
    return{a,b,distance,status:visionPairStatus(distance)};
  });
  return{mode,original,perceived,pairs};
}
function visionChangeRole(a,b){
  return VISION_ROLE_META[a].ratio<=VISION_ROLE_META[b].ratio?a:b;
}
function visionCandidateDistance(candidate,fixedColor,mode){
  return perceptualDistance(transformVision(candidate,mode),transformVision(fixedColor,mode));
}
function visionMinimalFix(pair,mode=visionMode){
  if(mode==='normal')return null;
  const role=visionChangeRole(pair.a,pair.b);
  const fixed=role===pair.a?pair.b:pair.a;
  const current=normHex(palette[role]),fixedColor=normHex(palette[fixed]);
  if(!current||!fixedColor)return null;
  const currentDistance=visionCandidateDistance(current,fixedColor,mode);
  if(currentDistance>=VISION_FIX_TARGET)return null;
  const o=toOKLCH(current),candidates=[];
  const pushCandidate=(color,method)=>{
    const h=normHex(color);if(!h||h===current)return;
    const distance=visionCandidateDistance(h,fixedColor,mode);
    if(distance<VISION_FIX_TARGET)return;
    candidates.push({
      color:h,method,distance,
      sourceDistance:perceptualDistance(current,h)
    });
  };

  for(const endpoint of [0,1]){
    for(let i=1;i<=72;i++){
      const t=i/72;
      const color=gamutMapOKLCH(o.l+(endpoint-o.l)*t,o.c,o.h);
      if(visionCandidateDistance(color,fixedColor,mode)>=VISION_FIX_TARGET){
        pushCandidate(color,'lightness');
        break;
      }
    }
  }
  if(!candidates.length){
    const hueSteps=[-15,15,-30,30,-45,45,-60,60,-90,90,180];
    const chromaScales=[.8,1,1.15,1.3];
    const lightOffsets=[0,-.08,.08,-.16,.16];
    for(const dh of hueSteps){
      for(const cs of chromaScales){
        for(const dl of lightOffsets){
          pushCandidate(
            gamutMapOKLCH(clamp(o.l+dl,.06,.96),Math.max(.01,o.c*cs),o.h+dh),
            'hue'
          );
        }
      }
    }
  }
  candidates.sort((a,b)=>a.sourceDistance-b.sourceDistance||b.distance-a.distance);
  const suggestion=candidates[0];
  return suggestion?{
    pair,role,fixed,current,fixedColor,
    suggestion,
    before:currentDistance
  }:null;
}
function visionFixes(analysis=visionAnalysis()){
  if(analysis.mode==='normal')return[];
  return analysis.pairs
    .filter(pair=>pair.status.key!=='clear')
    .map(pair=>visionMinimalFix(pair,analysis.mode))
    .filter(Boolean);
}
function visionFixPreviewPalette(){
  const source={base:palette.base,structure:palette.structure,accent:palette.accent};
  if(visionFixPreview&&VISION_ROLE_META[visionFixPreview.role]){
    source[visionFixPreview.role]=visionFixPreview.color;
  }
  return source;
}
function previewVisionSuggestion(role,color){
  const h=normHex(color);
  if(!h||!VISION_ROLE_META[role])return;
  visionFixPreview=visionFixPreview?.role===role&&visionFixPreview?.color===h?null:{role,color:h};
  renderVision();
}
function clearVisionSuggestion(){
  visionFixPreview=null;renderVision();
}
function applyVisionSuggestion(role,color){
  const h=normHex(color);
  const idx=role==='base'?0:role==='structure'?1:role==='accent'?2:-1;
  if(!h||idx<0)return;
  if(lockedSlots[idx]&&selectedColors[idx]&&selectedColors[idx]!==h){
    toast('先解除這個角色的鎖定');return;
  }
  const next=[palette.base,palette.structure,palette.accent];
  next[idx]=h;
  selectedColors=next;activeSlot=idx;seed=h;visionFixPreview=null;
  resetRoleCandidateSessions();syncEditor();generate(false);rememberColor(h);pushHistory();
  toast('已套用 '+VISION_ROLE_META[role].label+' 色覺辨識建議');
}
function setVisionMode(next){
  if(!VISION_MODE_META[next])return;
  visionMode=next;visionFixPreview=null;
  renderVision();
  if(document.getElementById('composeDeepDive')?.open&&document.getElementById('deepApplication')?.open)renderContextPreview();
}
function visionPairName(pair){
  return VISION_ROLE_META[pair.a].label+' ↔ '+VISION_ROLE_META[pair.b].label;
}
function renderVision(){
  const host=document.getElementById('visionPreview');if(!host)return;
  const analysis=visionAnalysis(),mode=VISION_MODE_META[visionMode]||VISION_MODE_META.normal;
  document.querySelectorAll('#visionModes [data-vision]').forEach(button=>{
    const active=button.dataset.vision===visionMode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active?'true':'false');
  });
  const strip='<div class="vision-v2-strip" aria-label="'+mode.label+' 75 18 7 色彩預覽">'+
    ['base','structure','accent'].map(role=>'<i style="background:'+analysis.perceived[role]+'"><span>'+VISION_ROLE_META[role].ratio+'</span></i>').join('')+
    '</div>';
  if(visionMode==='normal'){
    host.className='vision-preview vision-v2';
    host.innerHTML=strip+'<div class="vision-v2-note">切換紅色弱、綠色弱或藍色弱後，Color Lab 會檢查三個角色在近似模擬下是否仍有足夠感知差異。這不是醫療診斷。</div>';
    return;
  }

  const nonClear=analysis.pairs.filter(pair=>pair.status.key!=='clear');
  const summary=nonClear.length===0
    ?'<div class="vision-v2-summary good"><strong>三組角色皆維持可辨識差異</strong><span>'+mode.label+' · 近似模擬</span></div>'
    :'<div class="vision-v2-summary warn"><strong>'+nonClear.length+' 組關係需要注意</strong><span>'+mode.label+' · 原色不變</span></div>';
  const pairs='<div class="vision-v2-pairs">'+analysis.pairs.map(pair=>
    '<div class="vision-v2-pair '+pair.status.key+'"><span>'+visionPairName(pair)+'</span><strong>'+pair.status.label+'</strong><small>Δ '+pair.distance.toFixed(3)+'</small></div>'
  ).join('')+'</div>';

  let preview='';
  if(visionFixPreview){
    const source=visionFixPreviewPalette(),perceived=visionPalette(source,visionMode);
    preview='<div class="vision-v2-fix-preview"><div><strong>修正預覽</strong><span>只比較，不改原色</span></div><div class="vision-v2-strip compact">'+
      ['base','structure','accent'].map(role=>'<i style="background:'+perceived[role]+'"></i>').join('')+
      '</div><button type="button" data-vision-clear>取消預覽</button></div>';
  }

  const fixes=visionFixes(analysis);
  const fixHtml=fixes.length?'<div class="vision-v2-fixes"><div class="vision-v2-fix-title">最小修正方向</div>'+fixes.map(fix=>{
    const label=VISION_ROLE_META[fix.role].label;
    const method=fix.suggestion.method==='lightness'?'優先只調 Lightness':'Lightness 不足，才微調 Hue / Chroma';
    return '<div class="vision-v2-fix"><div class="vision-v2-fix-head"><strong>'+label+'</strong><span>'+method+'</span></div>'+
      '<div class="vision-v2-values"><span><i style="background:'+fix.current+'"></i>'+fix.current+'</span><b>→</b><span><i style="background:'+fix.suggestion.color+'"></i>'+fix.suggestion.color+'</span></div>'+
      '<div class="vision-v2-fix-actions"><button type="button" data-vision-preview="'+fix.role+'" data-vision-color="'+fix.suggestion.color+'">預覽</button><button type="button" data-vision-apply="'+fix.role+'" data-vision-color="'+fix.suggestion.color+'">套用建議</button></div></div>';
  }).join('')+'</div>':'';

  host.className='vision-preview vision-v2';
  host.innerHTML=strip+summary+pairs+preview+fixHtml+
    '<div class="vision-v2-note">Δ 為 Color Lab 內部 OKLCH 感知分離指標；&lt; '+VISION_CONFLICT_LIMIT.toFixed(3)+' 標記容易混淆，'+VISION_CONFLICT_LIMIT.toFixed(3)+'–'+VISION_WATCH_LIMIT.toFixed(3)+' 標記差異偏低。僅供設計比較，不代表臨床色覺測試。</div>';
}

document.addEventListener('click',event=>{
  const preview=event.target.closest?.('[data-vision-preview]');
  if(preview){previewVisionSuggestion(preview.dataset.visionPreview,preview.dataset.visionColor);return}
  const apply=event.target.closest?.('[data-vision-apply]');
  if(apply){applyVisionSuggestion(apply.dataset.visionApply,apply.dataset.visionColor);return}
  if(event.target.closest?.('[data-vision-clear]'))clearVisionSuggestion();
});
