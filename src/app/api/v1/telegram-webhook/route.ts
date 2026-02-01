import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.callback_query) {
      const callbackData = body.callback_query.data as string;
      const traceId = callbackData.split("_")[1];
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;

      await sql`
        UPDATE ghost_leads 
        SET is_claimed = TRUE 
        WHERE trace_id = ${traceId};
      `;

      const updatedText = body.callback_query.message.text.replace(
        "⚠️ *Status: UNCLAIMED*",
        "✅ *Status: CLAIMED*"
      );

      const { rows } = await sql`
        SELECT bot_token FROM ghost_clients WHERE chat_id = ${chatId.toString()} LIMIT 1;
      `;
      const botToken = rows[0]?.bot_token;

      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: updatedText,
            parse_mode: "Markdown",
          }),
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
  }
}
