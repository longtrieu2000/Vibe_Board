import { forwardRef, useEffect, useRef, useState } from "react";
import { VideoCard } from "./Cards/VideoCard";
import { ImageCard } from "./Cards/ImageCard";
import { NoteCard } from "./Cards/NoteCard";
import { TextCard } from "./Cards/TextCard";
import { CollectionCard } from "./Cards/CollectionCard";
import { ConnectorLayer } from "./ConnectorLayer";
import { FileText, Palette } from "lucide-react";

export const BoardCanvas = forwardRef(
  (
    {
      cards,
      selectedCard,
      onCardClick,
      onCardMouseDown,
      onCanvasClick,
      onNoteTextChange,
      onNoteTextBlur,
      onImageCaptionChange,
      onImageCaptionBlur,
      onNoteColorChange,
      boardId,
      connectors,
      selectedConnector,
      onSelectConnector,
      onDeleteConnector,
      onUpdateConnectorLabel,
      onUpdateConnection,
      connectingFrom,
      zoom = 1,
      pan = { x: 0, y: 0 },
      onWheel,
      onPanStart,
      onPanMove,
      onPanStop,
      onOpenCollectionAssign,
      onAssignSlot,
      onResizeCard,
      onAssistantAction, // ADD: quick actions callback
    },
    ref,
  ) => {
    // Alt key state for drag-to-assign on whole card
    const [isAltPressed, setIsAltPressed] = useState(false);
    useEffect(() => {
      const down = (e) => {
        if (e.key === "Alt") setIsAltPressed(true);
      };
      const up = (e) => {
        if (e.key === "Alt") setIsAltPressed(false);
      };
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);

    // Simple right-click menu for Video/Image cards
    const [menu, setMenu] = useState(null); // { x, y, cardId }
    const wrapperRef = useRef(null);

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

    // ADD: detect assistant card without schema change
    const isAssistantCard = (card) => {
      if (card.card_type !== "text") return false;
      const txt = (card.text_content || "").trim();
      return txt === "AI Assistant";
    };

    const [resizing, setResizing] = useState(null); // { id, startX, startY, startW, startH }
    const [tempSizes, setTempSizes] = useState({}); // { [id]: { w, h } }

    useEffect(() => {
      const onMove = (e) => {
        if (!resizing) return;
        const dx = (e.clientX - resizing.startX) / zoom;
        const dy = (e.clientY - resizing.startY) / zoom;
        const w = Math.max(240, Math.round(resizing.startW + dx));
        const h = Math.max(180, Math.round(resizing.startH + dy));
        setTempSizes((prev) => ({ ...prev, [resizing.id]: { w, h } }));
      };
      const onUp = async () => {
        if (resizing) {
          const size = tempSizes[resizing.id];
          if (size && onResizeCard) {
            await onResizeCard(resizing.id, size.w, size.h);
          }
        }
        setResizing(null);
        setTempSizes((prev) => ({ ...prev }));
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      if (resizing) {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    }, [resizing, zoom, onResizeCard, tempSizes]);

    const startResize = (e, card) => {
      e.stopPropagation();
      e.preventDefault();
      setResizing({
        id: card.id,
        startX: e.clientX,
        startY: e.clientY,
        startW: tempSizes[card.id]?.w || card.width,
        startH: tempSizes[card.id]?.h || card.height,
      });
    };

    const getDisplaySize = (card) => {
      const tmp = tempSizes[card.id];
      return {
        width: tmp ? tmp.w : card.width,
        height: tmp ? tmp.h : card.height,
      };
    };

    const renderAssignHandle = (card) => {
      if (card.card_type !== "video" && card.card_type !== "image") return null;
      return (
        <div
          className="absolute top-1 left-1 w-4 h-4 rounded bg-orange-500 border-2 border-white z-20 cursor-grab"
          title="Drag to a Collection slot"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({ cardId: card.id }),
            );
            e.dataTransfer.effectAllowed = "copy";
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      );
    };

    const renderResizeHandle = (card) => {
      if (card.card_type !== "collection") return null;
      return (
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-800 dark:bg-gray-100 rounded-sm cursor-se-resize z-20"
          onMouseDown={(e) => startResize(e, card)}
        />
      );
    };

    // Helper to assign to first empty slot of first available collection
    const assignToFirstEmptySlot = (sourceCardId) => {
      const collections = cards.filter((c) => c.card_type === "collection");
      for (const col of collections) {
        const slots = [
          col.slot1_card_id,
          col.slot2_card_id,
          col.slot3_card_id,
          col.slot4_card_id,
        ];
        const emptyIndex = slots.findIndex((s) => !s);
        if (emptyIndex !== -1 && onAssignSlot) {
          onAssignSlot(col, emptyIndex, sourceCardId);
          return true;
        }
      }
      return false;
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          wrapperRef.current = node;
        }}
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        onClick={onCanvasClick}
        onWheel={onWheel}
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanStop}
        onMouseLeave={onPanStop}
        onContextMenu={(e) => {
          // Close any open menu when right-clicking the empty canvas
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setMenu(null);
          }
        }}
      >
        <div
          className="min-w-[2000px] min-h-[2000px] relative origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {cards.map((card) => {
            const size = getDisplaySize(card);
            const isMedia =
              card.card_type === "video" || card.card_type === "image";
            const canAltDrag = isAltPressed && isMedia;
            return (
              <div
                key={card.id}
                className={`absolute ${
                  canAltDrag ? "cursor-copy" : "cursor-move"
                } ${
                  selectedCard?.id === card.id
                    ? "ring-2 ring-orange-500"
                    : connectingFrom?.id === card.id
                      ? "ring-4 ring-blue-500 ring-offset-2"
                      : ""
                }`}
                style={{
                  left: card.x,
                  top: card.y,
                  width: size.width,
                  minHeight: size.height,
                }}
                draggable={canAltDrag}
                onDragStart={(e) => {
                  if (!canAltDrag) return;
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ cardId: card.id }),
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onMouseDown={(e) => {
                  if (canAltDrag) {
                    // prevent move drag when alt-dragging to collection
                    e.stopPropagation();
                    return;
                  }
                  onCardMouseDown(e, card);
                }}
                onClick={(e) => onCardClick(e, card)}
                onDoubleClick={(e) => {
                  if (
                    card.card_type === "collection" &&
                    onOpenCollectionAssign
                  ) {
                    e.stopPropagation();
                    onOpenCollectionAssign(card);
                  }
                }}
                onContextMenu={(e) => {
                  if (!isMedia) return; // only for video/image
                  e.preventDefault();
                  // place menu relative to wrapper
                  const rect = wrapperRef.current?.getBoundingClientRect();
                  const x = e.clientX - (rect?.left || 0);
                  const y = e.clientY - (rect?.top || 0);
                  setMenu({ x, y, cardId: card.id });
                }}
              >
                {renderAssignHandle(card)}

                {card.card_type === "video" ? (
                  <VideoCard card={card} />
                ) : card.card_type === "image" ? (
                  <ImageCard
                    card={card}
                    onCaptionChange={onImageCaptionChange}
                    onCaptionBlur={onImageCaptionBlur}
                    boardId={boardId}
                  />
                ) : card.card_type === "pdf" ? (
                  <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg overflow-hidden h-full p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-red-600" size={32} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-jetbrains-mono">
                          {card.pdf_name || "Document.pdf"}
                        </p>
                        <a
                          href={card.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:underline font-jetbrains-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ) : card.card_type === "text" ? (
                  <div className="relative">
                    <TextCard
                      card={card}
                      onTextChange={onNoteTextChange}
                      onTextBlur={onNoteTextBlur}
                      onResize={onResizeCard}
                    />
                    {isAssistantCard(card) && (
                      <div className="absolute top-2 right-2 flex flex-wrap gap-2 z-20">
                        <button
                          className="px-2 py-1 text-xs rounded bg-orange-500 text-white hover:bg-orange-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("summarize_linked", card);
                          }}
                        >
                          Summarize linked
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-gray-900 text-white hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("create_schedule", card);
                          }}
                        >
                          Create schedule
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("pick_winner", card);
                          }}
                        >
                          Pick winner
                        </button>
                        {/* NEW quick actions */}
                        <button
                          className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("summarize_pdfs", card);
                          }}
                        >
                          Summarize PDFs
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-violet-600 text-white hover:bg-violet-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("titles_per_video", card);
                          }}
                        >
                          10 titles/video
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("weekly_plan", card);
                          }}
                        >
                          Weekly plan
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssistantAction &&
                              onAssistantAction("cross_post_plan", card);
                          }}
                        >
                          Cross-post plan
                        </button>
                      </div>
                    )}
                  </div>
                ) : card.card_type === "collection" ? (
                  <div className="relative">
                    <CollectionCard
                      card={card}
                      cards={cards}
                      onDoubleClick={() =>
                        onOpenCollectionAssign && onOpenCollectionAssign(card)
                      }
                      onAssignSlot={onAssignSlot}
                    />
                    {renderResizeHandle(card)}
                  </div>
                ) : (
                  <NoteCard
                    card={card}
                    onTextChange={onNoteTextChange}
                    onTextBlur={onNoteTextBlur}
                  />
                )}

                {/* Color picker for selected note cards */}
                {selectedCard?.id === card.id &&
                  card.card_type === "note" &&
                  onNoteColorChange && (
                    <div className="absolute -bottom-12 left-0 bg-white dark:bg-[#262626] rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
                      <Palette
                        size={16}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      {["yellow", "pink", "blue", "green", "purple"].map(
                        (color) => (
                          <button
                            key={color}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNoteColorChange(card.id, color);
                            }}
                            className={`w-6 h-6 rounded ${getNoteColor(color)} border-2 ${card.note_color === color ? "border-orange-500" : "border-transparent"}`}
                          />
                        ),
                      )}
                    </div>
                  )}
              </div>
            );
          })}

          {/* Connector Layer */}
          {connectors && (
            <ConnectorLayer
              connectors={connectors}
              cards={cards}
              showConnectors={true}
              selectedConnector={selectedConnector}
              onSelectConnector={onSelectConnector}
              onDeleteConnector={onDeleteConnector}
              onUpdateLabel={onUpdateConnectorLabel}
              onUpdateConnection={onUpdateConnection}
            />
          )}
        </div>

        {/* Context menu overlay (outside transform) */}
        {menu && (
          <div
            className="absolute z-50 bg-white dark:bg-[#262626] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
            style={{ left: menu.x, top: menu.y }}
          >
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const ok = assignToFirstEmptySlot(menu.cardId);
                if (!ok) alert("No collection with empty slot found");
                setMenu(null);
              }}
            >
              Duplicate to collection
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMenu(null)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  },
);

BoardCanvas.displayName = "BoardCanvas";
