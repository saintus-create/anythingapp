"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

export default function CodeEditor({ filePath, content, onSave, onClose }) {
  const [code, setCode] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCode(content);
    setHasChanges(false);
  }, [content, filePath]);

  const handleChange = (e) => {
    setCode(e.target.value);
    setHasChanges(e.target.value !== content);
  };

  const handleSave = () => {
    onSave(code);
    setHasChanges(false);
  };

  const getLanguage = (path) => {
    const ext = path.split(".").pop();
    const langMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      rb: "ruby",
      php: "php",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return langMap[ext] || "text";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#010409] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{filePath}</span>
          {hasChanges && (
            <span className="text-xs text-blue-400">● Modified</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full bg-[#0d1117] text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          style={{
            tabSize: 2,
            lineHeight: "1.6",
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-[#010409] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span>Language: {getLanguage(filePath)}</span>
        <span>Lines: {code.split("\n").length}</span>
      </div>
    </div>
  );
}
