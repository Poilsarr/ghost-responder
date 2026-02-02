"use client"
import { sendLead } from "@/app/actions";
import { useState } from "react";

interface SubmissionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  traceId?: string;
  error?: string;
}

interface LeadFormProps {
  clientId?: string | null;
  isDemo?: boolean;
  companyName?: string;
}

export default function LeadForm({ clientId, isDemo = false, companyName }: LeadFormProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: 'idle',
  });

  async function handleAction(formData: FormData) {
    setSubmissionState({ status: 'loading' });

    try {
      if (isDemo && !clientId) {
        throw new Error("Missing clientId in demo URL");
      }
      const result = await sendLead(formData, clientId || undefined);
      if (result.ok) {
        setSubmissionState({
          status: 'success',
          traceId: result.traceId,
        });
        return;
      }
      setSubmissionState({
        status: 'error',
        error: result.error || 'Failed to send lead',
      });
    } catch (error) {
      setSubmissionState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to send lead',
      });
    }
  }

  const formTitle = isDemo ? `${companyName} - Demo Mode` : "⚡ Ghost Responder";
  const formSubtitle = isDemo ? "See how fast we respond to your leads" : "Production-Grade Lead Engine";
  const submitButtonText = isDemo ? "🚀 Send Demo Lead" : "Send Lead to Ghost Responder";

  return (
    <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">{formTitle}</h1>
        <p className="text-zinc-400 text-center text-sm mt-2">{formSubtitle}</p>
      </div>

      {submissionState.status === 'success' ? (
        <div className="space-y-3">
          <div className="bg-green-500/20 text-green-400 p-4 rounded-lg text-center font-bold border border-green-500/40">
            ✅ Lead Delivered Successfully
          </div>
          <div className="bg-zinc-800 p-3 rounded-lg text-center text-xs text-zinc-400 border border-zinc-700">
            <p className="font-mono">TraceId: {submissionState.traceId}</p>
            {isDemo && (
              <p className="mt-2 text-green-400">
                ✨ Check your phone—your notification should arrive in &lt; 2 seconds!
              </p>
            )}
          </div>
          <button
            onClick={() => setSubmissionState({ status: 'idle' })}
            className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold transition-all"
          >
            {isDemo ? "Send Another Demo" : "Send Another Lead"}
          </button>
        </div>
      ) : submissionState.status === 'error' ? (
        <div className="space-y-3">
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg text-center font-bold border border-red-500/40">
            ❌ Failed to Send Lead
          </div>
          <div className="bg-zinc-800 p-3 rounded-lg text-center text-xs text-zinc-300 border border-zinc-700">
            {submissionState.error}
          </div>
          <button
            onClick={() => setSubmissionState({ status: 'idle' })}
            className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        <form action={handleAction} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name *"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors"
            required
            disabled={submissionState.status === 'loading'}
          />
          <input
            name="address"
            placeholder="Address *"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors"
            required
            disabled={submissionState.status === 'loading'}
          />
          <input
            name="city"
            placeholder="City (optional)"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors"
            disabled={submissionState.status === 'loading'}
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone Number *"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors"
            required
            disabled={submissionState.status === 'loading'}
          />
          <input
            name="service"
            placeholder="Service Type *"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors"
            required
            disabled={submissionState.status === 'loading'}
          />
          <textarea
            name="message"
            placeholder="Additional Notes (optional)"
            className="w-full bg-zinc-800 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors resize-none h-20"
            disabled={submissionState.status === 'loading'}
          />
          <button
            type="submit"
            disabled={submissionState.status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 p-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            {submissionState.status === 'loading' ? (
              <>
                <span className="animate-spin">⚙️</span> Sending...
              </>
            ) : (
              <>{submitButtonText}</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
