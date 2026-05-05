import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const cardId = parseInt(params.cardId);

    const comments = await sql`
      SELECT * FROM comments
      WHERE card_id = ${cardId}
      ORDER BY created_at ASC
    `;

    return Response.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return Response.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const cardId = parseInt(params.cardId);
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return Response.json(
        { error: "Comment text is required" },
        { status: 400 },
      );
    }

    const [comment] = await sql`
      INSERT INTO comments (card_id, comment_text)
      VALUES (${cardId}, ${text.trim()})
      RETURNING *
    `;

    return Response.json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return Response.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const cardId = parseInt(params.cardId);
    const url = new URL(request.url);
    const commentId = url.searchParams.get("id");

    if (!commentId) {
      return Response.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM comments
      WHERE id = ${parseInt(commentId)} AND card_id = ${cardId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return Response.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
