# Landing Page Design Spec

## Purpose

Create a front page / landing page for new visitors to Vita. The page introduces the product, highlights features, and drives sign-ups. Existing users who are logged in will still see this page (no redirect).

## Design Decisions

- **Layout:** Split layout (Layout B) — structured, numbered, terminal-aesthetic
- **Theme:** Dark/Light mode with toggle button in Navbar. Default: **Light mode**. Last setting persisted via `localStorage`.
- **Theme scope:** CSS variables and Tailwind `dark:` classes set up app-wide (on `<html>`), but only the landing page is styled for both modes initially.
- **Styling:** Tailwind CSS utility classes (project already uses Tailwind 4.1.18). SCSS modules for component-scoped styles where needed, following existing patterns.
- **Fonts:** Fira Code (monospace), consistent with existing design
- **Colors:** Black/White base, #FFD100 yellow as accent. In light mode: white bg, black text, yellow accent. In dark mode: black bg, white text, yellow accent.
- **Borders:** 1px solid strokes, consistent with existing `--stroke-width` variable

## Page Structure

### 1. Navbar (existing component, modified)

- Logo (left) — existing Monocircuit logo
- Theme toggle button — sun/moon icon, switches `dark` class on `<html>`, saves to `localStorage`
- Sign In / Sign Up (right) — existing popover behavior

### 2. Hero Section (Split)

- **Left side:** "VITA" title (large, bold, letter-spaced), tagline with yellow left-border accent ("Your life, visualized as an interactive timeline"), two CTA buttons: "GET STARTED" (filled yellow) + "LEARN MORE" (outlined)
- **Right side:** Example image/screenshot placeholder. Uses Next.js `<Image>` component. Image path: `/public/static/images/hero-example.png` (to be added by user later). Shows a placeholder box with text until image is provided.

### 3. Features Section (Numbered List)

Four features as horizontal rows, each with:
- Yellow number (01, 02, 03, 04)
- Feature name (bold, uppercase)
- Description (muted color)

Features:
1. **CHRONICLES** — Capture life events with rich metadata, categories and time knots
2. **TIMELINE** — Interactive visual editor with branches, connections and zoom
3. **ENTITIES** — Link people, organizations and places to your story
4. **SHARE** — Export and share your visual biography with others

### 4. How It Works Section

Three step cards in a row:
1. **CREATE** — Sign up and create your first Vita
2. **CHRONICLE** — Add events, people and milestones
3. **VISUALIZE** — See your timeline come alive

### 5. CTA Footer

- Heading: "Ready to map your story?"
- Subtext: "Start visualizing your life — it's free."
- Button: "SIGN UP FREE" (filled yellow)

## Technical Implementation

### Theme System

- Add `dark` class toggle to `<html>` element
- Use Tailwind `dark:` variant for all color switches
- Theme provider/hook: `useTheme()` custom hook using Zustand or simple React context
  - Reads from `localStorage` key `vita-theme` on mount
  - Defaults to `"light"` if no saved preference
  - Toggles between `"light"` and `"dark"`
  - Updates `document.documentElement.classList` and `localStorage`

### File Structure

```
src/
  app/
    page.tsx                          # Refactored: Landing page with sections
    page.module.scss                  # Updated styles
  components/
    landing/
      HeroSection.tsx                 # Hero split with image placeholder
      HeroSection.module.scss
      FeaturesSection.tsx             # Numbered features list
      FeaturesSection.module.scss
      HowItWorksSection.tsx           # 3-step cards
      HowItWorksSection.module.scss
      CtaFooterSection.tsx            # CTA footer
      CtaFooterSection.module.scss
      ThemeToggle.tsx                 # Sun/moon toggle button
      ThemeToggle.module.scss
  hooks/
    useTheme.ts                       # Theme state + localStorage persistence
```

### Key Files Modified

- `src/app/page.tsx` — Replace current minimal page with landing page composition
- `src/app/layout.tsx` — Add theme initialization (read localStorage, set class before render to avoid flash)
- `src/components/layout/Navbar/Navbar.tsx` — Add ThemeToggle component
- `src/app/tailwind.css` — Extend with dark mode color variables

### Responsive Behavior

- Hero split stacks vertically on mobile (image below text)
- Features list remains full-width rows
- How it works cards stack vertically on small screens
- CTA footer stays centered
