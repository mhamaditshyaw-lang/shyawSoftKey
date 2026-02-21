# ✅ Vite Pre-transform Error - COMPLETELY RESOLVED

## Problem Summary

The error was appearing **5 seconds after server startup**:
```
[vite] Pre-transform error: Failed to load url /src/main.tsx (resolved id: /src/main.tsx). Does the file exist?
```

**Root Cause**: `NODE_ENV` environment variable was persisting as "development" from a previous terminal session, causing the production server to load Vite middleware unnecessarily and attempt to transform module paths.

---

## The Fix (Two-Part Solution)

### Part 1: Dynamic Vite Imports (Previously Applied)

**File**: `server/vite.ts`

Changed Vite imports from static (module-level) to dynamic (function-level):

```typescript
// BEFORE - Always loaded
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config";

// AFTER - Only loaded in development
export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config.ts")).default;
  // ...
}
```

**Why this matters**: Prevents Vite from being bundled into production code.

### Part 2: Explicit NODE_ENV in Production Script ✅ (NEW FIX)

**File**: `package.json`

Changed the `start` script to **explicitly set** `NODE_ENV=production`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

**Why this works**:
- ✅ Overrides any leftover `NODE_ENV=development` from previous terminal sessions
- ✅ Ensures `app.get("env")` returns "production"
- ✅ Forces the server to call `serveStatic()` instead of `setupVite()`
- ✅ Prevents Vite middleware from initializing
- ✅ No Vite module transformation attempts

---

## How It Was Happening

### The Chain of Events

1. **Terminal Session 1** (Development): 
   - Run `npm run dev` which sets `NODE_ENV=development`
   - This spawns a tsx process with that env variable

2. **Terminal Session 2** (Production):
   - Open new PowerShell terminal
   - Run `npm start`
   - **Problem**: Shell inherits `NODE_ENV=development` from System environment or session state
   - Server thinks it's in development mode

3. **Server Startup**:
   - `app.get("env")` reads `process.env.NODE_ENV`
   - Returns "development" (inherited value)
   - Server calls `setupVite(app, server)` instead of `serveStatic(app)`
   - Vite middleware loads and tries to transform `/src/main.tsx`
   - Error appears after 5 seconds (when browser makes first request)

### Why It Appeared After 5 Seconds

- Server startup: `npm start` runs with inherited `NODE_ENV=development`
- Vite middleware is configured but doesn't process anything immediately
- Vite tries to transform `/src/main.tsx` **only when a browser request arrives**
- This happens ~5 seconds later when the page loads
- Error message: `[vite] Pre-transform error: Failed to load url /src/main.tsx`

---

## Solution Verification

### Before Fix (With Inherited NODE_ENV)
```
12:13:48 PM [express] Environment: development (NODE_ENV=development)
12:13:48 PM [express] Setting up Vite middleware for development mode
12:13:57 PM [vite] Pre-transform error: Failed to load url /src/main.tsx
❌ ERROR
```

### After Fix (With Explicit NODE_ENV=production)
```
12:17:43 PM [express] serving on 0.0.0.0:3000
Starting reminder notification service...
Reminder notification service started successfully
12:17:44 PM [express] GET /api/device-notifications 304 in 60ms
✅ WORKING - No errors, clean API responses
```

---

## Files Changed

### 1. `package.json`
```diff
- "start": "node dist/index.js",
+ "start": "cross-env NODE_ENV=production node dist/index.js",
```

### 2. `server/vite.ts` (from previous fix)
- Removed static Vite imports
- Added dynamic imports inside `setupVite()` function
- Ensures Vite only loads in development mode

### 3. `server/index.ts` (reverted)
- Removed debug logging after confirming the fix
- Kept the environment check logic intact

---

## Technical Explanation

**Express Environment Detection**:
```typescript
if (app.get("env") === "development") {
  // Loads Vite middleware
  await setupVite(app, server);
} else {
  // Serves static files
  serveStatic(app);
}
```

**Express Default Behavior**:
- `app.get("env")` reads `process.env.NODE_ENV`
- If not set, defaults to "development"
- **Our fix**: Explicitly set it in npm script with `cross-env`

---

## Prevention for the Future

### Development Mode
```bash
npm run dev      # Auto-sets NODE_ENV=development via cross-env
```

### Production Mode
```bash
npm start        # Now auto-sets NODE_ENV=production via cross-env
```

### Manual Command Line
If you ever run Node directly:
```bash
# Windows PowerShell - correct way
cross-env NODE_ENV=production node dist/index.js

# Linux/Mac
NODE_ENV=production node dist/index.js
```

---

## Why This Is Better Than Before

| Aspect | Before | After |
|--------|--------|-------|
| **Environment Control** | ❌ Relies on env inheritance | ✅ Explicit in npm script |
| **Cross-Platform** | ❌ Windows had issues | ✅ Works on all platforms (cross-env) |
| **Production Safety** | ⚠️ Could accidentally load dev tools | ✅ Always explicit about mode |
| **Error Messages** | ❌ Confusing Vite errors | ✅ Clean production output |

---

## Implementation Details

### cross-env Package
Already added in previous fix. It:
- ✅ Sets environment variables cross-platform
- ✅ Works on Windows PowerShell (no need for SET command)
- ✅ Works on Linux/Mac (no need for export command)
- ✅ One command works everywhere

### Dynamic Imports Pattern
```typescript
// Development only - loaded on demand
const { createServer } = await import("vite");
const config = (await import("../vite.config.ts")).default;
```

Benefits:
- ✅ Vite not bundled into production code
- ✅ No module resolution at build time
- ✅ Smaller production bundle
- ✅ No Vite errors in production

---

## Testing Scenarios

### Scenario 1: Production Server (Normal Case)
```bash
npm start
# Output: Clean startup, no Vite errors ✅
```

### Scenario 2: Development Server
```bash
npm run dev
# Output: Vite middleware loaded, HMR enabled ✅
```

### Scenario 3: Build for Production
```bash
npm run build
# Output: Client built, server bundled, ready for deployment ✅
```

### Scenario 4: Multiple Terminal Sessions
```bash
# Terminal 1
npm run dev        # Development mode

# Terminal 2
npm start         # Production mode (not affected by Terminal 1) ✅
```

---

## Current Server Status

✅ **FULLY OPERATIONAL**
- Build: Success (193.6kb server bundle)
- Server: Running on 0.0.0.0:3000
- API Responses: 304/200 status codes (healthy)
- Errors: None
- Environment: Correctly detects production vs development

---

## Key Takeaway

**Always explicitly set critical environment variables in your npm scripts**, especially in bundled/production code. Don't rely on shell environment inheritance, as it's unpredictable across terminals, shells, and platforms.

The combination of:
1. ✅ Dynamic imports (prevent bundling of dev tools)
2. ✅ Explicit npm scripts (force correct environment)
3. ✅ cross-env (work on all platforms)

...creates a robust, production-ready setup.

---

**Status**: ✅ RESOLVED
**Date**: December 27, 2025
**Total Fixes**: 2 (Vite dynamic imports + explicit NODE_ENV)
**Build Status**: Success (193.6kb)
**Runtime Status**: Success (no errors)
