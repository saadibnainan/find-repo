# Design Notes — FIND-REPO

## Architecture

```
Browser ──> Next.js App Router
             ├── app/page.tsx            (server component: static shell)
             │    └── components/Explorer.tsx   (client: state machine)
             │         ├── SearchBar     (validation + submit)
             │         ├── UserCard      (profile: avatar/bio/stats)
             │         ├── RepoScene     (repo card grid)
             │         │    └── RepoCard (clickable → opens detail)
             │         ├── RepoDetail    (modal: file tree)
             │         │    └── TreeView (recursive, collapsible)
             │         ├── SkeletonGrid  (loading state)
             │         ├── ErrorSlab     (error states)
             │         └── Pagination    (prev/next)
             └── app/api/…                        (server proxies)
                  ├── user/[username]              → GET /users/:u
                  ├── repos/[username]             → GET /users/:u/repos
                  └── repos/[username]/[repo]/tree → GET /repos/:u/:r/git/trees/:b
```

The page shell is a server component; all interactivity lives in one client
island (`Explorer`). The GitHub API is never called from the browser — three
route handlers proxy it so an optional `GITHUB_TOKEN` stays server-side, and
each maps GitHub's large responses down to the minimal fields the UI renders,
keeping payloads small. Shared header/error/rate-limit logic lives in
`lib/github.ts` so the three routes stay thin.

## State management

Plain React state in `Explorer` — no external store. The UI is a four-state
machine (`idle | loading | success | error`) plus the last successful repos
payload, the user profile, the last API error, and the currently selected repo
(for the detail modal). This is deliberately boring: the app has one async
resource keyed by `(username, page)`, so Redux/Zustand/React Query would be
pure overhead. An `AbortController` cancels in-flight requests when a new search
fires, preventing stale responses from clobbering newer ones.

On a new search the profile and first page of repos are fetched in parallel
(`Promise.all`); paging refetches only repos, so the profile stays put. The
file tree is owned locally by `RepoDetail` — it has its own fetch/loading/error
lifecycle so opening a repo never disturbs the list behind it.

Pagination state lives in the API payload (`page`, `hasNext`, `hasPrev`)
rather than duplicated client-side. `hasNext` is derived server-side from
GitHub's `Link: rel="next"` header (with a full-page-length fallback), because
the repos endpoint returns no total count.

## Motion strategy

The original brief called for a "3D motioned diagram." An early version tilted
the whole grid toward the cursor via a `mousemove` → spring → `rotateX/Y`
pipeline with per-card `translateZ` depth planes. In review that read as
disorienting and unprofessional, so it was **removed** in favour of restraint:

- **Entrance:** each card fades and rises a few pixels (`opacity 0→1`,
  `y 16→0`) with a small per-index stagger, capped at 0.4 s so long lists don't
  drag. Re-keying `RepoScene` on `(username, page)` replays it per page.
- **Hover:** a calm colour shift — the card border and title move to acid
  green, the primary action bar fills. No perspective, no scaling, no cursor
  tracking.
- **Accessibility:** `useReducedMotion` collapses the entrance to a plain
  opacity fade.

Framer Motion is still the animation layer (it is minimal here), and React
Three Fiber was never warranted — WebGL adds ~150 kB to render what is a grid
of text cards, at the cost of DOM text, native focus order, and real links.

## Repository file tree

Clicking a card opens `RepoDetail`, a modal that fetches
`/api/repos/:username/:repo/tree?branch=<default>`. Server-side the route calls
GitHub's git-trees API with `recursive=1`, then folds the flat, slash-delimited
path list into a nested `TreeNode[]` (directories before files, each group
alphabetised) so the client renders without any tree-building logic.
`TreeView` is a small recursive component: directories are collapsible buttons
(top level open by default), files show human-readable sizes. GitHub's
`truncated` flag is surfaced as a notice for very large repositories.

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
