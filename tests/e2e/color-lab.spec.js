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
