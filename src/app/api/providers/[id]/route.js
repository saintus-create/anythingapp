import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await sql`DELETE FROM ai_providers WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { is_active } = await request.json();

    // If activating this provider, deactivate all others
    if (is_active) {
      await sql`UPDATE ai_providers SET is_active = false`;
    }

    await sql`
      UPDATE ai_providers
      SET is_active = ${is_active}
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating provider:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
