import { useState } from "react";
import { Trash2 } from "lucide-react";

export function ConnectorLayer({
  connectors,
  cards,
  showConnectors,
  selectedConnector,
  onSelectConnector,
  onDeleteConnector,
  onUpdateLabel,
  onUpdateConnection,
}) {
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelValue, setLabelValue] = useState("");
  const [draggingEnd, setDraggingEnd] = useState(null); // { connectorId, end: 'from' | 'to', x, y }

  const getCardById = (cardId) => {
    return cards.find((c) => c.id === cardId);
  };

  const getConnectionPoint = (card, side) => {
    if (!card) return { x: 0, y: 0 };

    const x = side === "left" ? card.x : card.x + card.width;
    const y = card.y + card.height / 2;

    return { x, y };
  };

  const handleLabelClick = (e, connector) => {
    e.stopPropagation();
    setEditingLabel(connector.id);
    setLabelValue(connector.label || "");
  };

  const handleLabelSave = (connector) => {
    onUpdateLabel(connector.id, labelValue);
    setEditingLabel(null);
  };

  const handleEndDragStart = (e, connector, end) => {
    e.stopPropagation();
    const svg = e.currentTarget.ownerSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    setDraggingEnd({
      connectorId: connector.id,
      end: end,
      x: svgP.x,
      y: svgP.y,
      originalFromCardId: connector.from_card_id,
      originalToCardId: connector.to_card_id,
    });
  };

  const handleEndDragMove = (e) => {
    if (!draggingEnd) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    setDraggingEnd((prev) => ({
      ...prev,
      x: svgP.x,
      y: svgP.y,
    }));
  };

  const handleEndDragEnd = (e) => {
    if (!draggingEnd) return;

    // Find which card (if any) we're over
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    let targetCard = null;
    for (const card of cards) {
      if (
        svgP.x >= card.x &&
        svgP.x <= card.x + card.width &&
        svgP.y >= card.y &&
        svgP.y <= card.y + card.height
      ) {
        targetCard = card;
        break;
      }
    }

    if (targetCard && onUpdateConnection) {
      const connector = connectors.find(
        (c) => c.id === draggingEnd.connectorId,
      );
      if (connector) {
        // Update the appropriate end
        if (draggingEnd.end === "from") {
          if (targetCard.id !== connector.to_card_id) {
            onUpdateConnection(
              connector.id,
              targetCard.id,
              connector.to_card_id,
            );
          }
        } else {
          if (targetCard.id !== connector.from_card_id) {
            onUpdateConnection(
              connector.id,
              connector.from_card_id,
              targetCard.id,
            );
          }
        }
      }
    }

    setDraggingEnd(null);
  };

  if (!showConnectors) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%", zIndex: 5 }}
      onMouseMove={draggingEnd ? handleEndDragMove : undefined}
      onMouseUp={draggingEnd ? handleEndDragEnd : undefined}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#F97316" />
        </marker>
        <marker
          id="arrowhead-dragging"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3B82F6" />
        </marker>
      </defs>

      {connectors.map((connector) => {
        const fromCard = getCardById(connector.from_card_id);
        const toCard = getCardById(connector.to_card_id);

        if (
          !fromCard ||
          (!toCard &&
            (!draggingEnd || draggingEnd.connectorId !== connector.id))
        )
          return null;

        const isDragging = draggingEnd?.connectorId === connector.id;

        let from, to;

        if (isDragging) {
          if (draggingEnd.end === "from") {
            from = { x: draggingEnd.x, y: draggingEnd.y };
            to = toCard ? getConnectionPoint(toCard, "left") : { x: 0, y: 0 };
          } else {
            from = fromCard
              ? getConnectionPoint(fromCard, "right")
              : { x: 0, y: 0 };
            to = { x: draggingEnd.x, y: draggingEnd.y };
          }
        } else {
          from = getConnectionPoint(fromCard, "right");
          to = toCard ? getConnectionPoint(toCard, "left") : { x: 0, y: 0 };
        }

        const isSelected = selectedConnector?.id === connector.id;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        return (
          <g key={connector.id}>
            {/* Main connector line */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={
                isDragging ? "#3B82F6" : isSelected ? "#F97316" : "#6B7280"
              }
              strokeWidth={isDragging || isSelected ? 3 : 2}
              strokeDasharray="5,5"
              markerEnd={
                isDragging
                  ? "url(#arrowhead-dragging)"
                  : isSelected
                    ? "url(#arrowhead-selected)"
                    : "url(#arrowhead)"
              }
              className="pointer-events-auto cursor-pointer hover:stroke-orange-500"
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnector(connector);
              }}
            />

            {/* Draggable handle at start */}
            <circle
              cx={from.x}
              cy={from.y}
              r={6}
              fill={
                isDragging && draggingEnd.end === "from" ? "#3B82F6" : "#F97316"
              }
              stroke="white"
              strokeWidth={2}
              className="pointer-events-auto cursor-grab active:cursor-grabbing hover:r-8"
              onMouseDown={(e) => handleEndDragStart(e, connector, "from")}
            />

            {/* Draggable handle at end */}
            <circle
              cx={to.x}
              cy={to.y}
              r={6}
              fill={
                isDragging && draggingEnd.end === "to" ? "#3B82F6" : "#F97316"
              }
              stroke="white"
              strokeWidth={2}
              className="pointer-events-auto cursor-grab active:cursor-grabbing hover:r-8"
              onMouseDown={(e) => handleEndDragStart(e, connector, "to")}
            />

            {/* Label */}
            {connector.label && !isDragging && (
              <g>
                <rect
                  x={midX - 40}
                  y={midY - 12}
                  width={80}
                  height={24}
                  fill="white"
                  stroke={isSelected ? "#F97316" : "#D1D5DB"}
                  strokeWidth={1}
                  rx={4}
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => handleLabelClick(e, connector)}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  className="text-xs font-jetbrains-mono pointer-events-none"
                  fill="#374151"
                >
                  {connector.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ConnectorMenu({
  connector,
  position,
  onDelete,
  onUpdateLabel,
  onClose,
}) {
  const [label, setLabel] = useState(connector?.label || "");

  if (!connector) return null;

  return (
    <div
      className="absolute bg-white dark:bg-[#262626] rounded-lg shadow-lg p-3 z-50 pointer-events-auto"
      style={{
        left: position.x - 100,
        top: position.y - 60,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => {
            onUpdateLabel(connector.id, label);
          }}
          placeholder="Label (e.g. Idea → Script)"
          className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-jetbrains-mono"
        />
        <button
          onClick={() => {
            onDelete(connector.id);
            onClose();
          }}
          className="flex items-center justify-center space-x-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          <Trash2 size={12} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
