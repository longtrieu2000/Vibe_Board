import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { token } = params;

    const [board] = await sql`
      SELECT * FROM boards 
      WHERE share_token = ${token} AND is_public = true
    `;

    if (!board) {
      return Response.json(
        { error: "Board not found or not public" },
        { status: 404 },
      );
    }

    const cards = await sql`
      SELECT * FROM cards 
      WHERE board_id = ${board.id}
      ORDER BY created_at ASC
    `;

    return Response.json({ board, cards });
  } catch (error) {
    console.error("Error fetching shared board:", error);
    return Response.json({ error: "Failed to fetch board" }, { status: 500 });
  }
}
