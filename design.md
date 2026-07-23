# Design Notes — FIND-REPO

## Architecture

```
Browser ──> Next.js App Router
             ├── app/page.tsx            (server component: static shell)
             │    └── components/Explorer.tsx   (client: state machine)
             │         ├── SearchBar     (validation + submit)
             │         ├── RepoScene     (3D motioned diagram)
             │         │    └── RepoCard (presentational)
             │         ├── SkeletonGrid  (loading state)
             │         ├── ErrorSlab     (error states)
             │         └── Pagination    (prev/next)
             └── app/api/repos/[username]/route.ts   (server proxy)
                  └── https://api.github.com/users/:username/repos
```

The page shell is a server component; all interactivity lives in one client
island (`Explorer`). The GitHub API is never called from the browser — the
route handler proxies it so an optional `GITHUB_TOKEN` stays server-side, and
it maps the ~100-field GitHub response down to the 9 fields the UI renders,
keeping payloads small.

## State management

Plain React state in `Explorer` — no external store. The UI is a four-state
machine (`idle | loading | success | error`) plus the last successful payload
and the last API error. This is deliberately boring: the app has exactly one
async resource keyed by `(username, page)`, so Redux/Zustand/React Query would
be pure overhead. An `AbortController` cancels in-flight requests when a new
search fires, preventing stale responses from clobbering newer ones.

Pagination state lives in the API payload (`page`, `hasNext`, `hasPrev`)
rather than duplicated client-side. `hasNext` is derived server-side from
GitHub's `Link: rel="next"` header (with a full-page-length fallback), because
the repos endpoint returns no total count.

## 3D UI implementation strategy

**Chosen approach: CSS 3D transforms driven by Framer Motion** (rejected
React Three Fiber — see trade-offs below).

- The scene wrapper gets `perspective: 1400px`; the grid and each card get
  `transform-style: preserve-3d`, so all transforms compose in one 3D space.
- **Scene tilt:** a window-level `mousemove` listener writes normalized cursor
  coordinates into Framer `MotionValue`s, smoothed through `useSpring` and
  mapped via `useTransform` to ±7° `rotateY` / ±5° `rotateX` on the whole grid.
  Springing on the motion-value layer means the tilt animates off the React
  render path — no re-renders per mouse move.
- **Depth planes:** cards are assigned `translateZ` from a repeating
  `[0, 60, 120, 60]` slot pattern, giving the grid a sculpted, diagram-like
  relief rather than a flat wall.
- **Cascade entrance:** each card animates from `y:120, z:-300, rotateX:-35°`
  to its resting slot with a per-index stagger and an ease-out-quint curve.
  Re-keying `RepoScene` on `(username, page)` replays the cascade on every new
  result set.
- **Hover:** cards pop forward (`z:180, scale:1.04`) and their hard drop
  shadow flips from bone-white to acid green.
- **Accessibility:** `useReducedMotion` collapses all of the above to simple
  opacity fades, and the tilt listener is never attached.

### Why not React Three Fiber

R3F adds ~150 kB+ of WebGL runtime to render what is fundamentally a grid of
text cards. Text inside a canvas is either blurry (textures) or a positioning
headache (HTML overlays), and keyboard/screen-reader accessibility must be
rebuilt by hand. CSS 3D keeps real DOM text, native focus order, and links —
and delivers the same "floating diagram" read at a fraction of the cost.

## Visual language — dark brutalism

- Palette: `#050505` void, `#0d0d0d`/`#161616` concrete slabs, `#f2f2f2` bone,
  `#aaff00` acid green accent, `#ff2222` alarm red. Defined as Tailwind tokens.
- Zero border-radius anywhere; 4px solid borders; hard offset box-shadows
  (`8px 8px 0`) instead of blurs.
- Type: Archivo Black (display, always uppercase) against JetBrains Mono
  (body/metadata) via `next/font` with system-font fallbacks.
- Texture: a faint 48px etched grid on the body; blinking-cursor (`_`)
  step-animation for idle/loading states; skeletons are raw slabs that blink.
- Errors are load-bearing UI: full-width slabs with oversized display type.
  Rate-limit errors render in acid green with fix guidance; not-found and
  network errors render in alarm red.

## Deviations from the suggested stack

None. Next.js App Router + Tailwind CSS + Framer Motion, as specified.
