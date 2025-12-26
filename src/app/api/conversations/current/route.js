import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Get or create current conversation
    let conversations = await sql`
      SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 1
    `;

    if (conversations.length === 0) {
      conversations = await sql`
        INSERT INTO conversations (title) VALUES ('New Conversation')
        RETURNING *
      `;
    }

    return Response.json({ id: conversations[0].id });
  } catch (error) {
    console.error("Error getting conversation:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
