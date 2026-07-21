# Build Directory

This directory contains the compiled output for Render deployment.

## Contents

- `dist/` - Production build artifacts (TypeScript/React compiled files)
- `public/` - Static assets served by the web service

## Building

Run the following command to generate build artifacts:

```bash
npm run build
```

## Deployment

The Render platform will automatically:
1. Run the build command
2. Serve the static files from `./dist`
3. Redirect all routes to `index.html` for SPA routing
