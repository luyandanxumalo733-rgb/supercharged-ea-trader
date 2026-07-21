# Render Deployment Complete Setup Guide

## Quick Start

Your application is ready to deploy on Render! Follow these steps:

---

## Step 1: Environment Variables for Render Dashboard

When deploying on Render, add these **EXACT** environment variables:

### Required Environment Variables:

| Variable Name | Value | Source |
|---------------|-------|--------|
| `NODE_ENV` | `production` | Standard Node.js |
| `VITE_SUPABASE_URL` | `https://gqaiqhoyslmjghqnnuym.supabase.co` | From your `.env` |
| `VITE_SUPABASE_PROJECT_ID` | `gqaiqhoyslmjghqnnuym` | From your `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_Hco3MoMXhIz2nk9Krm7xcQ_5-SMHOkX` | From your `.env` |

---

## Step 2: Render Dashboard Configuration

**In Render Dashboard, set these exactly:**

### Build Configuration:
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Start Command:** `npm run preview`

### Advanced Settings:

**Build Filters - Included Paths** (trigger rebuilds for):
```
src/**
package.json
vite.config.ts
render.yaml
```

**Build Filters - Ignored Paths** (don't trigger rebuilds):
```
README.md
*.md
.prettierrc
.prettierignore
.env
```

**Auto-Deploy:** `On Commit` ✅

---

## Step 3: Add All Environment Variables

In Render Dashboard:

1. Go to **Environment Variables** section
2. Click **"+ Add Environment Variable"** for each variable below:

### Copy-Paste Format:

```
NODE_ENV = production
VITE_SUPABASE_URL = https://gqaiqhoyslmjghqnnuym.supabase.co
VITE_SUPABASE_PROJECT_ID = gqaiqhoyslmjghqnnuym
VITE_SUPABASE_PUBLISHABLE_KEY = sb_publishable_Hco3MoMXhIz2nk9Krm7xcQ_5-SMHOkX
```

---

## Step 4: Deploy

1. Fill in all the fields as shown above
2. Click **"Deploy Static Site"** button
3. Wait for deployment to complete (2-5 minutes)

---

## What Gets Deployed

- ✅ React 19.2.0 + TanStack Start
- ✅ TypeScript + Vite build system
- ✅ Tailwind CSS styling
- ✅ Radix UI components
- ✅ Supabase integration
- ✅ React Query + React Router
- ✅ All your custom components

---

## After Deployment

### Access Your App:
- URL format: `https://supercharged-ea-trader.onrender.com`

### Monitor Deployment:
- Check Render dashboard logs for errors
- Browser DevTools (F12) to debug runtime issues

### Update Code:
- Push changes to `main` branch
- Render auto-deploys automatically (On Commit enabled)

---

## Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies in `package.json` are correct
- Check build logs in Render dashboard

### App Doesn't Work After Deploy
- Verify all environment variables are set in Render dashboard
- Check browser console (F12) for errors
- Ensure Supabase URL and keys are correct

### Supabase Connection Issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` match exactly
- Check that Supabase project is active

---

## Files Included

- **render.yaml** - Render service configuration
- **.render/build.sh** - Custom build script
- **.render/start.sh** - Custom start script
- **Procfile** - Alternative process definition
- **render-env.example** - Environment variable template

---

## Support

For issues:
1. Check Render deployment logs
2. Review this guide
3. Visit Render documentation: https://render.com/docs

Happy deploying! 🚀
