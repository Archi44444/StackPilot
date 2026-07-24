# Fluence Design System

The interface is dark-first: precise, calm, and highly legible. Purple establishes hierarchy, cyan marks technical/highlighted states, and emerald is reserved for successful or active states. Decorative glow is restrained so long coding sessions remain comfortable.

## Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--bg-base` | `#05050A` | application canvas |
| `--bg-surface` | `#0D0D14` | cards and message areas |
| `--bg-elevated` | `#13131E` | sidebar, dialogs, popovers |
| `--bg-border` | `#1E1E2E` | low-emphasis dividers |
| `--brand-from` → `--brand-to` | `#7C3AED` → `#A855F7` | primary actions and gradients |
| `--accent-cyan` | `#22D3EE` | code and selected technical states |
| `--accent-emerald` | `#10B981` | success and ready states |
| `--text-primary` | `#F4F4FF` | primary copy |
| `--text-secondary` | `#9999BB` | supporting copy |
| `--text-muted` | `#55556A` | metadata and inactive controls |

Font pairing: Inter for UI and prose; JetBrains Mono for code. Base body text is 15px/24px. Labels are 12px/16px at medium weight. Code is 14px/22px.

## Components

The primitive set is `Button`, `Input`, `Textarea`, `Badge`, `Avatar`, `Tooltip`, `Modal`, `Spinner`, `GlowCard`, and `GradientText`. Each exposes semantic variants rather than raw color props. The initial button variants are `primary`, `secondary`, `ghost`, `danger`, and `icon`.

Focus is always visible: a 2px violet ring with sufficient offset. All controls meet a 44×44px pointer target where practical. Text and icons must keep WCAG AA contrast against their actual backgrounds.

## Layout and responsive behavior

- Desktop: a 260px collapsible sidebar, with a centered chat column capped at 896px.
- Tablet: the sidebar collapses to icons; secondary dashboard panels stack.
- Mobile: sidebar becomes an overlay sheet; chat composer stays reachable above safe-area insets.
- App headers are sticky only when they preserve useful controls; chat content must never be obscured by the composer.

## Motion

Use the shared presets in `frontend/src/utils/motionVariants.js`. Entry transitions are 350–500ms and use an ease-out curve. Stagger is 80ms. Animate opacity and transform only; respect `prefers-reduced-motion` by removing nonessential animations. Streaming indicators may animate, but no loop should be visually dominant.
