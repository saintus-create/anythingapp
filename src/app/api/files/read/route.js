import { promises as fs } from "fs";
import path from "path";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return Response.json({ error: "Path is required" }, { status: 400 });
    }

    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");
    const fullPath = path.join(workspaceDir, filePath);

    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(workspaceDir)) {
      return Response.json({ error: "Invalid path" }, { status: 403 });
    }

    const content = await fs.readFile(fullPath, "utf-8");

    return Response.json({ content });
  } catch (error) {
    console.error("Error reading file:", error);
    return Response.json({ error: "Failed to read file" }, { status: 500 });
  }
}
