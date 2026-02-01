import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { clientId, leadName, leadPhone, serviceType, traceId } = body;

    // 1. Fetch Client Config from the Data Fortress
    const { rows: clientRows } = await sql`
      SELECT * FROM ghost_clients 
      WHERE client_id = ${clientId} AND status = 'active'
      LIMIT 1;
    `;

    if (clientRows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized Client' }, { status: 401 });
    }

    const client = clientRows[0];
    const latency = Date.now() - startTime;

    // 2. Save Lead to Postgres (The Money Trace)
    await sql`
      INSERT INTO ghost_leads (client_id, lead_name, lead_phone, service_type, latency_ms, trace_id, is_claimed)
      VALUES (${clientId}, ${leadName}, ${leadPhone}, ${serviceType}, ${latency}, ${traceId}, FALSE);
    `;

    // 3. Fire the Telegram Alert with the Interactive "Claim" Button
    const message = `🚀 *New Lead: ${client.business_name}*\n\n` +
                    `👤 Name: ${leadName}\n` +
                    `📞 Phone: [${leadPhone}](tel:${leadPhone})\n` +
                    `🛠 Service: ${serviceType}\n` +
                    `⚡ Speed: ${latency}ms\n\n` +
                    `⚠️ Status: UNCLAIMED\n` +
                    `Please respond to stop the automated alerts!`;

    await fetch(`https://api.telegram.org/bot${client.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: client.chat_id,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { 
              text: "✅ CLAIM LEAD & STOP ALERTS", 
              callback_data: `claim_${traceId}` 
            }
          ]]
        }
      }),
    });

    return NextResponse.json({ success: true, latency });

  } catch (error) {
    console.error('Ghost Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}