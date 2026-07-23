"use client";

import { useCallback, useRef, useState } from "react";
import type { ApiError, ReposPayload } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import RepoScene from "@/components/RepoScene";
import SkeletonGrid from "@/components/SkeletonGrid";
import ErrorSlab from "@/components/ErrorSlab";
import Pagination from "@/components/Pagination";

const PER_PAGE = 20;

type Status = "idle" | "loading" | "success" | "error";

export default function Explorer() {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<ReposPayload | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchRepos = useCallback(async (username: string, page: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setApiError(null);

    try {
      const res = await fetch(
        `/api/repos/${encodeURIComponent(username)}?page=${page}&per_page=${PER_PAGE}`,
        { signal: controller.signal }
      );
      const body = await res.json();

      if (!res.ok) {
        setApiError(body as ApiError);
        setStatus("error");
        return;
      }

      setData(body as ReposPayload);
      setStatus("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setApiError({
        code: "UPSTREAM_ERROR",
        error: "Network failure. The request never made it out. Retry.",
      });
      setStatus("error");
    }
  }, []);

  const handleSearch = useCallback(
    (username: string) => fetchRepos(username, 1),
    [fetchRepos]
  );

  const handlePage = useCallback(
    (page: number) => {
      if (!data) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchRepos(data.username, page);
    },
    [data, fetchRepos]
  );

  return (
    <div className="flex flex-col gap-10">
      <SearchBar onSearch={handleSearch} busy={status === "loading"} />

      {status === "idle" && (
        <div className="border-4 border-dashed border-bone/30 p-10 text-center font-mono text-sm uppercase tracking-widest text-bone/50">
          Awaiting input<span className="animate-blink text-acid">_</span>
        </div>
      )}

      {status === "loading" && <SkeletonGrid count={8} />}

      {status === "error" && apiError && <ErrorSlab error={apiError} />}

      {status === "success" && data && (
        <>
          {data.repos.length === 0 ? (
            <div className="border-4 border-bone bg-concrete p-10 text-center">
              <p className="font-display text-3xl uppercase">Zero repos</p>
              <p className="mt-2 font-mono text-sm text-bone/60">
                {data.page > 1
                  ? "This page is past the end of the list. Go back."
                  : `@${data.username} has no public repositories.`}
              </p>
            </div>
          ) : (
            <RepoScene key={`${data.username}-${data.page}`} repos={data.repos} />
          )}
          <Pagination
            page={data.page}
            hasPrev={data.hasPrev}
            hasNext={data.hasNext}
            username={data.username}
            count={data.repos.length}
            onPage={handlePage}
          />
        </>
      )}
    </div>
  );
}
