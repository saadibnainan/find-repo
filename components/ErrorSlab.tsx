import type { ApiError } from "@/lib/types";

interface ErrorSlabProps {
  error: ApiError;
}

const TITLES: Record<ApiError["code"], string> = {
  NOT_FOUND: "User not found",
  RATE_LIMITED: "Rate limited",
  INVALID_USERNAME: "Invalid username",
  UPSTREAM_ERROR: "Upstream failure",
};

export default function ErrorSlab({ error }: ErrorSlabProps) {
  const rateLimited = error.code === "RATE_LIMITED";

  return (
    <div
      role="alert"
      className={`border-4 p-8 sm:p-12 ${
        rateLimited
          ? "border-acid bg-acid/5 shadow-brutal"
          : "border-alarm bg-alarm/5 shadow-brutal-alarm"
      }`}
    >
      <p
        className={`font-mono text-xs uppercase tracking-[0.4em] ${
          rateLimited ? "text-acid" : "text-alarm"
        }`}
      >
        error // {error.code}
      </p>
      <p className="mt-3 font-display text-3xl uppercase leading-none sm:text-5xl">
        {TITLES[error.code]}
      </p>
      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-bone/80">
        {error.error}
      </p>
      {rateLimited && (
        <p className="mt-4 border-l-8 border-acid pl-4 font-mono text-xs uppercase tracking-wide text-bone/60">
          Fix: add GITHUB_TOKEN to .env on the server → 5000 requests/hour.
        </p>
      )}
    </div>
  );
}
