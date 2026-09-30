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
