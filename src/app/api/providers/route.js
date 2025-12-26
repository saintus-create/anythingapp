import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const providers = await sql`
      SELECT id, name, base_url, model, is_active, created_at
      FROM ai_providers
      ORDER BY created_at DESC
    `;

    return Response.json({ providers });
  } catch (error) {
    console.error("Error getting providers:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, apiKey, baseUrl, model } = await request.json();

    if (!name || !apiKey || !model) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO ai_providers (name, api_key, base_url, model)
      VALUES (${name}, ${apiKey}, ${baseUrl || null}, ${model})
      RETURNING id
    `;

    return Response.json({ id: result[0].id });
  } catch (error) {
    console.error("Error creating provider:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
