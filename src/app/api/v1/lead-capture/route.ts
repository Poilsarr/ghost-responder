import { NextRequest, NextResponse } from "next/server";
import { validateLead } from "../../../../middleware/validator";
import { sendTelegramAlert } from "../../../../lib/telegram";
import { logLeadToStorage } from "../../../../lib/analytics";
import { getClientConfig } from "../../../../lib/clients";

const buildTraceId = () => `L-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

export async function POST(req: NextRequest) {
  const traceId = buildTraceId();
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const payload = await req.json();
    const clientId =
      (typeof payload?.clientId === "string" && payload.clientId.trim()) ||
      req.headers.get("x-client-id") ||
      "";

    if (!clientId) {
      throw new Error("Missing clientId");
    }

    const clientConfig = getClientConfig(clientId);
    const leadData = validateLead(payload);

    const deliveryStatus = await sendTelegramAlert(leadData, traceId, clientConfig);

    await logLeadToStorage({
      traceId,
      clientId,
      clientName: clientConfig.name,
      clientTier: clientConfig.tier,
      latency: Date.now() - startTime,
      status: deliveryStatus.data.ok ? "DELIVERED" : "FAILED",
      timestamp,
      lead: leadData,
    });

    if (!deliveryStatus.data.ok) {
      const telegramError =
        deliveryStatus.data.description ?? `Telegram error (${deliveryStatus.status})`;
      return NextResponse.json(
        { success: false, traceId, error: telegramError },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, traceId, message: "Value Delivered.", client: clientConfig.name },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "System logic fault.";
    const isProd = process.env.NODE_ENV === "production";

    await logLeadToStorage({
      traceId,
      clientId: req.headers.get("x-client-id") ?? "unknown",
      latency: Date.now() - startTime,
      status: "FAILED",
      timestamp,
      lead: {
        name: "Unknown",
        phone: "Unknown",
        service: "Unknown",
      },
    });

    console.error(`🔴 CRITICAL FAIL [${traceId}]:`, message);
    if (message.startsWith("Unauthorized Client ID") || message.includes("Missing clientId")) {
      return NextResponse.json(
        { success: false, traceId, error: "Invalid Routing" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, traceId, error: isProd ? "System logic fault." : message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "healthy", service: "lead-capture" }, { status: 200 });
}
