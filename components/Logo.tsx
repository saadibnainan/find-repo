interface LogoMarkProps {
  size?: number;
  className?: string;
}

// The icon alone: a repo card with a lime status dot — the found result.
export function LogoMark({ size = 40, className = "" }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center border-4 border-bone bg-concrete ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width="56%" height="56%" fill="none">
        <rect x="13" y="14" width="31" height="31" rx="6" className="stroke-bone" strokeWidth={6} />
        <line x1="13" y1="25" x2="44" y2="25" className="stroke-bone" strokeWidth={6} />
        <circle cx="46" cy="47" r="9" className="fill-acid" />
      </svg>
    </span>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}

// Full lockup: icon + "FIND[block]REPO" wordmark, as specified in the brand doc.
export default function Logo({ size = 44, className = "", wordmarkClassName = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      <span
        className={`inline-flex items-center font-display uppercase leading-none tracking-tight text-bone ${wordmarkClassName}`}
      >
        Find
        <span
          aria-hidden
          className="mx-[0.09em] inline-block h-[0.16em] w-[0.42em] bg-acid"
        />
        Repo
      </span>
    </span>
  );
}
