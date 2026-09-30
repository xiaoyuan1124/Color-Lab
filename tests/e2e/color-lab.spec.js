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
