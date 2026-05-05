import { useState, useEffect } from "react";
import { X, MessageCircle, Trash2, Send } from "lucide-react";

export function CommentsModal({ isOpen, card, boardId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      loadComments();
    }
  }, [isOpen, card]);

  const loadComments = async () => {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/cards/${card.id}/comments`,
      );
      if (!response.ok) throw new Error("Failed to load comments");
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/boards/${boardId}/cards/${card.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newComment }),
        },
      );

      if (!response.ok) throw new Error("Failed to add comment");
      const data = await response.json();

      setComments([...comments, data.comment]);
      setNewComment("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/cards/${card.id}/comments?id=${commentId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2A2A2A] rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageCircle className="text-orange-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 font-jetbrains-mono">
              Comments
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle
                className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                size={32}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jetbrains-mono">
                No comments yet. Add the first one!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-jetbrains-mono">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {comment.comment_text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addComment();
                }
              }}
              placeholder="Add a comment... (Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-jetbrains-mono text-sm resize-none"
              rows="3"
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim() || loading}
              className="px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
