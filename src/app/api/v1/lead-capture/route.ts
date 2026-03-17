import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import axios from "axios";
import https from "https";
import { logLeadToStorage } from "@/lib/analytics";

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isDevEnvironment = process.env.NODE_ENV !== "production";

const isTelegramBlockedByFilter = (status: number, data: unknown) => {
  const text = typeof data === "string" ? data : "";
  return (
    status === 403 &&
    text.includes("FortiGuard Intrusion Prevention") &&
    text.includes("api.telegram.org")
  );
};

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const clientId = normalizeString(body.clientId);
    const leadName = normalizeString(body.leadName);
    const leadPhone = normalizeString(body.leadPhone);
    const serviceType = normalizeString(body.serviceType);
    const traceId = normalizeString(body.traceId) || `trace_${crypto.randomUUID()}`;
    const address = normalizeString(body.address);
    const city = normalizeString(body.city);
    const leadMessage = normalizeString(body.message);

    if (!clientId || !leadName || !leadPhone || !serviceType || !traceId) {
      return NextResponse.json({ error: "Missing required lead fields" }, { status: 400 });
    }

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
    const telegramMessage = `🚀 *New Lead: ${client.business_name}*\n\n` +
                            `👤 Name: ${leadName}\n` +
                            `📞 Phone: [${leadPhone}](tel:${leadPhone})\n` +
                            `🛠 Service: ${serviceType}\n` +
                            `⚡ Speed: ${latency}ms\n\n` +
                            `⚠️ Status: UNCLAIMED\n` +
                            `Please respond to stop the automated alerts!`;

    const httpsAgent =
      process.env.NODE_ENV !== "production"
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${client.bot_token}/sendMessage`,
      {
        chat_id: client.chat_id,
        text: telegramMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: "✅ CLAIM LEAD & STOP ALERTS",
              callback_data: `claim_${traceId}`
            }
          ]]
        }
      },
      {
        ...(httpsAgent ? { httpsAgent } : {}),
        validateStatus: () => true,
      }
    );

    if (telegramResponse.status >= 400) {
      console.error('Telegram API Error:', telegramResponse.data);

      if (isDevEnvironment && isTelegramBlockedByFilter(telegramResponse.status, telegramResponse.data)) {
        await logLeadToStorage({
          traceId,
          clientId,
          clientName: client.business_name,
          clientTier: client.tier,
          latency,
          status: "SIMULATED",
          timestamp: new Date().toISOString(),
          lead: {
            name: leadName,
            phone: leadPhone,
            service: serviceType,
            address: address || undefined,
            city: city || undefined,
            message: leadMessage || undefined,
          },
        });

        return NextResponse.json({
          success: true,
          simulated: true,
          latency,
          traceId,
          message: "Lead captured locally. Telegram delivery was simulated because api.telegram.org is blocked on this network.",
        });
      }

      await logLeadToStorage({
        traceId,
        clientId,
        clientName: client.business_name,
        clientTier: client.tier,
        latency,
        status: "FAILED",
        timestamp: new Date().toISOString(),
        lead: {
          name: leadName,
          phone: leadPhone,
          service: serviceType,
          address: address || undefined,
          city: city || undefined,
          message: leadMessage || undefined,
        },
      });

      return NextResponse.json(
        {
          error: 'Failed to send Telegram message',
          reason:
            typeof telegramResponse.data === "string"
              ? "Telegram is blocked or unreachable from this network"
              : undefined,
          telegram: telegramResponse.data,
          traceId,
        },
        { status: telegramResponse.status }
      );
    }

    await logLeadToStorage({
      traceId,
      clientId,
      clientName: client.business_name,
      clientTier: client.tier,
      latency,
      status: "DELIVERED",
      timestamp: new Date().toISOString(),
        lead: {
          name: leadName,
          phone: leadPhone,
          service: serviceType,
          address: address || undefined,
          city: city || undefined,
          message: leadMessage || undefined,
        },
      });

    return NextResponse.json({
      success: true,
      latency,
      traceId,
      telegramMessageId: telegramResponse.data?.result?.message_id,
    });

  } catch (error) {
    console.error('Ghost Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
