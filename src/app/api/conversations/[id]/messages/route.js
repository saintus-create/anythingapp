import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const messages = await sql`
      SELECT role, content, created_at
      FROM messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `;

    return Response.json({ messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
