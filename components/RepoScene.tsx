"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Repo } from "@/lib/types";
import RepoCard from "@/components/RepoCard";

interface RepoSceneProps {
  repos: Repo[];
}

// Depth slots so cards sit on staggered z-planes — the "diagram" effect.
const DEPTHS = [0, 60, 120, 60];

export default function RepoScene({ repos }: RepoSceneProps) {
  const reduceMotion = useReducedMotion();

  // Normalized cursor position, -0.5..0.5 across the viewport.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // The whole diagram tilts toward the cursor.
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);

  useEffect(() => {
    if (reduceMotion) return;
    function handleMove(event: MouseEvent) {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <section aria-label="Repository diagram" className="perspective-stage">
      <motion.ul
        className="preserve-3d grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4"
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
      >
        {repos.map((repo, index) => (
          <motion.li
            key={repo.id}
            className="preserve-3d"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 120, z: -300, rotateX: -35 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, z: DEPTHS[index % DEPTHS.length], rotateX: 0 }
            }
            transition={{
              delay: index * 0.055,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={
              reduceMotion ? undefined : { z: 180, scale: 1.04, rotateX: 3 }
            }
          >
            <RepoCard repo={repo} index={index} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
