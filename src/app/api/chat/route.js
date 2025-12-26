import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Save user message
    await sql`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${conversationId}, 'user', ${message})
    `;

    // Get active AI provider
    const providers = await sql`
      SELECT * FROM ai_providers WHERE is_active = true ORDER BY created_at DESC LIMIT 1
    `;

    if (providers.length === 0) {
      return Response.json(
        { error: "No active AI provider configured" },
        { status: 400 },
      );
    }

    const provider = providers[0];

    // Get conversation history
    const history = await sql`
      SELECT role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    // Prepare messages for AI
    const messages = [
      {
        role: "system",
        content: `You are an AI coding assistant with access to file operations and Git commands. You can:
- Read, write, and modify files
- Execute Git commands (clone, pull, push, commit)
- Write and explain code
- Debug and optimize code

When the user asks you to modify files or use Git, respond with clear instructions and code.`,
      },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
    ];

    // Call AI provider
    const baseUrl = provider.base_url || "https://api.openai.com/v1";
    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.api_key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error("AI provider error:", error);
      return Response.json(
        { error: "AI provider request failed" },
        { status: 500 },
      );
    }

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Save assistant response
          await sql`
            INSERT INTO messages (conversation_id, role, content)
            VALUES (${conversationId}, 'assistant', ${fullResponse})
          `;

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
