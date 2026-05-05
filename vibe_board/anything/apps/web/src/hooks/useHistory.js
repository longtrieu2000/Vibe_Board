import { useState, useCallback, useRef } from "react";

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoingRef = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback(
    (state) => {
      if (isUndoingRef.current) return;

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(state);

        // Keep only last 50 states to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
          setCurrentIndex((prev) => prev);
          return newHistory;
        }

        setCurrentIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [currentIndex],
  );

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoingRef.current = true;
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => {
        isUndoingRef.current = false;
      }, 100);
      return history[currentIndex - 1];
    }
    return null;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoingRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        isUndoingRef.current = false;
      }, 100);
      return history[currentIndex + 1];
    }
    return null;
  }, [canRedo, currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
