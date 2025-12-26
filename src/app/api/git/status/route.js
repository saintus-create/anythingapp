import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const workspaceDir =
      process.env.WORKSPACE_DIR || path.join(process.cwd(), "workspace");

    // Check if git repo exists
    try {
      await execAsync("git rev-parse --git-dir", { cwd: workspaceDir });
    } catch {
      return Response.json({
        branch: null,
        files: [],
        ahead: 0,
        behind: 0,
      });
    }

    // Get current branch
    const { stdout: branch } = await execAsync("git branch --show-current", {
      cwd: workspaceDir,
    });

    // Get status
    const { stdout: status } = await execAsync("git status --porcelain", {
      cwd: workspaceDir,
    });

    const files = status
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const statusCode = line.substring(0, 2).trim();
        const filePath = line.substring(3);
        let fileStatus = "modified";

        if (statusCode === "A" || statusCode === "??") fileStatus = "added";
        else if (statusCode === "D") fileStatus = "deleted";

        return { path: filePath, status: fileStatus };
      });

    // Get ahead/behind info
    let ahead = 0;
    let behind = 0;
    try {
      const { stdout: tracking } = await execAsync(
        "git rev-list --left-right --count HEAD...@{u}",
        { cwd: workspaceDir },
      );
      const [aheadStr, behindStr] = tracking.trim().split("\t");
      ahead = parseInt(aheadStr) || 0;
      behind = parseInt(behindStr) || 0;
    } catch {
      // No upstream branch
    }

    return Response.json({
      branch: branch.trim(),
      files,
      ahead,
      behind,
    });
  } catch (error) {
    console.error("Error getting git status:", error);
    return Response.json(
      { error: "Failed to get git status" },
      { status: 500 },
    );
  }
}
