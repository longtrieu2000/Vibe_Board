import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Undo,
  Redo,
} from "lucide-react";

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  return (
    <div className="absolute bottom-24 right-6 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-30">
      {/* Undo/Redo Section */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-3 transition-colors ${
            canUndo
              ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          }`}
          title="Undo (Cmd+Z)"
        >
          <Undo size={18} />
        </button>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-3 transition-colors ${
            canRedo
              ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          }`}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Zoom Section */}
      <div className="flex flex-col">
        <button
          onClick={onZoomIn}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-200 dark:border-gray-700"
          title="Zoom In (Cmd + Scroll)"
        >
          <ZoomIn size={18} />
        </button>

        <div className="px-3 py-2 text-xs font-jetbrains-mono text-gray-600 dark:text-gray-400 text-center border-b border-gray-200 dark:border-gray-700">
          {Math.round(zoom * 100)}%
        </div>

        <button
          onClick={onZoomOut}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-200 dark:border-gray-700"
          title="Zoom Out (Cmd + Scroll)"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {/* View Controls */}
      <div className="flex flex-col">
        <button
          onClick={onFitToView}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-200 dark:border-gray-700"
          title="Fit All Cards"
        >
          <Maximize2 size={18} />
        </button>

        <button
          onClick={onReset}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
