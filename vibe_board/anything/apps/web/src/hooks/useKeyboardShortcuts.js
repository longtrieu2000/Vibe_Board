import { useEffect } from "react";

export function useKeyboardShortcuts(
  selectedCard,
  deleteCard,
  updateCardPosition,
) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCard) return;

      if (e.key === "Delete") {
        deleteCard(selectedCard.id);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const nudge = 10;
        let newX = selectedCard.x;
        let newY = selectedCard.y;

        if (e.key === "ArrowLeft") newX -= nudge;
        if (e.key === "ArrowRight") newX += nudge;
        if (e.key === "ArrowUp") newY -= nudge;
        if (e.key === "ArrowDown") newY += nudge;

        updateCardPosition(selectedCard.id, newX, newY);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard, deleteCard, updateCardPosition]);
}
