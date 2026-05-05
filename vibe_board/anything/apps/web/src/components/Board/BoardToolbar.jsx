import {
  Video,
  ImageIcon,
  StickyNote,
  RotateCcw,
  FileText,
  Type,
  Download,
  Save,
  Link,
  Bot,
  Paintbrush,
  Trash2,
} from "lucide-react";

export function BoardToolbar({
  onAddVideo,
  onAddImage,
  onAddNote,
  onAddPDF,
  onAddText,
  onAddCollection,
  onAddAssistant,
  onReset,
  onExport,
  onSave,
  connectorMode,
  onToggleConnectorMode,
  drawingMode,
  onToggleDrawing,
  onClearDrawing,
}) {
  return (
    <div className="bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-center items-center space-x-3 flex-shrink-0 flex-wrap gap-2">
      <button
        onClick={onAddVideo}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        <Video size={18} />
        <span className="font-medium">Video</span>
      </button>

      <button
        onClick={onAddImage}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <ImageIcon size={18} />
        <span className="font-medium">Image</span>
      </button>

      <button
        onClick={onAddNote}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <StickyNote size={18} />
        <span className="font-medium">Note</span>
      </button>

      <button
        onClick={onAddPDF}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <FileText size={18} />
        <span className="font-medium">PDF</span>
      </button>

      <button
        onClick={onAddText}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <Type size={18} />
        <span className="font-medium">Text</span>
      </button>

      <button
        onClick={onAddCollection}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <Type size={18} />
        <span className="font-medium">Collection</span>
      </button>

      <button
        onClick={onAddAssistant}
        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Bot size={18} />
        <span className="font-medium">Assistant</span>
      </button>

      <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />

      <button
        onClick={onToggleConnectorMode}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          connectorMode
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <Link size={18} />
        <span className="font-medium">Connect</span>
      </button>

      <button
        onClick={onToggleDrawing}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          drawingMode
            ? "bg-pink-500 text-white hover:bg-pink-600"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        <Paintbrush size={18} />
        <span className="font-medium">
          {drawingMode ? "Stop Drawing" : "Draw"}
        </span>
      </button>

      {drawingMode && (
        <button
          onClick={onClearDrawing}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Trash2 size={18} />
          <span className="font-medium">Clear</span>
        </button>
      )}

      <button
        onClick={onReset}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        <RotateCcw size={18} />
        <span className="font-medium">Reset</span>
      </button>

      <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />

      <button
        onClick={onSave}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Save size={18} />
        <span className="font-medium">Save</span>
      </button>

      <button
        onClick={onExport}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download size={18} />
        <span className="font-medium">Export</span>
      </button>
    </div>
  );
}
