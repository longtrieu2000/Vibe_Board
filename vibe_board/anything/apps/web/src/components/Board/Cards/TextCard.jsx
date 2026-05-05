import { useState, useEffect, useRef } from "react";

export function TextCard({ card, onTextChange, onTextBlur, onResize }) {
  const [resizing, setResizing] = useState(false);
  const [tempWidth, setTempWidth] = useState(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const getTextSize = (size) => {
    const sizes = {
      small: "text-base",
      medium: "text-2xl",
      large: "text-4xl",
    };
    return sizes[size] || sizes.medium;
  };

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const dx = e.clientX - startX.current;
      const newWidth = Math.max(200, startWidth.current + dx);
      setTempWidth(newWidth);
    };
    const onUp = () => {
      if (tempWidth && onResize) {
        onResize(card.id, tempWidth, card.height || 200);
      }
      setResizing(false);
      setTempWidth(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, tempWidth, onResize, card.id, card.height]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = tempWidth || card.width || 280;
    setResizing(true);
  };

  return (
    <div
      className="relative h-full"
      style={{ width: tempWidth || card.width || 280 }}
    >
      <textarea
        value={card.text_content || ""}
        onChange={(e) => onTextChange(card.id, e.target.value)}
        onBlur={(e) => onTextBlur(card.id, e.target.value, "textContent")}
        style={{
          color: card.text_color || "#000000",
          fontFamily: card.font_family || "JetBrains Mono",
        }}
        className={`w-full h-full bg-transparent ${getTextSize(card.text_size)} resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-4 font-bold`}
        placeholder="Type your text..."
      />
      {/* Horizontal resize handle */}
      <div
        className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group"
        onMouseDown={handleResizeStart}
      >
        <div className="w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-orange-500 transition-colors" />
      </div>
    </div>
  );
}
