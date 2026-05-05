import { useState, useCallback, useEffect } from "react";

export function useCardDrag(cards, setCards, updateCardPosition) {
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, card, canvasRef) => {
    if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

    setDraggingCard(card);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback(
    (e, canvasRef) => {
      if (!draggingCard || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      setCards((prev) =>
        prev.map((card) =>
          card.id === draggingCard.id ? { ...card, x: newX, y: newY } : card,
        ),
      );
    },
    [draggingCard, dragOffset, setCards],
  );

  const handleMouseUp = useCallback(() => {
    if (draggingCard) {
      const card = cards.find((c) => c.id === draggingCard.id);
      if (card) {
        updateCardPosition(card.id, card.x, card.y);
      }
      setDraggingCard(null);
    }
  }, [draggingCard, cards, updateCardPosition]);

  return {
    draggingCard,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
