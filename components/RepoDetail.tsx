"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError, Repo, TreePayload } from "@/lib/types";
import { languageColor } from "@/lib/languageColors";
import TreeView from "@/components/TreeView";

interface RepoDetailProps {
  username: string;
  repo: Repo;
  onClose: () => void;
}

type Status = "loading" | "success" | "error";

export default function RepoDetail({ username, repo, onClose }: RepoDetailProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [payload, setPayload] = useState<TreePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(
          `/api/repos/${encodeURIComponent(username)}/${encodeURIComponent(
            repo.name
          )}/tree?branch=${encodeURIComponent(repo.defaultBranch)}`,
          { signal: controller.signal }
        );
        const body = await res.json();
        if (!res.ok) {
          setError((body as ApiError).error);
          setStatus("error");
          return;
        }
        setPayload(body as TreePayload);
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Network failure while loading the file tree.");
        setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, [username, repo.name, repo.defaultBranch]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-void/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`File tree for ${repo.name}`}
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-3xl border-4 border-bone bg-concrete shadow-brutal"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-4 border-bone bg-slab px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
              file tree // branch: {repo.defaultBranch}
            </p>
            <h2 className="mt-1 break-all font-display text-2xl uppercase leading-none">
              {username}/{repo.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-xs uppercase text-bone/60">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 border border-void"
                    style={{ backgroundColor: languageColor(repo.language) }}
                  />
                  {repo.language}
                </span>
              )}
              <span>★ {repo.stars}</span>
              <span>⑂ {repo.forks}</span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close file tree"
            className="shrink-0 border-4 border-bone bg-void px-4 py-2 font-display text-lg uppercase text-bone hover:bg-alarm hover:text-void focus:outline-none focus-visible:ring-4 focus-visible:ring-acid"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-3">
          {status === "loading" && (
            <p className="px-3 py-8 text-center font-mono text-sm uppercase tracking-widest text-bone/60">
              Reading tree<span className="animate-blink text-acid">_</span>
            </p>
          )}

          {status === "error" && (
            <div
              role="alert"
              className="m-3 border-l-8 border-alarm bg-alarm/10 px-4 py-3 font-mono text-sm text-alarm"
            >
              ✗ {error}
            </div>
          )}

          {status === "success" && payload && (
            <>
              {payload.tree.length === 0 ? (
                <p className="px-3 py-8 text-center font-mono text-sm text-bone/60">
                  This repository is empty.
                </p>
              ) : (
                <TreeView nodes={payload.tree} />
              )}
              {payload.truncated && (
                <p className="mt-3 border-t-4 border-bone/20 px-3 pt-3 font-mono text-[11px] uppercase tracking-wide text-bone/40">
                  Tree truncated by GitHub — this repository is too large to
                  list in full.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-bone px-5 py-3">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-display text-sm uppercase tracking-widest text-acid hover:underline"
          >
            Open {repo.name} on GitHub ↗
          </a>
        </div>
      </div>
    </div>
  );
}
