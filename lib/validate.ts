// GitHub usernames: 1-39 chars, alphanumerics and hyphens, no leading/trailing
// hyphen, no consecutive hyphens.
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function isValidGithubUsername(value: string): boolean {
  return GITHUB_USERNAME_RE.test(value);
}

export function normalizeUsername(value: string): string {
  return value.trim();
}
