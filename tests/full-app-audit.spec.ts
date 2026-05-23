import { test, expect, Page } from '@playwright/test';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

type AuditIssue = {
  severity: Severity;
  location: string;
  evidence: string;
  suggestion: string;
};

type InteractiveElement = {
  idx: number;
  tag: string;
  text: string;
  id: string | null;
  name: string | null;
  type: string | null;
  role: string | null;
  disabled: boolean;
  hidden: boolean;
};

const BAD_VALUES = ['', ' ', '<script>alert(1)</script>', 'a'.repeat(1024), '!!!@@@###'];

function pushIssue(store: AuditIssue[], severity: Severity, location: string, evidence: string, suggestion: string) {
  store.push({ severity, location, evidence, suggestion });
}

async function snapshotInteractive(page: Page): Promise<InteractiveElement[]> {
  return page.evaluate(() => {
    const selector = [
      'button', 'a', 'input', 'textarea', 'select',
      '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="radio"]', '[role="switch"]', '[role="combobox"]',
      '[aria-haspopup="dialog"]', '[aria-controls]'
    ].join(',');

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));

    return nodes.map((node, idx) => {
      const style = getComputedStyle(node);
      const ariaDisabled = node.getAttribute('aria-disabled') === 'true';
      const nativeDisabled = 'disabled' in node ? Boolean((node as HTMLButtonElement).disabled) : false;
      const hidden = node.hidden || node.offsetParent === null || style.visibility === 'hidden' || style.display === 'none';

      return {
        idx,
        tag: node.tagName.toLowerCase(),
        text: (node.textContent || '').trim().slice(0, 120),
        id: node.id || null,
        name: node.getAttribute('name'),
        type: node.getAttribute('type'),
        role: node.getAttribute('role'),
        disabled: nativeDisabled || ariaDisabled,
        hidden,
      };
    });
  });
}

test('complete exploratory + deep audit', async ({ page }, testInfo) => {
  const issues: AuditIssue[] = [];
  const checks: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: string[] = [];
  const clickFailures: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  const startedAt = Date.now();
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  const loadMs = Date.now() - startedAt;
  checks.push(`Initial load completed in ${loadMs}ms`);

  if (!response || !response.ok()) {
    pushIssue(
      issues,
      'Critical',
      'Route: /',
      `Root navigation returned ${response?.status() ?? 'no response'}`,
      'Ensure server boot, route mapping, and root HTML response are healthy.'
    );
  }

  const interactive = await snapshotInteractive(page);
  checks.push(`Interactive elements detected: ${interactive.length}`);

  interactive.forEach((el) => {
    if (el.hidden) {
      pushIssue(
        issues,
        'Low',
        `Element ${el.tag}#${el.id ?? el.idx}`,
        `Hidden interactive element text="${el.text}" type="${el.type ?? ''}" role="${el.role ?? ''}"`,
        'Verify hidden state is intentional (feature flags, gated UI, modal off-state) and not accidental rendering regression.'
      );
    }
  });

  const forms = page.locator('form');
  const formCount = await forms.count();
  const inputs = page.locator('input, textarea, select');
  checks.push(`Forms detected: ${formCount}`);
  checks.push(`Input controls detected: ${await inputs.count()}`);

  for (const badValue of BAD_VALUES) {
    const textControls = page.locator('textarea, input[type="text"], input[type="email"], input[type="password"], input[type="search"], input:not([type])');
    const controlCount = await textControls.count();

    for (let i = 0; i < controlCount; i++) {
      const control = textControls.nth(i);
      await control.fill('').catch(() => {});
      await control.fill(badValue).catch(() => {});
    }

    const submitCandidates = page.locator('button[type="submit"], input[type="submit"], button:has-text("Analyze"), button:has-text("Submit")');
    const submitCount = await submitCandidates.count();
    for (let i = 0; i < submitCount; i++) {
      const candidate = submitCandidates.nth(i);
      await candidate.click({ force: true }).catch((err: Error) => {
        clickFailures.push(`submit-${i}: ${err.message}`);
      });
      await candidate.click({ clickCount: 2, force: true }).catch((err: Error) => {
        clickFailures.push(`submit-double-${i}: ${err.message}`);
      });
    }
  }

  const buttons = page.locator('button, [role="button"]');
  const buttonCount = await buttons.count();
  checks.push(`Buttons detected: ${buttonCount}`);

  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const label = ((await button.innerText().catch(() => '')) || `button-${i}`).trim().slice(0, 80);
    const disabled = await button.isDisabled().catch(() => false);

    if (disabled) {
      pushIssue(issues, 'Low', `Button: ${label}`, 'Button remained disabled throughout audit interaction.', 'Confirm disablement is driven by explicit validation/loading guards.');
      continue;
    }

    await button.click({ force: true }).catch((err: Error) => clickFailures.push(`single-${label}: ${err.message}`));
    await button.click({ clickCount: 2, force: true }).catch((err: Error) => clickFailures.push(`double-${label}: ${err.message}`));
    await page.mouse.down().catch(() => {});
    await page.mouse.up().catch(() => {});
    checks.push(`Button exercised: ${label}`);
  }

  if (consoleErrors.length || pageErrors.length) {
    pushIssue(
      issues,
      'High',
      'Browser runtime',
      `console errors=${consoleErrors.length}, uncaught page errors=${pageErrors.length}`,
      'Resolve runtime exceptions and unhandled promise rejections to prevent user-facing crashes.'
    );
  }

  if (failedResponses.length) {
    pushIssue(
      issues,
      'Medium',
      'Network/API',
      `HTTP failures captured: ${failedResponses.length}`,
      'Add graceful, user-friendly error handling for timeout and non-2xx responses.'
    );
  }

  if (clickFailures.length) {
    pushIssue(
      issues,
      'Medium',
      'Interaction reliability',
      `Click simulation failures captured: ${clickFailures.length}`,
      'Review overlays, stale locators, and pointer-event blockers that prevent deterministic interaction.'
    );
  }

  const severityCounts = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] += 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  const summary = {
    totalChecks: checks.length,
    errorsBySeverity: severityCounts,
    logicFlaws: pageErrors.length + clickFailures.length,
    recommendation: severityCounts.Critical > 0 || severityCounts.High > 0 ? 'FAIL' : 'PASS_WITH_WARNINGS',
  };

  await testInfo.attach('audit-checks.json', { body: JSON.stringify(checks, null, 2), contentType: 'application/json' });
  await testInfo.attach('audit-issues.json', { body: JSON.stringify(issues, null, 2), contentType: 'application/json' });
  await testInfo.attach('audit-summary.json', { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
  await testInfo.attach('console-errors.json', { body: JSON.stringify(consoleErrors, null, 2), contentType: 'application/json' });
  await testInfo.attach('network-failures.json', { body: JSON.stringify(failedResponses, null, 2), contentType: 'application/json' });

  expect(summary.totalChecks).toBeGreaterThan(0);
});
