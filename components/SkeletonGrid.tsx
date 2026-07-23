interface SkeletonGridProps {
  count: number;
}

export default function SkeletonGrid({ count }: SkeletonGridProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4"
    >
      <span className="sr-only">Loading repositories…</span>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="flex h-64 flex-col border-4 border-bone/40 bg-concrete"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="border-b-4 border-bone/40 bg-slab px-4 py-4">
            <div className="h-5 w-3/4 animate-blink bg-bone/20" />
          </div>
          <div className="flex-1 space-y-3 px-4 py-4">
            <div className="h-3 w-full bg-bone/10" />
            <div className="h-3 w-5/6 bg-bone/10" />
            <div className="h-3 w-1/2 bg-bone/10" />
          </div>
          <div className="border-t-4 border-bone/40 px-4 py-3">
            <div className="h-4 w-2/5 animate-blink bg-acid/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
