export function ImageCard({ card, onCaptionChange, onCaptionBlur, boardId }) {
  return (
    <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden relative">
      <img
        src={card.image_url}
        alt={card.image_caption || "Image"}
        className="w-full h-full object-cover rounded-lg"
      />
      {card.image_caption !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
          <input
            value={card.image_caption}
            onChange={(e) => onCaptionChange(card.id, e.target.value)}
            onBlur={(e) => onCaptionBlur(card.id, e.target.value)}
            className="w-full bg-transparent text-white text-xs focus:outline-none font-jetbrains-mono"
            placeholder="Add caption..."
          />
        </div>
      )}
    </div>
  );
}
