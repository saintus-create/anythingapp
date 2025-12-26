"use client";

import { useState, useEffect } from "react";
import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

export default function FileExplorer({ onFileSelect, activeFile }) {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(["/"]));
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/files/list");
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item, idx) => {
      const isExpanded = expandedFolders.has(item.path);
      const isActive = activeFile === item.path;

      return (
        <div key={idx}>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-800 transition-colors ${
              isActive ? "bg-blue-600 bg-opacity-20 text-blue-400" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            onClick={() => {
              if (item.type === "directory") {
                toggleFolder(item.path);
              } else {
                onFileSelect(item.path);
              }
            }}
          >
            {item.type === "directory" ? (
              <>
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <Folder size={16} className="text-blue-400" />
              </>
            ) : (
              <>
                <div className="w-4" />
                <File size={16} className="text-gray-400" />
              </>
            )}
            <span className="text-sm truncate">{item.name}</span>
          </div>
          {item.type === "directory" && isExpanded && item.children && (
            <div>{renderFileTree(item.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b border-gray-800">
        <button
          onClick={loadFiles}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            {loading ? "Loading files..." : "No files found"}
          </div>
        )}
      </div>
    </div>
  );
}
