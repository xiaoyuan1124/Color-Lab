import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();
});

async function setExactPalette(page,colors=['#E7DCC8','#274C55','#C65338']){
  await page.evaluate(colors => {
    selectedColors=[...colors];
    lockedSlots=[false,false,false];
    activeSlot=0;
    seed=selectedColors[0];
    generate(false);
  },colors);
}

test('WebKit boots the mobile Compose shell and keeps 75 / 18 / 7 visible', async ({ page }) => {
  await expect(page.locator('#preview > div')).toHaveCount(3);
  await expect(page.locator('#preview > div').nth(0)).toContainText('75');
  await expect(page.locator('#preview > div').nth(1)).toContainText('18');
  await expect(page.locator('#preview > div').nth(2)).toContainText('7');

  const toggle=page.locator('#cornerNavToggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.locator('#nav-library').click();
  await expect(page.locator('.tab-view[data-view="library"]')).toBeVisible();
});

test('WebKit preserves exact source roles through Deep Dive and remembers its section', async ({ page }) => {
  await setExactPalette(page,['#112233','#445566','#AABBCC']);
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('#composeDeepDive > summary').click();
  await page.locator('#deepValidation > summary').click();
  await expect(page.locator('#deepValidation')).toHaveAttribute('open','');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('colorlab.deepSection'))).toBe('deepValidation');

  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);

  await page.reload();
  await page.locator('#composeDeepDive > summary').click();
  await expect(page.locator('#deepValidation')).toHaveAttribute('open','');
  const restored=await page.evaluate(() => paletteArtifactBase());
  expect(restored.palette).toEqual(before.palette);
});

test('WebKit LocalStorage library survives reload with exact palette colors', async ({ page }) => {
  await setExactPalette(page,['#F4EFE6','#28343A','#D4513D']);
  await page.locator('#comboName').fill('WebKit Palette');
  await page.locator('#save').click();
  await expect.poll(() => page.evaluate(() => readSavedData().length)).toBe(1);

  await page.reload();
  await page.locator('#cornerNavToggle').click();
  await page.locator('#nav-library').click();
  await expect(page.locator('#saved')).toContainText('WebKit Palette');

  const saved=await page.evaluate(() => readSavedData()[0]?.palette);
  expect(saved).toEqual({base:'#F4EFE6',structure:'#28343A',accent:'#D4513D'});
});

test('WebKit share hash restores exact roles and preview state', async ({ page }) => {
  await page.goto('/#clv=1&cl=112233-445566-AABBCC&ctx=room&theme=dark');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();

  const result=await page.evaluate(() => ({
    palette:paletteArtifactBase().palette,
    context:previewContext,
    theme:previewTheme
  }));
  expect(result.palette).toEqual({base:'#112233',structure:'#445566',accent:'#AABBCC'});
  expect(result.context).toBe('room');
  expect(result.theme).toBe('dark');
});

test('WebKit can decode a local image into canvas and derive photo clusters', async ({ page }) => {
  await page.locator('#cornerNavToggle').click();
  await page.locator('#nav-photo').click();
  await expect(page.locator('.tab-view[data-view="photo"]')).toBeVisible();

  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><rect width="150" height="120" fill="#E7DCC8"/><rect x="150" width="90" height="120" fill="#274C55"/><rect x="240" width="60" height="120" fill="#C65338"/></svg>';
  await page.locator('#photoInput').setInputFiles({
    name:'webkit-photo.svg',
    mimeType:'image/svg+xml',
    buffer:Buffer.from(svg)
  });

  await expect.poll(() => page.evaluate(() => photoCanvas.width)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => lastPhotoClusters.length)).toBeGreaterThanOrEqual(3);
  await expect(page.locator('#photoPanel')).toHaveClass(/show/);
  await expect(page.locator('#photoPalettePreview')).toBeVisible();
});


test('WebKit PWA update prompt remains explicit and never mutates source colors', async ({ page }) => {
  await setExactPalette(page,['#112233','#445566','#AABBCC']);
  const result=await page.evaluate(() => {
    const before=paletteArtifactBase();
    pwaRegistration={waiting:{postMessage:()=>{}},addEventListener:()=>{}};
    pwaUpdateReady=false;
    pwaUpdateRequested=false;
    pwaMarkUpdateReady(pwaRegistration);
    return{
      before,
      after:paletteArtifactBase(),
      ready:pwaUpdateReady,
      requested:pwaUpdateRequested,
      state:document.getElementById('pwaHealthCard')?.dataset.state||'',
      title:document.getElementById('pwaHealthTitle')?.textContent||'',
      action:document.getElementById('pwaHealthAction')?.textContent||''
    };
  });

  expect(result.ready).toBe(true);
  expect(result.requested).toBe(false);
  expect(result.state).toBe('update');
  expect(result.title).toBe('新版已準備好');
  expect(result.action).toBe('更新');
  expect(result.after).toEqual(result.before);
});


test('WebKit keeps recommendation engine lazy until Inspire and preserves source roles', async ({ page }) => {
  await page.evaluate(() => {
    selectedColors=['#112233','',''];
    lockedSlots=[false,false,false];
    activeSlot=0;
    seed=selectedColors[0];
    generate(false);
  });
  const before=await page.evaluate(() => paletteArtifactBase());
  expect(await page.evaluate(() => typeof window.recommendationCombos)).toBe('undefined');

  await page.locator('#cornerNavToggle').click();
  await page.locator('#nav-inspire').click();
  await expect(page.locator('.tab-view[data-view="inspire"]')).toBeVisible();

  await expect.poll(() => page.evaluate(() => typeof window.recommendationCombos)).toBe('function');
  await expect(page.locator('script[data-lazy-runtime="./data/recommendation-engine.js"]')).toHaveCount(1);
  await expect(page.locator('#recommendationProgress')).toContainText('第 1 /');

  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
  expect(after.palette.base).toBe('#112233');
});

test('WebKit loads V2.37 color quality core before dependent palette runtime', async ({ page }) => {
  const result=await page.evaluate(() => {
    const src=[...document.scripts].map(script=>script.getAttribute('src')).filter(Boolean);
    return{
      core:src.indexOf('./core/color-quality.js'),
      palette:src.indexOf('./runtime/palette-tools.js'),
      ready:typeof qualityRefineGenerated==='function'&&typeof contrastRatio==='function'
    };
  });
  expect(result.ready).toBe(true);
  expect(result.core).toBeGreaterThanOrEqual(0);
  expect(result.palette).toBeGreaterThan(result.core);
});

