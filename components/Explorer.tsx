"use client";

import { useCallback, useRef, useState } from "react";
import type { ApiError, Repo, ReposPayload, UserProfile } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import UserCard from "@/components/UserCard";
import RepoScene from "@/components/RepoScene";
import RepoDetail from "@/components/RepoDetail";
import SkeletonGrid from "@/components/SkeletonGrid";
import ErrorSlab from "@/components/ErrorSlab";
import Pagination from "@/components/Pagination";

const PER_PAGE = 20;

type Status = "idle" | "loading" | "success" | "error";

export default function Explorer() {
  const [status, setStatus] = useState<Status>("idle");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<ReposPayload | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [selected, setSelected] = useState<Repo | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // includeUser=true on a new search (fetch profile + repos); false on paging.
  const fetchData = useCallback(
    async (username: string, page: number, includeUser: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setApiError(null);

      try {
        const reposReq = fetch(
          `/api/repos/${encodeURIComponent(username)}?page=${page}&per_page=${PER_PAGE}`,
          { signal: controller.signal }
        );
        const userReq = includeUser
          ? fetch(`/api/user/${encodeURIComponent(username)}`, {
              signal: controller.signal,
            })
          : null;

        const [reposRes, userRes] = await Promise.all([reposReq, userReq]);

        const reposBody = await reposRes.json();
        if (!reposRes.ok) {
          setApiError(reposBody as ApiError);
          setStatus("error");
          return;
        }

        if (userRes) {
          const userBody = await userRes.json();
          if (userRes.ok) setUser(userBody as UserProfile);
        }

        setData(reposBody as ReposPayload);
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setApiError({
          code: "UPSTREAM_ERROR",
          error: "Network failure. The request never made it out. Retry.",
        });
        setStatus("error");
      }
    },
    []
  );

  const handleSearch = useCallback(
    (username: string) => {
      setUser(null);
      setSelected(null);
      fetchData(username, 1, true);
    },
    [fetchData]
  );

  const handlePage = useCallback(
    (page: number) => {
      if (!data) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchData(data.username, page, false);
    },
    [data, fetchData]
  );

  return (
    <div className="flex flex-col gap-8">
      <SearchBar onSearch={handleSearch} busy={status === "loading"} />

      {status === "idle" && (
        <div className="border-4 border-dashed border-bone/30 p-10 text-center font-mono text-sm uppercase tracking-widest text-bone/50">
          Awaiting input<span className="animate-blink text-acid">_</span>
        </div>
      )}

      {status === "error" && apiError && <ErrorSlab error={apiError} />}

      {/* Keep the profile visible across pagination loads. */}
      {user && status !== "error" && <UserCard user={user} />}

      {status === "loading" && <SkeletonGrid count={6} />}

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
            <RepoScene
              key={`${data.username}-${data.page}`}
              repos={data.repos}
              onSelect={setSelected}
            />
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

      {selected && data && (
        <RepoDetail
          username={data.username}
          repo={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
