# FIND-REPO

A dark-brutalist GitHub repository explorer. Type a GitHub username, get their
profile plus public repositories in a clean, professional card grid. Click any
repo to inspect its full file tree.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**.
See [`design.md`](./design.md) for architecture and implementation notes.

## Features

- **User profile** — after searching, the user's avatar, name, bio, location,
  company, and repo/follower/following counts render above their repositories.
- **Repository grid** — a clean responsive card grid with a subtle staggered
  fade-in entrance and a calm hover state (no disorienting motion; fully
  respects `prefers-reduced-motion`).
- **File-tree inspector** — click any repo card to open a modal showing that
  repository's complete, collapsible file tree (directories first, sizes shown),
  fetched from GitHub's git-trees API.
- **Server-side GitHub proxy** — the browser only ever talks to `/api/*`
  routes; an optional `GITHUB_TOKEN` stays on the server.
- **Client-side validation** of GitHub username rules before any request fires.
- **Stark error states** for unknown users, rate limiting (with fix guidance),
  and network failures.
- **Brutalist Prev/Next pagination** mapped to GitHub's `page` / `per_page`.

## Setup

Requires Node.js 18.18+ (Node 20/22 recommended).

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure a GitHub token for higher rate limits
cp .env.example .env
# then edit .env and set GITHUB_TOKEN=ghp_...

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable       | Required | Purpose                                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `GITHUB_TOKEN` | No       | Server-only GitHub token. Raises the API rate limit from 60 to 5000 req/h. Never sent to browser. |

Without a token the app works fine against GitHub's unauthenticated limit
(60 requests/hour per IP). When that limit is hit, the UI shows a distinct
rate-limit error explaining the fix.

## Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the dev server with hot reload  |
| `npm run build` | Production build                      |
| `npm run start` | Serve the production build            |
| `npm run lint`  | Run ESLint (next/core-web-vitals)     |

## API

Three server routes proxy the GitHub REST API, mapping each response down to
the minimal shape the UI needs:

| Route                                         | Purpose                          |
| --------------------------------------------- | -------------------------------- |
| `GET /api/user/:username`                     | User profile                     |
| `GET /api/repos/:username?page=1&per_page=20` | A page of the user's public repos |
| `GET /api/repos/:username/:repo/tree`         | The repo's file tree (nested)    |

### `GET /api/repos/:username?page=1&per_page=20`

Returns a minimal payload mapped from the GitHub REST API:

```json
{
  "username": "vercel",
  "page": 1,
  "perPage": 20,
  "hasNext": true,
  "hasPrev": false,
  "repos": [
    {
      "id": 123,
      "name": "next.js",
      "description": "The React Framework",
      "language": "JavaScript",
      "stars": 130000,
      "forks": 27000,
      "url": "https://github.com/vercel/next.js",
      "isFork": false,
      "updatedAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

Errors come back as `{ "code": "NOT_FOUND" | "RATE_LIMITED" | "INVALID_USERNAME" | "UPSTREAM_ERROR", "error": "…" }`
with matching HTTP status codes (404 / 429 / 400 / 502).

## License

MIT — see [LICENSE](./LICENSE).
