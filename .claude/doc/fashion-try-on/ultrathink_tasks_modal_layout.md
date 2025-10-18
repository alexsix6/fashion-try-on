# Phase 1: Task Hierarchy - Modal Layout Responsive Fix
**Project:** fashion-try-on
**Date:** 2025-10-18
**Agent:** ultrathink-engineer
**Completion:** 10% → 20%

---

## TASK HIERARCHY (Reverse Engineering Approach)

### END GOAL (100%)
Modal "Regenerar con IA" totalmente responsive:
- Desktop (≥1024px): 100% zoom, todos controles visibles, scroll interno
- Tablet (768px-1024px): Layout adaptativo funcional
- Mobile (<768px): Stack vertical, scroll natural, UX fluida
- SSR fix preservado (NO hydration errors)
- Build passing (0 TypeScript errors)

---

## L1 MILESTONE: Responsive Modal Layout Implementado

### Success Criteria
- ✅ Modal constrained: `max-h-[90vh]` aplicado
- ✅ Desktop layout: Image + controls visible sin zoom
- ✅ Mobile layout: Stack vertical funcional
- ✅ Scroll interno: `overflow-y-auto` funciona
- ✅ SSR fix: `isMounted` state preservado
- ✅ Build: `pnpm build` sin errores

---

## L2 SUBTASKS BREAKDOWN

### L2.1: Add Modal Max-Height Constraint
**Objetivo:** Prevenir modal overflow fuera del viewport
**Lines Target:** 490-493 (modal container)
**Changes:**
1. Añadir `max-h-[90vh]` a modal container
2. Añadir `overflow-hidden` al outer container
3. Test: Modal no excede 90% viewport height

**Before:**
```tsx
<div className="bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full relative">
```

**After:**
```tsx
<div className="bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col">
```

**Validation:**
- [ ] Modal height ≤ 90vh en todos viewports
- [ ] Content no se corta visualmente
- [ ] Border radius preservado

---

### L2.2: Implement Internal Scroll
**Objetivo:** Content scrollable cuando excede max-height
**Lines Target:** 509-573 (content section)
**Changes:**
1. Añadir `overflow-y-auto` a content section
2. Ajustar padding para scroll visual
3. Test: Scroll smooth funciona

**Before:**
```tsx
<div className="p-6 space-y-4">
```

**After:**
```tsx
<div className="p-6 space-y-4 overflow-y-auto flex-1">
```

**Validation:**
- [ ] Scroll aparece cuando content > modal height
- [ ] Scroll suave (no jumpy)
- [ ] Scrollbar visible en desktop

---

### L2.3: Responsive Layout - Desktop (≥768px)
**Objetivo:** Optimize layout para desktop
**Lines Target:** 512-522 (image preview section)
**Changes:**
1. Image preview: `w-32 h-32` → `md:w-48 md:h-48 w-32 h-32`
2. Flex layout: Mantener `flex gap-4`
3. Test: Image visible correctamente en desktop

**Before:**
```tsx
<img className="w-32 h-32 object-cover rounded-lg border border-zinc-700" />
```

**After:**
```tsx
<img className="md:w-48 md:h-48 w-32 h-32 object-cover rounded-lg border border-zinc-700" />
```

**Validation:**
- [ ] Desktop (≥768px): Image 192px × 192px
- [ ] Mobile (<768px): Image 128px × 128px
- [ ] Aspect ratio preservado

---

### L2.4: Responsive Padding Optimization
**Objetivo:** Reduce padding en móvil para ahorrar espacio
**Lines Target:** 495, 510, 576 (header, content, footer)
**Changes:**
1. Header: `p-6` → `p-4 md:p-6`
2. Content: `p-6` → `p-4 md:p-6`
3. Footer: `p-6` → `p-4 md:p-6`

**Before:**
```tsx
<div className="p-6 border-b">
<div className="p-6 space-y-4">
<div className="p-6 border-t">
```

**After:**
```tsx
<div className="p-4 md:p-6 border-b">
<div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
<div className="p-4 md:p-6 border-t">
```

**Validation:**
- [ ] Mobile: Padding 16px (más compacto)
- [ ] Desktop: Padding 24px (espacioso)
- [ ] Spacing visual correcto

---

### L2.5: Responsive Modal Width Mobile
**Objetivo:** Modal adapta width en móvil
**Lines Target:** 491 (modal container)
**Changes:**
1. Añadir responsive width: `w-full sm:max-w-lg md:max-w-2xl`
2. Test: Modal no demasiado ancho en móvil

**Before:**
```tsx
<div className="... max-w-2xl w-full ...">
```

**After:**
```tsx
<div className="... w-full sm:max-w-lg md:max-w-2xl ...">
```

**Validation:**
- [ ] Mobile (<640px): w-full (100% - 32px padding)
- [ ] Tablet (640-768px): max-w-lg (512px)
- [ ] Desktop (≥768px): max-w-2xl (672px)

---

### L2.6: Chips Section Responsive
**Objetivo:** Chips wrap correctamente en móvil
**Lines Target:** 548-572 (ejemplos chips)
**Changes:**
1. Verificar `flex-wrap` existe
2. Reducir padding interno si necesario
3. Test: 6 chips visibles y accesibles

**Current:**
```tsx
<div className="flex flex-wrap gap-2">
```

**Analysis:**
- ✅ Ya tiene `flex-wrap`
- ⚠️ Gap 2 (8px) puede ser tight en móvil
- No changes needed (verificar solo)

**Validation:**
- [ ] Chips wrap en múltiples líneas móvil
- [ ] Todos 6 chips clickeables
- [ ] Gap visual adecuado

---

### L2.7: Preserve SSR Fix (CRITICAL)
**Objetivo:** Garantizar NO romper SSR/hydration fix
**Lines Target:** 39-40, 155-159, 464
**Changes:**
1. NO modificar `isMounted` state
2. NO modificar `useEffect` mounting
3. NO modificar Portal condition
4. Test: Console logs limpios

**Preserve Lines:**
```tsx
// Line 39-40
const [isMounted, setIsMounted] = useState(false);

// Line 155-159
useEffect(() => {
  console.log('🔧 Setting isMounted to true (client-side hydration complete)');
  setIsMounted(true);
}, []);

// Line 464
{isMounted && regenerateModal.isOpen && regenerateModal.item && createPortal(...)}
```

**Validation:**
- [ ] isMounted state unchanged
- [ ] useEffect mounting unchanged
- [ ] Portal condition unchanged
- [ ] No hydration warnings console

---

### L2.8: Build & Type Check
**Objetivo:** Validar NO hay errores TypeScript/build
**Lines Target:** All changes
**Changes:**
1. Run `pnpm build`
2. Fix any TypeScript errors
3. Validate output clean

**Commands:**
```bash
cd /mnt/d/Dev/fashion-try-on
pnpm build
```

**Validation:**
- [ ] 0 TypeScript errors
- [ ] 0 build warnings
- [ ] Build completes successfully

---

### L2.9: Integration Testing
**Objetivo:** Validar funcionalidad end-to-end
**Lines Target:** Full modal (464-605)
**Test Cases:**
1. Click "Regenerar" button → Modal opens
2. Modal visible desktop 100% zoom
3. All controls accessible sin scroll excesivo
4. Escape key closes modal
5. Click outside closes modal
6. Auto-focus textarea works
7. Ctrl+Enter submits
8. Loading state works

**Validation:**
- [ ] All 8 test cases passing
- [ ] Desktop UX smooth
- [ ] Mobile UX smooth
- [ ] No regressions

---

## L3 MICRO-TASKS (Implementation Details)

### L3.1: Modal Container Class Update
**Parent:** L2.1
**Action:** Edit line 491
**Old:** `"bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full relative"`
**New:** `"bg-zinc-900 border-2 border-purple-500/50 rounded-xl w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col"`

### L3.2: Header Padding Update
**Parent:** L2.4
**Action:** Edit line 495
**Old:** `"flex items-center justify-between p-6 border-b border-zinc-800"`
**New:** `"flex items-center justify-between p-4 md:p-6 border-b border-zinc-800"`

### L3.3: Content Section Update
**Parent:** L2.2, L2.4
**Action:** Edit line 510
**Old:** `"p-6 space-y-4"`
**New:** `"p-4 md:p-6 space-y-4 overflow-y-auto flex-1"`

### L3.4: Image Preview Update
**Parent:** L2.3
**Action:** Edit line 516
**Old:** `"w-32 h-32 object-cover rounded-lg border border-zinc-700"`
**New:** `"md:w-48 md:h-48 w-32 h-32 object-cover rounded-lg border border-zinc-700"`

### L3.5: Footer Padding Update
**Parent:** L2.4
**Action:** Edit line 576
**Old:** `"flex gap-4 p-6 border-t border-zinc-800"`
**New:** `"flex gap-4 p-4 md:p-6 border-t border-zinc-800"`

---

## EXECUTION ORDER (Dependency Chain)

### Phase 2 (20%): L2.1 - Modal Max-Height
- Independent task
- Blocking: L2.2 (scroll needs max-height)

### Phase 3 (30%): L2.2 - Internal Scroll
- Depends: L2.1 complete
- Blocking: L2.8 (testing)

### Phase 4 (40%): L2.3, L2.4, L2.5 - Responsive Layout
- Depends: L2.1, L2.2 complete
- Can run parallel (3 micro-tasks)

### Phase 5 (50%): L2.6 - Chips Verification
- Depends: L2.4 complete
- Independent verification

### Phase 6 (60%): L2.7 - SSR Preservation Check
- Depends: All L2.1-L2.6 complete
- Blocking: L2.8

### Phase 7 (70%): L2.8 - Build & Type Check
- Depends: All code changes complete
- Blocking: L2.9

### Phase 8 (80%): Manual Review
- Depends: L2.8 passing
- Code review antes de testing

### Phase 9 (90%): L2.9 - Integration Testing
- Depends: L2.8 passing
- Final validation

### Phase 10 (100%): Completion Report
- Depends: L2.9 passing
- Documentation + handoff

---

## RISK ASSESSMENT

### High Risk (P0)
- **SSR Fix Breaking**: Accidentally modify isMounted logic
  - Mitigation: NO tocar lines 39-40, 155-159, 464
- **Flexbox Layout Breaking**: Adding flex-col might break existing layout
  - Mitigation: Test incrementally

### Medium Risk (P1)
- **Scroll Not Smooth**: overflow-y-auto might look janky
  - Mitigation: Add custom scrollbar styling if needed
- **Image Too Large Mobile**: md:w-48 might still be big
  - Mitigation: Test on real device, adjust if needed

### Low Risk (P2)
- **Padding Too Tight Mobile**: p-4 might feel cramped
  - Mitigation: Easy adjustment after testing
- **TypeScript Errors**: Class changes might trigger type issues
  - Mitigation: Unlikely (only class strings)

---

## SUCCESS METRICS

### Performance
- Modal opens <100ms
- Scroll smooth 60fps
- No layout shift

### UX
- Desktop: 0 zoom needed para ver todo
- Mobile: Natural scroll, no pinch-zoom
- Accessibility: Keyboard navigation works

### Code Quality
- 0 TypeScript errors
- 0 console warnings
- SSR fix preserved 100%

---

## COMPLETION STATUS
- ✅ L1 Milestone defined
- ✅ 9 L2 Subtasks created
- ✅ 5 L3 Micro-tasks identified
- ✅ Execution order determined
- ✅ Risk assessment complete

**Phase 1 Progress:** 10% → 20% COMPLETE

**Next Phase:** Phase 2 - Implement Modal Max-Height (L2.1)
