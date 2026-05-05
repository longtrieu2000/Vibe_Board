export function ConnectorHandles({
  card,
  isDrawingConnector,
  onStartConnector,
  canvasRef,
}) {
  const handleMouseDown = (e, side) => {
    e.stopPropagation();
    onStartConnector(card, side);
  };

  const getHandlePosition = (side) => {
    if (side === "left") {
      return { left: -6, top: "50%", transform: "translateY(-50%)" };
    } else {
      return { right: -6, top: "50%", transform: "translateY(-50%)" };
    }
  };

  return (
    <>
      {/* Left handle */}
      <div
        className="absolute w-3 h-3 bg-orange-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform z-10"
        style={getHandlePosition("left")}
        onMouseDown={(e) => handleMouseDown(e, "left")}
      />

      {/* Right handle */}
      <div
        className="absolute w-3 h-3 bg-orange-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform z-10"
        style={getHandlePosition("right")}
        onMouseDown={(e) => handleMouseDown(e, "right")}
      />
    </>
  );
}
