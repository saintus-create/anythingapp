"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";

export default function GitPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [showClone, setShowClone] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/git/status");
      if (!response.ok) throw new Error("Failed to load git status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error loading git status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleClone = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/git/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl }),
      });
      if (!response.ok) throw new Error("Failed to clone repository");
      setRepoUrl("");
      setShowClone(false);
      await loadStatus();
    } catch (error) {
      console.error("Error cloning repository:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/git/pull", { method: "POST" });
      if (!response.ok) throw new Error("Failed to pull changes");
      await loadStatus();
    } catch (error) {
      console.error("Error pulling changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMessage }),
      });
      if (!response.ok) throw new Error("Failed to commit changes");
      setCommitMessage("");
      await loadStatus();
    } catch (error) {
      console.error("Error committing changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/git/push", { method: "POST" });
      if (!response.ok) throw new Error("Failed to push changes");
      await loadStatus();
    } catch (error) {
      console.error("Error pushing changes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Actions */}
      <div className="p-3 border-b border-gray-800 space-y-2">
        <button
          onClick={loadStatus}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Status
        </button>
        <button
          onClick={() => setShowClone(!showClone)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          <GitBranch size={14} />
          Clone Repository
        </button>
      </div>

      {/* Clone Form */}
      {showClone && (
        <div className="p-3 border-b border-gray-800 space-y-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleClone}
            disabled={loading || !repoUrl.trim()}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            Clone
          </button>
        </div>
      )}

      {/* Status */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {status && (
          <>
            {/* Branch Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <GitBranch size={14} className="text-blue-400" />
                <span className="font-medium">
                  {status.branch || "No repository"}
                </span>
              </div>
              {status.ahead > 0 && (
                <div className="text-xs text-gray-400">
                  {status.ahead} commit(s) ahead
                </div>
              )}
              {status.behind > 0 && (
                <div className="text-xs text-gray-400">
                  {status.behind} commit(s) behind
                </div>
              )}
            </div>

            {/* Changed Files */}
            {status.files && status.files.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Changes</div>
                <div className="space-y-1">
                  {status.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-gray-400 flex items-center gap-2"
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          file.status === "modified"
                            ? "bg-yellow-500"
                            : file.status === "added"
                              ? "bg-green-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="truncate">{file.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commit */}
            {status.files && status.files.length > 0 && (
              <div className="space-y-2">
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message..."
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={3}
                />
                <button
                  onClick={handleCommit}
                  disabled={loading || !commitMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm transition-colors"
                >
                  <GitCommit size={14} />
                  Commit
                </button>
              </div>
            )}

            {/* Pull/Push */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePull}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
              >
                <Download size={14} />
                Pull
              </button>
              <button
                onClick={handlePush}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
              >
                <Upload size={14} />
                Push
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
