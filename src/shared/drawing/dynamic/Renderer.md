# Using `Renderer`

This document explains how to use the `Renderer` React component (file: `Renderer.tsx`) with an `Engine`, and how to supply `globalConfig` and `branchStyles` props.

**What `Renderer` does**
- Creates a Pixi `Application` and `Viewport` and draws chronicles and connections using a provided `engine`.
- Waits for `engine.loaded` before rendering the scene.

**Engine API requirements**
`Renderer` expects an `engine` object implementing at least the following API (names and shapes used inside `Renderer.tsx`):

- `loaded: boolean` — whether the engine data is ready.
- `getLevel(level: number)` — returns a level collection with `.length` and `.toArray()` (the result items are `ButterflyCell` objects).
- `get(x: number, y: number)` — return a `ButterflyCell` or `undefined` for a given coordinates (used to find the first cell).
- `getLastCell(y: number)` — returns the last cell on a given horizontal level.
- `yDimensions: { positive: number, negative: number }` — numbers of positive/negative levels to iterate.

Note: `ButterflyCell` instances used by `Renderer` are expected to have properties used in the component: `.prev`, `.next`, `.y`, and a `.$` payload containing at least `id` and `knots: { start, end }`.

**Props**
- `engine?: Engine` — the engine instance to read layout and chain data from. If not provided, the component renders a fallback message.

- `globalConfig?: GlobalStyleConfig` — forwarded to the drawing style API via `setGlobalConfig`. Provide an object matching the shape of `GlobalStyleConfig` exported by the drawing style API (`styleApi`). This config adjusts global drawing options (colors, spacing, opacities, etc.). Passing `globalConfig` sets the global style once during mount.

- `branchStyles?: Map<string, BranchStyle>` — a `Map` where keys are branch IDs (string) and values are `BranchStyle` objects (see `styleApi`). Each entry is applied by `setBranchStyle(id, style)` during mount. Use branch IDs that match the identifiers used by your chronicles (for example, chronicle `id` values).

**Behavior notes**
- `Renderer` clears and redraws the viewport when the engine signals readiness (`engine.loaded`) or when the effect that draws depends on the `engine` reference. The component also applies `globalConfig` and `branchStyles` during mount.
- The current implementation applies `globalConfig` and `branchStyles` only during mount (one-time). If you need live updates when these props change, update the component to watch those props.

**Minimal usage example**

```tsx
import React from 'react';
import Renderer from './Renderer';
import useEngine from '@/shared/processing/engines/dynamic/useEngine';

function Viewer() {
  const engine = useEngine(); // or obtain engine from props/context

  // Example branch styles — keys should match branch IDs
  const branchStyles = new Map<string, any>([
    ['chronicle-1', { color: 0xff0000, thickness: 2 }],
  ]);

  // Example global config (shape must match GlobalStyleConfig)
  const globalConfig = {
    // fillAlpha: 0.8,
    // strokeColor: 0x000000,
  };

  return (
    <div className="viewer">
      <Renderer engine={engine} branchStyles={branchStyles} globalConfig={globalConfig} />
    </div>
  );
}

export default Viewer;
```

**Tips**
- Ensure `engine.loaded` becomes `true` once the engine has built its levels and cells; `Renderer` will not draw until then.
- Match `branchStyles` keys to the branch or chronicle identifiers the drawing code expects (commonly the chronicle `id`).
- If you need dynamic updates to styles, either update `Renderer` to re-run the style effect when props change, or call `setGlobalConfig`/`setBranchStyle` from your top-level code when styles change.

---

File: www/src/shared/drawing/dynamic/Renderer.tsx
