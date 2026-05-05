import { X } from "lucide-react";

export function CardStyleModal({ isOpen, card, onClose, onUpdateStyle }) {
  if (!isOpen || !card) return null;

  const handleStyleChange = (key, value) => {
    onUpdateStyle(card.id, { ...card, [key]: value });
  };

  const borderStyles = [
    { value: "none", label: "None", class: "" },
    { value: "thin", label: "Thin", class: "border border-gray-300" },
    { value: "medium", label: "Medium", class: "border-2 border-gray-400" },
    { value: "thick", label: "Thick", class: "border-4 border-gray-500" },
  ];

  const shadowStyles = [
    { value: "none", label: "None", class: "" },
    { value: "sm", label: "Small", class: "shadow-sm" },
    { value: "md", label: "Medium", class: "shadow-md" },
    { value: "lg", label: "Large", class: "shadow-lg" },
    { value: "xl", label: "Extra Large", class: "shadow-xl" },
  ];

  const shapeStyles = [
    { value: "rounded", label: "Rounded", class: "rounded-lg" },
    { value: "square", label: "Square", class: "rounded-none" },
    { value: "pill", label: "Pill", class: "rounded-full" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
            Card Style
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Border Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
              Border
            </label>
            <div className="grid grid-cols-2 gap-2">
              {borderStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleStyleChange("border_style", style.value)}
                  className={`p-3 rounded border-2 ${
                    (card.border_style || "none") === style.value
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } hover:border-orange-300`}
                >
                  <div
                    className={`h-12 bg-gray-100 dark:bg-gray-800 rounded ${style.class}`}
                  />
                  <p className="text-xs mt-2 font-jetbrains-mono">
                    {style.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Shadow Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
              Shadow
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shadowStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleStyleChange("shadow_style", style.value)}
                  className={`p-3 rounded border-2 ${
                    (card.shadow_style || "lg") === style.value
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } hover:border-orange-300`}
                >
                  <div
                    className={`h-8 bg-white dark:bg-gray-700 rounded ${style.class}`}
                  />
                  <p className="text-xs mt-2 font-jetbrains-mono">
                    {style.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Shape Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
              Shape
            </label>
            <div className="grid grid-cols-3 gap-2">
              {shapeStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleStyleChange("shape_style", style.value)}
                  className={`p-3 rounded border-2 ${
                    (card.shape_style || "rounded") === style.value
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } hover:border-orange-300`}
                >
                  <div
                    className={`h-12 bg-gray-100 dark:bg-gray-800 ${style.class}`}
                  />
                  <p className="text-xs mt-2 font-jetbrains-mono">
                    {style.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Background Color (for non-note cards) */}
          {card.card_type !== "note" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
                Background Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  "#FFFFFF",
                  "#F3F4F6",
                  "#DBEAFE",
                  "#FEF3C7",
                  "#FEE2E2",
                  "#E0E7FF",
                  "#D1FAE5",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleChange("bg_color", color)}
                    className={`w-full h-12 rounded border-2 ${
                      (card.bg_color || "#FFFFFF") === color
                        ? "border-orange-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 font-jetbrains-mono"
        >
          Done
        </button>
      </div>
    </div>
  );
}
