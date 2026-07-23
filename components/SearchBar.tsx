"use client";

import { FormEvent, useState } from "react";
import { isValidGithubUsername, normalizeUsername } from "@/lib/validate";

interface SearchBarProps {
  onSearch: (username: string) => void;
  busy: boolean;
}

export default function SearchBar({ onSearch, busy }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const username = normalizeUsername(value);

    if (!username) {
      setValidationError("Type a username first.");
      return;
    }
    if (!isValidGithubUsername(username)) {
      setValidationError(
        "Invalid handle. Letters, digits, single hyphens. No leading/trailing hyphen. Max 39 chars."
      );
      return;
    }

    setValidationError(null);
    onSearch(username);
  }

  return (
    <section aria-label="Search GitHub users">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-0 sm:flex-row"
        noValidate
      >
        <label htmlFor="username" className="sr-only">
          GitHub username
        </label>
        <div className="relative flex-1">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-acid sm:left-6 sm:text-4xl"
          >
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="USERNAME"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (validationError) setValidationError(null);
            }}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? "username-error" : undefined}
            className="w-full border-4 border-bone bg-void py-5 pl-12 pr-4 font-display text-2xl uppercase tracking-wide text-bone placeholder:text-bone/25 focus:border-acid focus:outline-none sm:py-7 sm:pl-20 sm:text-4xl"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="border-4 border-bone bg-acid px-10 py-5 font-display text-2xl uppercase text-void transition-none hover:bg-bone focus:outline-none focus-visible:ring-4 focus-visible:ring-acid disabled:cursor-wait disabled:bg-bone/30 sm:border-l-0 sm:py-7 sm:text-3xl"
        >
          {busy ? (
            <span>
              WAIT<span className="animate-blink">_</span>
            </span>
          ) : (
            "Search"
          )}
        </button>
      </form>
      {validationError && (
        <p
          id="username-error"
          role="alert"
          className="mt-3 border-l-8 border-alarm bg-alarm/10 px-4 py-2 font-mono text-sm uppercase tracking-wide text-alarm"
        >
          ✗ {validationError}
        </p>
      )}
    </section>
  );
}
