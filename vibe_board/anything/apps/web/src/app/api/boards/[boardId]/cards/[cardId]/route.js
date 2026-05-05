import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const { boardId, cardId } = params;
    const body = await request.json();

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (body.x !== undefined) {
      updates.push(`x = $${paramCount++}`);
      values.push(body.x);
    }

    if (body.y !== undefined) {
      updates.push(`y = $${paramCount++}`);
      values.push(body.y);
    }

    if (body.width !== undefined) {
      updates.push(`width = $${paramCount++}`);
      values.push(body.width);
    }

    if (body.height !== undefined) {
      updates.push(`height = $${paramCount++}`);
      values.push(body.height);
    }

    if (body.text !== undefined) {
      updates.push(`note_text = $${paramCount++}`);
      values.push(body.text);
    }

    if (body.imageCaption !== undefined) {
      updates.push(`image_caption = $${paramCount++}`);
      values.push(body.imageCaption);
    }

    if (body.color !== undefined) {
      updates.push(`note_color = $${paramCount++}`);
      values.push(body.color);
    }

    if (body.size !== undefined) {
      updates.push(`text_size = $${paramCount++}`);
      values.push(body.size);
    }

    if (body.textContent !== undefined) {
      updates.push(`text_content = $${paramCount++}`);
      values.push(body.textContent);
    }

    if (body.textColor !== undefined) {
      updates.push(`text_color = $${paramCount++}`);
      values.push(body.textColor);
    }

    if (body.fontFamily !== undefined) {
      updates.push(`font_family = $${paramCount++}`);
      values.push(body.fontFamily);
    }

    // Collection slots
    [
      "slot1_card_id",
      "slot2_card_id",
      "slot3_card_id",
      "slot4_card_id",
    ].forEach((key) => {
      if (body[key] !== undefined) {
        updates.push(`${key} = $${paramCount++}`);
        values.push(body[key]);
      }
    });

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE cards 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount} AND board_id = $${paramCount + 1}
      RETURNING *
    `;

    values.push(cardId, boardId);

    const [card] = await sql(query, values);

    if (!card) {
      return Response.json({ error: "Card not found" }, { status: 404 });
    }

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${boardId}
    `;

    return Response.json({ card });
  } catch (error) {
    console.error("Error updating card:", error);
    return Response.json({ error: "Failed to update card" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { boardId, cardId } = params;

    const [deletedCard] = await sql`
      DELETE FROM cards 
      WHERE id = ${cardId} AND board_id = ${boardId}
      RETURNING *
    `;

    if (!deletedCard) {
      return Response.json({ error: "Card not found" }, { status: 404 });
    }

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${boardId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return Response.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
