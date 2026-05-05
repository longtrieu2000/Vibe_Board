"use client";

import { useState, useRef, useEffect } from "react";
import { useBoard } from "@/hooks/useBoard";
import { useBoardCards } from "@/hooks/useBoardCards";
import { useCardDrag } from "@/hooks/useCardDrag";
import { useConnectors } from "@/hooks/useConnectors";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useZoom } from "@/hooks/useZoom";
import { useHistory } from "@/hooks/useHistory";
import { useComments } from "@/hooks/useComments";
import { BoardHeader } from "@/components/Board/BoardHeader";
import { BoardToolbar } from "@/components/Board/BoardToolbar";
import { BoardCanvas } from "@/components/Board/BoardCanvas";
import { ZoomControls } from "@/components/Board/ZoomControls";
import { Minimap } from "@/components/Board/Minimap";
import { AIPanel } from "@/components/Board/AIPanel/AIPanel";
import { AddVideoModal } from "@/components/Board/Modals/AddVideoModal";
import { AddImageModal } from "@/components/Board/Modals/AddImageModal";
import { NoteOptionsModal } from "@/components/Board/Modals/NoteOptionsModal";
import { AddPDFModal } from "@/components/Board/Modals/AddPDFModal";
import { AddTextModal } from "@/components/Board/Modals/AddTextModal";
import { ShareModal } from "@/components/Board/Modals/ShareModal";
import { CommentsModal } from "@/components/Board/Modals/CommentsModal";
import { AssignCollectionItemsModal } from "@/components/Board/Modals/AssignCollectionItemsModal";
import { DrawingToolbar } from "@/components/Board/DrawingToolbar";
import { DrawingCanvas } from "@/components/Board/DrawingCanvas";
import { exportBoardAsSVG } from "@/utils/boardExport";

export default function BoardPage({ params }) {
  const boardId = params.id;

  // Board and cards state
  const {
    board,
    loading: boardLoading,
    toggleBoardSharing,
  } = useBoard(boardId);
  const {
    cards,
    setCards,
    loading: cardsLoading,
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
    deleteCard,
    updateCollectionSlots,
  } = useBoardCards(boardId);

  // Connectors state
  const {
    connectors,
    createConnector,
    updateConnectorLabel,
    updateConnection,
    deleteConnector,
  } = useConnectors(boardId);

  // Zoom and pan
  const canvasRef = useRef(null);
  const {
    zoom,
    pan,
    isPanning,
    handleWheel,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    startPan,
    handlePanMove,
    stopPan,
  } = useZoom(canvasRef);

  // History (undo/redo)
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistory();

  // UI state
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [connectorMode, setConnectorMode] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showNoteOptionsModal, setShowNoteOptionsModal] = useState(false);
  const [showAddPDFModal, setShowAddPDFModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [noteColor, setNoteColor] = useState("yellow");
  const [noteSize, setNoteSize] = useState("medium");
  const [textContent, setTextContent] = useState("Text");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState("medium");
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // 'saving' | 'saved' | ''

  // Drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState("none");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokes, setStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // AI Assistant
  const { aiMessages, streamingMessage, aiLoading, sendToAI } =
    useAIAssistant();

  // Card dragging (modified to work with zoom)
  const { draggingCard, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCardDrag(cards, setCards, updateCardPosition);

  // Keyboard shortcuts (now including undo/redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Cmd/Ctrl + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      }
      // Delete selected card
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedCard &&
          document.activeElement.tagName !== "TEXTAREA" &&
          document.activeElement.tagName !== "INPUT"
        ) {
          e.preventDefault();
          deleteCard(selectedCard.id);
          setSelectedCard(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard, undo, redo, deleteCard]);

  // Track history when cards or connectors change
  useEffect(() => {
    if (cards.length > 0 || connectors.length > 0) {
      addToHistory({ cards, connectors });
    }
  }, [cards, connectors]);

  // Handle drag events
  useEffect(() => {
    if (draggingCard) {
      const onMove = (e) => handleMouseMove(e, canvasRef);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingCard, handleMouseMove, handleMouseUp]);

  const handleUndo = () => {
    const prevState = undo();
    if (prevState) {
      setCards(prevState.cards);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setCards(nextState.cards);
    }
  };

  const handleToggleBoardSharing = async () => {
    const newPublicState = await toggleBoardSharing();
    if (newPublicState) {
      setShowShareModal(true);
    }
  };

  const handleAddVideoCard = async () => {
    await addVideoCard(videoUrl);
    setShowAddVideoModal(false);
    setVideoUrl("");
  };

  const handleAddImageCard = async () => {
    await addImageCard(imageUrl, imageCaption);
    setShowAddImageModal(false);
    setImageUrl("");
    setImageCaption("");
  };

  const handleAddNoteCard = async () => {
    await addNoteCard(noteColor, noteSize);
    setShowNoteOptionsModal(false);
  };

  const handleAddPDFCard = async (pdfUrl, pdfName) => {
    await addPDFCard(pdfUrl, pdfName);
    setShowAddPDFModal(false);
  };

  const handleAddTextCard = async () => {
    await addTextCard(textContent, textColor, textSize);
    setShowAddTextModal(false);
    setTextContent("Text");
    setTextColor("#000000");
    setTextSize("medium");
  };

  const handleAddCollectionCard = async () => {
    const newCard = await addCollectionCard();
    if (newCard) {
      setSelectedCard(newCard);
      // Auto-open Assign Items panel for the new collection
      setAssigningCollectionCard(newCard);
      setShowAssignCollection(true);
    }
  };

  const handleAddAssistantCard = async () => {
    // Add a text card that acts as a detachable AI assistant
    const newCard = await addTextCard("AI Assistant", "#111111", "medium");
    if (newCard) {
      setSelectedCard(newCard);
      setShowAIPanel(true);
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    // Auto-save is already happening on every change
    // This is just visual feedback
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    }, 500);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/export`);
      if (!response.ok) throw new Error("Failed to export");

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${board?.name || "board"}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export board");
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${board.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCardClick = (e, card) => {
    e.stopPropagation();

    if (connectorMode) {
      if (!connectingFrom) {
        setConnectingFrom(card);
      } else if (connectingFrom.id !== card.id) {
        createConnector(connectingFrom.id, card.id);
        setConnectingFrom(null);
        setConnectorMode(false);
      }
    } else {
      setSelectedCard(card);
      if (card.card_type === "video") {
        setShowAIPanel(true);
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedCard(null);
      setSelectedConnector(null);
      setConnectingFrom(null);
      setShowAIPanel(false);
    }
  };

  const handleNoteTextChange = (cardId, text) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, note_text: text, text_content: text } : c,
      ),
    );
  };

  const handleImageCaptionChange = (cardId, caption) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, image_caption: caption } : c)),
    );
  };

  const handleNoteColorChange = async (cardId, color) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, note_color: color } : c)),
    );
    await updateNoteColor(cardId, color);
  };

  const saveAIResponseAsNote = async (content) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          text: content,
          x: (selectedCard?.x || 0) + 320,
          y: selectedCard?.y || 100,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");
      const data = await response.json();

      setCards((prev) => [...prev, data.card]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetCanvas = () => {
    resetZoom();
  };

  // Quick actions for Assistant card
  const handleAssistantAction = (actionKey, card) => {
    // ensure the assistant card is selected and panel is open
    setSelectedCard(card);
    setShowAIPanel(true);

    let prompt = "";
    switch (actionKey) {
      case "summarize_linked":
        prompt =
          "Summarize all linked items. For each linked item, include: title/name, platform/type, key insights, 5 hook ideas. Keep it structured per item.";
        break;
      case "create_schedule":
        prompt =
          "Create a 7-day posting schedule using the linked items. Include platform, post time, caption idea, and CTA for each day. Use the linked context to match the best platform to each item.";
        break;
      case "pick_winner":
        prompt =
          "Compare the linked items and pick the top performer for virality. Explain why, list 5 title ideas, 3 thumbnail ideas, and 3 CTAs. Keep it concise and actionable.";
        break;
      // NEW ACTIONS
      case "summarize_pdfs":
        prompt =
          "Batch summarize all linked PDFs only. For each PDF, output: Name, URL, 5-sentence summary, 5 key takeaways, 3 action items. If the PDF text is not available, infer based on the filename and provide questions to clarify.";
        break;
      case "titles_per_video":
        prompt =
          "For each linked video only, generate 10 high-performing title ideas. Use varied angles (curiosity, listicle, problem/solution, contrarian, emotional). Output as: Video Title → 10 Ideas.";
        break;
      case "weekly_plan":
        prompt =
          "Create a weekly content plan using the linked items. Return a 7-day table with: Day, Platform, Post format, Hook, Caption, CTA, and Hashtags. Balance platforms based on the content type.";
        break;
      case "cross_post_plan":
        prompt =
          "Create a cross-post plan for YouTube Shorts, TikTok, and Instagram Reels using the linked items. For each item, list: platform-specific hook, opening 3 seconds, caption style, hashtags, and any edits needed (cuts, aspect ratio, overlays).";
        break;
      default:
        prompt =
          "Summarize all linked items with key takeaways and 5 hooks per item.";
    }

    // Use linked context via sendToAI for text (assistant) card
    sendToAI(prompt, card, cards, connectors);
  };

  // Comments
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const { commentCount, refreshCount } = useComments(boardId, selectedCard?.id);

  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    refreshCount(); // Refresh comment count when modal closes
  };

  const handleScreenshot = async () => {
    const success = await exportBoardAsSVG(
      cards,
      connectors,
      board?.name || "board",
    );
    if (success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const [showAssignCollection, setShowAssignCollection] = useState(false);
  const [assigningCollectionCard, setAssigningCollectionCard] = useState(null);

  const handleOpenAssignCollection = (card) => {
    setAssigningCollectionCard(card);
    setShowAssignCollection(true);
  };

  const handleSaveAssignCollection = async (slots) => {
    if (!assigningCollectionCard) return;
    await updateCollectionSlots(assigningCollectionCard.id, slots);
    setShowAssignCollection(false);
    setAssigningCollectionCard(null);
    // Auto-open AI panel with collection context
    setSelectedCard((prev) => prev || assigningCollectionCard);
    setShowAIPanel(true);
  };

  const handleAssignSlot = async (collectionCard, slotIndex, sourceCardId) => {
    const slotKey = [
      `slot1_card_id`,
      `slot2_card_id`,
      `slot3_card_id`,
      `slot4_card_id`,
    ][slotIndex];
    const payload = { [slotKey]: sourceCardId };
    await updateCollectionSlots(collectionCard.id, payload);
  };

  // Resize handler for collection cards
  const handleResizeCard = async (cardId, width, height) => {
    await updateCardSize(cardId, Math.max(240, width), Math.max(180, height));
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);
    setDrawingMode(tool !== "none");
  };

  const handleAddStroke = (stroke) => {
    setStrokes((prev) => [...prev, stroke]);
  };

  const handleClearDrawing = () => {
    setStrokes([]);
  };

  const handleUndoStroke = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleConvertToCard = async () => {
    if (strokes.length === 0) {
      alert("No drawing to convert");
      return;
    }

    // Create a temporary canvas to export the drawing as an image
    const canvas = document.createElement("canvas");
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext("2d");

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;

      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "highlighter") {
        ctx.globalAlpha = 0.4;
      } else if (stroke.tool === "spray") {
        ctx.globalAlpha = 0.3;
        stroke.points.forEach((point) => {
          for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * stroke.width * 2;
            const offsetY = (Math.random() - 0.5) * stroke.width * 2;
            ctx.fillStyle = stroke.color;
            ctx.beginPath();
            ctx.arc(point.x + offsetX, point.y + offsetY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
        return;
      } else if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Failed to convert drawing");
        return;
      }

      // Upload the blob
      const formData = new FormData();
      formData.append("file", blob, "drawing.png");

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const { url } = await uploadRes.json();

        // Create an image card with the drawing
        await addImageCard(url, "Drawing");

        // Clear the drawing
        setStrokes([]);
        alert("Drawing saved as card!");
      } catch (error) {
        console.error(error);
        alert("Failed to save drawing as card");
      }
    }, "image/png");
  };

  if (boardLoading || cardsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400 font-jetbrains-mono">
          Loading board...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#1E1E1E] flex flex-col overflow-hidden">
      <BoardHeader
        board={board}
        selectedCard={selectedCard}
        saveStatus={saveStatus}
        onBack={() => (window.location.href = "/")}
        onToggleSharing={handleToggleBoardSharing}
        onDeleteCard={deleteCard}
        onOpenComments={handleOpenComments}
        onScreenshot={handleScreenshot}
        commentCount={commentCount}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <BoardCanvas
          ref={canvasRef}
          cards={cards}
          selectedCard={selectedCard}
          onCardClick={handleCardClick}
          onCardMouseDown={(e, card) => handleMouseDown(e, card, canvasRef)}
          onCanvasClick={handleCanvasClick}
          onNoteTextChange={handleNoteTextChange}
          onNoteTextBlur={updateNoteText}
          onImageCaptionChange={handleImageCaptionChange}
          onImageCaptionBlur={updateImageCaption}
          onNoteColorChange={handleNoteColorChange}
          boardId={boardId}
          connectors={connectors}
          selectedConnector={selectedConnector}
          onSelectConnector={setSelectedConnector}
          onDeleteConnector={deleteConnector}
          onUpdateConnectorLabel={updateConnectorLabel}
          onUpdateConnection={updateConnection}
          connectingFrom={connectingFrom}
          zoom={zoom}
          pan={pan}
          onWheel={handleWheel}
          onPanStart={startPan}
          onPanMove={handlePanMove}
          onPanStop={stopPan}
          onOpenCollectionAssign={handleOpenAssignCollection}
          onAssignSlot={handleAssignSlot}
          onResizeCard={handleResizeCard}
          onAssistantAction={handleAssistantAction}
        />

        {/* Drawing Layer */}
        {drawingMode && (
          <DrawingCanvas
            strokes={strokes}
            onAddStroke={handleAddStroke}
            activeTool={activeTool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            zoom={zoom}
            pan={pan}
            isDrawing={isDrawing}
            onDrawingChange={setIsDrawing}
          />
        )}

        {/* Drawing Toolbar */}
        {drawingMode && (
          <DrawingToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            strokeColor={strokeColor}
            onColorChange={setStrokeColor}
            strokeWidth={strokeWidth}
            onWidthChange={setStrokeWidth}
            onUndoStroke={handleUndoStroke}
            onConvertToCard={handleConvertToCard}
            canUndo={strokes.length > 0}
          />
        )}

        {/* Zoom Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToView={() => fitToView(cards)}
          onReset={resetZoom}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Minimap */}
        <Minimap
          cards={cards}
          connectors={connectors}
          zoom={zoom}
          pan={pan}
          canvasRef={canvasRef}
        />

        {connectorMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 font-jetbrains-mono">
            {connectingFrom
              ? "Click on another card to connect"
              : "Click on a card to start connecting"}
          </div>
        )}

        {showAIPanel && (
          <AIPanel
            selectedCard={selectedCard}
            aiMessages={aiMessages}
            streamingMessage={streamingMessage}
            aiLoading={aiLoading}
            onSendPrompt={(prompt) =>
              sendToAI(prompt, selectedCard, cards, connectors)
            }
            onSaveAsNote={saveAIResponseAsNote}
          />
        )}
      </div>

      <BoardToolbar
        onAddVideo={() => setShowAddVideoModal(true)}
        onAddImage={() => setShowAddImageModal(true)}
        onAddNote={() => setShowNoteOptionsModal(true)}
        onAddPDF={() => setShowAddPDFModal(true)}
        onAddText={() => setShowAddTextModal(true)}
        onAddCollection={handleAddCollectionCard}
        onAddAssistant={handleAddAssistantCard}
        onReset={handleResetCanvas}
        onSave={handleSave}
        onExport={handleExport}
        connectorMode={connectorMode}
        onToggleConnectorMode={() => {
          setConnectorMode(!connectorMode);
          setConnectingFrom(null);
        }}
        drawingMode={drawingMode}
        onToggleDrawing={() => {
          const newMode = !drawingMode;
          setDrawingMode(newMode);
          if (!newMode) {
            setActiveTool("none");
          } else {
            setActiveTool("pen");
          }
        }}
        onClearDrawing={handleClearDrawing}
      />

      <AddVideoModal
        isOpen={showAddVideoModal}
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onAdd={handleAddVideoCard}
        onClose={() => {
          setShowAddVideoModal(false);
          setVideoUrl("");
        }}
      />

      <AddImageModal
        isOpen={showAddImageModal}
        imageUrl={imageUrl}
        imageCaption={imageCaption}
        onImageUrlChange={setImageUrl}
        onImageCaptionChange={setImageCaption}
        onAdd={handleAddImageCard}
        onClose={() => {
          setShowAddImageModal(false);
          setImageUrl("");
          setImageCaption("");
        }}
      />

      <NoteOptionsModal
        isOpen={showNoteOptionsModal}
        noteColor={noteColor}
        noteSize={noteSize}
        onColorChange={setNoteColor}
        onSizeChange={setNoteSize}
        onCreate={handleAddNoteCard}
        onClose={() => setShowNoteOptionsModal(false)}
      />

      <AddPDFModal
        isOpen={showAddPDFModal}
        onAdd={handleAddPDFCard}
        onClose={() => setShowAddPDFModal(false)}
      />

      <AddTextModal
        isOpen={showAddTextModal}
        textContent={textContent}
        textColor={textColor}
        textSize={textSize}
        onTextChange={setTextContent}
        onColorChange={setTextColor}
        onSizeChange={setTextSize}
        onCreate={handleAddTextCard}
        onClose={() => setShowAddTextModal(false)}
      />

      <ShareModal
        isOpen={showShareModal}
        board={board}
        copiedLink={copiedLink}
        onCopyLink={copyShareLink}
        onClose={() => setShowShareModal(false)}
      />

      <CommentsModal
        isOpen={showCommentsModal}
        card={selectedCard}
        boardId={boardId}
        onClose={handleCloseComments}
      />

      {/* Assign Collection Items Modal */}
      <AssignCollectionItemsModal
        isOpen={showAssignCollection}
        cards={cards}
        initialSlots={assigningCollectionCard}
        onClose={() => {
          setShowAssignCollection(false);
          setAssigningCollectionCard(null);
        }}
        onSave={handleSaveAssignCollection}
      />
    </div>
  );
}
