import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const { boardId, connectorId } = params;
    const body = await request.json();
    const { label, fromCardId, toCardId } = body;

    // Build dynamic update based on what fields are provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (label !== undefined) {
      updates.push(`label = $${paramCount}`);
      values.push(label || null);
      paramCount++;
    }

    if (fromCardId !== undefined) {
      updates.push(`from_card_id = $${paramCount}`);
      values.push(fromCardId);
      paramCount++;
    }

    if (toCardId !== undefined) {
      updates.push(`to_card_id = $${paramCount}`);
      values.push(toCardId);
      paramCount++;
    }

    updates.push(`updated_at = NOW()`);

    // Add WHERE clause parameters
    values.push(connectorId);
    const connectorIdParam = paramCount;
    paramCount++;

    values.push(boardId);
    const boardIdParam = paramCount;

    const query = `
      UPDATE connectors
      SET ${updates.join(", ")}
      WHERE id = $${connectorIdParam} AND board_id = $${boardIdParam}
      RETURNING *
    `;

    const rows = await sql(query, values);

    if (rows.length === 0) {
      return Response.json({ error: "Connector not found" }, { status: 404 });
    }

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${boardId}
    `;

    return Response.json({ connector: rows[0] });
  } catch (error) {
    console.error("Error updating connector:", error);
    return Response.json(
      { error: "Failed to update connector" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { boardId, connectorId } = params;

    const [deletedConnector] = await sql`
      DELETE FROM connectors 
      WHERE id = ${connectorId} AND board_id = ${boardId}
      RETURNING *
    `;

    if (!deletedConnector) {
      return Response.json({ error: "Connector not found" }, { status: 404 });
    }

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${boardId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting connector:", error);
    return Response.json(
      { error: "Failed to delete connector" },
      { status: 500 },
    );
  }
}
