export interface ClientConfig {
  id: string;
  name: string;
  token?: string;
  chatId?: string;
  tier: "premium" | "standard";
}

const CLIENT_REGISTRY: Record<string, ClientConfig> = {
  "UK-ROOF-001": {
    id: "UK-ROOF-001",
    name: "High Range Roofing",
    token: process.env.HRR_BOT_TOKEN,
    chatId: process.env.HRR_CHAT_ID,
    tier: "premium",
  },
  "US-MOLD-002": {
    id: "US-MOLD-002",
    name: "Exit Mold NY",
    token: process.env.EXITMOLD_BOT_TOKEN,
    chatId: process.env.EXITMOLD_CHAT_ID,
    tier: "standard",
  },
};

export const getClientConfig = (clientId: string) => {
  const config = CLIENT_REGISTRY[clientId];
  if (!config) {
    throw new Error(`Unauthorized Client ID: ${clientId}`);
  }

  if (!config.token || !config.chatId) {
    throw new Error(`Missing credentials for client: ${clientId}`);
  }

  return config;
};