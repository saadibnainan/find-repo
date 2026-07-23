import { NextRequest, NextResponse } from "next/server";
import type { TreeNode, TreePayload } from "@/lib/types";
import { isValidGithubUsername, normalizeUsername } from "@/lib/validate";
import {
  GITHUB_API,
  errorResponse,
  githubHeaders,
  mapUpstreamError,
  unreachableResponse,
} from "@/lib/github";

// GitHub repo names allow letters, digits, ., _ and -.
const REPO_NAME_RE = /^[a-zA-Z0-9._-]{1,100}$/;
// A git ref: no spaces or control chars; keep it conservative.
const BRANCH_RE = /^[a-zA-Z0-9._\-/]{1,255}$/;

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
}

interface GitTreeResponse {
  tree: GitTreeEntry[];
  truncated: boolean;
}

// Build a nested tree from GitHub's flat, slash-delimited path list.
function buildTree(entries: GitTreeEntry[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", type: "dir", children: [] };

  for (const entry of entries) {
    // Submodules (type "commit") have no browsable contents — skip them.
    if (entry.type === "commit") continue;

    const segments = entry.path.split("/");
    let cursor = root;

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;
      cursor.children ??= [];
      let next = cursor.children.find((c) => c.name === segment);

      if (!next) {
        const isDir = isLeaf ? entry.type === "tree" : true;
        next = {
          name: segment,
          path: segments.slice(0, index + 1).join("/"),
          type: isDir ? "dir" : "file",
          ...(isDir ? { children: [] } : {}),
          ...(isLeaf && entry.type === "blob" ? { size: entry.size } : {}),
        };
        cursor.children.push(next);
      }
      cursor = next;
    });
  }

  sortTree(root.children ?? []);
  return root.children ?? [];
}

// Directories first, then files; each group alphabetical.
function sortTree(nodes: TreeNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const node of nodes) {
    if (node.children) sortTree(node.children);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; repo: string }> }
) {
  const { username: rawUsername, repo: rawRepo } = await params;
  const username = normalizeUsername(decodeURIComponent(rawUsername));
  const repo = decodeURIComponent(rawRepo);

  if (!isValidGithubUsername(username) || !REPO_NAME_RE.test(repo)) {
    return errorResponse(400, {
      code: "INVALID_USERNAME",
      error: "Invalid repository reference.",
    });
  }

  const branchParam = request.nextUrl.searchParams.get("branch");
  const notFound = `Could not load the file tree for ${username}/${repo}.`;

  // Resolve the branch: trust a valid query param, otherwise ask GitHub for
  // the repo's default branch.
  let branch = branchParam && BRANCH_RE.test(branchParam) ? branchParam : "";
  if (!branch) {
    let repoRes: Response;
    try {
      repoRes = await fetch(`${GITHUB_API}/repos/${username}/${repo}`, {
        headers: githubHeaders(),
        next: { revalidate: 60 },
      });
    } catch {
      return unreachableResponse();
    }
    const mapped = mapUpstreamError(repoRes, notFound);
    if (mapped) return mapped;
    const repoData = (await repoRes.json()) as { default_branch?: string };
    branch = repoData.default_branch ?? "main";
  }

  let treeRes: Response;
  try {
    treeRes = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      { headers: githubHeaders(), next: { revalidate: 60 } }
    );
  } catch {
    return unreachableResponse();
  }

  const mapped = mapUpstreamError(treeRes, notFound);
  if (mapped) return mapped;

  const data = (await treeRes.json()) as GitTreeResponse;

  const payload: TreePayload = {
    username,
    repo,
    branch,
    truncated: Boolean(data.truncated),
    tree: buildTree(data.tree ?? []),
  };

  return NextResponse.json(payload);
}
