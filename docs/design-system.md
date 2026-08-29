# Design System: Visual Identity & Component Standards

## 1. Design Philosophy
The School Alumni Platform UI communicates **elegance, simplicity, trust, and clarity**. It caters to multi-generational alumni—ranging from recent graduates to older alumni who require high contrast, large touch targets, readable typography, and straightforward navigation.

---

## 2. Palette & Visual Hierarchy

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Canvas Background** | `#FFFFFF` | Primary screen canvas, clean whitespace |
| **Surface Off-White** | `#FAFAFA` | Page background, subtle section contrast |
| **Surface Card** | `#FFFFFF` | Cards & containers with thin borders |
| **Primary Typography** | `#111111` | Headings, primary text (High contrast) |
| **Secondary Text** | `#6B7280` | Subtitles, labels, metadata, timestamps |
| **Muted Text** | `#9CA3AF` | Captions, placeholders |
| **Border Gray** | `#E5E7EB` | Clean 1px card & divider borders |
| **Primary Accent Yellow** | `#F4C542` | Primary buttons, active tabs, highlight badges |
| **Hover Yellow** | `#E0B030` | Hover state for accent buttons |
| **Soft Yellow Surface** | `#FFF7D6` | Subtle highlight banners, pending chips, active item background |
| **Success Subtle** | `#10B981` | Approved status, Check-in success |
| **Error Subtle** | `#EF4444` | Rejected status, cancellation alert |

### Visual Weight Rule
> **WHITE (80%)** → **DARK TYPOGRAPHY (15%)** → **SOFT YELLOW ACCENTS (5%)**  
> Yellow is used carefully for key call-to-action buttons, active navigation indicators, and highlight badges. Heavy yellow fill or noisy backgrounds are strictly avoided.

---

## 3. Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Sizes**:
  - `Display / H1`: 28px - 32px (Bold, Line Height 1.2)
  - `H2`: 22px - 24px (SemiBold)
  - `H3`: 18px - 20px (SemiBold)
  - `Body`: 15px - 16px (Regular/Medium)
  - `Caption / Small`: 13px - 14px (Regular)

---

## 4. UI Components & Patterns

### 4.1 Cards & Containers
- `Border Radius`: `14px` to `18px`
- `Border`: `1px solid #E5E7EB`
- `Shadow`: `0 2px 4px rgba(0,0,0,0.02)` (Ultra-subtle elevation)
- `Padding`: `16px` to `24px`

### 4.2 Buttons
- `Primary`: Accent Yellow (`#F4C542`) background, Dark Charcoal (`#111111`) text, SemiBold 15px, 12px rounded, 48px height minimum for mobile touch targets.
- `Secondary`: White background, 1px border (`#E5E7EB`), Dark text (`#111111`).
- `Ghost`: Transparent background, subtle dark text.

### 4.3 Badges & Status Indicators
- `Pending`: Soft Yellow (`#FFF7D6`) background, Dark Yellow/Brown (`#854D0E`) text.
- `Approved / Attending`: Light Green (`#ECFDF5`) background, Dark Green (`#065F46`) text.
- `Cancelled / Rejected`: Light Red (`#FEF2F2`) background, Dark Red (`#991B1B`) text.

---

## 5. Mobile & Responsive Layout Principles
- **Mobile First Alumni App**: Clean bottom navbar with 5 core items (Home, Batch, Events, Memories, Profile).
- **Desktop First Admin**: Collapsible left sidebar, top navbar with school context switcher, clear breadcrumbs, header search bar, table filters, responsive draw/modal dialogs.
