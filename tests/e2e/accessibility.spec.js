import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function summarize(violations) {
  return violations.map(v => {
    const nodes = v.nodes.slice(0, 3).map(n => `  - ${n.target.join(' ')}: ${n.failureSummary || ''}`).join('\n');
    return `${v.id} [${v.impact}] ${v.help}\n${nodes}`;
  }).join('\n\n');
}

test('Compose has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tab-view[data-view="compose"]')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(blocking, summarize(blocking)).toEqual([]);
});
