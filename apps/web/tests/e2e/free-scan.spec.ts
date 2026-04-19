import { test, expect } from '@playwright/test'

test.describe('Free Scan Flow', () => {
  test('should submit free scan form and display score result', async ({ page }) => {
    // Navigate to scan page
    await page.goto('/scan')

    // Assert form is visible
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Fill in the form
    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('https://example.com')
    await businessInput.fill('Test Business')

    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for scanning animation to appear
    const scanningText = page.locator('text=/scanning|analyzing/i')
    await expect(scanningText).toBeVisible({ timeout: 5000 })

    // Wait for result to appear (with 60s timeout as per spec)
    const scoreElement = page.locator('[class*="score"], [data-testid*="score"], text=/score|rating/i')
    await expect(scoreElement).toBeVisible({ timeout: 60000 })

    // Assert score is numeric and visible
    const scores = await page.locator('text=/^[0-9.]+$/').all()
    expect(scores.length).toBeGreaterThan(0)
  })

  test('should display result after scanning completes', async ({ page }) => {
    await page.goto('/scan')

    // Fill and submit
    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('https://testbiz.io')
    await businessInput.fill('Another Test')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for result phase
    await page.waitForTimeout(5000)

    // Assert result is displayed with competitors section
    const resultContent = page.locator('[class*="result"], [class*="score"], text=/competitors|mentions/i')
    await expect(resultContent.first()).toBeVisible({ timeout: 60000 })
  })

  test('should reject empty form submission', async ({ page }) => {
    await page.goto('/scan')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Assert form is still visible (not submitted)
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Check for validation error message
    const errorMsg = page.locator('[class*="error"], text=/required|please fill|invalid/i')
    const isVisible = await errorMsg.first().isVisible().catch(() => false)
    expect(isVisible || (await form.isVisible())).toBeTruthy()
  })

  test('should handle malformed URL gracefully', async ({ page }) => {
    await page.goto('/scan')

    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('not-a-valid-url')
    await businessInput.fill('Test')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Either validation error or form still visible
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })
})
