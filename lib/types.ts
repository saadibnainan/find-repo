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
}

export interface ReposPayload {
  username: string;
  page: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  repos: Repo[];
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
