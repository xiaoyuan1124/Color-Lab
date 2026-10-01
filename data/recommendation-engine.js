/* Color Lab V2.36.0 Recommendation Architecture
   Lazy-loaded Inspire recommendation runtime. Behavior-preserving extraction from index.html. */

function archetypeExpected(archetype,seedHex){
  const sample=archetype?.sample;
  if(!Array.isArray(sample)||sample.length<3)return null;
  return [seedHex,transferFashionColor(seedHex,sample[0],sample[1]),transferFashionColor(seedHex,sample[0],sample[2])];
}

function archetypeCombos(inputs){
  const atlas=inspirationAtlas();
  if(!atlas.length||!inputs.length||inputs.length>=3)return[];
  const rows=[];
  for(const archetype of atlas){
    const expected=archetypeExpected(archetype,inputs[0]);if(!expected)continue;
    const toneFamily=inferToneFamilyId(archetype.sample,archetype.lane||'editorial',archetype.id);
    let colors,compatibility=1;
    if(inputs.length===1){
      colors=tonalHarmonizeGenerated(inspirationRefineGenerated(expected,1),1,toneFamily);
    }else{
      colors=tonalHarmonizeGenerated(inspirationRefineGenerated([inputs[0],inputs[1],expected[2]],2),2,toneFamily);
      const d=fashionSupportDistance(inputs[0],inputs[1],{colors:archetype.sample});
      compatibility=Math.max(.15,1-Math.min(1,d/1.85));
    }
    const surprise=paletteSurpriseScore(colors);
    const quality=orderedPaletteScore(colors);
    const aesthetic=paletteAestheticScore(colors);
    const tonal=tonalCohesionScore(colors,toneFamily);
    const sourceVector=relationVector(archetype.sample),resultVector=relationVector(colors);
    const fidelity=sourceVector&&resultVector?Math.exp(-relationVectorDistance(sourceVector,resultVector)*1.35):0;
    rows.push({
      colors,palette:orderedPalette(colors),
      added:inputs.length===1?[colors[1],colors[2]]:[colors[2]],
      score:aesthetic*2.75+tonal*1.65+quality*.14+fidelity*.58+surprise*.16+(archetype.novelty||.7)*.08+compatibility*.22,
      surprise,aesthetic,tonal,
      meta:{label:archetype.label,sub:archetype.note,lane:archetype.lane||'editorial',novelty:archetype.novelty||.7,source:'atlas',fidelity,toneFamily}
    });
  }
  return rows.sort((a,b)=>b.score-a.score);
}

function igLane(pattern){
  const id=pattern?.id||'';
  if(/dopamine|three|complement|wheel|festival/.test(id))return'expressive';
  if(/mono|tonal|earth|soft|warm/.test(id))return'atmospheric';
  return'editorial';
}

function recommendationLane(item){return item?.meta?.lane||'editorial'}

function inspirationUtility(item,out=[]){
  const paletteColors=[item.palette.base,item.palette.structure,item.palette.accent];
  const aesthetic=Number.isFinite(item.aesthetic)?item.aesthetic:paletteAestheticScore(paletteColors);
  const toneFamily=item.meta?.toneFamily||inferToneFamilyId(paletteColors,recommendationLane(item));
  const tonal=Number.isFinite(item.tonal)?item.tonal:tonalCohesionScore(paletteColors,toneFamily);
  const surprise=Number.isFinite(item.surprise)?item.surprise:paletteSurpriseScore(paletteColors);
  const diversity=out.length?Math.min(...out.map(x=>recommendationDistance(item,x))):1;
  const novelty=Number(item.meta?.novelty)||0;
  const repeatedLabel=out.some(x=>x.meta?.label===item.meta?.label);
  const beautyGuard=clamp((aesthetic-.48)/.34);
  return aesthetic*3.85+tonal*2.10+diversity*.96+surprise*.38*beautyGuard+novelty*.10+item.score*.10-(repeatedLabel?.24:0);
}

function inspirationVariations(original,limit=6){
  const seed=original?.[0];if(!seed)return[];
  const baseVector=relationVector(original);
  const candidates=archetypeCombos([seed]).map(x=>({...x,sourceDistance:relationVectorDistance(baseVector,relationVector(x.colors))}));
  return selectDiverseRecommendations(candidates,limit);
}

function igStyleCombos(inputs){
  const patterns=window.IG_STYLE_PATTERNS||[];
  if(!patterns.length||!inputs.length||inputs.length>=3)return[];
  const rows=[];
  if(inputs.length===1){
    for(const pattern of patterns){
      const colors=igPatternExpected(pattern,inputs[0]);
      rows.push({
        colors,
        pattern,
        compatibility:1,
        score:orderedPaletteScore(colors)+(pattern.confidence||.75)*.8+igPatternAffinity(colors)*.7
      });
    }
  }else{
    for(const pattern of patterns){
      const d=igPatternSupportDistance(inputs[0],inputs[1],pattern);
      const compatibility=Math.max(0,1-Math.min(1,d/.34));
      const colors=[inputs[0],inputs[1],igPatternExpected(pattern,inputs[0])[2]];
      rows.push({
        colors,
        pattern,
        compatibility,
        score:orderedPaletteScore(colors)+(pattern.confidence||.75)*compatibility*.9+igPatternAffinity(colors)*.7
      });
    }
  }
  return rows.sort((a,b)=>b.score-a.score).slice(0,10);
}

function recommendationDistance(a,b){
  const av=relationVector([a.palette.base,a.palette.structure,a.palette.accent]);
  const bv=relationVector([b.palette.base,b.palette.structure,b.palette.accent]);
  const relation=clamp(relationVectorDistance(av,bv)/4.2,0,1);
  const structure=perceptualDistance(a.palette.structure,b.palette.structure);
  const accent=perceptualDistance(a.palette.accent,b.palette.accent);
  return clamp(relation*.62+structure*.55+accent*.72,0,1);
}

function selectDiverseRecommendations(candidates,limit=5){
  const unique=[],signatures=new Set();
  for(const raw of candidates){
    const signature=[raw.palette.base,raw.palette.structure,raw.palette.accent].join('|');
    if(signatures.has(signature))continue;
    signatures.add(signature);
    const colors=[raw.palette.base,raw.palette.structure,raw.palette.accent];
    const aesthetic=Number.isFinite(raw.aesthetic)?raw.aesthetic:paletteAestheticScore(colors);
    const toneFamily=raw.meta?.toneFamily||inferToneFamilyId(colors,recommendationLane(raw));
    const tonal=Number.isFinite(raw.tonal)?raw.tonal:tonalCohesionScore(colors,toneFamily);
    unique.push({...raw,aesthetic,tonal,meta:{...raw.meta,toneFamily}});
  }
  const eligible=unique.filter(item=>item.aesthetic>=laneAestheticFloor(recommendationLane(item))&&item.tonal>=.52);
  if(eligible.length<limit){
    const fallback=unique
      .filter(item=>!eligible.includes(item)&&item.aesthetic>=.48&&item.tonal>=.44)
      .sort((a,b)=>(b.aesthetic+b.tonal*.55)-(a.aesthetic+a.tonal*.55));
    eligible.push(...fallback.slice(0,limit-eligible.length));
  }
  const remaining=(eligible.length?eligible:[...unique].sort((a,b)=>b.aesthetic-a.aesthetic).slice(0,limit)),out=[];
  const takeBest=()=>{
    let best=null,bestUtility=-Infinity;
    const usedLanes=new Set(out.map(recommendationLane));
    for(const item of remaining){
      const laneBonus=usedLanes.has(recommendationLane(item))?0:.24;
      const utility=inspirationUtility(item,out)+laneBonus;
      if(utility>bestUtility){best=item;bestUtility=utility}
    }
    if(!best)return false;
    out.push(best);
    const index=remaining.indexOf(best);if(index>=0)remaining.splice(index,1);
    return true;
  };
  while(remaining.length&&out.length<limit)takeBest();
  return out;
}

function recommendationFingerprint(item){
  const p=item?.palette;return p?[p.base,p.structure,p.accent].map(x=>String(x||'').toUpperCase()).join('|'):'';
}

function rememberRecommendationBatch(items){
  const next=[...recommendationRecentFingerprints];
  for(const item of items||[]){
    const key=recommendationFingerprint(item);if(!key)continue;
    const at=next.indexOf(key);if(at>=0)next.splice(at,1);
    next.push(key);
  }
  recommendationRecentFingerprints=next.slice(-recommendationRecentLimit);
  try{localStorage.setItem('colorlab.inspireRecentV1',JSON.stringify(recommendationRecentFingerprints))}catch(_){}
}

function prioritizeUnseenRecommendations(items){
  const recent=new Set(recommendationRecentFingerprints),fresh=[],seen=[];
  for(const item of items||[])(recent.has(recommendationFingerprint(item))?seen:fresh).push(item);
  return fresh.concat(seen);
}

function recommendationCombos(){
  const inputs=chosenColors();
  if(inputs.length>=3)return[];
  const cacheKey=[...inputs,mode,(window.FASHION_PALETTES||[]).length,(window.IG_STYLE_PATTERNS||[]).length,(window.INSPIRATION_ATLAS||[]).length,Object.keys(window.TONE_FAMILIES||{}).length].join('|');
  if(cacheKey===recommendationCacheKey&&recommendationCacheValue.length)return recommendationCacheValue;
  resetRecommendationBatchSession();

  const pool=intelligentPool(inputs,mode);
  const candidates=[
    ...archetypeCombos(inputs),
    ...fashionReferenceCombos(inputs).map(x=>{
      const initial=inspirationRefineGenerated(x.colors,inputs.length);
      const toneFamily=inferToneFamilyId(initial,'fashion');
      const refined=tonalHarmonizeGenerated(initial,inputs.length,toneFamily);
      const surprise=paletteSurpriseScore(refined),aesthetic=paletteAestheticScore(refined),tonal=tonalCohesionScore(refined,toneFamily);
      return{
        added:inputs.length===1?[refined[1],refined[2]]:[refined[2]],
        palette:orderedPalette(refined),
        score:aesthetic*2.45+tonal*1.55+orderedPaletteScore(refined)*.14+x.score*.06+surprise*.14,
        surprise,aesthetic,tonal,
        meta:{label:'時裝關係',sub:'Fashion reference · 色調統一',lane:'fashion',novelty:.62,toneFamily}
      };
    }),
    ...igStyleCombos(inputs).map(x=>{
      const initial=inspirationRefineGenerated(x.colors,inputs.length),lane=igLane(x.pattern);
      const toneFamily=inferToneFamilyId(initial,lane);
      const refined=tonalHarmonizeGenerated(initial,inputs.length,toneFamily);
      const surprise=paletteSurpriseScore(refined),aesthetic=paletteAestheticScore(refined),tonal=tonalCohesionScore(refined,toneFamily);
      return{
        added:inputs.length===1?[refined[1],refined[2]]:[refined[2]],
        palette:orderedPalette(refined),
        score:aesthetic*2.40+tonal*1.50+orderedPaletteScore(refined)*.14+x.score*.06+surprise*.15,
        surprise,aesthetic,tonal,
        meta:{label:x.pattern.label,sub:'Styling pattern · 色調統一',lane,novelty:lane==='expressive'?.72:.48,toneFamily}
      };
    })
  ];

  if(inputs.length===2){
    for(const x of pool){
      const initial=qualityRefineGenerated([inputs[0],inputs[1],x],2);
      const meta=classifyCandidate(initial[2],inputs),toneFamily=inferToneFamilyId(initial,meta.lane);
      const trio=tonalHarmonizeGenerated(initial,2,toneFamily);
      const surprise=paletteSurpriseScore(trio),aesthetic=paletteAestheticScore(trio),tonal=tonalCohesionScore(trio,toneFamily);
      candidates.push({added:[trio[2]],palette:orderedPalette(trio),score:aesthetic*2.30+tonal*1.45+trioScore(trio)*.14+surprise*.14,surprise,aesthetic,tonal,meta:{...meta,toneFamily}});
    }
  }else{
    for(let i=0;i<pool.length;i++){
      for(let j=i+1;j<Math.min(pool.length,i+16);j++){
        const initial=qualityRefineGenerated([inputs[0],pool[i],pool[j]],1),initialSurprise=paletteSurpriseScore(initial);
        const lane=initialSurprise>.76?'unexpected':'editorial',toneFamily=inferToneFamilyId(initial,lane);
        const trio=tonalHarmonizeGenerated(initial,1,toneFamily),surprise=paletteSurpriseScore(trio),aesthetic=paletteAestheticScore(trio),tonal=tonalCohesionScore(trio,toneFamily);
        candidates.push({added:[trio[1],trio[2]],palette:orderedPalette(trio),score:aesthetic*2.25+tonal*1.50+trioScore(trio)*.12+surprise*.13,surprise,aesthetic,tonal,meta:{label:'生成關係',sub:'從單色延伸 · 色調統一',lane,novelty:surprise,toneFamily}});
      }
    }
  }

  const out=prioritizeUnseenRecommendations(selectDiverseRecommendations(candidates,30));
  recommendationCacheKey=cacheKey;
  recommendationCacheValue=out;
  return out;
}

function resetRecommendationBatchSession(){
  recommendationBatchOffset=0;
  recommendationBatchHistory=[0];
  recommendationBatchHistoryIndex=0;
}

function recommendationBatch(recs){
  if(!Array.isArray(recs)||!recs.length)return[];
  if(recommendationBatchOffset>=recs.length)resetRecommendationBatchSession();
  return recs.slice(recommendationBatchOffset,recommendationBatchOffset+recommendationBatchSize);
}

function recommendationBatchCount(recs){
  return Math.max(1,Math.ceil((Array.isArray(recs)?recs.length:0)/recommendationBatchSize));
}

function moveRecommendationBatch(direction=1){
  const recs=recommendationCombos();
  if(recs.length<=recommendationBatchSize){
    toast('目前這組條件只有 '+recs.length+' 個通過品質門檻的候選');
    return;
  }
  if(direction<0){
    if(recommendationBatchHistoryIndex<=0){toast('已經是第一批');return}
    recommendationBatchHistoryIndex--;
    recommendationBatchOffset=recommendationBatchHistory[recommendationBatchHistoryIndex];
    renderRecommendations();
    return;
  }
  if(recommendationBatchHistoryIndex<recommendationBatchHistory.length-1){
    recommendationBatchHistoryIndex++;
    recommendationBatchOffset=recommendationBatchHistory[recommendationBatchHistoryIndex];
    renderRecommendations();
    return;
  }
  const nextOffset=recommendationBatchOffset+recommendationBatchSize;
  if(nextOffset>=recs.length){toast('已看完這輪所有候選');return}
  recommendationBatchHistory=recommendationBatchHistory.slice(0,recommendationBatchHistoryIndex+1);
  recommendationBatchHistory.push(nextOffset);
  recommendationBatchHistoryIndex++;
  recommendationBatchOffset=nextOffset;
  renderRecommendations();
}

function previousRecommendationBatch(){moveRecommendationBatch(-1)}

function nextRecommendationBatch(){moveRecommendationBatch(1)}

function applyRecommendation(index){
  const recs=recommendationCombos(),r=recs[index];if(!r)return;
  const empties=selectedColors.map((v,i)=>v?null:i).filter(v=>v!==null);
  r.added.forEach((hex,k)=>{if(empties[k]!==undefined)selectedColors[empties[k]]=hex});
  const firstEmpty=selectedColors.findIndex(v=>!v);
  activeSlot=firstEmpty>=0?firstEmpty:0;
  learnPalettePreference(r.palette,.25);
  syncEditor();generate(false);pushHistory();switchTab('compose',false);$('#result').scrollIntoView({behavior:'smooth',block:'start'});toast('已加入推薦顏色');
}

function recommendationDirection(paletteLike,meta={}){
  const colors=[paletteLike.base,paletteLike.structure,paletteLike.accent];
  const b=toOKLCH(colors[0]),s=toOKLCH(colors[1]),a=toOKLCH(colors[2]);
  const avgC=(b.c+s.c)/2;
  const structureContrast=contrastRatio(colors[0],colors[1]);
  const accentHue=Math.min(hueDistance(b.h,a.h),hueDistance(s.h,a.h));
  if(meta.lane==='unexpected')return{label:'更意外',reason:'刻意跨出熟悉色相區域，但仍由 75 / 18 / 7 維持秩序'};
  if(meta.lane==='expressive')return{label:'更有張力',reason:'保留較大的色相或彩度差，避免被安全分數磨平'};
  if(meta.lane==='atmospheric')return{label:'更有空氣',reason:'把戲劇感放在材質、明暗與溫度，而不是全靠高彩度'};
  if(meta.lane==='fashion'||meta.label==='時裝關係')return{label:'更時裝',reason:'借用時裝常見角色關係，同時保留你的主體色'};
  if(meta.lane==='editorial')return{label:'更編輯',reason:'讓結構色與焦點色扮演更清楚的不同角色'};
  if(avgC<.065&&a.c<.13)return{label:'更安靜',reason:'降低整體彩度，讓層級主要由明暗建立'};
  if(structureContrast>=5.2)return{label:'更銳利',reason:'拉開主體與結構的明暗，閱讀層級更直接'};
  if(a.c>Math.max(.13,avgC*1.45))return{label:'更有焦點',reason:'把較高彩度留給 7% Accent，注意力更集中'};
  if(accentHue>=95)return{label:'更有張力',reason:'Accent 與主體色相距離拉開，但仍維持 75 / 18 / 7'};
  return{label:'更平衡',reason:'保留三色差異，同時控制明暗與色相不要互相搶戲'};
}

function renderRecommendations(){
  const box=$('#recommendations');if(!box)return;
  const inputs=chosenColors();
  const progress=$('#recommendationProgress'),previous=$('#previousRecommendations'),next=$('#nextRecommendations');
  if(inputs.length>=3){
    $('#intelHeading').textContent='三色已完整';
    $('#intelDescription').textContent='你選的三色會完整保留';
    box.innerHTML='<div class="saved-empty">移除其中一色後 系統會重新提出補色建議</div>';
    if(progress)progress.textContent='三色已完整';
    if(previous)previous.disabled=true;
    if(next)next.disabled=true;
    return;
  }
  $('#intelHeading').textContent=inputs.length===2?'推薦第三色':'推薦完整三色';
  $('#intelDescription').textContent=preferenceIsMature()?'Tonal Cohesion × Aesthetic Gate × Atlas × 本機偏好':'Tonal Cohesion × Aesthetic Gate × Atlas × Fashion × IG';
  const recs=recommendationCombos();
  const visible=recommendationBatch(recs);
  rememberRecommendationBatch(visible);
  box.innerHTML='';
  visible.forEach((r,i)=>{
    const b=document.createElement('button');b.className='rec-card';b.type='button';b.dataset.rec=recommendationBatchOffset+i;
    const profile=paletteQualityProfile([r.palette.base,r.palette.structure,r.palette.accent]);
    const direction=recommendationDirection(r.palette,r.meta);
    const toneLabel=toneFamilyLabel(r.meta?.toneFamily);
    const personalHint=preferenceIsMature()&&profile?.personal>=.52?' · 本機排序微調':'';
    b.innerHTML=`<div class="rec-palette"><i style="background:${r.palette.base}"></i><i style="background:${r.palette.structure}"></i><i style="background:${r.palette.accent}"></i></div>${toneLabel?'<span class="rec-tone">'+escapeHtml(toneLabel)+'</span>':''}<span class="rec-direction">${direction.label}</span><div class="rec-name">${r.meta.label}</div><div class="rec-sub">${direction.reason} · ${r.meta.sub}${personalHint}</div><div class="rec-actions"><span class="rec-add">加入</span></div>`;
    box.appendChild(b);
  });
  if(progress){
    const start=recs.length?recommendationBatchOffset+1:0;
    const end=Math.min(recommendationBatchOffset+visible.length,recs.length);
    const batchNumber=recs.length?Math.floor(recommendationBatchOffset/recommendationBatchSize)+1:0;
    progress.textContent=recs.length?'第 '+batchNumber+' / '+recommendationBatchCount(recs)+' 批 · '+start+'–'+end+' / '+recs.length+' 組':'沒有可用候選';
  }
  if(previous)previous.disabled=recommendationBatchHistoryIndex<=0;
  if(next){
    const hasForwardHistory=recommendationBatchHistoryIndex<recommendationBatchHistory.length-1;
    const hasUnseen=recommendationBatchOffset+recommendationBatchSize<recs.length;
    next.disabled=recs.length<=recommendationBatchSize||(!hasForwardHistory&&!hasUnseen);
    next.textContent=next.disabled&&recs.length>recommendationBatchSize?'已看完':'下一批 →';
  }
}
