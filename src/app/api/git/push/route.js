import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Push changes
    await execAsync("git push", { cwd: workspaceDir });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error pushing changes:", error);
    return Response.json({ error: "Failed to push changes" }, { status: 500 });
  }
}
