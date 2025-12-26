import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Pull changes
    await execAsync("git pull", { cwd: workspaceDir });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error pulling changes:", error);
    return Response.json({ error: "Failed to pull changes" }, { status: 500 });
  }
}
