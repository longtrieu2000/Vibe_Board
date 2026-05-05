import {
  ArrowLeft,
  Share2,
  Trash2,
  Check,
  MessageCircle,
  Camera,
} from "lucide-react";

export function BoardHeader({
  board,
  selectedCard,
  saveStatus,
  onBack,
  onToggleSharing,
  onDeleteCard,
  onOpenComments,
  onScreenshot,
  commentCount = 0,
}) {
  return (
    <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3 flex justify-between items-center h-16 flex-shrink-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
          {board?.name || "Board"}
        </h1>
        {saveStatus === "saving" && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-jetbrains-mono">
            Saving...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-green-600 dark:text-green-400 font-jetbrains-mono flex items-center space-x-1">
            <Check size={14} />
            <span>Saved</span>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onScreenshot}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          title="Export as image"
        >
          <Camera size={18} />
        </button>

        <button
          onClick={onToggleSharing}
          className={`p-2 rounded-lg transition-colors ${
            board?.is_public
              ? "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
          title={board?.is_public ? "Board is shared" : "Share board"}
        >
          <Share2 size={18} />
        </button>

        {selectedCard && (
          <>
            <button
              onClick={onOpenComments}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Comments"
            >
              <MessageCircle
                size={18}
                className="text-gray-600 dark:text-gray-400"
              />
              {commentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {commentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onDeleteCard(selectedCard.id)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
              title="Delete selected card (Del)"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
