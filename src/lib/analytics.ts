import { promises as fs } from "fs";
import path from "path";
import type { LeadData } from "../middleware/validator";

export interface LeadLogEntry {
  traceId: string;
  clientId: string;
  clientName?: string;
  clientTier?: "premium" | "standard";
  latency: number;
  status: "DELIVERED" | "FAILED";
  timestamp: string;
  lead: LeadData;
}

const logFilePath = () => path.join(process.cwd(), "logs", "leads.jsonl");

export const logLeadToStorage = async (entry: LeadLogEntry) => {
  const filePath = logFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
};

const readLogEntries = async () => {
  try {
    const filePath = logFilePath();
    const content = await fs.readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LeadLogEntry);
  } catch {
    return [] as LeadLogEntry[];
  }
};

export const getLatestLeads = async (limit = 20) => {
  const entries = await readLogEntries();
  return entries.slice(-limit).reverse();
};

export const getAnalyticsSummary = async () => {
  const entries = await readLogEntries();
  if (entries.length === 0) {
    return { averageLatencyMs: 0, deliveredCount: 0 };
  }

  const delivered = entries.filter((entry) => entry.status === "DELIVERED");
  const totalLatency = delivered.reduce((sum, entry) => sum + entry.latency, 0);
  const averageLatencyMs = delivered.length > 0 ? totalLatency / delivered.length : 0;

  return {
    averageLatencyMs,
    deliveredCount: delivered.length,
  };
};
