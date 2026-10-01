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

test('WebKit V2.38 invalidates pending Inspire work after leaving the route', async ({ page }) => {
  await page.evaluate(() => ensureInspirationResources());
  const result=await page.evaluate(async () => {
    const originalEnsure=ensureInspirationResources;
    const originalIdeas=renderIdeas;
    const originalRecommendations=renderRecommendations;
    const originalIdle=window.requestIdleCallback;
    let ideas=0,recommendations=0,resolveFirst=null;

    window.requestIdleCallback=cb=>setTimeout(()=>cb({didTimeout:false,timeRemaining:()=>50}),0);
    renderIdeas=()=>{ideas++};
    renderRecommendations=()=>{recommendations++};
    ensureInspirationResources=()=>new Promise(resolve=>{resolveFirst=resolve});

    switchTab('inspire',false);
    await new Promise(resolve=>setTimeout(resolve,12));
    switchTab('compose',false);
    if(resolveFirst)resolveFirst([]);
    await new Promise(resolve=>setTimeout(resolve,18));

    const state={
      ideas,
      recommendations,
      active:document.querySelector('.tab-view.active')?.dataset.view||'',
      pending:secondaryRenderPending
    };

    ensureInspirationResources=originalEnsure;
    renderIdeas=originalIdeas;
    renderRecommendations=originalRecommendations;
    window.requestIdleCallback=originalIdle;
    return state;
  });

  expect(result).toEqual({ideas:0,recommendations:0,active:'compose',pending:false});
});



test('WebKit V2.39 releases decoded photo URLs while keeping canvas photo availability', async ({ page }) => {
  await page.locator('#cornerNavToggle').click();
  await page.locator('#nav-photo').click();
  await page.evaluate(() => {
    const original=URL.revokeObjectURL.bind(URL);
    window.__v239Revoked=[];
    URL.revokeObjectURL=url=>{window.__v239Revoked.push(url);return original(url)};
  });

  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="120" height="120" fill="#E7DCC8"/><rect x="120" width="80" height="120" fill="#274C55"/><rect x="200" width="40" height="120" fill="#C65338"/></svg>';
  await page.locator('#photoInput').setInputFiles({
    name:'webkit-v239-photo.svg',
    mimeType:'image/svg+xml',
    buffer:Buffer.from(svg)
  });

  await expect.poll(() => page.evaluate(() => photoLoaded)).toBe(true);
  const state=await page.evaluate(() => ({
    objectURL:photoObjectURL,
    imagePending:photoLoadImage!==null,
    hasPhoto:referenceBoardHasPhoto(),
    width:photoCanvas.width,
    height:photoCanvas.height,
    revoked:window.__v239Revoked.length
  }));

  expect(state.objectURL).toBeNull();
  expect(state.imagePending).toBe(false);
  expect(state.hasPhoto).toBe(true);
  expect(state.width).toBeGreaterThan(0);
  expect(state.height).toBeGreaterThan(0);
  expect(state.revoked).toBeGreaterThanOrEqual(1);
});


test('WebKit V2.40 drops delayed Inspire actions after route changes', async ({ page }) => {
  await page.evaluate(() => ensureInspirationResources());
  await page.evaluate(() => switchTab('inspire',false));
  await page.waitForTimeout(220);
  const result=await page.evaluate(async () => {
    const originalEnsure=ensureInspirationResources;
    const beforeOffset=recommendationBatchOffset;
    let resolveLoad=null,ran=0;
    ensureInspirationResources=()=>new Promise(resolve=>{resolveLoad=resolve});
    const pending=runInspirationAction(()=>{ran++;recommendationBatchOffset+=50});
    switchTab('photo',false);
    if(resolveLoad)resolveLoad([]);
    const executed=await pending;
    const state={executed,ran,beforeOffset,afterOffset:recommendationBatchOffset,active:document.querySelector('.tab-view.active')?.dataset.view||''};
    ensureInspirationResources=originalEnsure;
    return state;
  });
  expect(result).toEqual({executed:false,ran:0,beforeOffset:result.beforeOffset,afterOffset:result.beforeOffset,active:'photo'});
});


test('WebKit V2.41 keeps Photo pointer ownership on the initiating touch', async ({ page }) => {
  await page.evaluate(() => switchTab('photo',false));
  const result=await page.evaluate(() => {
    cancelPhotoPointerInteraction();
    photoPanel.classList.add('show');
    photoCanvas.width=80;photoCanvas.height=80;
    const ctx=photoCanvas.getContext('2d');ctx.fillStyle='#445566';ctx.fillRect(0,0,80,80);
    const rect=photoCanvas.getBoundingClientRect();
    const p={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
    const fire=(type,pointerId)=>photoCanvas.dispatchEvent(new PointerEvent(type,{
      bubbles:true,pointerType:'touch',pointerId,clientX:p.x,clientY:p.y
    }));

    fire('pointerdown',7);
    fire('pointerdown',8);
    fire('pointercancel',8);
    const afterForeign={id:photoPointerId,picking:photoPicking};
    fire('pointercancel',7);
    const afterOwner={id:photoPointerId,picking:photoPicking,display:magnifier.style.display};
    return{afterForeign,afterOwner};
  });

  expect(result.afterForeign).toEqual({id:7,picking:true});
  expect(result.afterOwner).toEqual({id:null,picking:false,display:'none'});
});


test('WebKit V2.42 defers hidden Application preview rendering until section reveal', async ({ page }) => {
  const deep=page.locator('#composeDeepDive');
  if(!(await deep.evaluate(el=>el.open)))await deep.locator(':scope > summary').click();
  const validation=page.locator('#deepValidation');
  if(!(await validation.evaluate(el=>el.open)))await validation.locator(':scope > summary').click();
  await expect(validation).toHaveAttribute('open','');
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

  await page.evaluate(() => {
    previewContext='room';
    document.getElementById('uiPreview').innerHTML='<div id="webkitV242Sentinel">deferred</div>';
    document.getElementById('contextThemeNote').textContent='webkit-v242-sentinel';
  });
  await page.locator('[data-vision="deutan"]').click();
  await expect(page.locator('#webkitV242Sentinel')).toHaveCount(1);
  await expect(page.locator('#contextThemeNote')).toHaveText('webkit-v242-sentinel');

  const application=page.locator('#deepApplication');
  await application.locator(':scope > summary').click();
  await expect(application).toHaveAttribute('open','');
  await page.evaluate(() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await expect(page.locator('#webkitV242Sentinel')).toHaveCount(0);
  await expect(page.locator('#contextThemeNote')).toContainText('綠色弱近似模擬');
  await expect(page.locator('.cp2-room-wall')).toHaveCount(1);
});


test('WebKit V2.43 keeps consolidated mobile actions discoverable and source-safe', async ({ page }) => {
  await setExactPalette(page,['#112233','#445566','#AABBCC']);
  await page.evaluate(() => renderComboSlots());
  const before=await page.evaluate(() => paletteArtifactBase());

  await expect(page.locator('#generate')).toContainText('分析這組配色');
  await expect(page.locator('#handoffMore')).not.toHaveAttribute('open','');
  await expect(page.locator('[data-export-format="css"]')).not.toBeVisible();
  await page.locator('#handoffMore > summary').click();
  await expect(page.locator('[data-export-format="css"]')).toBeVisible();

  await expect(page.locator('#compareMore')).not.toHaveAttribute('open','');
  await page.locator('#compareMore > summary').click();
  await expect(page.locator('#setCompareA')).toBeVisible();

  const after=await page.evaluate(() => paletteArtifactBase());
  expect(after).toEqual(before);
});


test('WebKit V2.44 first-run guidance dismisses once and stays source-safe', async ({ page }) => {
  await page.addInitScript(() => {
    if(sessionStorage.getItem('v244WebKitFreshPrepared')==='1')return;
    localStorage.clear();
    sessionStorage.setItem('v244WebKitFreshPrepared','1');
  });
  await page.reload();
  await expect(page.locator('#firstRunGuide')).toBeVisible();
  const before=await page.evaluate(() => paletteArtifactBase());

  await page.locator('#dismissFirstRunGuide').click();
  await expect(page.locator('#firstRunGuide')).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('colorlab.firstRunGuideV1'))).toBe('done');
  expect(await page.evaluate(() => paletteArtifactBase())).toEqual(before);

  await page.reload();
  await expect(page.locator('#firstRunGuide')).toBeHidden();
});
