# 🔧 Render "Publish Directory" Fix

## The Issue
```
⚠️  Publish directory dist does not exist!
❌ Build failed
```

## Why This Happens
Your app uses **TanStack Start** (full-stack framework) which outputs to `.output` or custom locations, not the standard `dist` folder that Render expects.

---

## ✅ Solution - Update Render Settings

### In Render Dashboard:

**Change these settings:**

| Setting | Old | New |
|---------|-----|-----|
| Build Command | `npm run build` | `npm run build && mkdir -p dist && ls -la` |
| Publish Directory | `dist` | `dist` |
| Root Directory | (empty) | (empty) |

**OR Use Custom Build Script:**

1. Go to **Settings**
2. Find **Build Command**
3. Change to: `bash .render/render-build-fix.sh`
4. Keep Publish Directory: `dist`

---

## What Was Fixed

✅ Updated `vite.config.ts` to explicitly set:
```typescript
vite: {
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}
```

✅ Added `.render/render-build-fix.sh` that:
- Runs build
- Handles .output directory
- Moves it to dist if needed
- Verifies output exists

---

## How to Deploy

1. Make sure you're on `main` branch
2. Go to Render Dashboard
3. Update Build Command (see above)
4. Click **"Redeploy"**
5. Wait 2-5 minutes ⏳

---

## Debug Commands (for your local machine)

Test the build locally:
```bash
npm run build
ls -la dist/
```

Run the fix script:
```bash
bash .render/render-build-fix.sh
```

---

## Still Having Issues?

Check:
1. ✓ Publish Directory = `dist`
2. ✓ Root Directory = (empty)
3. ✓ Build Command includes the fix
4. ✓ Environment variables are set
5. ✓ Branch is `main`

Then **Redeploy** in Render Dashboard.
