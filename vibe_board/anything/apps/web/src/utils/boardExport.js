export async function exportBoardAsImage(canvasRef, boardName) {
  if (!canvasRef?.current) return;

  try {
    // Create a temporary canvas element
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Get the board content
    const boardElement = canvasRef.current.querySelector(
      "[data-board-content]",
    );
    if (!boardElement) {
      // Fallback: use the entire canvas
      const rect = canvasRef.current.getBoundingClientRect();
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;

      // Fill with background color
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Add grid pattern
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      for (let x = 0; x < tempCanvas.width; x += 20) {
        for (let y = 0; y < tempCanvas.height; y += 20) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add text indicating this is a screenshot
      ctx.fillStyle = "#000";
      ctx.font = "16px monospace";
      ctx.fillText(`Board: ${boardName}`, 20, 40);
      ctx.fillText("Screenshot taken from ViralBoard", 20, 70);
    }

    // Convert canvas to blob
    const blob = await new Promise((resolve) =>
      tempCanvas.toBlob(resolve, "image/png"),
    );

    // Download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${boardName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_screenshot.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Export failed:", error);
    return false;
  }
}

export async function exportBoardAsSVG(cards, connectors, boardName) {
  try {
    // Calculate bounding box
    const padding = 50;
    const minX = Math.min(...cards.map((c) => c.x)) - padding;
    const minY = Math.min(...cards.map((c) => c.y)) - padding;
    const maxX =
      Math.max(...cards.map((c) => c.x + (c.width || 280))) + padding;
    const maxY =
      Math.max(...cards.map((c) => c.y + (c.height || 200))) + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // Background
    svg += `<rect width="${width}" height="${height}" fill="#f9fafb"/>`;

    // Grid pattern
    svg += `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">`;
    svg += `<circle cx="1" cy="1" r="1" fill="#d1d5db"/></pattern></defs>`;
    svg += `<rect width="${width}" height="${height}" fill="url(#grid)"/>`;

    // Connectors
    connectors.forEach((conn) => {
      const fromCard = cards.find((c) => c.id === conn.from_card_id);
      const toCard = cards.find((c) => c.id === conn.to_card_id);
      if (!fromCard || !toCard) return;

      const x1 = fromCard.x + (fromCard.width || 280) / 2 - minX;
      const y1 = fromCard.y + (fromCard.height || 200) / 2 - minY;
      const x2 = toCard.x + (toCard.width || 280) / 2 - minX;
      const y2 = toCard.y + (toCard.height || 200) / 2 - minY;

      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f59e0b" stroke-width="2"/>`;

      if (conn.label) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        svg += `<text x="${midX}" y="${midY}" fill="#000" font-size="12" text-anchor="middle">${conn.label}</text>`;
      }
    });

    // Cards
    cards.forEach((card) => {
      const x = card.x - minX;
      const y = card.y - minY;
      const w = card.width || 280;
      const h = card.height || 200;

      let fill = "#fff";
      if (card.card_type === "note") {
        const colors = {
          yellow: "#fef3c7",
          pink: "#fce7f3",
          blue: "#dbeafe",
          green: "#d1fae5",
          purple: "#e9d5ff",
        };
        fill = colors[card.note_color] || colors.yellow;
      }

      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#e5e7eb" stroke-width="2" rx="8"/>`;

      // Card content
      if (card.card_type === "note" || card.card_type === "text") {
        const text = card.note_text || card.text_content || "";
        svg += `<text x="${x + 10}" y="${y + 30}" fill="#000" font-size="14" font-family="monospace">${text.slice(0, 50)}</text>`;
      } else if (card.card_type === "video") {
        svg += `<text x="${x + 10}" y="${y + 30}" fill="#000" font-size="14">📹 ${card.video_title || "Video"}</text>`;
      } else if (card.card_type === "image") {
        svg += `<text x="${x + 10}" y="${y + 30}" fill="#000" font-size="14">🖼️ ${card.image_caption || "Image"}</text>`;
      }
    });

    svg += "</svg>";

    // Download SVG
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${boardName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("SVG export failed:", error);
    return false;
  }
}
