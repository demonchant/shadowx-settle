# ✅ DEPLOYMENT CHECKLIST

Follow these steps in order for flawless deployment!

---

## ☑️ Step 1: Push to GitHub

```bash
cd ~/Downloads/shadowx-settle

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "ShadowX Settle - Colosseum 2026 Hackathon Submission"

# Create GitHub repo at: https://github.com/new
# Name: shadowx-settle
# Public repo
# Don't initialize with README

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/shadowx-settle.git

# Push
git branch -M main
git push -u origin main
```

**✅ Done! Your code is on GitHub**

---

## ☑️ Step 2: Deploy Trading App to Vercel

1. Go to: **https://vercel.com/new**
2. Click "Import Git Repository"
3. Connect GitHub (if not connected)
4. Select `shadowx-settle`
5. Configure:
   - **Project Name:** `shadowx-app`
   - **Root Directory:** `app`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**
7. Wait 2-3 minutes ⏳
8. **Copy your URL:** `https://shadowx-app.vercel.app`

**✅ Trading app is live!**

---

## ☑️ Step 3: Deploy Marketing Page to Vercel

1. Go to: **https://vercel.com/new** (new project)
2. Import same repository
3. Configure:
   - **Project Name:** `shadowx-marketing`
   - **Root Directory:** `apps/web/public`
   - **Framework Preset:** Other
   - **Build Command:** Leave empty
   - **Output Directory:** `.`
4. Click **Deploy**
5. Wait 1-2 minutes ⏳
6. **Copy your URL:** `https://shadowx-marketing.vercel.app`

**✅ Marketing page is live!**

---

## ☑️ Step 4: Update Marketing Links

Now update the marketing page to point to the live trading app:

```bash
cd ~/Downloads/shadowx-settle/apps/web/public

# Replace localhost with your actual Vercel URL
# Example: https://shadowx-app.vercel.app

sed -i 's|http://localhost:5173|https://shadowx-app.vercel.app|g' index.html

# Verify changes
grep "shadowx-app.vercel.app" index.html

# Commit
git add index.html
git commit -m "Update to production trading app URL"

# Push
git push
```

Vercel will **auto-redeploy** your marketing page in ~1 minute!

**✅ Links updated!**

---

## ☑️ Step 5: Test Everything

### Test Marketing Page:
1. Open `https://shadowx-marketing.vercel.app`
2. Click "Launch Trading App" button
3. Should open `https://shadowx-app.vercel.app` in new tab

### Test Trading App:
1. Open `https://shadowx-app.vercel.app`
2. Click "Connect Wallet"
3. Connect Phantom or Solflare
4. See pool stats loading from Solana devnet
5. Try the buy/sell interface

**✅ Everything works!**

---

## ☑️ Step 6: Update README with Live Links

```bash
cd ~/Downloads/shadowx-settle

# Edit README.md - replace the demo URLs
sed -i 's|\[Coming Soon - Deploy to Vercel\]|https://shadowx-app.vercel.app|g' README.md

# Commit
git add README.md
git commit -m "Add live demo links"
git push
```

**✅ README updated!**

---

## ☑️ Step 7: Prepare Hackathon Submission

Create a submission file with all your links:

```markdown
# ShadowX Settle - Colosseum 2026 Submission

## Live Demos
- Trading App: https://shadowx-app.vercel.app
- Marketing Page: https://shadowx-marketing.vercel.app
- GitHub Source: https://github.com/YOUR_USERNAME/shadowx-settle

## Solana Program
- Program ID: 4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt
- Network: Solana Devnet
- Explorer: https://explorer.solana.com/address/4GSUVffLEXNkL6i5TJL2dhSDuuubhagqfaRigo2xwKQt?cluster=devnet

## Pool Initialization
- Transaction: https://explorer.solana.com/tx/46HRj6vpE33tkfJP31PBEef9QccKpfvFYtTj5emcyKWw6UsbqvQpBwud65eDR9MwxZxsMoeQnC6ZyfTmCEwGaUjZ?cluster=devnet

## Tech Stack
- Solana + Anchor
- Arcium MPC
- React + TypeScript
- Vite + Tailwind CSS

## Features
- ✅ Encrypted intent submission
- ✅ Real-time pool stats (live from blockchain)
- ✅ Beautiful dark-themed UI
- ✅ Wallet integration
- ✅ On-chain program deployed and initialized

## Team
Wizardskull - Lagos, Nigeria
```

**✅ Ready to submit!**

---

## 📊 Final Checklist

- [ ] Code pushed to GitHub
- [ ] Trading app deployed to Vercel
- [ ] Marketing page deployed to Vercel
- [ ] Marketing links point to trading app
- [ ] README updated with live URLs
- [ ] Both apps tested and working
- [ ] Wallet connection works
- [ ] Pool stats load from devnet
- [ ] Submission file prepared

---

## 🎉 You're Done!

Your project is live and ready for judging!

**Your URLs:**
- Trading: `https://shadowx-app.vercel.app`
- Marketing: `https://shadowx-marketing.vercel.app`
- GitHub: `https://github.com/YOUR_USERNAME/shadowx-settle`

---

## 💡 Pro Tips

1. **Custom Domain (Optional):**
   - In Vercel → Project Settings → Domains
   - Add `app.shadowx.com` for trading app
   - Add `shadowx.com` for marketing

2. **Environment Variables:**
   - If you add RPC keys later
   - Vercel → Settings → Environment Variables

3. **Auto-Deploy:**
   - Vercel watches your GitHub repo
   - Every `git push` auto-deploys
   - No manual steps needed!

---

## 🆘 Troubleshooting

### "Vercel build failed"
Check build logs, ensure `npm run build` works locally

### "404 on marketing page"
Verify root directory is `apps/web/public`

### "Wallet won't connect"
This is normal on first try, refresh and try again

### "Stats not loading"
Check browser console for RPC errors, devnet might be slow

---

**Questions? Everything working? Time to submit to Colosseum! 🚀**
