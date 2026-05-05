import { useState, useCallback } from "react";

export function useZoom(canvasRef) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3;

  const handleWheel = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY / 1000;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));

        // Zoom towards mouse position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const zoomRatio = newZoom / zoom;
          const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
          const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;

          setPan({ x: newPanX, y: newPanY });
        }

        setZoom(newZoom);
      }
    },
    [zoom, pan, canvasRef],
  );

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, zoom * 1.2);
    setZoom(newZoom);
  }, [zoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, zoom / 1.2);
    setZoom(newZoom);
  }, [zoom]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitToView = useCallback(
    (cards) => {
      if (!cards.length || !canvasRef.current) return;

      const padding = 100;
      const minX = Math.min(...cards.map((c) => c.x)) - padding;
      const minY = Math.min(...cards.map((c) => c.y)) - padding;
      const maxX =
        Math.max(...cards.map((c) => c.x + (c.width || 280))) + padding;
      const maxY =
        Math.max(...cards.map((c) => c.y + (c.height || 200))) + padding;

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      const rect = canvasRef.current.getBoundingClientRect();
      const zoomX = rect.width / contentWidth;
      const zoomY = rect.height / contentHeight;
      const newZoom = Math.min(zoomX, zoomY, 1);

      const newPanX =
        (rect.width - contentWidth * newZoom) / 2 - minX * newZoom;
      const newPanY =
        (rect.height - contentHeight * newZoom) / 2 - minY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    },
    [canvasRef],
  );

  const startPan = useCallback(
    (e) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan],
  );

  const handlePanMove = useCallback(
    (e) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart],
  );

  const stopPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  return {
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
  };
}
