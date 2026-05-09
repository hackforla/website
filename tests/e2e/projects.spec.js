// e2e/projects.spec.js
import { test, expect } from '@playwright/test'

test('filter by status shows only matching projects', async ({ page }) => {
  await page.goto('/projects/')
  
  await page.getByLabel('Active').check()
  
  const cards = page.locator('.project-card:visible')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  
  for (let i = 0; i < count; i++) {
    await expect(cards.nth(i).locator('.status-text')).toHaveText('Active')
  }
})

test('search returns relevant results', async ({ page }) => {
  await page.goto('/projects/')
  
  await page.locator('#search-desktop').fill('JavaScript')
  await page.locator('.search-bar-desktop .search-glass').click()
  
  const cards = page.locator('.project-card:visible')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)

  // NOTE: Only checks the 'languages' attribute, and would false
  //       error if JavaScript is added to another field and not languages
  for (let i = 0; i < count; i++) {
    const languages = await cards.nth(i).getAttribute('data-languages')
    expect(languages?.toLowerCase()).toContain('javascript')
  }
})

test('clear all filters works at mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/projects/')
  
  const totalCards = await page.locator('.project-card').count()
  
  await page.locator('.show-filters-button').click()
  await page.locator('.filter-item a.category-title').filter({ hasText: 'status' }).click()
  await page.getByLabel('Active').check()
  
  await expect(page.locator('.project-card[data-status="Completed"]').first())
    .toBeHidden({ timeout: 5000 })

  await expect(page.locator('#clear-all-filters')).toBeVisible()
  await page.locator('#clear-all-filters').click()
  
  await expect(page.locator('.project-card:visible')).toHaveCount(totalCards)
})

test('clear all filters is not present at desktop', async ({ page }) => {
  // Clear All button is intentionally hidden in desktop view via CSS
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/projects/')
  
  await page.getByLabel('Active').check()
  
  await expect(page.locator('.project-card[data-status="Completed"]').first())
    .toBeHidden({ timeout: 5000 })
  
  await expect(page.locator('#clear-all-filters')).toBeHidden()
})