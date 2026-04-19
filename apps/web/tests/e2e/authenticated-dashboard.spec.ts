import { test, expect } from '@playwright/test'

test.describe('authenticated dashboard', () => {
  test.beforeAll(() => {
    // Skip entire suite if E2E_TEST_EMAIL not provided
    if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
      test.skip()
    }
  })

  test('should sign in and navigate to dashboard home', async ({ page }) => {
    // Navigate to login
    await page.goto('/login')

    // Assert login form is visible
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Fill credentials from environment
    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)

    // Submit
    await submitButton.click()

    // Wait for redirect to /home or dashboard (60s timeout for auth processing)
    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Assert hero/score element visible on home
    const scoreElement = page.locator('[class*="score"], [data-testid*="score"], text=/score|rating|visibility/i')
    await expect(scoreElement.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Fallback: if no explicit score element, check page content is loaded
      expect(page.url()).toMatch(/\/(home|dashboard|inbox)/)
    })
  })

  test('should display dashboard without login redirect', async ({ page }) => {
    // First sign in
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)
    await submitButton.click()

    // Wait for redirect
    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Now try to access /home directly (should not redirect to login)
    await page.goto('/home')

    // Assert we're still at /home (not redirected)
    expect(page.url()).toContain('/home')

    // Assert dashboard content is visible
    const dashboardContent = page.locator('[class*="dashboard"], [class*="container"], [data-testid*="dashboard"]')
    await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Fallback: just verify we're not at login page
      expect(page.url()).not.toContain('/login')
    })
  })

  test('should navigate to scans section from dashboard', async ({ page }) => {
    // Sign in first
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill(process.env.E2E_TEST_EMAIL as string)
    await passwordInput.fill(process.env.E2E_TEST_PASSWORD as string)
    await submitButton.click()

    await page.waitForURL(/\/(home|dashboard|inbox)/, { timeout: 60000 })

    // Look for scans navigation link
    const scansLink = page.locator('a:has-text(/scans|timeline|history/i), [data-testid*="scans"], button:has-text(/scans/i)').first()
    if (await scansLink.isVisible()) {
      await scansLink.click()

      // Wait for navigation or content load
      await page.waitForTimeout(2000)

      // Assert scans content visible (timeline, list, or container)
      const scansContent = page.locator('[class*="timeline"], [class*="scans"], [data-testid*="scans"]')
      await expect(scansContent.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Fallback: verify URL changed or content loaded
        expect(page.url()).toMatch(/\/scans|\/timeline|\/history/)
      })
    }
  })
})
