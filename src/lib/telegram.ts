import axios from "axios";
import https from "https";
import type { LeadData } from "../middleware/validator";
import type { ClientConfig } from "./clients";

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

const formatTelegramMessage = (lead: LeadData, traceId: string, clientName?: string) => {
  const { name, phone, service, message, address, city } = lead;

  return `
⚡ <b>NEW LEAD INCOMING</b> ⚡
${"─".repeat(28)}
<b>👤 Name:</b> ${name}
<b>📍 Address:</b> ${address ?? "N/A"}
<b>🧾 Trace:</b> ${traceId}
${clientName ? `<b>🏷 Client:</b> ${clientName}` : ""}
<b>🏙 City:</b> ${city ?? "Unknown"}
<b>🛠 Service:</b> ${service}
<b>💬 Note:</b> ${message ?? "No additional notes"}

<b>📞 Action:</b> <a href="tel:${phone}">TAP TO CALL NOW</a>
${"─".repeat(28)}
<i>⏱ Sent via Ghost Responder Pro @ ${new Date().toISOString()}</i>
  `.trim();
};

export const sendTelegramAlert = async (
  lead: LeadData,
  traceId: string,
  clientConfig: ClientConfig
) => {
  const url = `https://api.telegram.org/bot${clientConfig.token}/sendMessage`;
  const text = formatTelegramMessage(lead, traceId, clientConfig.name);
  const httpsAgent =
    process.env.NODE_ENV !== "production"
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

  return axios.post<TelegramResponse>(
    url,
    {
      chat_id: clientConfig.chatId,
      text,
      parse_mode: "HTML",
    },
    { httpsAgent, validateStatus: () => true }
  );
};
