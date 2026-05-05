import { useEffect, useRef, useState } from "react";

export function NoteCard({ card, onTextChange, onTextBlur }) {
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

  const getTextSize = (size) => {
    const sizes = {
      small: "text-xs",
      medium: "text-sm",
      large: "text-base",
    };
    return sizes[size] || sizes.medium;
  };

  const textareaRef = useRef(null);
  const [autoHeight, setAutoHeight] = useState("auto");

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset to recalc
    const next = Math.max(120, el.scrollHeight); // keep a sensible minimum
    setAutoHeight(next + "px");
  };

  useEffect(() => {
    adjustHeight();
    // also adjust on window resize to keep things tidy
    const onResize = () => adjustHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // when the text changes externally, re-measure
    adjustHeight();
  }, [card.note_text]);

  return (
    <div
      className={`${getNoteColor(card.note_color)} rounded-lg shadow-lg p-4 min-h-[120px]`}
    >
      <textarea
        ref={textareaRef}
        value={card.note_text || ""}
        onChange={(e) => {
          onTextChange(card.id, e.target.value);
          // let the DOM update the value before measuring
          requestAnimationFrame(adjustHeight);
        }}
        onBlur={(e) => onTextBlur(card.id, e.target.value)}
        style={{
          height: autoHeight,
          overflow: "hidden",
        }}
        className={`w-full bg-transparent text-gray-900 dark:text-gray-100 ${getTextSize(card.text_size)} resize-none focus:outline-none font-jetbrains-mono`}
        placeholder="Type your note..."
      />
    </div>
  );
}
