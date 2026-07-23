"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Repo } from "@/lib/types";
import RepoCard from "@/components/RepoCard";

interface RepoSceneProps {
  repos: Repo[];
  onSelect: (repo: Repo) => void;
}

export default function RepoScene({ repos, onSelect }: RepoSceneProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Repositories">
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {repos.map((repo, index) => (
          <motion.li
            key={repo.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(index * 0.04, 0.4),
              duration: 0.35,
              ease: "easeOut",
            }}
          >
            <RepoCard repo={repo} index={index} onSelect={onSelect} />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
