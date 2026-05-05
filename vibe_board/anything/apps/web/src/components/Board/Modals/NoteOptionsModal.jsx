export function NoteOptionsModal({
  isOpen,
  noteColor,
  noteSize,
  onColorChange,
  onSizeChange,
  onCreate,
  onClose,
}) {
  if (!isOpen) return null;

  const getNoteColor = (color) => {
    const colors = {
      yellow: "bg-yellow-100 dark:bg-yellow-900",
      pink: "bg-pink-100 dark:bg-pink-900",
      blue: "bg-blue-100 dark:bg-blue-900",
      green: "bg-green-100 dark:bg-green-900",
      purple: "bg-purple-100 dark:bg-purple-900",
    };
    return colors[color] || colors.yellow;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#262626] rounded-xl p-6 sm:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-jetbrains-mono">
          Create Note
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
            Color
          </label>
          <div className="flex space-x-2">
            {["yellow", "pink", "blue", "green", "purple"].map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-10 h-10 rounded-lg ${getNoteColor(color)} border-2 ${noteColor === color ? "border-orange-500" : "border-transparent"}`}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
            Text Size
          </label>
          <div className="flex space-x-2">
            {[
              { value: "small", label: "S" },
              { value: "medium", label: "M" },
              { value: "large", label: "L" },
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => onSizeChange(size.value)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  noteSize === size.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Create Note
          </button>
        </div>
      </div>
    </div>
  );
}
