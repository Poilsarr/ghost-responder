import { getAnalyticsSummary, getLatestLeads } from "../../lib/analytics";
import { getClientConfig } from "../../lib/clients";
import RevenueCalculator from "./RevenueCalculator";

export const dynamic = "force-dynamic";

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

export default async function GhostPanelPage() {
  const defaultClientId = process.env.DEFAULT_CLIENT_ID;
  const clientConfig = (() => {
    if (!defaultClientId) return undefined;
    try {
      return getClientConfig(defaultClientId);
    } catch {
      return undefined;
    }
  })();

  const [summary, leads] = await Promise.all([
    getAnalyticsSummary(),
    getLatestLeads(12),
  ]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Ghost Panel</p>
          <h1 className="text-4xl font-bold">Growth Bot Command Center</h1>
          <p className="text-zinc-400">
            Live proof that Ghost Responder is protecting revenue in real time.
          </p>
          {clientConfig ? (
            <p className="text-sm text-zinc-300">
              Welcome, <span className="font-semibold">{clientConfig.name}</span> Team
            </p>
          ) : null}
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Avg. Response</p>
            <p className="mt-3 text-3xl font-bold text-green-400">
              {(summary.averageLatencyMs / 1000).toFixed(2)} Seconds
            </p>
            <p className="mt-2 text-xs text-zinc-500">Calculated from delivered leads</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Delivered This Week</p>
            <p className="mt-3 text-3xl font-bold">{summary.deliveredCount}</p>
            <p className="mt-2 text-xs text-zinc-500">Auto-tracked money traces</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Revenue Guarded</p>
            <RevenueCalculator deliveredCount={summary.deliveredCount} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Latest Ghost Responses</h2>
            <span className="text-xs uppercase tracking-widest text-zinc-500">Live Feed</span>
          </div>
          <div className="space-y-4">
            {leads.length === 0 ? (
              <p className="text-sm text-zinc-500">No leads captured yet.</p>
            ) : (
              leads.map((entry) => (
                <div
                  key={entry.traceId}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{entry.lead.city ?? "Unknown"}</span>
                    <span className="text-xs text-zinc-500">{formatTime(entry.timestamp)}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Trace {entry.traceId} • {entry.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
