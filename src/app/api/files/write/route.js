import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { path: filePath, content } = await request.json();

    if (!filePath || content === undefined) {
      return Response.json(
        { error: "Path and content are required" },
        { status: 400 },
      );
    }

    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");
    const fullPath = path.join(workspaceDir, filePath);

    // Security check: ensure path is within workspace
    if (!fullPath.startsWith(workspaceDir)) {
      return Response.json({ error: "Invalid path" }, { status: 403 });
    }

    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, "utf-8");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error writing file:", error);
    return Response.json({ error: "Failed to write file" }, { status: 500 });
  }
}
