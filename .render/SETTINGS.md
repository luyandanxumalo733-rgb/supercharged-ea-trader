# Render Settings - Copy these values to your Render Dashboard

## Dashboard Configuration

### Name
supercharged-ea-trader

### Branch
main

### Root Directory
(leave empty - uses repository root)

### Build Command
```
npm run build
```

### Publish Directory  
```
dist
```

### Environment Variables

Add these in Render Dashboard Settings → Environment:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| VITE_SUPABASE_URL | https://gqaiqhoyslmjghqnnuym.supabase.co |
| VITE_SUPABASE_PROJECT_ID | gqaiqhoyslmjghqnnuym |
| VITE_SUPABASE_PUBLISHABLE_KEY | sb_publishable_Hco3MoMXhIz2nk9Krm7xcQ_5-SMHOkX |

### Advanced Settings

**Auto-Deploy:** On Commit ✅

**Build Filters - Included Paths:**
```
src/**
package.json
vite.config.ts
tsconfig.json
render.yaml
```

**Build Filters - Ignored Paths:**
```
README.md
*.md
.prettierrc
.prettierignore
.env
docs/**
```
