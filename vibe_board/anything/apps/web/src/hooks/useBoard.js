import { useState, useEffect } from "react";

export function useBoard(boardId) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      if (!response.ok) throw new Error("Failed to load board");
      const data = await response.json();
      setBoard(data.board);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBoardSharing = async () => {
    try {
      const newPublicState = !board.is_public;

      const response = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newPublicState }),
      });

      if (!response.ok) throw new Error("Failed to update board");
      const data = await response.json();

      setBoard(data.board);
      return newPublicState;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return { board, loading, toggleBoardSharing };
}
