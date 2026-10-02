import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.use({
  viewport:{width:440,height:956},
  deviceScaleFactor:3,
  isMobile:true,
  hasTouch:true,
  locale:'zh-TW',
  timezoneId:'Asia/Taipei',
  reducedMotion:'reduce'
});

const OUT=path.resolve('artifacts/app-store-screenshots');
const PALETTE=['#E7DCC8','#274C55','#C65338'];

test.beforeAll(()=>{
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
});

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('colorlab.firstRunGuideV1','done');
  });
  await page.goto('/');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();
  await page.evaluate(colors=>{
    selectedColors=[...colors];
    lockedSlots=[false,false,false];
    activeSlot=0;
    seed=selectedColors[0];
    generate(false);
    renderComboSlots();
  },PALETTE);
});

async function openDeepSection(page,id){
  const deep=page.locator('#composeDeepDive');
  if(!(await deep.evaluate(el=>el.open)))await deep.locator(':scope > summary').click();
  const section=page.locator('#'+id);
  if(!(await section.evaluate(el=>el.open)))await section.locator(':scope > summary').click();
  await expect(section).toHaveAttribute('open','');
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function capture(page,file){
  const target=path.join(OUT,file);
  await page.screenshot({path:target,fullPage:false,animations:'disabled'});
  const png=fs.readFileSync(target);
  expect(png.readUInt32BE(16),file+' width').toBe(1320);
  expect(png.readUInt32BE(20),file+' height').toBe(2868);
  expect([4,6],file+' alpha channel').not.toContain(png[25]);
}

test('01 Compose — 75 18 7 roles',async({page})=>{
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect(page.locator('#preview > div')).toHaveCount(3);
  await capture(page,'01-compose-75-18-7.png');
});

test('02 Result-first summary',async({page})=>{
  await page.locator('#resultSummary').scrollIntoViewIfNeeded();
  await expect(page.locator('#resultSummary')).toBeVisible();
  await capture(page,'02-result-first.png');
});

test('03 Photo — on-device extraction workflow',async({page})=>{
  await page.evaluate(()=>switchTab('photo',false));
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">'+
    '<rect width="900" height="700" fill="#E7DCC8"/>'+
    '<rect x="540" width="240" height="700" fill="#274C55"/>'+
    '<rect x="780" width="120" height="700" fill="#C65338"/>'+
    '<circle cx="230" cy="350" r="95" fill="#68705E"/>'+
    '<rect x="80" y="90" width="300" height="110" rx="28" fill="#F7F2EA"/>'+
    '</svg>';
  await page.locator('#photoInput').setInputFiles({
    name:'color-lab-reference.svg',
    mimeType:'image/svg+xml',
    buffer:Buffer.from(svg)
  });
  await expect(page.locator('#photoPanel')).toHaveClass(/show/);
  await page.locator('#photoPanel').scrollIntoViewIfNeeded();
  await capture(page,'03-photo-on-device.png');
});

test('04 Accessibility and contrast validation',async({page})=>{
  await openDeepSection(page,'deepValidation');
  await page.locator('#accessibilityMatrix').scrollIntoViewIfNeeded();
  await expect(page.locator('#accessibilityMatrix .validation-table')).toBeVisible();
  await capture(page,'04-accessibility-validation.png');
});

test('05 Context Preview',async({page})=>{
  await openDeepSection(page,'deepApplication');
  await page.locator('[data-context="app"]').click();
  await page.locator('#uiPreview').scrollIntoViewIfNeeded();
  await expect(page.locator('#uiPreview .cp2-app')).toBeVisible();
  await capture(page,'05-context-preview.png');
});

test('06 Professional handoff',async({page})=>{
  const handoff=page.locator('#handoffMore');
  if(!(await handoff.evaluate(el=>el.open)))await handoff.locator(':scope > summary').click();
  await page.locator('#professionalHandoff').scrollIntoViewIfNeeded();
  await expect(page.locator('#professionalHandoff')).toBeVisible();
  await expect(page.locator('#professionalHandoff')).toContainText('Display-P3');
  await capture(page,'06-professional-handoff.png');
});
