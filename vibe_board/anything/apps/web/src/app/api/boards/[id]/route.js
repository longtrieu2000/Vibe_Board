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

    return Response.json({ board });
  } catch (error) {
    console.error("Error fetching board:", error);
    return Response.json({ error: "Failed to fetch board" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (body.isPublic !== undefined) {
      const [board] = await sql`
        UPDATE boards 
        SET is_public = ${body.isPublic}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (!board) {
        return Response.json({ error: "Board not found" }, { status: 404 });
      }

      return Response.json({ board });
    }

    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error updating board:", error);
    return Response.json({ error: "Failed to update board" }, { status: 500 });
  }
}
