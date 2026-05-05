import { Image as ImageIcon, Video, X } from "lucide-react";

export function CollectionCard({ card, cards, onDoubleClick, onAssignSlot }) {
  const slots = [
    card.slot1_card_id,
    card.slot2_card_id,
    card.slot3_card_id,
    card.slot4_card_id,
  ];
  const items = slots.map((id) => (id ? cards.find((c) => c.id === id) : null));

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    try {
      const data =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain");
      const parsed = JSON.parse(data);
      if (parsed && parsed.cardId && onAssignSlot) {
        onAssignSlot(card, slotIndex, parsed.cardId);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleClear = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAssignSlot) {
      onAssignSlot(card, idx, null);
    }
  };

  const renderThumb = (item, idx) => {
    if (!item) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700 text-gray-400">
          <span className="text-xs font-jetbrains-mono">Slot {idx + 1}</span>
        </div>
      );
    }

    if (item.card_type === "video") {
      return (
        <div className="relative w-full h-full">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.video_title || "Video"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-600">
              <Video size={18} className="text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] px-1 py-[2px] rounded font-jetbrains-mono truncate">
            {item.platform || "Video"} · {item.video_title || "Untitled"}
          </div>
        </div>
      );
    }

    if (item.card_type === "image") {
      return (
        <div className="relative w-full h-full">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.image_caption || "Image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-600">
              <ImageIcon size={18} className="text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] px-1 py-[2px] rounded font-jetbrains-mono truncate">
            Image · {item.image_caption || ""}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700 text-gray-400">
        <span className="text-xs font-jetbrains-mono">Unsupported</span>
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden h-full"
      onDoubleClick={onDoubleClick}
    >
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 min-h-[100px] relative group"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderThumb(item, idx)}
            {/* Clear button when slot has an item */}
            {items[idx] && (
              <button
                title="Clear slot"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded p-1"
                onClick={(e) => handleClear(e, idx)}
              >
                <X size={12} />
              </button>
            )}
            <div className="absolute inset-0 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
