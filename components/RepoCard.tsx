"use client";

import { KeyboardEvent } from "react";
import type { Repo } from "@/lib/types";
import { languageColor } from "@/lib/languageColors";

interface RepoCardProps {
  repo: Repo;
  index: number;
  onSelect: (repo: Repo) => void;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export default function RepoCard({ repo, index, onSelect }: RepoCardProps) {
  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(repo);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View file tree for ${repo.name}`}
      onClick={() => onSelect(repo)}
      onKeyDown={handleKey}
      className="group flex h-full cursor-pointer flex-col border-4 border-bone bg-concrete transition-colors duration-150 hover:border-acid focus:outline-none focus-visible:border-acid focus-visible:ring-4 focus-visible:ring-acid/40"
    >
      <div className="flex items-start justify-between gap-2 border-b-4 border-inherit bg-slab px-4 py-3">
        <h2 className="break-all font-display text-lg uppercase leading-tight group-hover:text-acid">
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

      <div className="flex items-stretch border-t-4 border-inherit">
        <span className="flex-1 bg-void px-4 py-3 text-center font-display text-sm uppercase tracking-widest text-acid group-hover:bg-acid group-hover:text-void">
          View tree →
        </span>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="border-l-4 border-inherit bg-void px-4 py-3 text-center font-display text-sm uppercase tracking-widest text-bone hover:bg-bone hover:text-void focus:outline-none focus-visible:bg-bone focus-visible:text-void"
        >
          GitHub ↗<span className="sr-only"> open {repo.name} on GitHub</span>
        </a>
      </div>
    </article>
  );
}
