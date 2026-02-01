import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.callback_query) {
      const callbackData = body.callback_query.data; // e.g., "claim_strike-final"
      const traceId = callbackData.split('_')[1];
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;

      // 1. Update the Data Fortress
      await sql`UPDATE ghost_leads SET is_claimed = TRUE WHERE trace_id = ${traceId};`;

      // 2. Get the Bot Token to send the update
      const { rows } = await sql`SELECT bot_token FROM ghost_clients WHERE chat_id = ${chatId.toString()} LIMIT 1;`;
      const botToken = rows[0].bot_token;

      // 3. Edit the original message to show "CLAIMED"
      const oldText = body.callback_query.message.text;
      const newText = oldText.replace('⚠️ Status: UNCLAIMED', '✅ Status: CLAIMED');

      await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: newText,
          parse_mode: 'Markdown'
        }),
      });

      // 4. Important: Answer the callback to stop the "loading" spinner on the button
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: body.callback_query.id, text: "Lead Claimed!" }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}