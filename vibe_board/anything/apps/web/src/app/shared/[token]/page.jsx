"use client";

import { useState, useEffect, useRef } from "react";
import { Grid3x3, Video, StickyNote, ImageIcon } from "lucide-react";

export default function SharedBoardPage({ params }) {
  const token = params.token;

  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadSharedBoard();
  }, [token]);

  const loadSharedBoard = async () => {
    try {
      const response = await fetch(`/api/boards/share/${token}`);
      if (!response.ok) {
        throw new Error("Board not found or not shared");
      }
      const data = await response.json();
      setBoard(data.board);
      setCards(data.cards);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
          Loading shared board...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Grid3x3
            className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            size={48}
          />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 font-jetbrains-mono">
            Board Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
            This board doesn't exist or is no longer shared
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#1E1E1E] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3 flex justify-between items-center h-16 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Grid3x3 className="text-orange-500" size={24} />
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
            {board?.name || "Shared Board"}
          </h1>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded font-jetbrains-mono">
            View Only
          </span>
        </div>
      </header>

      {/* Canvas - Read Only */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto relative"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="min-w-[2000px] min-h-[2000px] relative">
          {cards.map((card) => (
            <div
              key={card.id}
              className="absolute pointer-events-none"
              style={{
                left: card.x,
                top: card.y,
                width: card.width,
                minHeight: card.height,
              }}
            >
              {card.card_type === "video" ? (
                <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden h-full">
                  {card.thumbnail_url ? (
                    <img
                      src={card.thumbnail_url}
                      alt={card.video_title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Video className="text-gray-400" size={32} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 font-jetbrains-mono">
                      {card.video_title || "Video"}
                    </p>
                    {card.platform && (
                      <span className="inline-block mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded">
                        {card.platform}
                      </span>
                    )}
                  </div>
                </div>
              ) : card.card_type === "image" ? (
                <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden h-full">
                  <img
                    src={card.image_url}
                    alt={card.image_caption || "Image"}
                    className="w-full h-full object-cover"
                  />
                  {card.image_caption && (
                    <div className="p-2 bg-black bg-opacity-50 absolute bottom-0 left-0 right-0">
                      <p className="text-xs text-white font-jetbrains-mono">
                        {card.image_caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`${getNoteColor(card.note_color)} rounded-lg shadow-lg p-4 min-h-[150px]`}
                >
                  <p
                    className={`text-gray-900 dark:text-gray-100 ${getTextSize(card.text_size)} whitespace-pre-wrap font-jetbrains-mono`}
                  >
                    {card.note_text || ""}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
