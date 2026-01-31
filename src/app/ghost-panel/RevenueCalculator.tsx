"use client";

import { useMemo, useState } from "react";

export default function RevenueCalculator({ deliveredCount }: { deliveredCount: number }) {
  const [avgJobValue, setAvgJobValue] = useState(5000);
  const revenue = useMemo(() => avgJobValue * deliveredCount, [avgJobValue, deliveredCount]);

  return (
    <div className="mt-3 space-y-3">
      <label className="block text-xs text-zinc-500">Avg. Job Value</label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">$</span>
        <input
          type="number"
          min={0}
          value={avgJobValue}
          onChange={(event) => setAvgJobValue(Number(event.target.value))}
          className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white"
          name="avgJobValue"
        />
      </div>
      <div className="text-xs text-zinc-500">
        Ghost Responder has protected <span className="text-green-400 font-semibold">${revenue.toLocaleString()}</span> this week.
        <input
          type="range"
          min={100}
          max={20000}
          step={100}
          value={avgJobValue}
          onChange={(event) => setAvgJobValue(Number(event.target.value))}
          className="mt-3 w-full accent-green-400"
        />
      </div>
    </div>
  );
}
