# Self-Service Demo URLs

## Overview
The demo page is your **sales closer**—it moves prospects from "I believe you" to "I experienced it."

## How It Works

### Demo URL Format
```
https://ghost-responder.com/demo?clientId=CLIENT_ID&name=COMPANY_NAME
```

### Example URLs for Your Targets

**UK Roofers:**
- Henry (High Range Roofing): `https://ghost-responder.com/demo?clientId=UK-ROOF-001&name=High+Range+Roofing`

**US Mold Specialists:**
- Sarah (Mold Control USA): `https://ghost-responder.com/demo?clientId=US-MOLD-002&name=Mold+Control+USA`

## The Experience Flow

1. **Prospect clicks the link** → Lands on personalized demo page with their company name
2. **Fills out the form** → Submits a test lead
3. **Gets a TraceId** → Sees the lead was captured in < 2 seconds
4. **Phone pings** → Telegram notification arrives instantly to their bot
5. **Aha moment** → They realize you built something that actually works

## What Gets Logged

Every demo attempt is tracked in **Ghost Panel** (`/ghost-panel`):
- Test lead appears in the live feed with `clientId`
- Latency is recorded (typically 0.2-0.5 seconds locally)
- If they test 5 times but don't reply to your email, you know they're interested but hesitant

## Architecture

### Files Created
- `src/components/LeadForm.tsx` — Reusable form component (now supports `clientId` and `isDemo` props)
- `src/app/demo/page.tsx` — Demo landing page that reads URL params and personalizes the experience
- **Legacy files deleted:**
  - ❌ `src/app/api/ghost-engine/route.ts` (deprecated 410 endpoint)
  - ❌ `src/app/api/ghost-engine.ts` (deprecated marker file)

### How It Routes

```
GET /demo?clientId=UK-ROOF-001&name=High+Range+Roofing
  ↓
/src/app/demo/page.tsx (reads params)
  ↓
<LeadForm clientId="UK-ROOF-001" isDemo={true} companyName="High Range Roofing" />
  ↓
Form submits to /api/v1/lead-capture with clientId in payload
  ↓
Lead captured, routed to contractor's Telegram bot via CLIENT_REGISTRY
  ↓
Logged in Ghost Panel with client branding
```

## Next Steps

### Immediate (Today)
- [ ] Send demo links to your 11 remaining targets
- [ ] Monitor Ghost Panel for demo attempts
- [ ] Follow up on prospects who test > 3 times with: "Hey [Name], I saw you tested the demo. Want to go live on your site?"

### Coming Soon (Money Guard Phase)
- [ ] Add trial dates to CLIENT_REGISTRY (e.g., `trialEndDate: '2026-02-01'`)
- [ ] Implement billing middleware (`src/middleware/billing.ts`)
- [ ] Create Stripe webhook handler (`src/app/api/v1/billing/webhook/route.ts`)
- [ ] Auto-send alerts when trials expire: "Your Ghost Responder trial ends Feb 1. Click to upgrade."

## Sales Psychology

**The Question in Their Head:** "How do I know this actually works?"

**Your Answer:** A 2-second notification on their phone—no BS, no theory, pure speed.

**Why It Closes Deals:**
- Speed is unforgettable (muscle memory: "Oh wow, I just saw that")
- Self-service removes friction ("I did it myself, it works")
- Proof is instant (no waiting for a demo, no Zoom call needed)
- Reciprocity kicks in ("I tested their thing, I should at least hear their pitch")

Send those links out. The tech is done. The rest is sales.
