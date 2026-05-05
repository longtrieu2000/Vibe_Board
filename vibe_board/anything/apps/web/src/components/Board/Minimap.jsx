export function Minimap({ cards, connectors, zoom, pan, canvasRef }) {
  if (!cards.length) return null;

  const padding = 50;
  const minX = Math.min(...cards.map((c) => c.x)) - padding;
  const minY = Math.min(...cards.map((c) => c.y)) - padding;
  const maxX = Math.max(...cards.map((c) => c.x + (c.width || 280))) + padding;
  const maxY = Math.max(...cards.map((c) => c.y + (c.height || 200))) + padding;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const minimapWidth = 200;
  const minimapHeight = 150;
  const scale = Math.min(
    minimapWidth / contentWidth,
    minimapHeight / contentHeight,
  );

  const viewportRect = canvasRef?.current?.getBoundingClientRect();
  const viewportWidth = viewportRect ? viewportRect.width / zoom : 0;
  const viewportHeight = viewportRect ? viewportRect.height / zoom : 0;

  const viewportX = viewportRect ? -pan.x / zoom : 0;
  const viewportY = viewportRect ? -pan.y / zoom : 0;

  return (
    <div className="absolute bottom-24 left-6 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-30">
      <div className="text-xs font-jetbrains-mono text-gray-600 dark:text-gray-400 mb-2">
        Map
      </div>
      <svg
        width={minimapWidth}
        height={minimapHeight}
        className="bg-gray-50 dark:bg-[#1E1E1E] rounded"
      >
        {/* Connectors */}
        {connectors.map((conn) => {
          const fromCard = cards.find((c) => c.id === conn.from_card_id);
          const toCard = cards.find((c) => c.id === conn.to_card_id);
          if (!fromCard || !toCard) return null;

          const x1 = (fromCard.x + (fromCard.width || 280) / 2 - minX) * scale;
          const y1 = (fromCard.y + (fromCard.height || 200) / 2 - minY) * scale;
          const x2 = (toCard.x + (toCard.width || 280) / 2 - minX) * scale;
          const y2 = (toCard.y + (toCard.height || 200) / 2 - minY) * scale;

          return (
            <line
              key={conn.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9CA3AF"
              strokeWidth="1"
            />
          );
        })}

        {/* Cards */}
        {cards.map((card) => {
          const x = (card.x - minX) * scale;
          const y = (card.y - minY) * scale;
          const w = (card.width || 280) * scale;
          const h = (card.height || 200) * scale;

          let fill = "#3B82F6";
          if (card.card_type === "note") fill = "#FCD34D";
          if (card.card_type === "image") fill = "#10B981";
          if (card.card_type === "pdf") fill = "#EF4444";
          if (card.card_type === "text") fill = "#8B5CF6";

          return (
            <rect
              key={card.id}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={fill}
              fillOpacity="0.7"
              rx="2"
            />
          );
        })}

        {/* Viewport indicator */}
        {viewportRect && (
          <rect
            x={(viewportX - minX) * scale}
            y={(viewportY - minY) * scale}
            width={viewportWidth * scale}
            height={viewportHeight * scale}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            rx="2"
          />
        )}
      </svg>
    </div>
  );
}
