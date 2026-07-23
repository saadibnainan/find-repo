"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/types";

interface TreeViewProps {
  nodes: TreeNode[];
  depth?: number;
}

function formatSize(bytes?: number): string | null {
  if (bytes === undefined) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DirRow({ node, depth }: { node: TreeNode; depth: number }) {
  // Top two levels start expanded so the structure reads at a glance.
  const [open, setOpen] = useState(depth < 1);
  const count = node.children?.length ?? 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 py-1 pr-2 text-left font-mono text-sm hover:bg-acid/10 focus:outline-none focus-visible:bg-acid/10"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="w-3 shrink-0 text-acid">{open ? "▾" : "▸"}</span>
        <span className="text-acid">{open ? "📂" : "📁"}</span>
        <span className="truncate font-bold uppercase tracking-wide">
          {node.name}
        </span>
        <span className="ml-auto shrink-0 pl-2 text-[10px] text-bone/40">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </button>
      {open && node.children && (
        <TreeView nodes={node.children} depth={depth + 1} />
      )}
    </li>
  );
}

function FileRow({ node, depth }: { node: TreeNode; depth: number }) {
  const size = formatSize(node.size);
  return (
    <li>
      <div
        className="flex items-center gap-2 py-1 pr-2 font-mono text-sm text-bone/80"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="w-3 shrink-0" aria-hidden />
        <span aria-hidden>📄</span>
        <span className="truncate">{node.name}</span>
        {size && (
          <span className="ml-auto shrink-0 pl-2 text-[10px] text-bone/40">
            {size}
          </span>
        )}
      </div>
    </li>
  );
}

export default function TreeView({ nodes, depth = 0 }: TreeViewProps) {
  return (
    <ul className={depth === 0 ? "" : ""}>
      {nodes.map((node) =>
        node.type === "dir" ? (
          <DirRow key={node.path} node={node} depth={depth} />
        ) : (
          <FileRow key={node.path} node={node} depth={depth} />
        )
      )}
    </ul>
  );
}
