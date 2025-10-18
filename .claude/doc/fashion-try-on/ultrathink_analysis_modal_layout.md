# Phase 0: Reverse Engineering - Modal Layout Analysis
**Project:** fashion-try-on
**Date:** 2025-10-18
**Agent:** ultrathink-engineer
**Completion:** 0% → 10%

---

## PROBLEM SUMMARY
Modal "Regenerar con IA" funciona (SSR fix ✅) pero tiene problemas de layout responsivo:
- **Desktop**: Modal demasiado grande, controles fuera del viewport, requiere zoom 33%
- **Móvil**: Navegación imposible, controles invisibles
- **Root Cause**: Modal sin max-height, no hay scroll interno, layout no responsive

---

## CURRENT MODAL STRUCTURE (Lines 464-605)

### 1. Portal Container (Lines 465-489)
```tsx
<div
  className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
  onClick={closeRegenerateModal}
>
```
**Analysis:**
- ✅ Fixed positioning correcto
- ✅ z-index 9999 adecuado
- ✅ Centering con flexbox
- ✅ Click-outside-to-close funciona
- ❌ Padding p-4 (16px) puede ser insuficiente en móvil

### 2. Modal Content Container (Lines 490-493)
```tsx
<div
  className="bg-zinc-900 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full relative"
  onClick={(e) => e.stopPropagation()}
>
```
**Analysis:**
- ✅ max-w-2xl (672px) adecuado para desktop
- ❌ **CRITICAL**: NO max-height definido
- ❌ NO overflow handling
- ❌ NO responsive width para móvil
- ✅ Stop propagation correcto

### 3. Header Section (Lines 495-507)
```tsx
<div className="flex items-center justify-between p-6 border-b border-zinc-800">
  <h3>Regenerar con IA</h3>
  <button>✕</button>
</div>
```
**Analysis:**
- ✅ Fixed height (~80px con padding)
- ✅ Close button funcional
- ⚠️ p-6 (24px) puede reducirse en móvil

### 4. Content Section (Lines 509-573)
```tsx
<div className="p-6 space-y-4">
  {/* Preview imagen */}
  <div className="flex gap-4">
    <img className="w-32 h-32 object-cover" />
    <div className="flex-1">...</div>
  </div>

  {/* Textarea */}
  <textarea rows={4} className="w-full" />

  {/* Ejemplos chips */}
  <div className="bg-zinc-800/50 p-4">
    {6 chips de sugerencias}
  </div>
</div>
```
**Analysis:**
- ❌ **CRITICAL**: NO max-height en content
- ❌ **CRITICAL**: NO overflow-y-auto
- ⚠️ Image preview w-32 h-32 (128px) es pequeña
- ⚠️ flex layout no responsive
- ✅ Textarea 4 rows adecuado
- ✅ 6 chips funcionan correctamente

**Height Calculation (Desktop):**
- Header: ~80px
- Image preview: 128px
- Textarea: ~120px (4 rows)
- Chips section: ~100px
- Footer: ~80px
- Padding/spacing: ~80px
- **TOTAL**: ~588px (cabe en viewport 1080px)

**¿Por qué necesita zoom 33%?**
- Problema NO es la altura calculada (588px)
- Problema es que el modal NO tiene max-height
- Si viewport es pequeño (<700px height), el modal se extiende fuera
- Sin scroll interno, controles quedan inaccesibles

### 5. Footer Section (Lines 576-601)
```tsx
<div className="flex gap-4 p-6 border-t border-zinc-800">
  <button>Cancelar</button>
  <button>Regenerar con IA</button>
</div>
```
**Analysis:**
- ✅ Fixed height (~80px con padding)
- ✅ Botones funcionan correctamente
- ⚠️ p-6 puede reducirse en móvil

---

## RESPONSIVE BREAKPOINTS ANALYSIS

### Current Breakpoints (NONE for modal)
- Modal usa `max-w-2xl` sin responsive variants
- NO hay clases `md:`, `lg:`, `sm:` en modal container
- Content layout NO cambia entre móvil/desktop

### Expected Breakpoints
- **Mobile**: <768px → Stack vertical, reduce paddings
- **Tablet**: 768px-1024px → Hybrid layout
- **Desktop**: ≥1024px → Full 2-column layout

---

## ROOT CAUSES IDENTIFIED

### 1. Modal Sin Max-Height (P0 - CRITICAL)
**Location:** Line 491
**Issue:** `max-w-2xl w-full` sin max-height
**Impact:** Modal puede extenderse infinitamente, empujando controles fuera del viewport
**Fix:** Añadir `max-h-[90vh]` al modal container

### 2. No Internal Scroll (P0 - CRITICAL)
**Location:** Line 510 (content section)
**Issue:** Content section sin `overflow-y-auto`
**Impact:** Si content excede max-height, no hay forma de scrollear
**Fix:** Añadir `overflow-y-auto` a content section

### 3. Layout No Responsive (P1 - HIGH)
**Location:** Lines 490-603 (entire modal)
**Issue:** No breakpoints móvil/desktop
**Impact:** Móvil usa mismo layout que desktop (ineficiente)
**Fix:** Implementar stack vertical en móvil, 2 columnas en desktop

### 4. Image Preview Pequeña (P2 - MEDIUM)
**Location:** Line 513-516
**Issue:** w-32 h-32 (128px) es pequeño para preview
**Impact:** Usuario no ve bien la imagen que va a regenerar
**Fix:** Aumentar a w-48 h-48 (192px) desktop, mantener w-32 móvil

### 5. Padding No Optimizado (P3 - LOW)
**Location:** Multiple (p-6 en header, content, footer)
**Issue:** p-6 (24px) es generoso para móvil
**Impact:** Desperdicia espacio en pantallas pequeñas
**Fix:** `p-6 md:p-6 sm:p-4` responsive padding

---

## SSR FIX PRESERVATION (CRITICAL)

### Current SSR Protection (Lines 39-159)
```tsx
// Track client-side mounting
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Portal rendering condition
{isMounted && regenerateModal.isOpen && regenerateModal.item && createPortal(...)}
```

**Analysis:**
- ✅ Prevents SSR/hydration mismatch
- ✅ Portal only renders client-side
- ✅ Console logs confirm mounting
- **MUST PRESERVE**: Lines 39-40, 155-159, 464 condition

---

## PROPOSED SOLUTION ARCHITECTURE

### Strategy: Minimal Invasive Responsive Fix
1. Add max-height + overflow to modal container
2. Implement responsive layout (flexbox desktop, stack móvil)
3. Optimize paddings for móvil
4. Increase image preview size desktop
5. Preserve ALL SSR fix code

### Implementation Plan (Next Phase)
- **Phase 1 (10%)**: Create task hierarchy
- **Phase 2 (20%)**: Desktop layout (2 columnas)
- **Phase 3 (30%)**: Mobile layout (stack vertical)
- **Phase 4 (40%)**: Scroll optimization
- **Phase 5 (50%)**: Glassmorphism preservation
- **Phase 6 (60%)**: Responsive testing
- **Phase 7 (70%)**: SSR verification
- **Phase 8 (80%)**: Build & type check
- **Phase 9 (90%)**: Integration testing
- **Phase 10 (100%)**: Completion report

---

## KEY FILES IDENTIFIED

### Primary Target
- `/mnt/d/Dev/fashion-try-on/src/components/fashion/MediaDashboard.tsx`
  - Lines 464-605: Modal implementation
  - Lines 39-40: isMounted state (PRESERVE)
  - Lines 155-159: isMounted effect (PRESERVE)

### Dependencies
- `react-dom` createPortal (line 4)
- Tailwind CSS classes
- lucide-react icons

---

## TESTING CHECKLIST (Phase 9)

### Desktop (≥1024px, 1920x1080)
- [ ] Modal visible 100% zoom
- [ ] All controls accessible without scroll external
- [ ] Image preview visible (192px)
- [ ] Textarea funcional
- [ ] 6 chips visibles
- [ ] Botones Regenerar/Cancelar visibles

### Tablet (768px-1024px, 768x1024)
- [ ] Modal responsive a width
- [ ] Layout adapta correctamente
- [ ] Scroll interno funciona

### Mobile (320px-768px, 375x667)
- [ ] Modal stack vertical
- [ ] Image preview reducida (128px)
- [ ] Scroll natural funciona
- [ ] Todos controles accesibles

### SSR/Hydration
- [ ] No console errors
- [ ] isMounted state funciona
- [ ] Portal rendering correcto

### Functionality
- [ ] Click regenerate → modal opens
- [ ] Escape key closes
- [ ] Click outside closes
- [ ] Auto-focus textarea
- [ ] Ctrl+Enter submits

---

## COMPLETION STATUS
- ✅ File read: MediaDashboard.tsx
- ✅ Modal structure analyzed (lines 464-605)
- ✅ Root causes identified (5 issues)
- ✅ SSR fix preservation plan
- ✅ Solution architecture defined

**Phase 0 Progress:** 0% → 10% COMPLETE

**Next Phase:** Phase 1 - Task Hierarchy Creation
