import { useState, useCallback } from "react";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

export function useAIAssistant() {
  const [aiMessages, setAiMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleFinish = useCallback((message) => {
    setAiMessages((prev) => [...prev, { role: "assistant", content: message }]);
    setStreamingMessage("");
    setAiLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const buildCollectionContext = (selectedCard, cards) => {
    const slotIds = [
      selectedCard.slot1_card_id,
      selectedCard.slot2_card_id,
      selectedCard.slot3_card_id,
      selectedCard.slot4_card_id,
    ];
    const items = slotIds
      .map((id) => (id ? cards.find((c) => c.id === id) : null))
      .filter(Boolean);

    if (items.length === 0) return null;

    const lines = items.map((item, idx) => {
      if (item.card_type === "video") {
        return `Clip ${idx + 1}: ${item.video_title || "Untitled"} | ${item.platform || "Video"} | ${item.video_url || ""}`;
      }
      if (item.card_type === "image") {
        return `Clip ${idx + 1}: Image | ${item.image_caption || ""} | ${item.image_url || ""}`;
      }
      return `Clip ${idx + 1}: Unsupported type`;
    });
    return lines.join("\n");
  };

  const buildLinkedContext = (selectedCard, cards, connectors = []) => {
    // collect cards connected to the selected card (both directions)
    const linkedIds = new Set();
    connectors.forEach((c) => {
      if (c.from_card_id === selectedCard.id) linkedIds.add(c.to_card_id);
      if (c.to_card_id === selectedCard.id) linkedIds.add(c.from_card_id);
    });
    const items = cards.filter((c) => linkedIds.has(c.id));
    if (items.length === 0) return null;
    const lines = items.map((item, idx) => {
      if (item.card_type === "video") {
        return `Linked ${idx + 1}: ${item.video_title || "Untitled"} | ${item.platform || "Video"} | ${item.video_url || ""}`;
      }
      if (item.card_type === "image") {
        return `Linked ${idx + 1}: Image | ${item.image_caption || ""} | ${item.image_url || ""}`;
      }
      if (item.card_type === "pdf") {
        return `Linked ${idx + 1}: PDF | ${item.pdf_name || "Document"} | ${item.pdf_url || ""}`;
      }
      if (item.card_type === "note" || item.card_type === "text") {
        return `Linked ${idx + 1}: Text | ${item.text_content || item.note_text || ""}`;
      }
      return `Linked ${idx + 1}: ${item.card_type}`;
    });
    return lines.join("\n");
  };

  const sendToAI = async (
    prompt,
    selectedCard,
    cards = [],
    connectors = [],
  ) => {
    if (!selectedCard) return;

    setAiLoading(true);
    const userMessage = { role: "user", content: prompt };
    setAiMessages((prev) => [...prev, userMessage]);

    let systemContent = "You are a viral content expert.";

    if (selectedCard.card_type === "video") {
      systemContent = `You are a viral content expert helping analyze this video: ${selectedCard.video_url}. The video title is: ${selectedCard.video_title || "Unknown"}`;
    } else if (selectedCard.card_type === "text") {
      // When a detachable assistant (text card) is selected, include linked context
      const linked = buildLinkedContext(selectedCard, cards, connectors);
      systemContent = `You are assisting with writing and analysis. Consider the linked context if provided.\n${linked || "No linked items."}`;
    } else if (selectedCard.card_type === "note") {
      systemContent = `You are assisting with notes. Current note: ${selectedCard.note_text || ""}`;
    } else if (selectedCard.card_type === "collection") {
      const context = buildCollectionContext(selectedCard, cards);
      systemContent = `You are analyzing a 4-pack collection of clips. Keep your response structured per clip (Clip 1..Clip 4).\n${context || "No clips assigned yet."}`;
    }

    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemContent,
            },
            ...aiMessages,
            userMessage,
          ],
          stream: true,
        }),
      });

      handleStreamResponse(response);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  return {
    aiMessages,
    streamingMessage,
    aiLoading,
    sendToAI,
  };
}
