import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import pngjs from 'pngjs';

const { PNG } = pngjs;
const PROD_URL = process.env.COLOR_LAB_PROD_URL || 'https://xiaoyuan1124.github.io/Color-Lab/';
const MAX_DIFF_RATIO = Number(process.env.VISUAL_DIFF_MAX_RATIO || '0.18');

async function settle(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#preview')).toBeVisible();
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
    html{scroll-behavior:auto!important}
  ` });
  await page.waitForTimeout(150);
}

async function shot(page, target = 'top') {
  if (target === 'top') {
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    await page.locator('#result').evaluate(el => el.scrollIntoView({ block: 'start' }));
  }
  await page.waitForTimeout(100);
  return page.screenshot({ fullPage: false, animations: 'disabled' });
}

function comparePng(localBuffer, prodBuffer, outDir, name) {
  const local = PNG.sync.read(localBuffer);
  const prod = PNG.sync.read(prodBuffer);
  expect({ width: local.width, height: local.height }).toEqual({ width: prod.width, height: prod.height });

  const diff = new PNG({ width: local.width, height: local.height });
  const changed = pixelmatch(local.data, prod.data, diff.data, local.width, local.height, {
    threshold: 0.12,
    includeAA: false
  });
  const ratio = changed / (local.width * local.height);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${name}-local.png`), localBuffer);
  fs.writeFileSync(path.join(outDir, `${name}-prod.png`), prodBuffer);
  fs.writeFileSync(path.join(outDir, `${name}-diff.png`), PNG.sync.write(diff));
  return ratio;
}

test('pre-deploy screenshots stay within the visual safety envelope', async ({ page, context }, testInfo) => {
  const prodPage = await context.newPage();
  await settle(page, '/');
  await settle(prodPage, PROD_URL);

  const outDir = testInfo.outputPath('visual');
  for (const target of ['top', 'result']) {
    const localBuffer = await shot(page, target);
    const prodBuffer = await shot(prodPage, target);
    const ratio = comparePng(localBuffer, prodBuffer, outDir, `compose-${target}`);

    await testInfo.attach(`compose-${target}-local`, { body: localBuffer, contentType: 'image/png' });
    await testInfo.attach(`compose-${target}-prod`, { body: prodBuffer, contentType: 'image/png' });
    expect(ratio, `${target} screenshot diff ratio ${ratio.toFixed(4)} exceeded ${MAX_DIFF_RATIO}`).toBeLessThanOrEqual(MAX_DIFF_RATIO);
  }

  await prodPage.close();
});
