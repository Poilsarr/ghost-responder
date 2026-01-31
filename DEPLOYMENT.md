# 📋 Ghost Responder - Deployment Checklist

## Pre-Deployment ✅

- [ ] All environment variables in `.env.local`:
  - `TELEGRAM_BOT_TOKEN` 
  - `TELEGRAM_CHAT_ID`
- [ ] Run `npm run build` - builds without errors
- [ ] Run `npm run lint` - no lint errors
- [ ] Test locally with `npm run dev`
- [ ] Form submits successfully
- [ ] Message arrives in Telegram within 2 seconds
- [ ] Check terminal for `✅ SUCCESS` logs

---

## Files Ready for Deployment ✅

```
src/app/
├── api/
│   └── ghost-engine.ts          ⚡ Core API
├── actions.ts                   🔧 Server Action
└── page.tsx                      🎨 UI Component

vercel.json                       🔄 Cron Config
package.json                      📦 With axios
```

---

## Deployment Steps

### Step 1: Verify All Changes
```bash
cd "/Users/kushagarhsingh/Desktop/context/lead Ghost/ghost-responder"
git status
```

You should see:
- `M  src/app/page.tsx` (modified)
- `M  src/app/actions.ts` (modified)
- `A  src/app/api/ghost-engine.ts` (new)
- `M  package.json` (modified)
- `A  vercel.json` (new)
- `A  GHOST_ENGINE_ARCHITECTURE.md` (new)
- `A  QUICK_START.md` (new)

### Step 2: Build & Test
```bash
npm run build
npm run lint
```

**Expected output:**
- ✅ Build successful
- ✅ No lint errors
- ✅ Ready to deploy

### Step 3: Commit Changes
```bash
git add .
git commit -m "feat: upgrade to production-grade Ghost Engine

- Add schema validation
- Implement structured logging with TraceIds
- Create extravagant HTML Telegram messages
- Add error handling and recovery
- Configure Vercel cron job for warm starts
- Enhance UI with loading states and error handling"
```

### Step 4: Push to GitHub
```bash
git push origin main
```

### Step 5: Vercel Auto-Deploy
- Vercel watches your repo
- Automatically builds on push
- Deploys within 1-2 minutes
- Cron jobs activate immediately

---

## Post-Deployment Verification ✅

### 1. Check Build Success
- Go to **Vercel Dashboard**
- Select your project
- Look for green checkmark next to latest commit
- Build should take 30-60 seconds

### 2. Test Live Endpoint
```bash
curl -X GET https://your-domain.vercel.app/api/ghost-engine

# Should respond:
# {"status":"healthy","engine":"Ghost Responder Pro","timestamp":"..","uptime":...}
```

### 3. Test via Web UI
- Visit https://your-domain.vercel.app
- Fill out the form
- Click "Send Lead to Ghost Responder"
- Should arrive in Telegram within 2 seconds

### 4. Check Logs
- Go to **Vercel Dashboard → Logs**
- Look for `[ID: XXX]` entries
- Should see structured logs with timestamps

### 5. Verify Cron Job
- Go to **Vercel Dashboard → Settings → Cron Jobs**
- Should show: `GET /api/ghost-engine` at `*/10 * * * *`
- Status should be "Active"

---

## First Week Monitoring 📊

### Daily:
- [ ] Test form submission
- [ ] Verify message arrives in Telegram
- [ ] Check Vercel logs for any errors

### Weekly:
- [ ] Review log patterns
- [ ] Check response times (should be <500ms)
- [ ] Monitor error rate (should be 0%)

---

## Troubleshooting Deployment Issues

### Issue: Build fails
**Solution:**
1. Run `npm run build` locally
2. Fix any errors
3. Re-commit and push

### Issue: Cron job not showing
**Solution:**
1. Verify `vercel.json` is in root folder
2. Re-deploy: `vercel --prod`
3. Wait 5 minutes for activation

### Issue: Telegram messages not arriving
**Solution:**
1. Check `.env.local` credentials in Vercel
2. Search logs for `🔴 CRITICAL ERROR`
3. Check TraceId in error response

### Issue: Slow first request after cron
**Solution:**
1. Normal - cron warms it up
2. Should be fixed within 10 minutes
3. All subsequent requests will be fast

---

## Environment Setup on Vercel

### Via Dashboard:
1. **Project Settings → Environment Variables**
2. Add:
   - Key: `TELEGRAM_BOT_TOKEN` / Value: `your_token`
   - Key: `TELEGRAM_CHAT_ID` / Value: `your_chat_id`
3. Save & redeploy

### Via Vercel CLI:
```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel --prod  # Redeploy
```

---

## Rollback (If Needed)

### Quick Rollback:
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys the previous version
```

### Stay on Old Version:
```bash
git reset --hard HEAD~1
git push origin main --force
```

---

## Success Metrics

After deployment, you should see:

| Metric | Target | Actual |
|--------|--------|--------|
| **Build Time** | <2 min | ✅ |
| **Response Time** | <500ms | ✅ |
| **Telegram Delivery** | <2s | ✅ |
| **Error Rate** | <1% | ✅ |
| **Uptime** | >99% | ✅ |

---

## Next Steps (Optional)

After successful deployment:

1. **Add Database** - Store all leads with timestamps
2. **Email Notifications** - Send confirmation emails
3. **Dashboard** - View all leads with analytics
4. **SMS Backup** - Send SMS if Telegram fails
5. **Rate Limiting** - Prevent spam submissions

---

## Support

**Got stuck?**
1. Check [GHOST_ENGINE_ARCHITECTURE.md](./GHOST_ENGINE_ARCHITECTURE.md)
2. Review [QUICK_START.md](./QUICK_START.md)
3. Search Vercel logs with TraceId
4. Check environment variables setup

---

**Deployment Date:** January 27, 2026
**Status:** Ready for Production 🚀
