"use client";

import { useState, useEffect } from "react";
import { Plus, Grid3x3 } from "lucide-react";
import { TemplatesModal } from "@/components/Board/Modals/TemplatesModal";

export default function HomePage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadBoards();

    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem(
      "viralboard_onboarding_seen",
    );
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const loadBoards = async () => {
    try {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to load boards");
      const data = await response.json();
      setBoards(data.boards);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (template = null) => {
    if (!newBoardName.trim()) return;

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName,
          template: template,
        }),
      });

      if (!response.ok) throw new Error("Failed to create board");
      const data = await response.json();

      setShowNewBoardModal(false);
      setShowTemplatesModal(false);
      setNewBoardName("");
      setSelectedTemplate(null);
      window.location.href = `/board/${data.board.id}`;
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewBoardClick = () => {
    setShowTemplatesModal(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplatesModal(false);
    setShowNewBoardModal(true);
  };

  const handleBoardNameSubmit = () => {
    createBoard(selectedTemplate);
  };

  const dismissOnboarding = () => {
    localStorage.setItem("viralboard_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Grid3x3 className="text-orange-500" size={24} />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
              ViralBoard Lite
            </span>
          </div>

          <button
            onClick={handleNewBoardClick}
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Board</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-jetbrains-mono">
            Your Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-12 font-jetbrains-mono">
            Organize and analyze your viral video content
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#262626] rounded-xl p-6 h-40 animate-pulse"
                />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-20">
              <Grid3x3
                className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                size={48}
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 font-jetbrains-mono">
                No boards yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-jetbrains-mono">
                Create your first board to get started
              </p>
              <button
                onClick={() => setShowNewBoardModal(true)}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => (window.location.href = `/board/${board.id}`)}
                  className="bg-white dark:bg-[#262626] rounded-xl p-6 text-left hover:shadow-lg dark:hover:ring-2 dark:hover:ring-gray-700 transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 font-jetbrains-mono">
                    {board.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    Updated {new Date(board.updated_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => {
          setShowTemplatesModal(false);
          setSelectedTemplate(null);
        }}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* New Board Modal - now shows after template selection */}
      {showNewBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#262626] rounded-xl p-6 sm:p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-jetbrains-mono">
              Create New Board
            </h2>
            {selectedTemplate && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-jetbrains-mono">
                Using template: {selectedTemplate.name}
              </p>
            )}
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleBoardNameSubmit()}
              placeholder="Board name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-jetbrains-mono mb-6"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewBoardModal(false);
                  setNewBoardName("");
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBoardNameSubmit}
                disabled={!newBoardName.trim()}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#262626] rounded-xl p-8 sm:p-12 max-w-2xl w-full">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 font-jetbrains-mono">
              Welcome to ViralBoard Lite! 🚀
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 font-jetbrains-mono">
                    Create a board
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    Click "New Board" to create your first workspace
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 font-jetbrains-mono">
                    Paste video links
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    Add your viral videos from YouTube, TikTok, or any platform
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 font-jetbrains-mono">
                    Use the AI panel
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
                    Click any card and let AI generate hooks, scripts, and ideas
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={dismissOnboarding}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
