import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const connectors = await sql`
      SELECT * FROM connectors 
      WHERE board_id = ${id}
      ORDER BY created_at ASC
    `;

    return Response.json({ connectors });
  } catch (error) {
    console.error("Error fetching connectors:", error);
    return Response.json(
      { error: "Failed to fetch connectors" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { fromCardId, toCardId, label } = body;

    if (!fromCardId || !toCardId) {
      return Response.json(
        { error: "fromCardId and toCardId are required" },
        { status: 400 },
      );
    }

    const [connector] = await sql`
      INSERT INTO connectors (board_id, from_card_id, to_card_id, label)
      VALUES (${id}, ${fromCardId}, ${toCardId}, ${label || null})
      RETURNING *
    `;

    // Update board's updated_at timestamp
    await sql`
      UPDATE boards 
      SET updated_at = NOW() 
      WHERE id = ${id}
    `;

    return Response.json({ connector });
  } catch (error) {
    console.error("Error creating connector:", error);
    return Response.json(
      { error: "Failed to create connector" },
      { status: 500 },
    );
  }
}
