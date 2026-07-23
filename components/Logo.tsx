interface LogoMarkProps {
  size?: number;
  className?: string;
}

// The icon alone: a blocky F monogram with a lime locator dot.
export function LogoMark({ size = 40, className = "" }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center border-4 border-bone bg-concrete ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width="50%" height="50%" fill="none">
        <rect x="18" y="14" width="9" height="36" className="fill-bone" />
        <rect x="18" y="14" width="26" height="9" className="fill-bone" />
        <rect x="18" y="29" width="18" height="9" className="fill-bone" />
        <circle cx="45" cy="46" r="6.5" className="fill-acid" />
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
