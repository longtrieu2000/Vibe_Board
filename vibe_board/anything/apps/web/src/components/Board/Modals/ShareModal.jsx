import { Check, Copy } from "lucide-react";

export function ShareModal({ isOpen, board, copiedLink, onCopyLink, onClose }) {
  if (!isOpen || !board?.is_public) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#262626] rounded-xl p-6 sm:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-jetbrains-mono">
          Share Board
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 font-jetbrains-mono text-sm">
          Anyone with this link can view your board (read-only)
        </p>
        <div className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/shared/${board.share_token}`}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 font-jetbrains-mono text-sm"
          />
          <button
            onClick={onCopyLink}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            {copiedLink ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
