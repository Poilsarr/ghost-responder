"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LeadForm from '@/components/LeadForm';

function DemoPageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const companyName = searchParams.get('name') || "your company";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Experience Ghost Responder ⚡
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Enter your details below to see how fast <b>{companyName}</b> 
            can respond to your lead.
          </p>
          <p className="text-gray-500 text-sm">
            Watch your Telegram for an instant notification—typically delivered in under 2 seconds.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <LeadForm clientId={clientId} isDemo={true} companyName={companyName} />
        </div>

        <div className="text-center space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-400">
              <span className="font-bold text-blue-400">How it works:</span> Fill out the form above and submit. 
              Your lead will be instantly routed to <b>{companyName}</b>&apos;s Telegram bot.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Response benchmark: &lt; 2 seconds | Trace ID tracked in Ghost Panel
          </p>
        </div>
      </div>
    </main>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="w-full max-w-2xl text-center text-zinc-400">Loading demo...</div>
        </main>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
}
