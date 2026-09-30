import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();
});

test('mobile Compose keeps the 75 / 18 / 7 contract visible', async ({ page }) => {
  const preview = page.locator('#preview > div');
  await expect(preview).toHaveCount(3);
  await expect(preview.nth(0)).toContainText('75');
  await expect(preview.nth(1)).toContainText('18');
  await expect(preview.nth(2)).toContainText('7');
  await expect(page.locator('#candidateModeBar')).toBeVisible();
});

test('candidate explorer can move forward and return to the original generated color', async ({ page }) => {
  const next = page.locator('[data-shuffle="accent"][data-shuffle-dir="1"]');
  const previous = page.locator('[data-shuffle="accent"][data-shuffle-dir="-1"]');
  await expect(next).toBeVisible();

  await next.click();
  const progress = page.locator('[data-shuffle="accent"][data-shuffle-dir="1"]').locator('xpath=..').locator('.candidate-progress');
  await expect(progress).toHaveText(/\d+ \/ \d+/);
  await expect(previous).toBeEnabled();

  await previous.click();
  await expect(progress).toHaveText('原始');
  await expect(previous).toBeDisabled();
});

test('corner fan navigation opens on demand and switches to Library', async ({ page }) => {
  const toggle = page.locator('#cornerNavToggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const libraryTab = page.locator('#nav-library');
  await expect(libraryTab).toBeVisible();
  await libraryTab.click();

  await expect(page.locator('.tab-view[data-view="library"]')).toBeVisible();
  await expect(libraryTab).toHaveAttribute('aria-selected', 'true');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('Inspire batch history moves forward and back without wrapping', async ({ page }) => {
  await page.locator('#cornerNavToggle').click();
  await page.locator('#nav-inspire').click();
  await expect(page.locator('.tab-view[data-view="inspire"]')).toBeVisible();

  const progress = page.locator('#recommendationProgress');
  const previous = page.locator('#previousRecommendations');
  const next = page.locator('#nextRecommendations');

  await expect(progress).toContainText('第 1 /');
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  await next.click();
  await expect(progress).toContainText('第 2 /');
  await expect(previous).toBeEnabled();

  await previous.click();
  await expect(progress).toContainText('第 1 /');
  await expect(previous).toBeDisabled();

  await next.click();
  await expect(progress).toContainText('第 2 /');
});

test('professional handoff exports exact 75 / 18 / 7 role colors', async ({ page }) => {
  const css = await page.evaluate(() => paletteArtifact('css').text);
  expect(css).toContain('--color-base:');
  expect(css).toContain('--color-structure:');
  expect(css).toContain('--color-accent:');
  expect(css).toContain('--color-base-ratio: 75%');
  expect(css).toContain('--color-structure-ratio: 18%');
  expect(css).toContain('--color-accent-ratio: 7%');

  const json = JSON.parse(await page.evaluate(() => paletteArtifact('json').text));
  const tokens = JSON.parse(await page.evaluate(() => paletteArtifact('tokens').text));
  expect(json.ratios).toEqual({ base: 75, structure: 18, accent: 7 });
  expect(tokens.color.base.$value).toBe(json.palette.base);
  expect(tokens.color.structure.$value).toBe(json.palette.structure);
  expect(tokens.color.accent.$value).toBe(json.palette.accent);
});

test('dark context preview never overwrites the current palette', async ({ page }) => {
  await page.locator('#composeDeepDive').evaluate(el => { el.open = true; el.dispatchEvent(new Event('toggle')); });
  const before = await page.evaluate(() => paletteArtifactBase());
  const dark = page.locator('[data-preview-theme="dark"]');
  await dark.click();

  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#contextThemeNote')).toContainText('不改原色');
  const after = await page.evaluate(() => paletteArtifactBase());
  expect(after.palette).toEqual(before.palette);

  const preview = await page.evaluate(() => previewThemePalette());
  expect(preview.derived).toBe(true);
  expect(preview.accent).toBe(before.palette.accent);
});

test('three-color accessibility matrix validates original and Dark preview without mutation', async ({ page }) => {
  await page.locator('#composeDeepDive').evaluate(el => { el.open = true; el.dispatchEvent(new Event('toggle')); });

  const matrix = page.locator('#accessibilityMatrix .validation-table');
  await expect(matrix).toBeVisible();
  await expect(matrix.locator('tbody tr')).toHaveCount(3);
  await expect(matrix.locator('.validation-cell')).toHaveCount(6);

  const thresholds = await page.evaluate(() => [contrastGrade(7)[0], contrastGrade(4.5)[0], contrastGrade(3)[0], contrastGrade(2.9)[0]]);
  expect(thresholds).toEqual(['aaa', 'aa', 'large', 'fail']);

  const before = await page.evaluate(() => paletteArtifactBase());
  const original = await page.evaluate(() => paletteValidationData('original').pairs.map(x => x.ratio));
  expect(original).toHaveLength(3);
  expect(original.every(x => Number.isFinite(x) && x >= 1)).toBe(true);

  const dark = page.locator('[data-validation-theme="dark"]');
  await dark.click();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');

  const after = await page.evaluate(() => paletteArtifactBase());
  expect(after.palette).toEqual(before.palette);

  const darkPreview = await page.evaluate(() => previewThemePalette('dark'));
  expect(darkPreview.accent).toBe(before.palette.accent);
  await expect(page.locator('#validationSummary')).toContainText('/ 3');
});

test('V2.13.1 local palette runtime is loaded and callable', async ({ page }) => {
  await expect(page.locator('script[src="./runtime/palette-tools.js"]')).toHaveCount(1);
  const api = await page.evaluate(() => ({
    artifact: typeof paletteArtifact,
    validation: typeof renderPaletteValidation,
    context: typeof renderContextPreview,
    dark: previewThemePalette('dark')
  }));
  expect(api.artifact).toBe('function');
  expect(api.validation).toBe('function');
  expect(api.context).toBe('function');
  expect(api.dark.derived).toBe(true);
});

test('V2.14 suggests the smallest AA fix, previews without mutation, and applies only on request', async ({ page }) => {
  const algorithm = await page.evaluate(() => {
    const suggestion = nearestAccessibleColor('#777777', '#FFFFFF', 4.5);
    return {
      suggestion,
      ratio: contrastRatio(suggestion.color, '#FFFFFF'),
      baseStructure: accessibilityChangeRole('base', 'structure'),
      baseAccent: accessibilityChangeRole('base', 'accent')
    };
  });
  expect(algorithm.suggestion.color).not.toBe('#777777');
  expect(algorithm.ratio).toBeGreaterThanOrEqual(4.5);
  expect(algorithm.baseStructure).toBe('structure');
  expect(algorithm.baseAccent).toBe('accent');

  await page.evaluate(() => {
    selectedColors = ['#FFFFFF', '#777777', '#999999'];
    lockedSlots = [false, false, false];
    activeSlot = 0;
    seed = selectedColors[0];
    generate(false);
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open = true; el.dispatchEvent(new Event('toggle')); });

  const before = await page.evaluate(() => paletteArtifactBase());
  const previewButton = page.locator('[data-accessibility-preview="structure"]').first();
  await expect(previewButton).toBeVisible();
  const suggestionColor = await previewButton.getAttribute('data-accessibility-color');
  expect(suggestionColor).toMatch(/^#[0-9A-F]{6}$/);

  await previewButton.click();
  await expect(page.locator('.accessibility-preview')).toBeVisible();
  await expect(page.locator('.accessibility-preview')).toContainText('只比較，不改原色');
  const afterPreview = await page.evaluate(() => paletteArtifactBase());
  expect(afterPreview.palette).toEqual(before.palette);

  const applyButton = page.locator('[data-accessibility-apply="structure"]').first();
  await applyButton.click();
  const afterApply = await page.evaluate(() => paletteArtifactBase());
  expect(afterApply.palette.structure).toBe(suggestionColor);
  expect(afterApply.palette.base).toBe(before.palette.base);
  expect(await page.evaluate(() => contrastRatio(palette.structure, palette.base))).toBeGreaterThanOrEqual(4.5);
});

test('V2.14 Dark validation never offers source-color apply actions', async ({ page }) => {
  await page.locator('#composeDeepDive').evaluate(el => { el.open = true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('[data-validation-theme="dark"]').click();
  await expect(page.locator('#accessibilityFixes')).toContainText('Dark 為衍生預覽');
  await expect(page.locator('[data-accessibility-apply]')).toHaveCount(0);
});

test('V2.15 Inspire recent memory prioritizes fresh palettes without deleting seen ones', async ({ page }) => {
  const result = await page.evaluate(() => {
    const item = (a,b,c) => ({ palette:{ base:a, structure:b, accent:c } });
    const seen = item('#111111','#222222','#333333');
    const fresh = item('#AAAAAA','#BBBBBB','#CCCCCC');
    recommendationRecentFingerprints=[recommendationFingerprint(seen)];
    const ordered=prioritizeUnseenRecommendations([seen,fresh]);
    return {
      keys:ordered.map(recommendationFingerprint),
      seenKey:recommendationFingerprint(seen),
      freshKey:recommendationFingerprint(fresh)
    };
  });
  expect(result.keys).toEqual([result.freshKey,result.seenKey]);
});

test('V2.15 Inspire recent memory stays bounded to 24 fingerprints', async ({ page }) => {
  const state = await page.evaluate(() => {
    recommendationRecentFingerprints=[];
    const items=Array.from({length:30},(_,i)=>{
      const n=(i+1).toString(16).padStart(2,'0').toUpperCase();
      return {palette:{base:'#'+n+'0000',structure:'#00'+n+'00',accent:'#0000'+n}};
    });
    rememberRecommendationBatch(items);
    return {
      length:recommendationRecentFingerprints.length,
      stored:JSON.parse(localStorage.getItem('colorlab.inspireRecentV1')||'[]').length
    };
  });
  expect(state.length).toBe(24);
  expect(state.stored).toBe(24);
});

test('V2.16 Aesthetic Gate accepts controlled vivid palettes without rewarding noisy saturation', async ({ page }) => {
  const scores = await page.evaluate(() => {
    const quiet = paletteAestheticCore(['#E9E1D2','#25313A','#4D739B']);
    const vivid = paletteAestheticCore(['#286B69','#D0A32E','#A94B38']);
    const noisy = paletteAestheticCore(['#FF4B55','#FF5A4D','#FF6A45']);
    return {
      quiet,
      vivid,
      noisy,
      priors: {
        atmospheric: laneAestheticPrior('atmospheric'),
        expressive: laneAestheticPrior('expressive'),
        unexpected: laneAestheticPrior('unexpected')
      }
    };
  });

  expect(scores.quiet.score).toBeGreaterThanOrEqual(0.48);
  expect(scores.vivid.score).toBeGreaterThanOrEqual(0.48);
  expect(scores.noisy.score).toBeLessThan(scores.vivid.score);
  expect(scores.vivid.vividIntent).toBeGreaterThan(0);
  expect(scores.vivid.energyStructure).toBeGreaterThan(0.45);
  expect(scores.priors.expressive).toBeGreaterThanOrEqual(scores.priors.atmospheric - 0.01);
  expect(scores.priors.unexpected).toBeGreaterThanOrEqual(0.95);
});

test('V2.16 quality practicality no longer punishes vivid Accent by absolute chroma', async ({ page }) => {
  const source = await page.evaluate(() => paletteQualityProfile.toString());
  expect(source).toContain('supportChroma');
  expect(source).toContain('accentControl');
  expect(source).not.toContain('chromaUsability');
});

test('V2.17 fixed-Hue Tone Explorer changes tone while preserving hue identity', async ({ page }) => {
  const result = await page.evaluate(async () => {
    await ensureToneFamilies();
    const colors=['#5E6648','#B95A37','#315EAA'];
    const candidate=toneExplorerToneCandidate(colors,'earth');
    const hueDrift=toneExplorerHueDrift(colors,candidate);
    const toneDelta=toneExplorerToneDelta(colors,candidate);
    return {candidate,hueDrift,toneDelta};
  });
  expect(result.candidate).toHaveLength(3);
  expect(result.hueDrift.every(x => x < 2.5)).toBe(true);
  expect(result.toneDelta.some(x => x.light > 0.02 || x.chroma > 0.015)).toBe(true);
});

test('V2.17 fixed-Tone Hue Explorer rotates hue together and preserves L/C intent', async ({ page }) => {
  const result = await page.evaluate(() => {
    const colors=['#D8C7A7','#275C64','#B95A37'];
    const candidate=toneExplorerHueCandidate(colors,20);
    const before=colors.map(toOKLCH),after=candidate.map(toOKLCH);
    const shifts=before.map((x,i)=>{
      let d=((after[i].h-x.h)%360+360)%360;
      if(d>180)d-=360;
      return d;
    });
    const lc=before.map((x,i)=>({l:Math.abs(x.l-after[i].l),c:Math.abs(x.c-after[i].c)}));
    const beforeRelations=[
      hueDistance(before[0].h,before[1].h),
      hueDistance(before[0].h,before[2].h),
      hueDistance(before[1].h,before[2].h)
    ];
    const afterRelations=[
      hueDistance(after[0].h,after[1].h),
      hueDistance(after[0].h,after[2].h),
      hueDistance(after[1].h,after[2].h)
    ];
    return {shifts,lc,beforeRelations,afterRelations};
  });
  expect(result.shifts.every(x => Math.abs(x-20) < 3)).toBe(true);
  expect(result.lc.every(x => x.l < 0.015 && x.c < 0.025)).toBe(true);
  result.beforeRelations.forEach((x,i)=>expect(Math.abs(x-result.afterRelations[i])).toBeLessThan(3));
});

test('V2.17 Tone Explorer preview is non-mutating, apply is explicit, and Undo restores origin', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#D8C7A7','#275C64','#B95A37'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];
    generate(false);
    historyStack=[snapshotState()];historyIndex=0;updateHistoryButtons();
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await expect(page.locator('#toneExplorer')).toBeVisible();
  await expect(page.locator('[data-tone-preview="tone-earth"]')).toBeVisible();

  const before=await page.evaluate(() => paletteArtifactBase());
  await page.locator('[data-tone-preview="tone-earth"]').click();
  await expect(page.locator('.tone-explorer-preview')).toContainText('只比較，不改原色');
  const afterPreview=await page.evaluate(() => paletteArtifactBase());
  expect(afterPreview.palette).toEqual(before.palette);

  await page.locator('[data-tone-apply="tone-earth"]').click();
  const afterApply=await page.evaluate(() => paletteArtifactBase());
  expect(afterApply.palette).not.toEqual(before.palette);

  await page.locator('#undoBtn').click();
  const afterUndo=await page.evaluate(() => paletteArtifactBase());
  expect(afterUndo.palette).toEqual(before.palette);
});

test('V2.17 Tone Explorer explicit apply respects locked roles and stale previews expire', async ({ page }) => {
  const result=await page.evaluate(async () => {
    await ensureToneFamilies();
    selectedColors=['#D8C7A7','#275C64','#B95A37'];
    lockedSlots=[true,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
    setToneExplorerMode('hue');
    const origin=toneExplorerColors();
    previewToneExplorer('hue-20');
    const hadPreview=!!toneExplorerPreview;
    selectedColors=['#D8C7A7','#315EAA','#C84335'];
    seed=selectedColors[0];generate(false);
    await renderToneExplorer();
    const staleCleared=toneExplorerPreview===null;
    setToneExplorerMode('hue');
    const applyOrigin=toneExplorerColors();
    applyToneExplorer('hue-20');
    return {
      hadPreview,staleCleared,
      lockedBefore:applyOrigin[0],
      lockedAfter:palette.base,
      structureChanged:palette.structure!==applyOrigin[1],
      accentChanged:palette.accent!==applyOrigin[2]
    };
  });
  expect(result.hadPreview).toBe(true);
  expect(result.staleCleared).toBe(true);
  expect(result.lockedAfter).toBe(result.lockedBefore);
  expect(result.structureChanged).toBe(true);
  expect(result.accentChanged).toBe(true);
});

test('V2.18 Context Preview 2.0 renders all five real-world scenes without mutating palette', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#F2EDE4','#292B29','#C8433D'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  const before=await page.evaluate(() => paletteArtifactBase());

  const scenes=[
    ['app','.cp2-app','App / Web'],
    ['brand','.cp2-brand','品牌'],
    ['room','.cp2-room','室內'],
    ['outfit','.cp2-outfit','穿搭'],
    ['slides','.cp2-slide','簡報']
  ];
  for(const [context,selector,label] of scenes){
    await page.locator('[data-context="'+context+'"]').click();
    await expect(page.locator('#uiPreview '+selector)).toBeVisible();
    await expect(page.locator('#uiPreview')).toHaveAttribute('aria-label',new RegExp(label));
    const current=await page.evaluate(() => paletteArtifactBase());
    expect(current.palette).toEqual(before.palette);
  }
});

test('V2.18 Dark preview only derives UI-like contexts while room and outfit stay exact', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#FFFFFF','#222222','#E24A3B'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('[data-context="app"]').click();
  await page.locator('[data-preview-theme="dark"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('Dark 預覽變體');
  const appBg=await page.locator('.cp2-app').evaluate(el => el.style.background);
  const darkBase=await page.evaluate(() => previewThemePalette('dark').base);
  expect(appBg.toUpperCase().replace(/\s/g,'')).not.toContain('FFFFFF');
  expect(darkBase).not.toBe(before.palette.base);

  await page.locator('[data-context="room"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('原色情境');
  const roomWall=await page.locator('.cp2-room-wall').getAttribute('style');
  expect(roomWall).toContain(before.palette.base);

  await page.locator('[data-context="outfit"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('原色情境');
  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after.palette).toEqual(before.palette);
});

test('V2.18 context preview stylesheet is local and loaded', async ({ page }) => {
  await expect(page.locator('link[href="./runtime/context-preview.css"]')).toHaveCount(1);
  const style=await page.evaluate(() => {
    const sheet=[...document.styleSheets].find(x => x.href?.includes('/runtime/context-preview.css'));
    return {loaded:!!sheet, rules:sheet?.cssRules?.length||0};
  });
  expect(style.loaded).toBe(true);
  expect(style.rules).toBeGreaterThan(20);
});

test('V2.19 photo strategies use detected clusters, dedupe perceptually, and separate Muted from Vivid', async ({ page }) => {
  const result=await page.evaluate(() => {
    const mk=(hex,proportion,edgeShare=0)=>({hex,proportion,edgeShare,...toOKLCH(hex)});
    const clusters=[
      mk('#D8C7A7',.40),mk('#D7C6A8',.06),
      mk('#27383A',.22),mk('#D94A3B',.08),
      mk('#9B806D',.12),mk('#526F91',.08),mk('#D84C3C',.04)
    ];
    const roles=[{label:'主體',hex:'#D8C7A7',proportion:.40},{label:'鮮明',hex:'#D94A3B',proportion:.08}];
    const distinct=photoDistinctClusters(clusters);
    const balanced=photoPaletteSelection(clusters,roles,'balanced');
    const muted=photoPaletteSelection(clusters,roles,'muted');
    const vivid=photoPaletteSelection(clusters,roles,'vivid');
    const source=new Set(clusters.map(x=>x.hex.toUpperCase()));
    return{
      raw:clusters.length,distinct:distinct.length,
      balanced,muted,vivid,
      allFromSource:[balanced,muted,vivid].every(x=>x.colors.every(c=>source.has(c))),
      mutedAccentC:toOKLCH(muted.colors[2]).c,
      vividAccentC:toOKLCH(vivid.colors[2]).c
    };
  });
  expect(result.distinct).toBeLessThan(result.raw);
  expect(result.allFromSource).toBe(true);
  for(const item of [result.balanced,result.muted,result.vivid]){
    expect(item.colors).toHaveLength(3);
    expect(new Set(item.colors).size).toBe(3);
    expect(item.minDistance).toBeGreaterThanOrEqual(0.045);
  }
  expect(result.vividAccentC).toBeGreaterThanOrEqual(result.mutedAccentC);
});

test('V2.19 strategy switching is preview-only until explicit photo apply', async ({ page }) => {
  const before=await page.evaluate(() => paletteArtifactBase());
  await page.evaluate(() => {
    switchTab('photo',false);
    photoPanel.classList.add('show');
    const mk=(hex,proportion,edgeShare=0)=>({hex,proportion,edgeShare,...toOKLCH(hex)});
    lastPhotoClusters=[
      mk('#D8C7A7',.40),mk('#27383A',.22),mk('#D94A3B',.08),
      mk('#9B806D',.12),mk('#526F91',.10),mk('#F2E9DC',.08,.65)
    ];
    lastPhotoRoles=semanticRolesFromClusters(lastPhotoClusters);
    document.querySelector('#photoAuto').hidden=false;
    renderPhotoPalette(lastPhotoRoles);
    renderPhotoStrategyPreview(lastPhotoClusters,lastPhotoRoles);
  });

  await expect(page.locator('#photoPalettePreview')).toBeVisible();
  await expect(page.locator('.photo-palette-ratio i')).toHaveCount(3);
  await page.locator('[data-photo-strategy="vivid"]').click();
  await expect(page.locator('[data-photo-strategy="vivid"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#photoPalettePreview')).toContainText('Vivid');

  const afterStrategy=await page.evaluate(() => paletteArtifactBase());
  expect(afterStrategy.palette).toEqual(before.palette);

  const expected=await page.evaluate(() => photoPaletteSelection(lastPhotoClusters,lastPhotoRoles,'vivid').colors);
  await page.locator('#photoUsePalette').click();
  const afterApply=await page.evaluate(() => paletteArtifactBase());
  expect([afterApply.palette.base,afterApply.palette.structure,afterApply.palette.accent]).toEqual(expected);
});

test('V2.19 photo palette runtime and styles are local', async ({ page }) => {
  await expect(page.locator('script[src="./runtime/photo-palette.js"]')).toHaveCount(1);
  await expect(page.locator('link[href="./runtime/photo-palette.css"]')).toHaveCount(1);
  const api=await page.evaluate(()=>({
    selection:typeof photoPaletteSelection,
    dedupe:typeof photoDistinctClusters,
    strategy:photoPaletteStyle
  }));
  expect(api.selection).toBe('function');
  expect(api.dedupe).toBe('function');
  expect(['balanced','muted','vivid']).toContain(api.strategy);
});

test('V2.20 Tailwind SwiftUI and SVG exports keep exact source palette', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const input=document.querySelector('#comboName');
    input.value='R&D <Test>';currentComboName=input.value;
    const tailwind=paletteArtifact('tailwind');
    const swift=paletteArtifact('swiftui');
    const svg=paletteArtifact('svg');
    return {tailwind,swift,svg,base:paletteArtifactBase()};
  });

  expect(result.base.palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
  expect(result.tailwind.name).toMatch(/\.tailwind\.js$/);
  expect(result.tailwind.type).toBe('text/javascript');
  for(const hex of ['#112233','#445566','#AABBCC'])expect(result.tailwind.text).toContain(hex);
  expect(result.tailwind.text).toContain("base: '#112233'");
  expect(result.tailwind.text).toContain("structure: '#445566'");
  expect(result.tailwind.text).toContain("accent: '#AABBCC'");

  expect(result.swift.name).toMatch(/\.swift$/);
  expect(result.swift.text).toContain('Color(red: 0.066667, green: 0.133333, blue: 0.200000)');
  expect(result.swift.text).toContain('Color(red: 0.266667, green: 0.333333, blue: 0.400000)');
  expect(result.swift.text).toContain('Color(red: 0.666667, green: 0.733333, blue: 0.800000)');
  expect(result.swift.text).toContain('// 75%');
  expect(result.swift.text).toContain('// 18%');
  expect(result.swift.text).toContain('// 7%');

  expect(result.svg.name).toMatch(/\.palette\.svg$/);
  expect(result.svg.type).toBe('image/svg+xml');
  expect(result.svg.text).toContain('R&amp;D &lt;Test&gt;');
  for(const hex of ['#112233','#445566','#AABBCC'])expect(result.svg.text).toContain(hex);
  expect(result.svg.text).toContain('width="792"');
  expect(result.svg.text).toContain('width="190"');
  expect(result.svg.text).toContain('width="74"');
});

test('V2.20 derived Dark preview never changes professional export values', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#F4EFE6','#28343A','#D4513D'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const source=paletteArtifactBase();
    const light={
      tailwind:paletteArtifact('tailwind').text,
      swiftui:paletteArtifact('swiftui').text,
      svg:paletteArtifact('svg').text
    };
    setPreviewTheme('dark');
    const darkPreview=previewThemePalette('dark');
    const after={
      tailwind:paletteArtifact('tailwind').text,
      swiftui:paletteArtifact('swiftui').text,
      svg:paletteArtifact('svg').text
    };
    return {source,light,after,darkPreview};
  });
  expect(result.darkPreview.base).not.toBe(result.source.palette.base);
  expect(result.after).toEqual(result.light);
  expect(result.after.tailwind).toContain(result.source.palette.base);
  expect(result.after.svg).not.toContain(result.darkPreview.base);
});

test('V2.20 keeps advanced handoff formats behind compact disclosure', async ({ page }) => {
  await expect(page.locator('#handoffMore')).toHaveCount(1);
  await expect(page.locator('[data-export-format="tailwind"]')).not.toBeVisible();
  await page.locator('#handoffMore summary').click();
  await expect(page.locator('[data-export-format="tailwind"]')).toBeVisible();
  await expect(page.locator('[data-export-format="swiftui"]')).toBeVisible();
  await expect(page.locator('[data-export-format="svg"]')).toBeVisible();
  await expect(page.locator('.handoff-more-actions .utility-btn')).toHaveCount(7);
  await expect(page.locator('#exportReferenceBoard')).toBeVisible();
});

test('V2.18 renders all five realistic 75/18/7 context scenes', async ({ page }) => {
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  const cases=[
    ['app','.cp2-app','App / Web'],
    ['brand','.cp2-brand','品牌'],
    ['room','.cp2-room','室內'],
    ['outfit','.cp2-outfit','穿搭'],
    ['slides','.cp2-slide','簡報']
  ];
  for(const [context,selector,label] of cases){
    await page.locator('[data-context="'+context+'"]').click();
    await expect(page.locator('#uiPreview '+selector)).toBeVisible();
    await expect(page.locator('#uiPreview')).toHaveAttribute('aria-label',new RegExp(label));
  }
});

test('V2.18 context switching and Dark preview never mutate the source palette', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('[data-context="app"]').click();
  await page.locator('[data-preview-theme="dark"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('Dark 預覽變體');
  await expect(page.locator('#uiPreview .cp2-app')).toBeVisible();

  await page.locator('[data-context="brand"]').click();
  await expect(page.locator('#uiPreview .cp2-brand')).toBeVisible();
  await page.locator('[data-context="slides"]').click();
  await expect(page.locator('#uiPreview .cp2-slide')).toBeVisible();

  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after.palette).toEqual(before.palette);
});

test('V2.18 Room and Outfit stay on exact source colors even while Dark mode is selected', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('[data-preview-theme="dark"]').click();

  for(const context of ['room','outfit']){
    await page.locator('[data-context="'+context+'"]').click();
    await expect(page.locator('#contextThemeNote')).toContainText('原色情境');
    const result=await page.evaluate(() => ({
      context:previewContext,
      palette:paletteArtifactBase().palette,
      note:document.querySelector('#contextThemeNote')?.textContent||''
    }));
    expect(result.context).toBe(context);
    expect(result.palette).toEqual({base:'#E7DCC8',structure:'#274C55',accent:'#C65338'});
    expect(result.note).toContain('原色情境');
  }
});

test('V2.18 App scene uses all three palette roles in distinct product UI responsibilities', async ({ page }) => {
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('[data-context="app"]').click();
  await expect(page.locator('.cp2-app-rail')).toBeVisible();
  await expect(page.locator('.cp2-app-hero')).toBeVisible();
  await expect(page.locator('.cp2-app-cta')).toBeVisible();
  await expect(page.locator('.cp2-app-card')).toHaveCount(2);
});

test('V2.21 Color Relationship Map visualizes Hue Lightness Chroma and 75/18/7 without mutation', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await expect(page.locator('#colorRelationshipMap')).toBeVisible();
  await expect(page.locator('#colorRelationshipMap .crm-point')).toHaveCount(3);
  await expect(page.locator('#colorRelationshipMap .crm-wheel line')).toHaveCount(3);
  await expect(page.locator('#colorRelationshipMap .crm-metric')).toHaveCount(2);
  await expect(page.locator('#colorRelationshipMap .crm-role-weight i')).toHaveCount(3);
  await expect(page.locator('#colorRelationshipMap')).toContainText('Lightness');
  await expect(page.locator('#colorRelationshipMap')).toContainText('Chroma');
  await expect(page.locator('#colorRelationshipMap')).toContainText('只讀分析');
  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
});

test('V2.21 relationship analysis preserves exact semantic role order', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    const roles=relationshipRoleData().map(x=>({key:x.key,ratio:x.ratio,hex:x.hex}));
    const verdict=relationshipVerdict(relationshipRoleData());
    renderColorRelationshipMap();
    return {before,after:paletteArtifactBase(),roles,verdict};
  });
  expect(result.roles).toEqual([
    {key:'base',ratio:75,hex:'#112233'},
    {key:'structure',ratio:18,hex:'#445566'},
    {key:'accent',ratio:7,hex:'#AABBCC'}
  ]);
  expect(result.after).toEqual(result.before);
  expect(result.verdict.hueText.length).toBeGreaterThan(8);
  expect(result.verdict.lightText.length).toBeGreaterThan(8);
  expect(result.verdict.accentText.length).toBeGreaterThan(8);
});

test('V2.22 Role Scale keeps exact source color as one anchor per semantic role', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    const system=roleScaleSystem();
    const compact={};
    for(const key of ['base','structure','accent']){
      compact[key]={
        source:system[key].source,
        exact:system[key].scale.filter(x=>x.source).map(x=>x.hex),
        stops:system[key].scale.map(x=>x.stop),
        lightness:system[key].scale.map(x=>x.l)
      };
    }
    return {before,after:paletteArtifactBase(),compact};
  });
  expect(result.after).toEqual(result.before);
  for(const [key,hex] of [['base','#E7DCC8'],['structure','#274C55'],['accent','#C65338']]){
    expect(result.compact[key].source).toBe(hex);
    expect(result.compact[key].exact).toEqual([hex]);
    expect(result.compact[key].stops).toEqual([50,100,200,300,400,500,600,700,800,900]);
    const ls=result.compact[key].lightness;
    for(let i=1;i<ls.length;i++)expect(ls[i]).toBeLessThanOrEqual(ls[i-1]+0.012);
  }
});

test('V2.22 Role Scale renders 30 derived swatches and suggested usage without mutating Compose', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#F4EFE6','#28343A','#D4513D'];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('#roleScaleDetails').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await expect(page.locator('#roleScale')).toBeVisible();
  await expect(page.locator('#roleScale .rscale-role')).toHaveCount(3);
  await expect(page.locator('#roleScale .rscale-swatch')).toHaveCount(30);
  await expect(page.locator('#roleScale .rscale-swatch.source')).toHaveCount(3);
  await expect(page.locator('#roleScale .rscale-token')).toHaveCount(6);
  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
});

test('V2.22 Role Scale CSS exposes exact source variables separately from derived stops', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    const text=roleScaleCssText();
    return {before,after:paletteArtifactBase(),text};
  });
  expect(result.after).toEqual(result.before);
  expect(result.text).toContain('--color-base-source: #112233;');
  expect(result.text).toContain('--color-structure-source: #445566;');
  expect(result.text).toContain('--color-accent-source: #AABBCC;');
  expect((result.text.match(/exact source/g)||[]).length).toBe(3);
});

test('V2.23 Shareable Snapshot round-trips exact source roles without changing the current URL', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    previewContext='room';previewTheme='dark';
    const beforeHash=location.hash;
    const before=paletteArtifactBase();
    const hash=shareSnapshotHash();
    const url=shareSnapshotUrl();
    const parsed=parseShareSnapshot(hash);
    return {beforeHash,afterHash:location.hash,before,hash,url,parsed};
  });
  expect(result.afterHash).toBe(result.beforeHash);
  expect(result.hash).toBe('#clv=1&cl=112233-445566-AABBCC&ctx=room&theme=dark');
  expect(result.parsed.colors).toEqual(['#112233','#445566','#AABBCC']);
  expect(result.parsed.context).toBe('room');
  expect(result.parsed.theme).toBe('dark');
  expect(result.url).toContain('#clv=1&cl=112233-445566-AABBCC&ctx=room&theme=dark');
});

test('V2.23 shared URL restores Base Structure Accent order before initial render', async ({ page }) => {
  await page.goto('/#clv=1&cl=112233-445566-AABBCC&ctx=slides&theme=dark');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();
  const state=await page.evaluate(() => ({
    selected:[...selectedColors],
    palette:paletteArtifactBase().palette,
    context:previewContext,
    theme:previewTheme,
    locks:[...lockedSlots]
  }));
  expect(state.selected).toEqual(['#112233','#445566','#AABBCC']);
  expect(state.palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
  expect(state.context).toBe('slides');
  expect(state.theme).toBe('dark');
  expect(state.locks).toEqual([false,false,false]);
});

test('V2.23 share action renders a same-origin QR and restorable link locally', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  await page.locator('#sharePalette').click();
  await expect(page.locator('#shareSnapshotPanel')).toBeVisible();
  await expect(page.locator('#shareSnapshotUrl')).toHaveValue(/#clv=1&cl=E7DCC8-274C55-C65338/);
  await expect(page.locator('#shareSnapshotRatio i')).toHaveCount(3);
  await expect(page.locator('#shareSnapshotQr').locator('canvas, img').first()).toBeVisible();
  await expect(page.locator('script[src="./vendor/qrcode.min.js"]')).toHaveCount(1);
});

test('V2.23 snapshot parser fails closed on malformed palette payloads', async ({ page }) => {
  const result=await page.evaluate(() => [
    parseShareSnapshot('#clv=1&cl=123456-ABCDEF&ctx=app&theme=light'),
    parseShareSnapshot('#clv=1&cl=GGGGGG-445566-AABBCC&ctx=app&theme=light'),
    parseShareSnapshot('#clv=2&cl=112233-445566-AABBCC&ctx=app&theme=light')
  ]);
  expect(result).toEqual([null,null,null]);
});



test('V2.24 Custom Design Preview sanitizes unsafe SVG content before rendering', async ({ page }) => {
  const result=await page.evaluate(() => {
    const unsafe='<svg viewBox="0 0 100 100" onload="alert(1)"><script>alert(1)</script><image href="https://example.com/a.png"/><rect x="0" y="0" width="60" height="100" fill="#112233" onclick="alert(2)"/><path d="M60 0H100V100H60Z" style="fill:#445566;stroke:#AABBCC;filter:url(#x)"/></svg>';
    const parsed=customDesignSanitizeSvg(unsafe);
    return {markup:parsed.markup,colors:parsed.colors.map(x=>x.hex)};
  });
  expect(result.markup).not.toContain('<script');
  expect(result.markup).not.toContain('<image');
  expect(result.markup).not.toContain('onload=');
  expect(result.markup).not.toContain('onclick=');
  expect(result.markup).not.toContain('href=');
  expect(result.markup).not.toContain('filter=');
  expect(result.markup).not.toContain('url(');
  expect(result.colors).toEqual(expect.arrayContaining(['#112233','#445566','#AABBCC']));
});

test('V2.24 maps local SVG flat colors to exact source roles without mutating Compose', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('#customDesignPreviewDetails').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });

  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="40" height="80" fill="#111111"/><rect x="40" width="20" height="80" fill="#111111"/><rect x="60" width="20" height="80" fill="#111111"/><rect x="80" width="20" height="80" fill="#222222"/><circle cx="100" cy="20" r="10" fill="#222222"/><circle cx="105" cy="55" r="8" fill="#333333"/></svg>';
  await page.locator('#customDesignInput').setInputFiles({name:'sample.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});

  await expect(page.locator('#customDesignStatus')).toContainText('sample.svg');
  await expect(page.locator('#customDesignMappings select')).toHaveCount(3);
  await expect(page.locator('#customDesignCanvas svg')).toBeVisible();

  const mapped=await page.evaluate(() => ({
    roles:customDesignMappedRoles(),
    markup:customDesignMappedMarkup(),
    after:paletteArtifactBase()
  }));
  expect(mapped.roles).toEqual({
    '#111111':'#E7DCC8',
    '#222222':'#274C55',
    '#333333':'#C65338'
  });
  expect(mapped.markup).toContain('#E7DCC8');
  expect(mapped.markup).toContain('#274C55');
  expect(mapped.markup).toContain('#C65338');
  expect(mapped.after).toEqual(before);

  await page.locator('[data-custom-design-color="#333333"]').selectOption('keep');
  const afterManual=await page.evaluate(() => ({markup:customDesignMappedMarkup(),palette:paletteArtifactBase()}));
  expect(afterManual.markup).toContain('#333333');
  expect(afterManual.palette).toEqual(before);
});


test('V2.25 detects CVD role conflicts and previews a minimal fix without mutating source colors', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#777777','#787878','#E24A3B'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('[data-vision="deutan"]').click();

  const result=await page.evaluate(() => {
    const analysis=visionAnalysis('deutan');
    const fixes=visionFixes(analysis);
    const first=fixes[0]||null;
    if(first)previewVisionSuggestion(first.role,first.suggestion.color);
    return {
      pairs:analysis.pairs.map(x=>({a:x.a,b:x.b,status:x.status.key,distance:x.distance})),
      fix:first&&{role:first.role,color:first.suggestion.color,method:first.suggestion.method},
      preview:visionFixPreview,
      after:paletteArtifactBase()
    };
  });

  expect(result.pairs.find(x=>x.a==='base'&&x.b==='structure')?.status).not.toBe('clear');
  expect(result.fix).not.toBeNull();
  expect(['structure','accent']).toContain(result.fix.role);
  expect(result.preview).not.toBeNull();
  expect(result.after).toEqual(before);
  await expect(page.locator('#visionPreview')).toContainText('最小修正方向');
  await expect(page.locator('#visionPreview')).toContainText('只比較，不改原色');
  await expect(page.locator('#visionPreview')).toContainText('不代表臨床色覺測試');
});

test('V2.25 syncs CVD simulation across all five context previews and restores exact source preview', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    lockedSlots=[false,false,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('[data-context="room"]').click();
  const normalRoom=await page.locator('.cp2-room-wall').evaluate(el => getComputedStyle(el).backgroundColor);

  await page.locator('[data-vision="deutan"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('綠色弱近似模擬');
  await expect(page.locator('#contextThemeNote')).toContainText('原色不變');

  const expected=await page.evaluate(() => transformVision(palette.base,'deutan'));
  const expectedCss=await page.evaluate(hex => {
    const probe=document.createElement('i');probe.style.background=hex;document.body.appendChild(probe);
    const value=getComputedStyle(probe).backgroundColor;probe.remove();return value;
  },expected);
  const simulatedRoom=await page.locator('.cp2-room-wall').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(simulatedRoom).toBe(expectedCss);
  expect(simulatedRoom).not.toBe(normalRoom);

  for(const [context,selector] of [
    ['app','.cp2-app'],['brand','.cp2-brand'],['room','.cp2-room'],['outfit','.cp2-outfit'],['slides','.cp2-slide']
  ]){
    await page.locator('[data-context="'+context+'"]').click();
    await expect(page.locator('#uiPreview '+selector)).toBeVisible();
    await expect(page.locator('#uiPreview')).toHaveAttribute('aria-label',/綠色弱近似模擬/);
  }

  await page.locator('[data-context="room"]').click();
  await page.locator('[data-vision="normal"]').click();
  await expect(page.locator('#contextThemeNote')).toContainText('原色情境');
  const restoredRoom=await page.locator('.cp2-room-wall').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(restoredRoom).toBe(normalRoom);
  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
});

test('V2.25 explicit vision fix respects locked roles and only applies after confirmation', async ({ page }) => {
  const setup=await page.evaluate(() => {
    selectedColors=['#777777','#787878','#E24A3B'];
    lockedSlots=[false,true,false];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const analysis=visionAnalysis('deutan');
    const fix=visionMinimalFix(analysis.pairs.find(x=>x.a==='base'&&x.b==='structure'),'deutan');
    return {before:paletteArtifactBase(),fix:fix&&{role:fix.role,color:fix.suggestion.color}};
  });
  expect(setup.fix).not.toBeNull();
  expect(setup.fix.role).toBe('structure');

  await page.evaluate(fix => applyVisionSuggestion(fix.role,fix.color),setup.fix);
  const locked=await page.evaluate(() => paletteArtifactBase());
  expect(locked).toEqual(setup.before);

  await page.evaluate(fix => {
    lockedSlots[1]=false;
    applyVisionSuggestion(fix.role,fix.color);
  },setup.fix);
  const applied=await page.evaluate(() => paletteArtifactBase());
  expect(applied.palette.base).toBe(setup.before.palette.base);
  expect(applied.palette.accent).toBe(setup.before.palette.accent);
  expect(applied.palette.structure).toBe(setup.fix.color);
});


test('V2.26 Local Projects filters saved palettes without mutating their source colors', async ({ page }) => {
  const result=await page.evaluate(() => {
    localStorage.setItem('colorlab.saved',JSON.stringify([
      sanitizeSavedRecord({name:'Portfolio UI',projectId:'prj-alpha1',palette:{base:'#112233',structure:'#445566',accent:'#AABBCC'},selectedColors:['#112233','#445566','#AABBCC'],lockedSlots:[false,false,false],mode:'quiet',date:2}),
      sanitizeSavedRecord({name:'Room',projectId:'prj-room01',palette:{base:'#E7DCC8',structure:'#274C55',accent:'#C65338'},selectedColors:['#E7DCC8','#274C55','#C65338'],lockedSlots:[false,false,false],mode:'quiet',date:1})
    ]));
    writeLocalProjects([
      {id:'prj-alpha1',name:'PortfolioPilot',createdAt:1},
      {id:'prj-room01',name:'Room Design',createdAt:2}
    ]);
    switchTab('library',false);renderSaved();
    const before=readSavedData().map(x=>({name:x.name,palette:x.palette}));
    return {before,projects:readLocalProjects()};
  });
  expect(result.projects.map(x=>x.name)).toEqual(['PortfolioPilot','Room Design']);
  await expect(page.locator('#localProjectsPanel')).toBeVisible();
  await expect(page.locator('#localProjectChips [data-project-filter="prj-alpha1"]')).toContainText('PortfolioPilot');
  await page.locator('#localProjectChips [data-project-filter="prj-alpha1"]').click();
  await expect(page.locator('#saved .library-piece')).toHaveCount(1);
  await expect(page.locator('#saved')).toContainText('Portfolio UI');
  const after=await page.evaluate(() => readSavedData().map(x=>({name:x.name,palette:x.palette})));
  expect(after).toEqual(result.before);
});

test('V2.26 deleting a project only unassigns palettes and never deletes them', async ({ page }) => {
  const result=await page.evaluate(() => {
    localStorage.setItem('colorlab.saved',JSON.stringify([
      sanitizeSavedRecord({name:'A',projectId:'prj-delete1',palette:{base:'#112233',structure:'#445566',accent:'#AABBCC'},selectedColors:['#112233','#445566','#AABBCC'],mode:'quiet',date:2}),
      sanitizeSavedRecord({name:'B',projectId:'',palette:{base:'#E7DCC8',structure:'#274C55',accent:'#C65338'},selectedColors:['#E7DCC8','#274C55','#C65338'],mode:'quiet',date:1})
    ]));
    writeLocalProjects([{id:'prj-delete1',name:'Delete Me',createdAt:1}]);
    window.confirm=()=>true;
    const before=readSavedData().map(x=>({name:x.name,palette:x.palette}));
    deleteLocalProject('prj-delete1');
    return {
      before,
      after:readSavedData().map(x=>({name:x.name,projectId:x.projectId,palette:x.palette})),
      projects:readLocalProjects()
    };
  });
  expect(result.after).toHaveLength(2);
  expect(result.after.map(x=>({name:x.name,palette:x.palette}))).toEqual(result.before);
  expect(result.after.find(x=>x.name==='A').projectId).toBe('');
  expect(result.projects).toEqual([]);
});

test('V2.26 imported project ID collisions are remapped without misassigning palettes', async ({ page }) => {
  const result=await page.evaluate(() => {
    const incoming=[{id:'prj-shared1',name:'Imported Project',createdAt:2}];
    const saved=[{name:'Imported Palette',projectId:'prj-shared1'}];
    const current=[{id:'prj-shared1',name:'Existing Project',createdAt:1}];
    return mergeImportedProjectData(incoming,saved,current);
  });
  expect(result.projects).toHaveLength(2);
  const existing=result.projects.find(x=>x.name==='Existing Project');
  const imported=result.projects.find(x=>x.name==='Imported Project');
  expect(existing.id).toBe('prj-shared1');
  expect(imported.id).not.toBe('prj-shared1');
  expect(result.saved[0].projectId).toBe(imported.id);
});

test('V2.26 project picker assigns a saved palette while preserving palette data', async ({ page }) => {
  const before=await page.evaluate(() => {
    localStorage.setItem('colorlab.saved',JSON.stringify([
      sanitizeSavedRecord({name:'Brand',projectId:'',palette:{base:'#F4EFE6',structure:'#28343A',accent:'#D4513D'},selectedColors:['#F4EFE6','#28343A','#D4513D'],mode:'quiet',date:1})
    ]));
    writeLocalProjects([{id:'prj-brand01',name:'Brand Refresh',createdAt:1}]);
    switchTab('library',false);renderSaved();
    return readSavedData()[0].palette;
  });
  await page.locator('[data-saved-menu="0"]').click();
  await expect(page.locator('[data-saved-action="project"]')).toBeVisible();
  await page.locator('[data-saved-action="project"]').click();
  await expect(page.locator('#projectPickerBackdrop')).toBeVisible();
  await page.locator('[data-project-pick="prj-brand01"]').click();
  const after=await page.evaluate(() => readSavedData()[0]);
  expect(after.projectId).toBe('prj-brand01');
  expect(after.palette).toEqual(before);
});


test('V2.26 backup dedupe preserves imported project assignment on an existing palette', async ({ page }) => {
  const result=await page.evaluate(() => {
    const current=[sanitizeSavedRecord({
      name:'Same Palette',projectId:'',
      palette:{base:'#112233',structure:'#445566',accent:'#AABBCC'},
      selectedColors:['#112233','#445566','#AABBCC'],mode:'quiet',date:1
    })];
    const imported=[sanitizeSavedRecord({
      name:'Same Palette',projectId:'prj-import1',
      palette:{base:'#112233',structure:'#445566',accent:'#AABBCC'},
      selectedColors:['#112233','#445566','#AABBCC'],mode:'quiet',date:2
    })];
    return mergeSavedPaletteRecords(current,imported);
  });
  expect(result).toHaveLength(1);
  expect(result[0].projectId).toBe('prj-import1');
  expect(result[0].palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
});


test('V2.27 Reference Board uses exact source colors despite derived preview modes', async ({ page }) => {
  const result=await page.evaluate(async () => {
    selectedColors=['#112233','#445566','#AABBCC'];
    lockedSlots=[false,false,false];activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    setPreviewTheme('dark');
    setVisionMode('deutan');
    const data=await referenceBoardData();
    const after=paletteArtifactBase();
    return {before,data,after,theme:previewTheme,vision:visionMode};
  });
  expect(result.theme).toBe('dark');
  expect(result.vision).toBe('deutan');
  expect(result.data.palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
  expect(result.data.ratios).toEqual({base:75,structure:18,accent:7});
  expect(result.data.toneLabel.length).toBeGreaterThan(0);
  expect(result.after).toEqual(result.before);
});

test('V2.27 Reference Board renders a 1600x1200 palette board when no photo is loaded', async ({ page }) => {
  const result=await page.evaluate(async () => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    if(typeof photoObjectURL!=='undefined')photoObjectURL=null;
    const before=paletteArtifactBase();
    const board=await drawReferenceBoard();
    const pixel=board.canvas.getContext('2d').getImageData(1100,300,1,1).data;
    const hex='#'+[pixel[0],pixel[1],pixel[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
    return {width:board.canvas.width,height:board.canvas.height,data:board.data,pixel:hex,before,after:paletteArtifactBase()};
  });
  expect(result.width).toBe(1600);
  expect(result.height).toBe(1200);
  expect(result.data.hasPhoto).toBe(false);
  expect(result.pixel).toBe('#E7DCC8');
  expect(result.after).toEqual(result.before);
});

test('V2.27 Reference Board can include the current local photo without changing palette data', async ({ page }) => {
  const result=await page.evaluate(async () => {
    selectedColors=['#F4EFE6','#28343A','#D4513D'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    photoObjectURL='blob:color-lab-reference-test';
    photoCanvas.width=120;photoCanvas.height=80;
    const ctx=photoCanvas.getContext('2d');ctx.fillStyle='#00CC66';ctx.fillRect(0,0,120,80);
    const before=paletteArtifactBase();
    const board=await drawReferenceBoard();
    const pixel=board.canvas.getContext('2d').getImageData(300,400,1,1).data;
    const hex='#'+[pixel[0],pixel[1],pixel[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
    photoObjectURL=null;
    return {hasPhoto:board.data.hasPhoto,pixel:hex,before,after:paletteArtifactBase()};
  });
  expect(result.hasPhoto).toBe(true);
  expect(result.pixel).toBe('#00CC66');
  expect(result.after).toEqual(result.before);
});

test('V2.27 Reference Board export stays behind the existing handoff disclosure', async ({ page }) => {
  await expect(page.locator('#exportReferenceBoard')).toHaveCount(1);
  await expect(page.locator('#exportReferenceBoard')).not.toBeVisible();
  await page.locator('#handoffMore summary').click();
  await expect(page.locator('#exportReferenceBoard')).toBeVisible();
  await expect(page.locator('#handoffMore .handoff-more-actions .utility-btn')).toHaveCount(4);
});


test('V2.28 Gradient Studio uses exact source colors despite Dark and CVD previews', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    lockedSlots=[false,false,false];activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    setPreviewTheme('dark');
    setVisionMode('deutan');
    const source=gradientStudioSource();
    const css=gradientStudioCss('base-accent',135);
    const after=paletteArtifactBase();
    return {before,source,css,after,theme:previewTheme,vision:visionMode};
  });
  expect(result.theme).toBe('dark');
  expect(result.vision).toBe('deutan');
  expect(result.source.palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
  expect(result.css).toBe('background: linear-gradient(135deg, #112233 0%, #AABBCC 100%);');
  expect(result.after).toEqual(result.before);
});

test('V2.28 Gradient Studio renders four role paths and four controlled angles without mutating Compose', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#E7DCC8','#274C55','#C65338'];
    lockedSlots=[false,false,false];activeSlot=0;seed=selectedColors[0];generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());
  await page.locator('#composeDeepDive').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });
  await page.locator('#gradientStudioDetails').evaluate(el => { el.open=true; el.dispatchEvent(new Event('toggle')); });

  await expect(page.locator('#gradientStudioPreview')).toBeVisible();
  await expect(page.locator('#gradientStudioPairs [data-gradient-pair]')).toHaveCount(4);
  await expect(page.locator('#gradientStudioAngles [data-gradient-angle]')).toHaveCount(4);
  await expect(page.locator('#gradientStudioCode')).toContainText('#E7DCC8');
  await expect(page.locator('#gradientStudioCode')).toContainText('#C65338');

  await page.locator('[data-gradient-pair="structure-accent"]').click();
  await page.locator('[data-gradient-angle="90"]').click();
  await expect(page.locator('#gradientStudioCode')).toHaveText('background: linear-gradient(90deg, #274C55 0%, #C65338 100%);');
  await expect(page.locator('[data-gradient-pair="structure-accent"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-gradient-angle="90"]')).toHaveAttribute('aria-pressed','true');

  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
});

test('V2.28 three-role gradient preserves exact Base Structure Accent order and stays derivative-only', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#F4EFE6','#28343A','#D4513D'];
    activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    const stops=gradientStudioStops('system').map(x=>({role:x.role,hex:x.hex,stop:x.stop}));
    const gradient=gradientStudioGradient('system',45);
    setGradientStudioPair('system');
    setGradientStudioAngle(45);
    return {before,stops,gradient,after:paletteArtifactBase(),pair:gradientStudioPair,angle:gradientStudioAngle};
  });
  expect(result.stops).toEqual([
    {role:'base',hex:'#F4EFE6',stop:0},
    {role:'structure',hex:'#28343A',stop:50},
    {role:'accent',hex:'#D4513D',stop:100}
  ]);
  expect(result.gradient).toBe('linear-gradient(45deg, #F4EFE6 0%, #28343A 50%, #D4513D 100%)');
  expect(result.pair).toBe('system');
  expect(result.angle).toBe(45);
  expect(result.after).toEqual(result.before);
});


test('V2.29 exports SCSS Flutter and Jetpack from exact source colors', async ({ page }) => {
  const result=await page.evaluate(() => {
    selectedColors=['#112233','#445566','#AABBCC'];
    lockedSlots=[false,false,false];activeSlot=0;seed=selectedColors[0];generate(false);
    const before=paletteArtifactBase();
    setPreviewTheme('dark');
    setVisionMode('deutan');
    setGradientStudioPair('system');
    setGradientStudioAngle(45);
    const scss=paletteArtifact('scss');
    const flutter=paletteArtifact('flutter');
    const jetpack=paletteArtifact('jetpack');
    return {before,after:paletteArtifactBase(),scss,flutter,jetpack};
  });

  expect(result.scss.name).toMatch(/\.scss$/);
  expect(result.scss.text).toContain('$color-base: #112233;');
  expect(result.scss.text).toContain('$color-structure: #445566;');
  expect(result.scss.text).toContain('$color-accent: #AABBCC;');

  expect(result.flutter.name).toMatch(/\.dart$/);
  expect(result.flutter.text).toContain('Color(0xFF112233)');
  expect(result.flutter.text).toContain('Color(0xFF445566)');
  expect(result.flutter.text).toContain('Color(0xFFAABBCC)');

  expect(result.jetpack.name).toMatch(/\.kt$/);
  expect(result.jetpack.text).toContain('Color(0xFF112233)');
  expect(result.jetpack.text).toContain('Color(0xFF445566)');
  expect(result.jetpack.text).toContain('Color(0xFFAABBCC)');
  expect(result.after).toEqual(result.before);
});

test('V2.29 framework formats remain inside the existing compact handoff disclosure', async ({ page }) => {
  await expect(page.locator('[data-export-format="scss"]')).not.toBeVisible();
  await expect(page.locator('[data-export-format="flutter"]')).not.toBeVisible();
  await expect(page.locator('[data-export-format="jetpack"]')).not.toBeVisible();

  await page.locator('#handoffMore summary').click();

  await expect(page.locator('[data-export-format="scss"]')).toBeVisible();
  await expect(page.locator('[data-export-format="flutter"]')).toBeVisible();
  await expect(page.locator('[data-export-format="jetpack"]')).toBeVisible();
  await expect(page.locator('#handoffMore .handoff-more-actions .utility-btn')).toHaveCount(7);
});
