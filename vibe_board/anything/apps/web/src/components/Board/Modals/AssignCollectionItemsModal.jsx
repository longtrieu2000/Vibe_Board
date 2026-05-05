import { useMemo, useState } from "react";

export function AssignCollectionItemsModal({
  isOpen,
  cards,
  initialSlots,
  onClose,
  onSave,
}) {
  const options = useMemo(
    () =>
      cards.filter((c) => c.card_type === "video" || c.card_type === "image"),
    [cards],
  );
  const [slots, setSlots] = useState({
    slot1_card_id: initialSlots?.slot1_card_id || null,
    slot2_card_id: initialSlots?.slot2_card_id || null,
    slot3_card_id: initialSlots?.slot3_card_id || null,
    slot4_card_id: initialSlots?.slot4_card_id || null,
  });

  const handleChange = (slotKey, value) => {
    setSlots((prev) => ({ ...prev, [slotKey]: value ? Number(value) : null }));
  };

  const renderSelect = (slotKey, label) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-jetbrains-mono">
        {label}
      </label>
      <select
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm"
        value={slots[slotKey] || ""}
        onChange={(e) => handleChange(slotKey, e.target.value)}
      >
        <option value="">Empty</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.card_type === "video"
              ? `🎬 ${c.video_title || "Video"}`
              : `🖼️ ${c.image_caption || "Image"}`}{" "}
            (#{c.id})
          </option>
        ))}
      </select>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#262626] rounded-xl p-6 sm:p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-jetbrains-mono">
          Assign items
        </h2>

        {renderSelect("slot1_card_id", "Slot 1")}
        {renderSelect("slot2_card_id", "Slot 2")}
        {renderSelect("slot3_card_id", "Slot 3")}
        {renderSelect("slot4_card_id", "Slot 4")}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(slots)}
            className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Save Slots
          </button>
        </div>
      </div>
    </div>
  );
}
