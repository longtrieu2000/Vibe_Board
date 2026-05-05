import { useEffect, useRef, useState, useCallback } from "react";
import { Pen, Highlighter, Paintbrush, SprayCan, Eraser } from "lucide-react";

export function DrawingCanvas({
  strokes,
  onAddStroke,
  activeTool,
  strokeColor,
  strokeWidth,
  zoom,
  pan,
  isDrawing,
  onDrawingChange,
}) {
  const canvasRef = useRef(null);
  const [currentStroke, setCurrentStroke] = useState(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);

  // Use a much larger canvas to cover entire board
  const CANVAS_WIDTH = 8000;
  const CANVAS_HEIGHT = 8000;

  // Redraw all strokes whenever they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all existing strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke being drawn
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke]);

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points || stroke.points.length === 0) return;

    ctx.save();

    if (stroke.tool === "pen") {
      // Realistic pen: smooth, clean line with slight opacity variation
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.95;

      if (stroke.points.length === 1) {
        // Single dot
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(
          stroke.points[0].x,
          stroke.points[0].y,
          stroke.width / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.tool === "marker") {
      // Realistic marker: thicker, slightly transparent with texture
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.7;

      if (stroke.points.length === 1) {
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(
          stroke.points[0].x,
          stroke.points[0].y,
          (stroke.width * 1.5) / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        // Draw main stroke
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();

        // Add slight texture overlay
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = stroke.width * 1.8;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.tool === "highlighter") {
      // Realistic highlighter: wide, very transparent, bright
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 3;
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      ctx.globalAlpha = 0.25;

      if (stroke.points.length === 1) {
        ctx.fillStyle = stroke.color;
        ctx.fillRect(
          stroke.points[0].x - (stroke.width * 3) / 2,
          stroke.points[0].y - (stroke.width * 3) / 2,
          stroke.width * 3,
          stroke.width * 3,
        );
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.tool === "spray") {
      // Realistic spray paint: dense particle cloud
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = stroke.color;

      stroke.points.forEach((point) => {
        const particleCount = 25; // Much more particles
        const radius = stroke.width * 2;

        for (let i = 0; i < particleCount; i++) {
          // Random position within spray radius
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * radius;
          const x = point.x + Math.cos(angle) * distance;
          const y = point.y + Math.sin(angle) * distance;
          const size = Math.random() * 2 + 0.5;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (stroke.tool === "eraser") {
      // Eraser: removes everything underneath
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = stroke.width * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(
          stroke.points[0].x,
          stroke.points[0].y,
          stroke.width,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  const getCanvasPoint = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [zoom, pan],
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!activeTool || activeTool === "none") return;

      e.stopPropagation();
      e.preventDefault();

      const point = getCanvasPoint(e);
      if (!point) return;

      isDrawingRef.current = true;
      lastPointRef.current = point;
      onDrawingChange(true);

      setCurrentStroke({
        tool: activeTool,
        color: strokeColor,
        width: strokeWidth,
        points: [point],
      });
    },
    [activeTool, strokeColor, strokeWidth, getCanvasPoint, onDrawingChange],
  );

  const handleMouseMove = useCallback(
    (e) => {
      // Update cursor position
      setCursorPosition({ x: e.clientX, y: e.clientY });

      if (!isDrawingRef.current) return;

      e.stopPropagation();
      e.preventDefault();

      const point = getCanvasPoint(e);
      if (!point) return;

      // Skip if point hasn't moved (optimization)
      if (
        lastPointRef.current &&
        Math.abs(point.x - lastPointRef.current.x) < 0.5 &&
        Math.abs(point.y - lastPointRef.current.y) < 0.5
      ) {
        return;
      }

      lastPointRef.current = point;

      setCurrentStroke((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          points: [...prev.points, point],
        };
      });
    },
    [getCanvasPoint],
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (!isDrawingRef.current) return;

      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      isDrawingRef.current = false;
      lastPointRef.current = null;
      onDrawingChange(false);

      if (currentStroke) {
        onAddStroke(currentStroke);
        setCurrentStroke(null);
      }
    },
    [currentStroke, onAddStroke, onDrawingChange],
  );

  // Global event listeners for continuous drawing
  useEffect(() => {
    const handleGlobalMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      if (isDrawingRef.current) {
        handleMouseMove(e);
      }
    };

    const handleGlobalUp = (e) => {
      if (isDrawingRef.current) {
        handleMouseUp(e);
      }
    };

    document.addEventListener("mousemove", handleGlobalMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleGlobalUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMove);
      document.removeEventListener("mouseup", handleGlobalUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Get the cursor icon based on active tool
  const getCursorIcon = () => {
    if (!activeTool || activeTool === "none") return null;

    const iconProps = { size: 24, strokeWidth: 2 };

    switch (activeTool) {
      case "pen":
        return <Pen {...iconProps} color={strokeColor} />;
      case "marker":
        return <Paintbrush {...iconProps} color={strokeColor} />;
      case "highlighter":
        return <Highlighter {...iconProps} color={strokeColor} />;
      case "spray":
        return <SprayCan {...iconProps} color={strokeColor} />;
      case "eraser":
        return <Eraser {...iconProps} color="#666" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute inset-0 z-30"
      style={{
        pointerEvents: activeTool && activeTool !== "none" ? "auto" : "none",
      }}
      onMouseEnter={() => setShowCursor(true)}
      onMouseLeave={() => setShowCursor(false)}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute top-0 left-0"
        style={{
          cursor: "none", // Hide default cursor
          transformOrigin: "0 0",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Custom cursor */}
      {showCursor && activeTool && activeTool !== "none" && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            transform: "translate(-12px, -12px)",
          }}
        >
          <div className="drop-shadow-lg">{getCursorIcon()}</div>
        </div>
      )}
    </div>
  );
}
