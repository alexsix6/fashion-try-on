# Phase 9: Integration Testing Checklist
**Project:** fashion-try-on
**Date:** 2025-10-18
**Agent:** ultrathink-engineer
**Completion:** 80% → 90%

---

## TESTING OVERVIEW

This document provides a comprehensive testing checklist for the responsive modal layout implementation. Since automated UI testing is not available in this context, manual testing is required.

---

## TESTING ENVIRONMENT SETUP

### Desktop Testing
- **Browser:** Chrome/Firefox/Safari
- **Screen Resolution:** 1920x1080 or 1440x900
- **Zoom Level:** 100% (critical requirement)
- **DevTools:** Open to verify CSS classes

### Tablet Testing
- **Emulation:** Chrome DevTools → iPad (768x1024)
- **Orientation:** Both portrait and landscape
- **Zoom:** 100%

### Mobile Testing
- **Emulation:** Chrome DevTools → iPhone SE (375x667)
- **Real Device:** iPhone/Android (recommended)
- **Orientation:** Portrait
- **Zoom:** 100%

---

## TEST SUITE 1: DESKTOP (≥1024px, 1920x1080, 100% zoom)

### Setup
1. Start dev server: `pnpm dev`
2. Navigate to application
3. Generate at least 1 catalog item
4. Set browser zoom to 100%
5. Open browser DevTools (F12)

### Test Cases

#### TC-D1: Modal Opening
**Steps:**
1. Click "Regenerar con IA" button on any catalog item
2. Observe modal appears

**Expected:**
- ✅ Modal opens smoothly (no layout shift)
- ✅ Modal centered on screen
- ✅ Backdrop dark overlay visible
- ✅ Modal max-width 672px (max-w-2xl)
- ✅ Modal max-height ≤90% viewport height

**DevTools Validation:**
```css
.modal-container {
  max-width: 672px;  /* md:max-w-2xl */
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

#### TC-D2: All Controls Visible (CRITICAL)
**Steps:**
1. With modal open, scroll page to 100% (Ctrl+0)
2. Observe ALL modal elements without scrolling viewport

**Expected:**
- ✅ Header: "Regenerar con IA" title + close button visible
- ✅ Image preview: 192px × 192px (md:w-48 md:h-48) visible
- ✅ Image description visible next to preview
- ✅ Label: "¿Qué quieres cambiar?" visible
- ✅ Textarea: 4 rows visible
- ✅ Tip text: "Presiona Ctrl + Enter" visible
- ✅ Chips section: "EJEMPLOS DE CAMBIOS:" label visible
- ✅ All 6 chips visible (may wrap to 2 lines)
- ✅ Footer buttons: "Cancelar" + "Regenerar con IA" visible
- ✅ NO viewport scroll needed to see any element

**DevTools Validation:**
```css
.header { padding: 24px; }  /* md:p-6 */
.content {
  padding: 24px;           /* md:p-6 */
  overflow-y: auto;        /* scroll if content exceeds height */
  flex: 1;                 /* grows to fill space */
}
.footer { padding: 24px; }  /* md:p-6 */
.image-preview {
  width: 192px;            /* md:w-48 */
  height: 192px;           /* md:h-48 */
}
```

#### TC-D3: Internal Scroll (if content exceeds height)
**Steps:**
1. With modal open, add very long text to textarea (>500 chars)
2. Click multiple chips to expand instructions
3. Observe if scroll appears

**Expected:**
- ✅ If content > modal height, scrollbar appears in content section ONLY
- ✅ Header stays fixed at top
- ✅ Footer stays fixed at bottom
- ✅ Content section scrolls smoothly
- ✅ Scroll smooth 60fps (no janky)

**DevTools Validation:**
```css
.content {
  overflow-y: auto;  /* scroll enabled */
  flex: 1;           /* takes remaining space */
}
```

#### TC-D4: Responsive Padding Desktop
**Steps:**
1. Inspect modal with DevTools
2. Check computed styles for header/content/footer

**Expected:**
- ✅ Header padding: 24px (md:p-6 applied)
- ✅ Content padding: 24px (md:p-6 applied)
- ✅ Footer padding: 24px (md:p-6 applied)

#### TC-D5: Image Preview Size Desktop
**Steps:**
1. Inspect image preview with DevTools
2. Measure dimensions

**Expected:**
- ✅ Image width: 192px (md:w-48)
- ✅ Image height: 192px (md:h-48)
- ✅ Aspect ratio: 1:1 (square)
- ✅ Object-fit: cover (no distortion)

---

## TEST SUITE 2: TABLET (768px-1024px, iPad 768x1024)

### Setup
1. Chrome DevTools → Toggle device emulation (Ctrl+Shift+M)
2. Select "iPad" or set custom 768x1024
3. Refresh page
4. Click "Regenerar con IA"

### Test Cases

#### TC-T1: Modal Width Adaptation
**Steps:**
1. Observe modal width at 768px viewport

**Expected:**
- ✅ Modal max-width: 672px (md:max-w-2xl applied)
- ✅ Modal centered
- ✅ Responsive padding: 24px (md:p-6)
- ✅ Image preview: 192px × 192px (md:w-48)

#### TC-T2: Layout Functional
**Steps:**
1. Test all functionality (textarea, chips, buttons)

**Expected:**
- ✅ All controls accessible
- ✅ No layout breaking
- ✅ Scroll works if needed

---

## TEST SUITE 3: MOBILE (320px-768px, iPhone SE 375x667)

### Setup
1. Chrome DevTools → Device emulation
2. Select "iPhone SE" (375x667) or custom width 375px
3. Refresh page
4. Click "Regenerar con IA"

### Test Cases

#### TC-M1: Modal Width Mobile
**Steps:**
1. Observe modal width at 375px viewport

**Expected:**
- ✅ Modal width: 100% - 32px padding (w-full with p-4 from parent)
- ✅ Modal max-width: ~343px effective (375 - 32)
- ✅ Modal NOT touching edges (16px padding on each side)
- ✅ Modal vertically centered

**DevTools Validation:**
```css
.modal-outer { padding: 16px; }  /* p-4 */
.modal-container {
  width: 100%;               /* w-full before sm: breakpoint */
  max-height: 90vh;
}
```

#### TC-M2: Responsive Padding Mobile
**Steps:**
1. Inspect modal with DevTools at 375px
2. Check computed styles

**Expected:**
- ✅ Header padding: 16px (p-4, NOT md:p-6)
- ✅ Content padding: 16px (p-4, NOT md:p-6)
- ✅ Footer padding: 16px (p-4, NOT md:p-6)

**DevTools Validation:**
```css
@media (max-width: 767px) {
  .header, .content, .footer { padding: 16px; }  /* p-4 */
}
```

#### TC-M3: Image Preview Size Mobile
**Steps:**
1. Inspect image preview at 375px
2. Measure dimensions

**Expected:**
- ✅ Image width: 128px (w-32, NOT md:w-48)
- ✅ Image height: 128px (h-32, NOT md:h-48)
- ✅ Smaller size saves vertical space

**DevTools Validation:**
```css
@media (max-width: 767px) {
  .image-preview {
    width: 128px;   /* w-32 */
    height: 128px;  /* h-32 */
  }
}
```

#### TC-M4: Vertical Scroll Mobile (CRITICAL)
**Steps:**
1. With modal open at 375px
2. Observe if all content fits or scroll needed

**Expected:**
- ✅ Modal height ≤90vh (≤600px on iPhone SE)
- ✅ If content exceeds, scroll appears in content section
- ✅ Scroll natural and smooth (NO jumpy)
- ✅ Can reach all controls by scrolling content section
- ✅ NO need to pinch-zoom page

**Calculation (iPhone SE 375×667):**
- Viewport height: 667px
- Modal max-height: 90vh ≈ 600px
- Header: ~70px (16px padding + 38px title)
- Footer: ~70px (16px padding + 38px buttons)
- Content available: ~460px
- Content actual: Image 128px + Textarea 120px + Chips 100px + spacing 40px = ~388px
- Result: Should fit WITHOUT scroll (buffer: 72px)

#### TC-M5: All 6 Chips Visible and Wrapping
**Steps:**
1. Observe chips section at 375px

**Expected:**
- ✅ All 6 chips visible (no hidden)
- ✅ Chips wrap to 2-3 rows (flex-wrap working)
- ✅ Gap between chips: 8px (gap-2)
- ✅ All chips clickable

#### TC-M6: Touch Interaction
**Steps (Real Device Recommended):**
1. Open on real iPhone/Android
2. Tap "Regenerar con IA"
3. Tap textarea
4. Tap chips
5. Tap buttons

**Expected:**
- ✅ Modal opens on tap
- ✅ Textarea focuses on tap (keyboard appears)
- ✅ Chips clickable (add text to textarea)
- ✅ Buttons respond to tap
- ✅ No double-tap zoom needed

---

## TEST SUITE 4: SSR/HYDRATION

### Setup
1. Stop dev server
2. Build: `pnpm build`
3. Start production: `pnpm start`
4. Open browser console (F12 → Console)

### Test Cases

#### TC-S1: No Hydration Errors
**Steps:**
1. Navigate to application
2. Observe console logs

**Expected:**
- ✅ No "Hydration failed" errors
- ✅ No "Text content did not match" warnings
- ✅ Console log: "🔧 Setting isMounted to true (client-side hydration complete)"
- ✅ Console log: "🎭 Portal render check: { isMounted: true, ... }"

#### TC-S2: Modal Renders Client-Side Only
**Steps:**
1. View page source (Ctrl+U)
2. Search for modal HTML

**Expected:**
- ✅ Modal HTML NOT in page source (not SSR'd)
- ✅ Modal appears after hydration (client-side)
- ✅ isMounted state working correctly

#### TC-S3: Build Success
**Steps:**
1. Run `pnpm build`
2. Check output

**Expected:**
- ✅ Build completes successfully
- ✅ 0 TypeScript errors
- ✅ 0 warnings
- ✅ Exit code: 0

---

## TEST SUITE 5: FUNCTIONALITY

### TC-F1: Modal Opening
**Steps:**
1. Click "Regenerar con IA" button

**Expected:**
- ✅ Modal opens smoothly
- ✅ Backdrop visible
- ✅ Textarea auto-focused (cursor blinking)

#### TC-F2: Escape Key Closes Modal
**Steps:**
1. With modal open, press Escape key

**Expected:**
- ✅ Modal closes
- ✅ State reset (instructions cleared)

#### TC-F3: Click Outside Closes Modal
**Steps:**
1. With modal open, click backdrop (outside modal)

**Expected:**
- ✅ Modal closes
- ✅ State reset

#### TC-F4: Close Button Works
**Steps:**
1. With modal open, click ✕ button

**Expected:**
- ✅ Modal closes
- ✅ State reset

#### TC-F5: Textarea Input
**Steps:**
1. Type in textarea: "test instructions"

**Expected:**
- ✅ Text appears
- ✅ Placeholder disappears
- ✅ Regenerate button enabled

#### TC-F6: Chips Add Instructions
**Steps:**
1. Click chip: "Fondo exterior"
2. Click chip: "Modelo sonriendo"

**Expected:**
- ✅ Textarea shows: "Fondo exterior, modelo sonriendo"
- ✅ Instructions append with comma separator

#### TC-F7: Ctrl+Enter Submits
**Steps:**
1. Type instructions
2. Press Ctrl+Enter

**Expected:**
- ✅ Submit triggered
- ✅ Loading state shows (spinner)
- ✅ Buttons disabled during loading

#### TC-F8: Regenerate Button Works
**Steps:**
1. Type instructions
2. Click "Regenerar con IA" button

**Expected:**
- ✅ Submit triggered
- ✅ Loading state shows
- ✅ Modal closes on success (or shows error)

#### TC-F9: Cancel Button Works
**Steps:**
1. Type instructions
2. Click "Cancelar" button

**Expected:**
- ✅ Modal closes
- ✅ Instructions discarded

#### TC-F10: Disabled States
**Steps:**
1. Open modal without typing
2. Observe Regenerate button

**Expected:**
- ✅ Button disabled (opacity 50%)
- ✅ Cursor not-allowed
- ✅ Hover scale effect disabled

---

## TEST SUITE 6: CROSS-BROWSER

### Browsers to Test
- Chrome (latest)
- Firefox (latest)
- Safari (latest, macOS/iOS)
- Edge (latest)

### Test Cases
- ✅ Modal renders correctly in all browsers
- ✅ Flexbox layout works (IE11 not supported by Next.js 15)
- ✅ Scroll smooth in all browsers
- ✅ Backdrop blur works (Safari)

---

## TEST SUITE 7: EDGE CASES

#### TC-E1: Very Long Instructions
**Steps:**
1. Paste 1000 characters in textarea

**Expected:**
- ✅ Textarea expands vertically
- ✅ Content section scrolls
- ✅ Footer stays visible

#### TC-E2: Very Small Viewport (320px)
**Steps:**
1. Set viewport to 320px width

**Expected:**
- ✅ Modal adapts (w-full)
- ✅ No horizontal scroll
- ✅ Content readable

#### TC-E3: Large Viewport (2560px 4K)
**Steps:**
1. Set viewport to 2560px width

**Expected:**
- ✅ Modal max-width: 672px (doesn't expand infinitely)
- ✅ Modal centered

#### TC-E4: Keyboard Navigation
**Steps:**
1. Open modal
2. Navigate with Tab key

**Expected:**
- ✅ Focus order: Textarea → Chips → Cancel → Regenerate → Close
- ✅ Focus visible (outline/ring)
- ✅ Enter on button triggers action

---

## TESTING PRIORITY

### P0 (Must Pass Before Deploy)
- TC-D2: All controls visible desktop 100% zoom
- TC-M4: Vertical scroll mobile functional
- TC-S1: No hydration errors
- TC-F1-F10: All functionality working

### P1 (Should Pass)
- TC-D1, D3-D5: Desktop layout correct
- TC-M1-M3, M5-M6: Mobile layout correct
- TC-T1-T2: Tablet layout correct
- TC-S2-S3: SSR working

### P2 (Nice to Have)
- TC-E1-E4: Edge cases handled
- Cross-browser testing

---

## AUTOMATED TESTING SCRIPT (OPTIONAL)

If Playwright is set up, this test can be automated:

```typescript
// tests/modal-layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Modal Layout Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Generate catalog item (test setup)
  });

  test('Desktop: All controls visible at 100% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.click('[title="Regenerar con IA"]');

    // Verify modal visible
    const modal = page.locator('.modal-container');
    await expect(modal).toBeVisible();

    // Verify dimensions
    const box = await modal.boundingBox();
    expect(box.height).toBeLessThanOrEqual(1080 * 0.9); // ≤90vh

    // Verify all controls visible
    await expect(page.locator('text=Regenerar con IA')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('text=Fondo exterior')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
    await expect(page.locator('button:has-text("Regenerar con IA")')).toBeVisible();
  });

  test('Mobile: Modal responsive at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[title="Regenerar con IA"]');

    const modal = page.locator('.modal-container');
    const box = await modal.boundingBox();

    // Verify modal width
    expect(box.width).toBeLessThanOrEqual(375 - 32); // 100% - padding

    // Verify responsive padding (16px)
    const header = page.locator('.modal-container > div:first-child');
    const padding = await header.evaluate(el =>
      window.getComputedStyle(el).padding
    );
    expect(padding).toContain('16px');
  });
});
```

---

## TESTING COMPLETION CRITERIA

### All Tests Passing
- ✅ Desktop (1920x1080): All controls visible at 100% zoom
- ✅ Mobile (375x667): All controls accessible with scroll
- ✅ SSR: No hydration errors
- ✅ Build: 0 TypeScript errors
- ✅ Functionality: All 10 test cases passing

### Sign-Off
- [ ] Developer tested: _________________ (Date: _______)
- [ ] QA tested: _________________ (Date: _______)
- [ ] Product Owner approved: _________________ (Date: _______)

---

## COMPLETION STATUS

**Phase 9 Progress:** 80% → 90% COMPLETE

**Next Phase:** Phase 10 - Completion Report

**Note:** Manual testing required by user/QA team to validate all test cases.
