import { X, Lightbulb, Video, BookOpen, Zap } from "lucide-react";

const templates = [
  {
    id: "brainstorm",
    name: "Brainstorm Board",
    description: "Organize ideas with sticky notes and connections",
    icon: Lightbulb,
    cards: [
      { type: "note", text: "Main Idea", x: 400, y: 200, color: "yellow" },
      { type: "note", text: "Sub-idea 1", x: 200, y: 400, color: "blue" },
      { type: "note", text: "Sub-idea 2", x: 400, y: 400, color: "green" },
      { type: "note", text: "Sub-idea 3", x: 600, y: 400, color: "pink" },
    ],
    connectors: [
      { from: 0, to: 1, label: "relates to" },
      { from: 0, to: 2, label: "leads to" },
      { from: 0, to: 3, label: "connects to" },
    ],
  },
  {
    id: "video-research",
    name: "Video Research",
    description: "Collect and analyze video content with notes",
    icon: Video,
    cards: [
      {
        type: "text",
        textContent: "📹 Video Research Board",
        x: 400,
        y: 100,
        textColor: "#F59E0B",
        size: "large",
      },
      {
        type: "note",
        text: "Video 1 notes here...",
        x: 200,
        y: 300,
        color: "yellow",
      },
      {
        type: "note",
        text: "Video 2 notes here...",
        x: 600,
        y: 300,
        color: "blue",
      },
      { type: "note", text: "Key Insights", x: 400, y: 500, color: "green" },
    ],
    connectors: [],
  },
  {
    id: "research",
    name: "Research Board",
    description: "Organize research with sources and findings",
    icon: BookOpen,
    cards: [
      {
        type: "text",
        textContent: "📚 Research Topic",
        x: 400,
        y: 100,
        textColor: "#3B82F6",
        size: "large",
      },
      { type: "note", text: "Source 1", x: 200, y: 250, color: "yellow" },
      { type: "note", text: "Source 2", x: 400, y: 250, color: "pink" },
      { type: "note", text: "Source 3", x: 600, y: 250, color: "blue" },
      { type: "note", text: "Conclusion", x: 400, y: 450, color: "green" },
    ],
    connectors: [
      { from: 1, to: 4, label: "supports" },
      { from: 2, to: 4, label: "supports" },
      { from: 3, to: 4, label: "supports" },
    ],
  },
  {
    id: "quick-start",
    name: "Quick Start",
    description: "Simple board with a few cards to get started",
    icon: Zap,
    cards: [
      {
        type: "text",
        textContent: "🎯 Welcome to Your Board!",
        x: 400,
        y: 200,
        textColor: "#F59E0B",
        size: "large",
      },
      {
        type: "note",
        text: "Click to edit this note",
        x: 300,
        y: 400,
        color: "yellow",
      },
      {
        type: "note",
        text: "Drag cards to move them",
        x: 500,
        y: 400,
        color: "blue",
      },
    ],
    connectors: [],
  },
];

export function TemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-[#2A2A2A] border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
              Choose a Template
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Start with a pre-built board layout
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <Icon
                      className="text-orange-600 dark:text-orange-400"
                      size={24}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 font-jetbrains-mono mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                    <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>{template.cards.length} cards</span>
                      <span>•</span>
                      <span>{template.connectors.length} connections</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-jetbrains-mono"
          >
            Start with blank board
          </button>
        </div>
      </div>
    </div>
  );
}
