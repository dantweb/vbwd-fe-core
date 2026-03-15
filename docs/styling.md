# VBWD Design System — Developer Reference

`vbwd-fe-core` is the single source of truth for all visual styles, tokens, and UI components used by `vbwd-fe-user` and `vbwd-fe-admin`. Both apps consume the design system via the shared `vbwd-view-component` library.

---

## 1. Architecture Overview

```
vbwd-fe-core/src/styles/
  variables.css   ← All CSS custom properties (design tokens)
  index.css       ← Utility classes, resets, imports variables.css

vbwd-fe-core/src/components/
  ui/             ← Button, Input, Card, Table, Modal, Badge, Alert, Pagination, Dropdown, Spinner
  layout/         ← Container, Row, Col
  forms/          ← Form group components
  access/         ← Permission-gated wrappers
  cart/           ← Cart UI components
```

The design system is intentionally **CSS-variable-first**: every color, radius, shadow, and spacing value is expressed as a `var(--vbwd-*)` property. This makes theme switching (light/dark/custom) a single `:root` override — no component changes needed.

---

## 2. Importing Styles

In each consuming app's entry point (`main.ts`):

```typescript
// Import design tokens + utility classes
import 'vbwd-view-component/styles';
// or directly from submodule during development:
import '../vbwd-fe-core/src/styles/index.css';
```

---

## 3. CSS Custom Properties (Design Tokens)

All tokens are defined in `src/styles/variables.css`. Override any token in the consuming app's global CSS to customize the theme.

### Color Palette

| Token | Default (Light) | Purpose |
|---|---|---|
| `--vbwd-color-primary` | `#3b82f6` | Buttons, links, active states |
| `--vbwd-color-primary-light` | `rgba(59,130,246,0.1)` | Hover backgrounds |
| `--vbwd-color-primary-dark` | `#2563eb` | Pressed state |
| `--vbwd-color-success` | `#10b981` | Positive status, paid badges |
| `--vbwd-color-success-light` | `#ecfdf5` | Success badge background |
| `--vbwd-color-danger` | `#ef4444` | Errors, destructive actions |
| `--vbwd-color-danger-light` | `#fef2f2` | Error badge background |
| `--vbwd-color-warning` | `#f59e0b` | Pending states, warnings |
| `--vbwd-color-warning-light` | `#fffbeb` | Warning badge background |
| `--vbwd-color-info` | `#3b82f6` | Info states |

### Surface & Text

| Token | Default | Purpose |
|---|---|---|
| `--vbwd-color-background` | `#ffffff` | Page background |
| `--vbwd-color-surface` | `#f9fafb` | Card, sidebar, table header |
| `--vbwd-color-surface-hover` | `#f3f4f6` | Row hover |
| `--vbwd-color-text` | `#374151` | Body text |
| `--vbwd-color-text-muted` | `#9ca3af` | Labels, secondary text |
| `--vbwd-color-border` | `#e5e7eb` | Dividers, input borders |

### Sidebar / Layout

| Token | Default | Purpose |
|---|---|---|
| `--vbwd-sidebar-bg` | `#2c3e50` | Sidebar background |
| `--vbwd-sidebar-text` | `rgba(255,255,255,0.8)` | Sidebar nav text |
| `--vbwd-sidebar-active-bg` | `rgba(255,255,255,0.1)` | Active nav item background |
| `--vbwd-page-bg` | `#f5f5f5` | Main content area background |
| `--vbwd-card-bg` | `#ffffff` | Card background |

### Spacing & Shape

| Token | Default | Purpose |
|---|---|---|
| `--vbwd-radius-sm` | `0.25rem` | Small elements |
| `--vbwd-radius-md` | `0.375rem` | Buttons, inputs |
| `--vbwd-radius-lg` | `0.5rem` | Cards, modals |
| `--vbwd-radius-full` | `9999px` | Pills, badges |
| `--vbwd-shadow-sm` | `0 1px 2px …` | Subtle card shadow |
| `--vbwd-shadow-md` | `0 4px 6px …` | Raised cards |
| `--vbwd-shadow-lg` | `0 10px 15px …` | Modals, dropdowns |

### Transitions

| Token | Default |
|---|---|
| `--vbwd-transition-fast` | `0.15s ease` |
| `--vbwd-transition-normal` | `0.2s ease` |
| `--vbwd-transition-slow` | `0.3s ease` |

---

## 4. UI Components

All components are in `vbwd-fe-core/src/components/ui/` and exported from `vbwd-view-component`.

### Button

```vue
<Button variant="primary" size="md" :loading="saving" @click="save">
  Save Changes
</Button>
```

| Prop | Type | Values | Default |
|---|---|---|---|
| `variant` | string | `primary` `secondary` `danger` `ghost` `link` | `primary` |
| `size` | string | `sm` `md` `lg` | `md` |
| `block` | boolean | — | `false` |
| `loading` | boolean | — | `false` |
| `disabled` | boolean | — | `false` |

CSS classes: `vbwd-btn`, `vbwd-btn-{variant}`, `vbwd-btn-{size}`, `vbwd-btn-block`

### Input

```vue
<Input v-model="email" label="Email" type="email" :error="errors.email" required />
```

| Prop | Type | Notes |
|---|---|---|
| `modelValue` | string | `v-model` |
| `label` | string | Renders `<label>` above |
| `error` | string | Red border + error message below |
| `hint` | string | Grey hint text below |
| `size` | string | `sm` `md` `lg` |
| `required` | boolean | Adds `*` to label |

Slots: `#prefix`, `#suffix` (icons inside input frame)

### Table

```vue
<Table
  :columns="[{ key: 'name', label: 'Name', sortable: true }, { key: 'status', label: 'Status' }]"
  :data="rows"
  :loading="loading"
  hoverable
>
  <template #cell-status="{ value }">
    <Badge :variant="value === 'active' ? 'success' : 'warning'">{{ value }}</Badge>
  </template>
</Table>
```

The `vbwd-table-wrapper` applies `overflow-x: auto` automatically — tables are always scroll-safe on mobile.

### Card

```vue
<Card title="Subscription" :padding="true">
  <p>Content here</p>
</Card>
```

### Badge

```vue
<Badge variant="success">Active</Badge>
<Badge variant="danger">Overdue</Badge>
<Badge variant="warning">Pending</Badge>
```

### Modal

```vue
<Modal :show="showModal" title="Confirm" @close="showModal = false">
  <p>Are you sure?</p>
  <template #footer>
    <Button variant="secondary" @click="showModal = false">Cancel</Button>
    <Button variant="danger" @click="confirm">Delete</Button>
  </template>
</Modal>
```

### Pagination

```vue
<Pagination :total="totalItems" :per-page="20" v-model:page="currentPage" />
```

---

## 5. Sidebar & Burger Menu Pattern

The sidebar + burger pattern is **currently implemented per-app** in `UserLayout.vue` (fe-user) and `AdminLayout.vue` + `AdminSidebar.vue` (fe-admin). Both use the same CSS custom properties for consistency.

**Target state (planned):** Extract into a `VbwdAppLayout` component in fe-core that accepts named slots for brand, nav, footer. Both apps will replace their current layout files with `<VbwdAppLayout>`.

### Current CSS contract (both apps must follow)

```css
/* Sidebar uses these tokens — override to theme */
--vbwd-sidebar-bg: #2c3e50;
--vbwd-sidebar-text: rgba(255, 255, 255, 0.8);
--vbwd-sidebar-active-bg: rgba(255, 255, 255, 0.1);
```

### Responsive breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 1024px` (desktop) | Sidebar fixed on left, main content `margin-left: 250px` |
| `≤ 1024px` (tablet/mobile) | Mobile header shown (60px, dark), sidebar hidden off-screen, burger toggles slide-in |
| `≤ 768px` (phone) | Sidebar expands to `width: 100%` when open |

### Mobile header structure

```html
<header class="mobile-header">          <!-- position: fixed, height: 60px, z-index: 999 -->
  <button class="burger-menu">          <!-- 3 spans, animates to X when .active -->
  <div class="logo-mobile">             <!-- flex: 1, app title -->
  <!-- optional: action buttons (cart icon, etc.) -->
</header>
```

### Burger animation

```css
.burger-menu span { transition: all 0.3s; }
.burger-menu.active span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
.burger-menu.active span:nth-child(2) { opacity: 0; }
.burger-menu.active span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }
```

---

## 6. Theme Switching

The design system supports runtime theme switching by toggling a class on `<html>` or `<body>`.

### Built-in dark mode

```css
/* Enabled by adding .dark to <html> */
.dark {
  --vbwd-color-background: #111827;
  --vbwd-color-surface: #1f2937;
  --vbwd-color-text: #f3f4f6;
  --vbwd-color-border: #374151;
  /* … all danger/success/warning lights also overridden */
}
```

### Custom themes

```typescript
// src/stores/appearance.ts  (or similar in fe-user)
function applyTheme(theme: 'light' | 'dark' | 'custom') {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-custom');
  if (theme === 'dark') root.classList.add('dark');
  if (theme === 'custom') root.classList.add('theme-custom');
}
```

```css
/* In app's global.css */
.theme-custom {
  --vbwd-color-primary: #8b5cf6;
  --vbwd-sidebar-bg: #1a1a2e;
}
```

The theme switcher in the user sidebar calls `applyTheme()` and persists the choice to `localStorage`.

---

## 7. Form Elements — Inline Styling vs. Components

Prefer the `<Input>`, `<Dropdown>`, `<Button>` components from `vbwd-view-component`. When you must write inline styles (e.g., in a plugin view), follow these rules:

- **Never hardcode hex colors** — always use `var(--vbwd-color-*)`.
- **Use the shared radius tokens** — `border-radius: var(--vbwd-radius-md)`.
- **Touch targets ≥ 44px** — padding on buttons/inputs must make the hit area at least 44×44px on mobile.
- **No hover-only interactions** — every hover state must also work on `:focus-visible` for keyboard/touchscreen.

---

## 8. Mobile App Compatibility (Android / iOS)

When the app is wrapped in a native WebView (Capacitor, Cordova, etc.):

```css
/* Add to app root layout */
.app-layout {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

- All interactive elements use `cursor: pointer` (required for some Android WebViews).
- Font sizes never below `14px` to avoid auto-zoom on iOS.
- No `position: fixed` inside scrolling containers (iOS rubber-band bug).

---

## 9. Adding New Tokens

Edit `src/styles/variables.css`. Add to both `:root` (light) and `.dark` sections. Document the token in this file.

Example:

```css
:root {
  --vbwd-color-brand-accent: #f97316;  /* orange accent for marketplace edition */
}
.dark {
  --vbwd-color-brand-accent: #fb923c;
}
```

---

## 10. Adding New UI Components

1. Create `src/components/ui/MyComponent.vue`
2. Use only `var(--vbwd-*)` in `<style scoped>`
3. Export from `src/components/ui/index.ts`
4. Export from `src/index.ts`
5. Run `npm run build` to regenerate `dist/`
6. Write unit test in `tests/`
