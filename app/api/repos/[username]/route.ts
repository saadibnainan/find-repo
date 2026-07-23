import { NextRequest, NextResponse } from "next/server";
import type { ApiError, Repo, ReposPayload } from "@/lib/types";
import { isValidGithubUsername, normalizeUsername } from "@/lib/validate";

// Overridable so tests can point the proxy at a mock upstream.
const GITHUB_API = process.env.GITHUB_API_URL ?? "https://api.github.com";
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  fork: boolean;
  updated_at: string;
}

function errorResponse(status: number, body: ApiError) {
  return NextResponse.json(body, { status });
}

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(decodeURIComponent(rawUsername));

  if (!isValidGithubUsername(username)) {
    return errorResponse(400, {
      code: "INVALID_USERNAME",
      error: "Invalid GitHub username. Use letters, digits and single hyphens (max 39 chars).",
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = clampInt(searchParams.get("page"), 1, 1, 10_000);
  const perPage = clampInt(searchParams.get("per_page"), DEFAULT_PER_PAGE, 1, MAX_PER_PAGE);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "find-repo",
  };
  // Server-side only: the token never reaches the browser.
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const upstreamUrl = new URL(`${GITHUB_API}/users/${username}/repos`);
  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("per_page", String(perPage));
  upstreamUrl.searchParams.set("sort", "updated");
  upstreamUrl.searchParams.set("direction", "desc");

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers,
      next: { revalidate: 60 },
    });
  } catch {
    return errorResponse(502, {
      code: "UPSTREAM_ERROR",
      error: "Could not reach the GitHub API. Check your connection and retry.",
    });
  }

  if (upstream.status === 404) {
    return errorResponse(404, {
      code: "NOT_FOUND",
      error: `No GitHub user named "${username}" exists.`,
    });
  }

  const rateLimitRemaining = upstream.headers.get("x-ratelimit-remaining");
  if (
    upstream.status === 429 ||
    (upstream.status === 403 && rateLimitRemaining === "0")
  ) {
    const reset = upstream.headers.get("x-ratelimit-reset");
    const resetHint = reset
      ? ` Limit resets at ${new Date(Number(reset) * 1000).toUTCString()}.`
      : "";
    return errorResponse(429, {
      code: "RATE_LIMITED",
      error: `GitHub API rate limit exceeded.${resetHint} Set GITHUB_TOKEN on the server to raise the limit to 5000 req/h.`,
    });
  }

  if (!upstream.ok) {
    return errorResponse(502, {
      code: "UPSTREAM_ERROR",
      error: `GitHub API responded with status ${upstream.status}. Try again shortly.`,
    });
  }

  const raw = (await upstream.json()) as GithubRepo[];

  // Map to the minimal shape the UI needs — no raw GitHub payload leaks through.
  const repos: Repo[] = raw.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    url: repo.html_url,
    isFork: repo.fork,
    updatedAt: repo.updated_at,
  }));

  // GitHub signals more pages via the Link header's rel="next"; when the
  // header is absent entirely, fall back to a full-page heuristic.
  const linkHeader = upstream.headers.get("link");
  const hasNext = linkHeader
    ? /<[^>]+>;\s*rel="next"/.test(linkHeader)
    : repos.length === perPage;

  const payload: ReposPayload = {
    username,
    page,
    perPage,
    hasNext,
    hasPrev: page > 1,
    repos,
  };

  return NextResponse.json(payload);
}
