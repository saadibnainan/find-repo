/* eslint-disable @next/next/no-img-element */
import type { UserProfile } from "@/lib/types";

interface UserCardProps {
  user: UserProfile;
}

function stat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export default function UserCard({ user }: UserCardProps) {
  const meta = [
    user.company,
    user.location,
    user.blog ? user.blog.replace(/^https?:\/\//, "") : null,
  ].filter(Boolean) as string[];

  return (
    <section
      aria-label={`Profile for ${user.login}`}
      className="flex flex-col gap-6 border-4 border-bone bg-concrete p-6 sm:flex-row sm:items-center"
    >
      <img
        src={user.avatarUrl}
        alt={`${user.login} avatar`}
        width={112}
        height={112}
        className="h-28 w-28 shrink-0 border-4 border-bone bg-slab object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl uppercase leading-none sm:text-3xl">
            {user.name ?? user.login}
          </h2>
          <a
            href={user.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-acid hover:underline"
          >
            @{user.login} ↗
          </a>
        </div>

        {user.bio && (
          <p className="mt-2 max-w-2xl font-mono text-sm text-bone/70">
            {user.bio}
          </p>
        )}

        {meta.length > 0 && (
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-bone/50">
            {meta.join("  //  ")}
          </p>
        )}
      </div>

      <dl className="flex shrink-0 gap-6 border-t-4 border-bone/20 pt-4 font-mono sm:border-l-4 sm:border-t-0 sm:pl-6 sm:pt-0">
        {[
          ["Repos", user.publicRepos],
          ["Followers", user.followers],
          ["Following", user.following],
        ].map(([label, value]) => (
          <div key={label as string} className="text-center">
            <dd className="font-display text-2xl text-acid">
              {stat(value as number)}
            </dd>
            <dt className="text-[10px] uppercase tracking-widest text-bone/50">
              {label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
