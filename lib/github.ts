import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";

// Overridable so tests can point the proxy at a mock upstream.
export const GITHUB_API =
  process.env.GITHUB_API_URL ?? "https://api.github.com";

export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "find-repo",
  };
  // Server-side only: the token never reaches the browser.
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function errorResponse(status: number, body: ApiError) {
  return NextResponse.json(body, { status });
}

// Translate a non-ok GitHub response into our typed error envelope.
// Returns null when the response is fine and the caller should proceed.
export function mapUpstreamError(
  upstream: Response,
  notFoundMessage: string
): NextResponse | null {
  if (upstream.ok) return null;

  if (upstream.status === 404) {
    return errorResponse(404, { code: "NOT_FOUND", error: notFoundMessage });
  }

  const remaining = upstream.headers.get("x-ratelimit-remaining");
  if (upstream.status === 429 || (upstream.status === 403 && remaining === "0")) {
    const reset = upstream.headers.get("x-ratelimit-reset");
    const resetHint = reset
      ? ` Limit resets at ${new Date(Number(reset) * 1000).toUTCString()}.`
      : "";
    return errorResponse(429, {
      code: "RATE_LIMITED",
      error: `GitHub API rate limit exceeded.${resetHint} Set GITHUB_TOKEN on the server to raise the limit to 5000 req/h.`,
    });
  }

  return errorResponse(502, {
    code: "UPSTREAM_ERROR",
    error: `GitHub API responded with status ${upstream.status}. Try again shortly.`,
  });
}

export function unreachableResponse() {
  return errorResponse(502, {
    code: "UPSTREAM_ERROR",
    error: "Could not reach the GitHub API. Check your connection and retry.",
  });
}
