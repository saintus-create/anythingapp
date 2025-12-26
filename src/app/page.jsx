"use client";

import { useState } from "react";
import {
  MessageSquare,
  FileText,
  GitBranch,
  Settings,
  Code2,
} from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import CodeEditor from "@/components/CodeEditor";
import FileExplorer from "@/components/FileExplorer";
import GitPanel from "@/components/GitPanel";
import ProviderSettings from "@/components/ProviderSettings";

export default function HomePage() {
  const [activePanel, setActivePanel] = useState("chat");
  const [activeFile, setActiveFile] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleFileSelect = (filePath) => {
    setActiveFile(filePath);
    setShowEditor(true);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setActivePanel("chat")}
          className={`p-3 rounded-lg transition-colors ${
            activePanel === "chat"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800"
          }`}
          title="Chat"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={() => setActivePanel("files")}
          className={`p-3 rounded-lg transition-colors ${
            activePanel === "files"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800"
          }`}
          title="Files"
        >
          <FileText size={20} />
        </button>
        <button
          onClick={() => setActivePanel("git")}
          className={`p-3 rounded-lg transition-colors ${
            activePanel === "git"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800"
          }`}
          title="Git"
        >
          <GitBranch size={20} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setActivePanel("settings")}
          className={`p-3 rounded-lg transition-colors ${
            activePanel === "settings"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800"
          }`}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-lg font-semibold">
            {activePanel === "chat" && "AI Chat"}
            {activePanel === "files" && "Files"}
            {activePanel === "git" && "Git"}
            {activePanel === "settings" && "Settings"}
          </h2>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {activePanel === "chat" && <ChatInterface />}
          {activePanel === "files" && (
            <FileExplorer
              onFileSelect={handleFileSelect}
              activeFile={activeFile}
            />
          )}
          {activePanel === "git" && <GitPanel />}
          {activePanel === "settings" && <ProviderSettings />}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-gray-900 flex flex-col">
        {showEditor && activeFile ? (
          <CodeEditor filePath={activeFile} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <Code2 size={64} className="mx-auto text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-300">
                AI Code Assistant
              </h1>
              <p className="text-gray-500">
                Select a file to edit or start chatting with AI
              </p>
              <div className="grid grid-cols-2 gap-2 pt-4">
                <button
                  onClick={() => setActivePanel("chat")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                >
                  Start Chat
                </button>
                <button
                  onClick={() => setActivePanel("settings")}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-sm"
                >
                  Setup AI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
