"use client";

interface PaginationProps {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  username: string;
  count: number;
  onPage: (page: number) => void;
}

export default function Pagination({
  page,
  hasPrev,
  hasNext,
  username,
  count,
  onPage,
}: PaginationProps) {
  return (
    <nav
      aria-label="Repository pages"
      className="flex flex-col items-stretch gap-4 border-4 border-bone bg-concrete p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-bone/60">
        {`@${username} // page ${page} // ${count} repos shown`}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={!hasPrev}
          className="border-4 border-bone bg-void px-8 py-3 font-display text-lg uppercase text-bone hover:bg-bone hover:text-void focus:outline-none focus-visible:ring-4 focus-visible:ring-acid disabled:cursor-not-allowed disabled:border-bone/20 disabled:text-bone/20 disabled:hover:bg-void"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={!hasNext}
          className="border-4 border-bone bg-acid px-8 py-3 font-display text-lg uppercase text-void hover:bg-bone focus:outline-none focus-visible:ring-4 focus-visible:ring-acid disabled:cursor-not-allowed disabled:border-bone/20 disabled:bg-void disabled:text-bone/20"
        >
          Next →
        </button>
      </div>
    </nav>
  );
}
