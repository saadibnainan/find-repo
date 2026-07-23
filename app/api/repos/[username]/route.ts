import { NextRequest, NextResponse } from "next/server";
import type { Repo, ReposPayload } from "@/lib/types";
import { isValidGithubUsername, normalizeUsername } from "@/lib/validate";
import {
  GITHUB_API,
  errorResponse,
  githubHeaders,
  mapUpstreamError,
  unreachableResponse,
} from "@/lib/github";

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
  default_branch: string;
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

  const upstreamUrl = new URL(`${GITHUB_API}/users/${username}/repos`);
  upstreamUrl.searchParams.set("page", String(page));
  upstreamUrl.searchParams.set("per_page", String(perPage));
  upstreamUrl.searchParams.set("sort", "updated");
  upstreamUrl.searchParams.set("direction", "desc");

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: githubHeaders(),
      next: { revalidate: 60 },
    });
  } catch {
    return unreachableResponse();
  }

  const mapped = mapUpstreamError(upstream, `No GitHub user named "${username}" exists.`);
  if (mapped) return mapped;

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
    defaultBranch: repo.default_branch,
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
