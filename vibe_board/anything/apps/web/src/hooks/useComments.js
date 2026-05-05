import { useState, useEffect } from "react";

export function useComments(boardId, cardId) {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (boardId && cardId) {
      loadCommentCount();
    }
  }, [boardId, cardId]);

  const loadCommentCount = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/comments`,
      );
      if (!response.ok) throw new Error("Failed to load comments");
      const data = await response.json();
      setCommentCount(data.comments.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCount = () => {
    loadCommentCount();
  };

  return {
    commentCount,
    loading,
    refreshCount,
  };
}
