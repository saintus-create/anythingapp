"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check } from "lucide-react";

export default function ProviderSettings() {
  const [providers, setProviders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    apiKey: "",
    baseUrl: "",
    model: "",
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch("/api/providers");
      if (!response.ok) throw new Error("Failed to load providers");
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error("Error loading providers:", error);
    }
  };

  const handleAdd = async () => {
    if (!newProvider.name || !newProvider.apiKey || !newProvider.model) return;

    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProvider),
      });
      if (!response.ok) throw new Error("Failed to add provider");

      setNewProvider({ name: "", apiKey: "", baseUrl: "", model: "" });
      setShowAdd(false);
      await loadProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete provider");
      await loadProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!response.ok) throw new Error("Failed to update provider");
      await loadProviders();
    } catch (error) {
      console.error("Error updating provider:", error);
    }
  };

  const presetProviders = [
    {
      name: "Groq",
      baseUrl: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    },
    {
      name: "Moonshot",
      baseUrl: "https://api.moonshot.cn/v1",
      model: "moonshot-v1-8k",
    },
    {
      name: "Codestral",
      baseUrl: "https://codestral.mistral.ai/v1",
      model: "codestral-latest",
    },
    {
      name: "SambaNova",
      baseUrl: "https://api.sambanova.ai/v1",
      model: "Meta-Llama-3.1-70B-Instruct",
    },
    {
      name: "DeepSeek",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Add Provider Button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
      >
        <Plus size={16} />
        Add AI Provider
      </button>

      {/* Add Provider Form */}
      {showAdd && (
        <div className="p-4 bg-gray-800 rounded-lg space-y-3">
          <div className="text-sm font-medium mb-2">Quick Setup</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {presetProviders.map((preset, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setNewProvider({
                    ...newProvider,
                    name: preset.name,
                    baseUrl: preset.baseUrl,
                    model: preset.model,
                  })
                }
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newProvider.name}
            onChange={(e) =>
              setNewProvider({ ...newProvider, name: e.target.value })
            }
            placeholder="Provider Name (e.g., Groq)"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            value={newProvider.apiKey}
            onChange={(e) =>
              setNewProvider({ ...newProvider, apiKey: e.target.value })
            }
            placeholder="API Key"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            value={newProvider.baseUrl}
            onChange={(e) =>
              setNewProvider({ ...newProvider, baseUrl: e.target.value })
            }
            placeholder="Base URL (optional)"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            value={newProvider.model}
            onChange={(e) =>
              setNewProvider({ ...newProvider, model: e.target.value })
            }
            placeholder="Model Name"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleAdd}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          >
            Add Provider
          </button>
        </div>
      )}

      {/* Providers List */}
      <div className="space-y-2">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{provider.name}</span>
                {provider.is_active && (
                  <span className="px-2 py-0.5 bg-green-600 text-xs rounded">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">{provider.model}</div>
              {provider.base_url && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {provider.base_url}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(provider.id, provider.is_active)}
                className={`p-2 rounded transition-colors ${
                  provider.is_active
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleDelete(provider.id)}
                className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {providers.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No AI providers configured. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
