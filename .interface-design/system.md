# Cheerbase Design System

Extracted from existing codebase on 2026-01-24.

## Direction

Minimal, black-on-white surfaces with thin borders. Typography-driven hierarchy. Generous spacing and air. Borders-first depth strategy with subtle shadows on hover/elevation.

## Spacing

| Token | Value | Usage                      |
| ----- | ----- | -------------------------- |
| Base  | 4px   | `--spacing: 0.25rem`       |
| 1     | 4px   | Tight gaps                 |
| 2     | 8px   | Icon gaps, small padding   |
| 3     | 12px  | Compact padding            |
| 4     | 16px  | Standard padding           |
| 5     | 20px  | Medium spacing             |
| 6     | 24px  | Section gaps, card padding |
| 8     | 32px  | Large section gaps         |
| 10    | 40px  | Page padding (tablet)      |
| 12    | 48px  | Major sections             |
| 16    | 64px  | Hero spacing               |
| 20    | 80px  | Page padding (desktop)     |

**Page Layout:**

- Mobile padding: 24px (`--page-padding-x`)
- Tablet padding: 40px (min-width: 744px)
- Desktop padding: 80px (min-width: 1128px)
- Max content width: 1280px (`--content-max-width`)

## Radius

| Token | Value  | CSS Variable         |
| ----- | ------ | -------------------- |
| sm    | 6px    | `--radius-sm`        |
| md    | 8px    | `--radius-md`        |
| lg    | 10px   | `--radius-lg` (base) |
| xl    | 14px   | `--radius-xl`        |
| full  | 9999px | Pills, avatars       |

**Common usage:**

- Cards: `var(--radius-md)` or `rounded-md`
- Buttons: `rounded-md` (never `rounded-full` — buttons are never circular)
- Inputs: `rounded-lg`
- Badges: `rounded-md` or `rounded-full`
- Images: `rounded-xl`
- Avatars: `rounded-full`

## Depth

**Strategy: Borders-first** (114 border instances vs 35 shadow instances)

| Level    | Treatment                                      |
| -------- | ---------------------------------------------- |
| Default  | `border border-border/60` - thin, light border |
| Hover    | `shadow-lg` - subtle lift effect               |
| Elevated | `backdrop-filter: blur(24px)` - glass effect   |
| Focus    | `ring-[3px] ring-ring/50` - focus rings        |

**Avoid:**

- Heavy drop shadows on static elements
- Layered/stacked shadows
- Box shadows for depth hierarchy

**Allow:**

- Inset bevel shadows for glass effects
- Hover shadows for interactive feedback
- Ring shadows for focus states

## Typography

**Font Family:** Barlow (sans-serif)

| Class        | Size | Weight | Line Height | Usage              |
| ------------ | ---- | ------ | ----------- | ------------------ |
| `heading-1`  | 36px | 500    | 1.1         | Page titles        |
| `heading-2`  | 30px | 500    | 1.15        | Section titles     |
| `heading-3`  | 24px | 500    | 1.2         | Card titles        |
| `heading-4`  | 20px | 500    | 1.25        | Subsections        |
| `body-large` | 18px | 400    | 1.625       | Lead text          |
| `body-text`  | 16px | 400    | 1.625       | Default body       |
| `body-small` | 14px | 400    | 1.625       | Secondary text     |
| `label`      | 12px | 500    | 1.5         | Labels (uppercase) |

**Rules:**

- Always use typography classes, never raw Tailwind font sizes
- Title Case for headings, buttons, labels
- Sentence case for body text and descriptions

## Colors

**Color Space:** OKLCH

| Token                | Usage                           |
| -------------------- | ------------------------------- |
| `--primary`          | Dark gray text, primary buttons |
| `--muted-foreground` | Secondary text                  |
| `--border`           | Default borders                 |
| `--destructive`      | Errors, delete actions          |
| `--accent`           | Hover backgrounds               |

**Semantic Badges:**

- Success: `bg-green-100 border-green-200 text-green-900`
- Error: `bg-red-100 border-red-200 text-red-900`
- Warning: `bg-amber-100 border-amber-200 text-amber-900`
- Info: `bg-blue-100 border-blue-200 text-blue-900`

## Component Patterns

### Button

**Radius Rule:** Buttons always use `rounded-md` (default). Never use `rounded-full` for circular buttons — this is a design system constraint to maintain visual consistency.

```tsx
// Sizes
size = "sm"; // h-8, px-3, gap-1.5
size = "default"; // h-9, px-4, gap-2
size = "lg"; // h-10, px-6
size = "icon"; // size-9, rounded-md (not circular)

// Variants
variant = "default"; // bg-primary, solid
variant = "outline"; // border, bg-background
variant = "ghost"; // transparent, hover:bg-accent
variant = "secondary"; // bg-secondary
variant = "destructive"; // bg-destructive
variant = "gradient"; // gradient background with noise

// Action buttons with text + icon
<Button variant="outline" size="sm">
  <ShareIcon className="size-4" />
  Share
</Button>;
```

### Card

```tsx
// Base card
<Card className="border border-border/60 p-0">
  <CardContent className="px-6 py-6">...</CardContent>
</Card>;

// Interactive card hover
className =
  "hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40 transition duration-200";
```

### Input

```tsx
// Standard input
<Input className="h-9 rounded-lg px-3" />

// Focus state: border-ring ring-ring/50 ring-[3px]
```

### Badge

```tsx
// Standard
<Badge variant="secondary" />

// Status badges
<Badge variant="green">Open</Badge>
<Badge variant="amber">Closing Soon</Badge>
<Badge variant="red">Full</Badge>
```

## Layout Patterns

### Page Container

```tsx
<div className="page-container">
  {/* Auto-responsive padding, max-w-[1280px] */}
</div>
```

### Section Spacing

```tsx
// Vertical section gap
<div className="space-y-8">...</div>  // 32px between sections

// Card internal spacing
<div className="space-y-4">...</div>  // 16px between elements
```

### Max Widths

- Content pages: `max-w-7xl` (1280px)
- Forms/dialogs: `max-w-md` to `max-w-2xl`
- Full bleed: No max-width constraint

## Interaction States

| State          | Treatment                                        |
| -------------- | ------------------------------------------------ |
| Hover (card)   | `-translate-y-[2px] shadow-lg border-primary/40` |
| Hover (button) | `bg-{variant}/90` or `bg-accent`                 |
| Focus          | `ring-[3px] ring-ring/50 border-ring`            |
| Disabled       | `opacity-50 pointer-events-none`                 |
| Active         | Increased saturation or darker variant           |

## Animation

**Transitions:**

- Default: `transition duration-200 ease-out`
- Hover lift: `transition-transform duration-200`
- Glass gradient: `transition 0.4s ease-in-out`

**Motion principles:**

- Subtle, functional animations only
- No decorative motion
- Smooth scroll on marketing pages only
