import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { promises as fs } from "fs";

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json(
        { error: "Repository URL is required" },
        { status: 400 },
      );
    }

    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Clear workspace directory
    try {
      await fs.rm(workspaceDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }

    // Create workspace directory
    await fs.mkdir(workspaceDir, { recursive: true });

    // Clone repository
    await execAsync(`git clone ${url} .`, { cwd: workspaceDir });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error cloning repository:", error);
    return Response.json(
      { error: "Failed to clone repository" },
      { status: 500 },
    );
  }
}
