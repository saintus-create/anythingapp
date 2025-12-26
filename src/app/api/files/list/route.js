import { promises as fs } from "fs";
import path from "path";

async function buildFileTree(dirPath, basePath = "") {
  const items = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and common directories to ignore
      if (
        entry.name.startsWith(".") ||
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "build"
      ) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        const children = await buildFileTree(fullPath, relativePath);
        items.push({
          name: entry.name,
          path: relativePath,
          type: "directory",
          children,
        });
      } else {
        items.push({
          name: entry.name,
          path: relativePath,
          type: "file",
        });
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }

  return items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "directory" ? -1 : 1;
  });
}

export async function GET() {
  try {
    // Use a workspace directory (you can make this configurable)
    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Create workspace if it doesn't exist
    try {
      await fs.access(workspaceDir);
    } catch {
      await fs.mkdir(workspaceDir, { recursive: true });
    }

    const files = await buildFileTree(workspaceDir);

    return Response.json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    return Response.json({ error: "Failed to list files" }, { status: 500 });
  }
}
