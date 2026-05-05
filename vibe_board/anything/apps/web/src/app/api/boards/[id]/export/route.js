import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [board] = await sql`
      SELECT * FROM boards 
      WHERE id = ${id}
    `;

    if (!board) {
      return Response.json({ error: "Board not found" }, { status: 404 });
    }

    const cards = await sql`
      SELECT * FROM cards 
      WHERE board_id = ${id}
      ORDER BY created_at ASC
    `;

    const exportData = {
      board: {
        name: board.name,
        created_at: board.created_at,
        updated_at: board.updated_at,
      },
      cards: cards,
      exported_at: new Date().toISOString(),
      version: "1.0",
    };

    return Response.json(exportData);
  } catch (error) {
    console.error("Error exporting board:", error);
    return Response.json({ error: "Failed to export board" }, { status: 500 });
  }
}
