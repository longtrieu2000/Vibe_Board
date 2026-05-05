import sql from "@/app/api/utils/sql";

// Generate unique share token
function generateShareToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function GET(request) {
  try {
    const boards = await sql`
      SELECT * FROM boards 
      ORDER BY updated_at DESC
    `;

    return Response.json({ boards });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return Response.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, template } = body;

    if (!name || !name.trim()) {
      return Response.json(
        { error: "Board name is required" },
        { status: 400 },
      );
    }

    const shareToken = generateShareToken();

    const [board] = await sql`
      INSERT INTO boards (name, share_token)
      VALUES (${name.trim()}, ${shareToken})
      RETURNING *
    `;

    // If template is provided, create cards and connectors
    if (template && template.cards && template.cards.length > 0) {
      const createdCards = [];

      // Create all cards
      for (const cardTemplate of template.cards) {
        const cardType = cardTemplate.type;
        const x = cardTemplate.x || 100;
        const y = cardTemplate.y || 100;

        let query;
        if (cardType === "note") {
          const text = cardTemplate.text || "New note";
          const color = cardTemplate.color || "yellow";
          const size = cardTemplate.size || "medium";
          query = sql`
            INSERT INTO cards (board_id, card_type, x, y, note_text, note_color, text_size)
            VALUES (${board.id}, 'note', ${x}, ${y}, ${text}, ${color}, ${size})
            RETURNING *
          `;
        } else if (cardType === "text") {
          const textContent = cardTemplate.textContent || "Text";
          const textColor = cardTemplate.textColor || "#000000";
          const size = cardTemplate.size || "medium";
          query = sql`
            INSERT INTO cards (board_id, card_type, x, y, text_content, text_color, text_size)
            VALUES (${board.id}, 'text', ${x}, ${y}, ${textContent}, ${textColor}, ${size})
            RETURNING *
          `;
        } else if (cardType === "video") {
          const videoUrl = cardTemplate.videoUrl || "";
          query = sql`
            INSERT INTO cards (board_id, card_type, x, y, video_url)
            VALUES (${board.id}, 'video', ${x}, ${y}, ${videoUrl})
            RETURNING *
          `;
        } else if (cardType === "image") {
          const imageUrl = cardTemplate.imageUrl || "";
          const caption = cardTemplate.imageCaption || "";
          query = sql`
            INSERT INTO cards (board_id, card_type, x, y, image_url, image_caption)
            VALUES (${board.id}, 'image', ${x}, ${y}, ${imageUrl}, ${caption})
            RETURNING *
          `;
        }

        if (query) {
          const [card] = await query;
          createdCards.push(card);
        }
      }

      // Create connectors if any
      if (template.connectors && template.connectors.length > 0) {
        for (const connTemplate of template.connectors) {
          const fromCard = createdCards[connTemplate.from];
          const toCard = createdCards[connTemplate.to];

          if (fromCard && toCard) {
            await sql`
              INSERT INTO connectors (board_id, from_card_id, to_card_id, label)
              VALUES (${board.id}, ${fromCard.id}, ${toCard.id}, ${connTemplate.label || ""})
            `;
          }
        }
      }
    }

    return Response.json({ board });
  } catch (error) {
    console.error("Error creating board:", error);
    return Response.json({ error: "Failed to create board" }, { status: 500 });
  }
}
