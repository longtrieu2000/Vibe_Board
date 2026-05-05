import {
  Pen,
  Highlighter,
  Eraser,
  Paintbrush,
  Undo,
  Image as ImageIcon,
} from "lucide-react";

export function DrawingToolbar({
  activeTool,
  onToolChange,
  strokeColor,
  onColorChange,
  strokeWidth,
  onWidthChange,
  onUndoStroke,
  onConvertToCard,
  canUndo,
}) {
  const tools = [
    { key: "pen", icon: Pen, label: "Pen" },
    { key: "marker", icon: Paintbrush, label: "Marker" },
    { key: "highlighter", icon: Highlighter, label: "Highlighter" },
    { key: "spray", icon: Paintbrush, label: "Spray", rotate: true },
    { key: "eraser", icon: Eraser, label: "Eraser" },
  ];

  const colors = [
    "#000000",
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#FFFFFF",
  ];

  const widths = [2, 4, 8, 16];

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 z-40 flex items-center space-x-4">
      {/* Tools */}
      <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-4">
        {tools.map(({ key, icon: Icon, label, rotate }) => (
          <button
            key={key}
            onClick={() => onToolChange(key)}
            className={`p-2 rounded transition-colors ${
              activeTool === key
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            title={label}
          >
            <Icon size={20} className={rotate ? "rotate-45" : ""} />
          </button>
        ))}
      </div>

      {/* Colors */}
      {activeTool !== "eraser" && (
        <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-7 h-7 rounded border-2 ${
                strokeColor === color
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Width */}
      <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-4">
        {widths.map((width) => (
          <button
            key={width}
            onClick={() => onWidthChange(width)}
            className={`p-2 rounded transition-colors flex items-center justify-center ${
              strokeWidth === width
                ? "bg-orange-500 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            title={`${width}px`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: `${width}px`, height: `${width}px` }}
            />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onUndoStroke}
          disabled={!canUndo}
          className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors text-sm font-jetbrains-mono ${
            canUndo
              ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          }`}
          title="Undo last stroke"
        >
          <Undo size={16} />
          <span>Undo</span>
        </button>

        <button
          onClick={onConvertToCard}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-jetbrains-mono"
          title="Convert drawing to card"
        >
          <ImageIcon size={16} />
          <span>Save as card</span>
        </button>
      </div>
    </div>
  );
}
