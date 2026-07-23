export interface Repo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  isFork: boolean;
  updatedAt: string;
  defaultBranch: string;
}

export interface ReposPayload {
  username: string;
  page: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  repos: Repo[];
}

export interface UserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  url: string;
  followers: number;
  following: number;
  publicRepos: number;
  location: string | null;
  company: string | null;
  blog: string | null;
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  children?: TreeNode[];
}

export interface TreePayload {
  username: string;
  repo: string;
  branch: string;
  truncated: boolean;
  tree: TreeNode[];
}

export type ApiErrorCode =
  | "INVALID_USERNAME"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  error: string;
}
