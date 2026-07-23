# FIND-REPO

A dark-brutalist GitHub repository explorer. Type a GitHub username, get their
public repositories rendered as a 3D motioned diagram — cards cascade in on
staggered depth planes and the whole scene tilts toward your cursor.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**.
See [`design.md`](./design.md) for architecture and implementation notes.

## Features

- **3D motioned diagram** — repo cards float on staggered z-planes, cascade in
  with spring physics, and the whole scene parallax-tilts with mouse movement
  (fully disabled for `prefers-reduced-motion` users).
- **Server-side GitHub proxy** — the browser only ever talks to
  `/api/repos/:username`; an optional `GITHUB_TOKEN` stays on the server.
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

`GET /api/repos/:username?page=1&per_page=20`

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
