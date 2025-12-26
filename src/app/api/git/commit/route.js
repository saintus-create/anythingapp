import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Commit message is required" },
        { status: 400 },
      );
    }

    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Add all changes
    await execAsync("git add .", { cwd: workspaceDir });

    // Commit changes
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: workspaceDir,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error committing changes:", error);
    return Response.json(
      { error: "Failed to commit changes" },
      { status: 500 },
    );
  }
}
