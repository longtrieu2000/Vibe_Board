import { useState, useEffect } from "react";

export function useBoardCards(boardId) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [boardId]);

  const loadCards = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`);
      if (!response.ok) throw new Error("Failed to load cards");
      const data = await response.json();
      setCards(data.cards);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addVideoCard = async (videoUrl) => {
    if (!videoUrl.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          videoUrl: videoUrl,
          x: 100,
          y: 100,
        }),
      });

      if (!response.ok) throw new Error("Failed to add video");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addImageCard = async (imageUrl, imageCaption) => {
    if (!imageUrl.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          imageUrl: imageUrl,
          imageCaption: imageCaption,
          x: 120,
          y: 120,
        }),
      });

      if (!response.ok) throw new Error("Failed to add image");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addNoteCard = async (noteColor, noteSize) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          text: "New note",
          color: noteColor,
          size: noteSize,
          x: 150,
          y: 150,
        }),
      });

      if (!response.ok) throw new Error("Failed to add note");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addPDFCard = async (pdfUrl, pdfName) => {
    if (!pdfUrl.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pdf",
          pdfUrl: pdfUrl,
          pdfName: pdfName,
          x: 180,
          y: 180,
        }),
      });

      if (!response.ok) throw new Error("Failed to add PDF");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addTextCard = async (textContent, textColor, textSize) => {
    if (!textContent.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          textContent: textContent,
          textColor: textColor,
          size: textSize,
          x: 200,
          y: 200,
        }),
      });

      if (!response.ok) throw new Error("Failed to add text");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const addCollectionCard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "collection",
          x: 220,
          y: 220,
        }),
      });

      if (!response.ok) throw new Error("Failed to add collection");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const updateCardPosition = async (cardId, x, y) => {
    try {
      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y }),
      });

      setCards((prev) =>
        prev.map((card) => (card.id === cardId ? { ...card, x, y } : card)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateCardSize = async (cardId, width, height) => {
    try {
      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ width, height }),
      });

      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, width, height } : card,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateNoteText = async (cardId, text, field = "text") => {
    try {
      const body = field === "textContent" ? { textContent: text } : { text };

      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? { ...card, note_text: text, text_content: text }
            : card,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateImageCaption = async (cardId, imageCaption) => {
    try {
      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageCaption }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateNoteColor = async (cardId, color) => {
    try {
      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });

      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, note_color: color } : card,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateCollectionSlots = async (cardId, slots) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slots),
      });
      if (!response.ok) throw new Error("Failed to update collection slots");
      const data = await response.json();
      setCards((prev) => prev.map((c) => (c.id === cardId ? data.card : c)));
      return data.card;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const deleteCard = async (cardId) => {
    try {
      await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "DELETE",
      });

      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    cards,
    setCards,
    loading,
    addVideoCard,
    addImageCard,
    addNoteCard,
    addPDFCard,
    addTextCard,
    addCollectionCard,
    updateCardPosition,
    updateCardSize,
    updateNoteText,
    updateImageCaption,
    updateNoteColor,
    updateCollectionSlots,
    deleteCard,
  };
}
