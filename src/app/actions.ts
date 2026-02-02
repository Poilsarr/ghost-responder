"use server"

import { headers } from "next/headers";

interface LeadPayload {
  clientId: string;
  leadName: string;
  leadPhone: string;
  serviceType: string;
  traceId: string;
  address?: string;
  city?: string;
  message?: string;
}

const getBaseUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
};

export async function sendLead(formData: FormData, overrideClientId?: string) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const service = String(formData.get("service") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = formData.get("message") as string;
  const clientId = (overrideClientId ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? "").trim();

  if (!clientId) {
    return {
      ok: false,
      error: "Missing clientId",
    };
  }

  const traceId = `trace_${crypto.randomUUID()}`;
  const leadData: LeadPayload = {
    clientId,
    leadName: name,
    leadPhone: phone,
    serviceType: service,
    traceId,
    address,
    city: city || undefined,
    message,
  };

  try {
    // Call the extravagant Ghost Engine API
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/lead-capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    const responseText = await response.text();
    const result = responseText
      ? (() => {
          try {
            return JSON.parse(responseText);
          } catch {
            return { message: responseText };
          }
        })()
      : {};

    console.log("[GHOST ENGINE RESPONSE]");
    console.log("Status:", result.status ?? result.success);
    console.log("TraceId:", result.traceId);
    if (result.telegramMessageId) {
      console.log("Telegram Message ID:", result.telegramMessageId);
    }
    console.log("Timestamp:", result.timestamp);

    if (!response.ok) {
      console.error("Error:", result.error || result.message);
      return {
        ok: false,
        error: result.error || result.message || "Failed to send lead",
      };
    }

    return {
      ok: true,
      traceId: result.traceId ?? traceId,
      ...result,
    };
  } catch (e) {
    console.error("[GHOST ENGINE ERROR]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to send lead",
    };
  }
}