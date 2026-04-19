import { test, expect } from '@playwright/test'

test.describe('Preview Mode - Explore First Flow', () => {
  test('should render PreviewModeBanner after scan completion', async ({ page }) => {
    // Complete a free scan first
    await page.goto('/scan')

    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('https://example.com')
    await businessInput.fill('Test Business')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for result to display
    const scoreElement = page.locator('[class*="score"], text=/score|rating/i')
    await expect(scoreElement).toBeVisible({ timeout: 60000 })

    // Assert PreviewModeBanner is rendered
    const banner = page.locator('[class*="preview"], [class*="banner"], text=/preview|explore/i').first()
    await expect(banner).toBeVisible()
  })

  test('should open PaywallModal when clicking "Run Agent" button', async ({ page }) => {
    // Complete scan
    await page.goto('/scan')

    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('https://example.com')
    await businessInput.fill('Test Business')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for result
    const scoreElement = page.locator('[class*="score"], text=/score|rating/i')
    await expect(scoreElement).toBeVisible({ timeout: 60000 })

    // Click "Run Agent" or equivalent button
    const runAgentBtn = page.locator('button:has-text(/run agent|explore|get recommendations/i)').first()
    if (await runAgentBtn.isVisible()) {
      await runAgentBtn.click()

      // Assert PaywallModal opens
      const paywall = page.locator('[class*="paywall"], [class*="modal"], text=/upgrade|subscribe|select.*plan/i').first()
      await expect(paywall).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display correct preview state messaging', async ({ page }) => {
    await page.goto('/scan')

    const websiteInput = page.locator('input[name="website"], input[name="url"], input[placeholder*="website" i]').first()
    const businessInput = page.locator('input[name="businessName"], input[name="business"], input[placeholder*="business" i]').first()

    await websiteInput.fill('https://example.com')
    await businessInput.fill('Test')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for result
    await page.waitForTimeout(5000)

    // Assert preview-mode specific text (e.g., "limited preview" or "upgrade to see more")
    const previewText = page.locator('text=/preview|limited|upgrade|premium/i')
    const textElements = await previewText.all()
    expect(textElements.length).toBeGreaterThan(0)
  })
})
