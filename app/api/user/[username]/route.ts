import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/types";
import { isValidGithubUsername, normalizeUsername } from "@/lib/validate";
import {
  GITHUB_API,
  errorResponse,
  githubHeaders,
  mapUpstreamError,
  unreachableResponse,
} from "@/lib/github";

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  company: string | null;
  blog: string | null;
}

export async function GET(
  _request: Request,
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

  let upstream: Response;
  try {
    upstream = await fetch(`${GITHUB_API}/users/${username}`, {
      headers: githubHeaders(),
      next: { revalidate: 60 },
    });
  } catch {
    return unreachableResponse();
  }

  const mapped = mapUpstreamError(upstream, `No GitHub user named "${username}" exists.`);
  if (mapped) return mapped;

  const raw = (await upstream.json()) as GithubUser;

  const profile: UserProfile = {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    url: raw.html_url,
    followers: raw.followers,
    following: raw.following,
    publicRepos: raw.public_repos,
    location: raw.location,
    company: raw.company,
    blog: raw.blog,
  };

  return NextResponse.json(profile);
}
