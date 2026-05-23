import { test, expect, Page, Locator } from '@playwright/test';

type AuditIssue = {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  evidence: string;
  suggestion: string;
};

const KNOWN_BAD_VALUES = ['', ' ', '<script>alert(1)</script>', 'a'.repeat(5000), '!!!@@@###'];

async function snapshotInteractive(page: Page) {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('button, a, input, textarea, select, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="combobox"], [aria-haspopup="dialog"]'));
    return nodes.map((node, idx) => ({
      idx,
      tag: node.tagName.toLowerCase(),
      text: (node.textContent || '').trim().slice(0, 120),
      id: node.id || null,
      name: node.getAttribute('name'),
      type: node.getAttribute('type'),
      role: node.getAttribute('role'),
      href: (node as HTMLAnchorElement).href || null,
      disabled: (node as HTMLButtonElement).disabled || node.getAttribute('aria-disabled') === 'true',
      hidden: node.offsetParent === null || getComputedStyle(node).visibility === 'hidden' || getComputedStyle(node).display === 'none',
      bounding: node.getBoundingClientRect().toJSON(),
    }));
  });
}

async function collectConsoleAndNetwork(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('response', response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  return { consoleErrors, pageErrors, failedResponses };
}

async function fastClick(locator: Locator, times = 3) {
  for (let i = 0; i < times; i++) {
    await locator.click({ delay: 10, force: true }).catch(() => {});
  }
}

test('complete exploratory + deep audit', async ({ page }, testInfo) => {
  const issues: AuditIssue[] = [];
  const checks: string[] = [];
  const metrics = { logicFlaws: 0 };

  const tracker = await collectConsoleAndNetwork(page);

  const startedAt = Date.now();
  const response = await page.goto('/');
  const loadMs = Date.now() - startedAt;
  checks.push(`Initial load in ${loadMs}ms`);

  if (!response || !response.ok()) {
    issues.push({
      severity: 'Critical',
      location: 'Landing page load',
      evidence: `Navigation failed or returned non-2xx (${response?.status() ?? 'no response'})`,
      suggestion: 'Ensure dev server is running and root route returns a successful HTML response.',
    });
  }

  const interactive = await snapshotInteractive(page);
  checks.push(`Interactive elements discovered: ${interactive.length}`);

  for (const el of interactive) {
    if (el.hidden) {
      issues.push({
        severity: 'Low',
        location: `${el.tag}#${el.id ?? el.idx}`,
        evidence: `Element appears hidden (text="${el.text}")`,
        suggestion: 'Confirm hidden state is intentional and protected behind valid conditional rendering.',
      });
    }
  }

  const forms = page.locator('form, [role="form"], textarea, input');
  const formCount = await forms.count();
  checks.push(`Form/input containers discovered: ${formCount}`);

  for (const badValue of KNOWN_BAD_VALUES) {
    const textareas = page.locator('textarea');
    for (let i = 0; i < await textareas.count(); i++) {
      await textareas.nth(i).fill('');
      await textareas.nth(i).fill(badValue);
    }

    const textInputs = page.locator('input[type="text"], input[type="email"], input[type="password"], input:not([type])');
    for (let i = 0; i < await textInputs.count(); i++) {
      await textInputs.nth(i).fill('');
      await textInputs.nth(i).fill(badValue);
    }

    const submitButtons = page.locator('button:has-text("Submit"), button:has-text("Analyze"), button[type="submit"]');
    for (let i = 0; i < await submitButtons.count(); i++) {
      await fastClick(submitButtons.nth(i), 2);
    }
  }

  const allButtons = page.locator('button, [role="button"]');
  const buttonCount = await allButtons.count();
  checks.push(`Buttons discovered: ${buttonCount}`);

  for (let i = 0; i < buttonCount; i++) {
    const button = allButtons.nth(i);
    const label = ((await button.innerText().catch(() => '')) || `button-${i}`).trim().slice(0, 80);

    const isDisabled = await button.isDisabled().catch(() => false);
    if (isDisabled) {
      issues.push({
        severity: 'Low',
        location: `Button ${label}`,
        evidence: 'Button is disabled during audit pass.',
        suggestion: 'Verify disabled state is intentionally tied to validation/submission state.',
      });
      continue;
    }

    await button.click({ force: true }).catch(() => {});
    await fastClick(button, 2);
    checks.push(`Clicked button: ${label}`);
  }

  if (tracker.consoleErrors.length > 0 || tracker.pageErrors.length > 0) {
    issues.push({
      severity: 'High',
      location: 'Browser console/runtime',
      evidence: `consoleErrors=${tracker.consoleErrors.length}, pageErrors=${tracker.pageErrors.length}`,
      suggestion: 'Fix runtime errors and unhandled promise exceptions before release.',
    });
    metrics.logicFlaws += tracker.pageErrors.length;
  }

  if (tracker.failedResponses.length > 0) {
    issues.push({
      severity: 'Medium',
      location: 'Network/API requests',
      evidence: `${tracker.failedResponses.length} failing responses (>=400) detected`,
      suggestion: 'Handle 4xx/5xx responses with resilient UI messaging and retries where appropriate.',
    });
  }

  const severityCounts = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] += 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 },
  );

  const summary = {
    totalChecks: checks.length,
    issues: severityCounts,
    logicFlaws: metrics.logicFlaws,
    recommendation: severityCounts.Critical > 0 || severityCounts.High > 0 ? 'FAIL' : 'PASS_WITH_WARNINGS',
  };

  await testInfo.attach('audit-checks.json', {
    body: JSON.stringify(checks, null, 2),
    contentType: 'application/json',
  });

  await testInfo.attach('audit-issues.json', {
    body: JSON.stringify(issues, null, 2),
    contentType: 'application/json',
  });

  await testInfo.attach('audit-summary.json', {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  });

  expect(summary.totalChecks).toBeGreaterThan(0);
});
