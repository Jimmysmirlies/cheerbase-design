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

| Level    | Treatment                                    |
| -------- | -------------------------------------------- |
| Default  | `border border-border` - standard border     |
| Hover    | `shadow-lg` - subtle lift effect             |
| Elevated | `backdrop-filter: blur(24px)` - glass effect |
| Focus    | `ring-[3px] ring-ring/50` - focus rings      |

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
<Card className="border border-border p-0">
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

- Content pages (dashboard, public events): `max-w-6xl` (1152px)
- Form pages (edit, new event): `max-w-4xl` (896px)
- Dialogs: `max-w-md` to `max-w-2xl`
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

## Mobile Sticky Footer

Fixed-position CTA bars that persist at the bottom of mobile screens for primary actions (register, book, checkout).

**Design Guidelines:**

| Property    | Value                               | Rationale                                               |
| ----------- | ----------------------------------- | ------------------------------------------------------- |
| Height      | 56–64px content area                | Large enough to tap comfortably, not obtrusive          |
| Button size | `size="lg"` (min 44×44pt)           | Apple HIG / Material Design touch target minimum        |
| Padding     | `px-4 py-4`                         | Generous touch area, balanced with content              |
| Safe area   | `pb-[env(safe-area-inset-bottom)]`  | Accounts for iPhone home indicator, Android gesture bar |
| Border      | `border-t border-border`            | Subtle separation, consistent with depth strategy       |
| Background  | `bg-background/95 backdrop-blur-sm` | Glass effect for layering over content                  |
| Z-index     | `z-50`                              | Above page content, below modals                        |

**Content Structure:**

```tsx
<div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden pb-[env(safe-area-inset-bottom)]">
  <div className="flex items-center justify-between gap-4 px-4 py-4">
    {/* Left: Status text (two-line layout) */}
    <div className="min-w-0 flex-1">
      <p className="body-small font-medium text-foreground truncate">
        Primary Status
      </p>
      <p className="body-small text-muted-foreground truncate">
        Secondary info
      </p>
    </div>
    {/* Right: CTA button */}
    <Button size="lg" className="shrink-0">
      Action
    </Button>
  </div>
</div>;

{
  /* Spacer to prevent content overlap */
}
<div
  className="h-24 lg:hidden"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
/>;
```

**Best Practices:**

- Use `lg:hidden` to hide on desktop (show sidebar/inline CTA instead)
- Two-line text layout: bold status on top, muted detail below
- `truncate` on text to handle long content gracefully
- `shrink-0` on button to prevent compression
- Always include matching spacer element to prevent content overlap
- Use Title Case for status text, sentence case for details

**Avoid:**

- `size="sm"` buttons — too small for comfortable mobile tapping
- Single-line layouts that cram too much text
- Forgetting safe-area-inset — causes overlap with system UI
- Height under 56px — feels cramped and hard to interact with

## Modal / Dialog

Standard structure for all modal dialogs with consistent spacing, borders, and footer styling.

**DialogContent Base:**

- `rounded-xl` — consistent border radius
- `border-border/40` — subtle border
- `p-0 gap-0` — reset default spacing
- `overflow-hidden` — clean edge clipping

**Sizes:**

| Size     | Class       | Use Case                         |
| -------- | ----------- | -------------------------------- |
| Small    | `max-w-md`  | Confirmations, alerts            |
| Standard | `max-w-2xl` | Forms, multi-step flows          |
| Large    | `max-w-3xl` | Tables, bulk operations          |
| Full     | Responsive  | Specialized editors (roster etc) |

**Structure:**

```tsx
<DialogContent className="max-w-2xl rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
  {/* Header */}
  <DialogHeader className="px-6 pt-6 pb-4">
    <DialogTitle className="heading-3">Title</DialogTitle>
    <DialogDescription className="body-small text-muted-foreground/80">
      Description text
    </DialogDescription>
  </DialogHeader>

  {/* Content */}
  <div className="px-6 pb-6">{/* Main content here */}</div>

  {/* Footer */}
  <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
    <Button variant="ghost">Cancel</Button>
    <Button>Primary Action</Button>
  </div>
</DialogContent>
```

**Footer Variants:**

- **Split actions:** `flex items-center justify-between` (Cancel left, Submit right)
- **Right-aligned:** `flex items-center justify-end gap-3` (all buttons right)
- **With status:** Left side shows selection/status, right side has actions

**Scrollable Content:**

For modals with scrollable content areas:

```tsx
<div className="px-6 pb-6 max-h-80 overflow-y-auto pr-1">
  {/* Scrollable content */}
</div>
```

**Step Indicators (Multi-step):**

Place between header and content with `px-6 pb-6` wrapper.

**Avoid:**

- `rounded-3xl` or `rounded-md` — use `rounded-xl` consistently
- Direct padding on DialogContent (`p-6`) — use section-specific padding
- Missing `gap-0` — causes unwanted spacing between sections
- Footers without background — always use `bg-muted/30` for visual separation
