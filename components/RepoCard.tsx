"use client";

import type { Repo } from "@/lib/types";
import { languageColor } from "@/lib/languageColors";

interface RepoCardProps {
  repo: Repo;
  index: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export default function RepoCard({ repo, index }: RepoCardProps) {
  return (
    <article className="group flex h-full flex-col border-4 border-bone bg-concrete shadow-brutal-white transition-shadow duration-150 hover:shadow-brutal">
      <div className="flex items-start justify-between gap-2 border-b-4 border-bone bg-slab px-4 py-3">
        <h2 className="break-all font-display text-lg uppercase leading-tight">
          {repo.name}
        </h2>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[10px] text-bone/40">
            #{String(index + 1).padStart(2, "0")}
          </span>
          {repo.isFork && (
            <span className="border-2 border-acid px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-acid">
              Fork
            </span>
          )}
        </div>
      </div>

      <p className="flex-1 px-4 py-4 font-mono text-sm leading-relaxed text-bone/70">
        {repo.description ?? "// no description provided"}
      </p>

      <div className="flex items-center gap-4 border-t-4 border-bone/20 px-4 py-3 font-mono text-xs uppercase">
        {repo.language && (
          <span className="flex items-center gap-1.5" title="Primary language">
            <span
              aria-hidden
              className="inline-block h-3 w-3 border border-void"
              style={{ backgroundColor: languageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span title={`${repo.stars} stars`}>★ {formatCount(repo.stars)}</span>
        <span title={`${repo.forks} forks`}>⑂ {formatCount(repo.forks)}</span>
      </div>

      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-t-4 border-bone bg-void px-4 py-3 text-center font-display text-sm uppercase tracking-widest text-acid hover:bg-acid hover:text-void focus:outline-none focus-visible:bg-acid focus-visible:text-void"
      >
        Open repo ↗<span className="sr-only"> {repo.name} on GitHub</span>
      </a>
    </article>
  );
}
