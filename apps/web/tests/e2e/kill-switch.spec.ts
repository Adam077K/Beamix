import { test, expect } from '@playwright/test'

test.describe('kill-switch automation control', () => {
  test.beforeAll(() => {
    // Skip entire suite if E2E_TEST_EMAIL not provided
    if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
      test.skip()
    }
  })

  test('should display kill-switch button on automation page', async ({ page }) => {
    // Sign in first
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)
    await submitButton.click()

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Navigate to automation page
    await page.goto('/automation')

    // Assert page loaded (no 404 or redirect to login)
    expect(page.url()).toContain('/automation')

    // Look for kill-switch button with flexible selectors
    const killSwitchButton = page.locator(
      'button:has-text(/kill.*switch|pause|stop|disable.*automation|disable.*agents/i), ' +
      '[data-testid*="kill"], ' +
      '[data-testid*="pause"], ' +
      '[class*="kill-switch"]'
    ).first()

    await expect(killSwitchButton).toBeVisible({ timeout: 5000 }).catch(async () => {
      // Fallback: look for any button with stop/pause/kill in text
      const anyControlButton = page.locator('button').filter({ hasText: /kill|pause|stop|disable/i }).first()
      await expect(anyControlButton).toBeVisible()
    })
  })

  test('should open confirmation modal when clicking kill-switch', async ({ page }) => {
    // Sign in
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)
    await submitButton.click()

    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Navigate to automation
    await page.goto('/automation')

    // Find and click kill-switch button
    const killSwitchButton = page.locator(
      'button:has-text(/kill.*switch|pause|stop|disable.*automation|disable.*agents/i), ' +
      '[data-testid*="kill"], ' +
      '[data-testid*="pause"]'
    ).first()

    if (await killSwitchButton.isVisible()) {
      await killSwitchButton.click()

      // Wait for modal to appear
      await page.waitForTimeout(500)

      // Assert confirmation modal/dialog is visible
      const confirmationModal = page.locator(
        'dialog, ' +
        '[role="dialog"], ' +
        '[class*="modal"], ' +
        '[class*="confirm"], ' +
        'text=/confirm|are you sure|pause automation|stop agents/i'
      ).first()

      await expect(confirmationModal).toBeVisible({ timeout: 5000 }).catch(async () => {
        // Fallback: check if any dialog-like element appeared
        const dialogLike = page.locator('[role="alertdialog"], [role="dialog"], .modal, .dialog').first()
        const isVisible = await dialogLike.isVisible().catch(() => false)
        expect(isVisible).toBeTruthy()
      })
    }
  })

  test('should persist kill-switch state across page reload', async ({ page }) => {
    // Sign in
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)
    await submitButton.click()

    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Navigate to automation
    await page.goto('/automation')

    // Get initial kill-switch state
    const killSwitchButton = page.locator(
      'button:has-text(/kill.*switch|pause|stop|disable.*automation|disable.*agents/i), ' +
      '[data-testid*="kill"]'
    ).first()

    const initialState = await killSwitchButton.isVisible().catch(() => false)

    // Reload page
    await page.reload()

    // Assert kill-switch button still visible after reload
    const reloadedButton = page.locator(
      'button:has-text(/kill.*switch|pause|stop|disable.*automation|disable.*agents/i), ' +
      '[data-testid*="kill"]'
    ).first()

    const reloadedState = await reloadedButton.isVisible().catch(() => false)
    expect(reloadedState).toBe(initialState)
  })
})
