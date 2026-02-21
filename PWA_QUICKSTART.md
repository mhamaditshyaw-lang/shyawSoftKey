# TaskMasterPro - PWA & Auto-Start Setup Guide

## ✅ What's Installed

Your TaskMasterPro application now has:

1. **Progressive Web App (PWA)** - Install as native app on desktop/mobile
2. **Service Worker** - Works offline with intelligent caching
3. **Auto-Start** - Server automatically starts when you log in
4. **Server Control Menu** - Easy management tool

---

## 🚀 Quick Start

### Option 1: Automatic Start (Default)
The server will **automatically start** when you log in. Just wait 30-60 seconds after boot.

### Option 2: Manual Start
```bash
npm start
```

### Option 3: Use Server Control Menu
```bash
server-control.bat
```

---

## 📱 Install as PWA

### On Desktop (Windows/Mac/Linux)
1. Open: **http://192.168.70.10:3000**
2. Look for **Install** button (Chrome/Edge address bar)
3. Click **Install** and confirm
4. App appears in: Start Menu / Applications
5. Click to launch as standalone app

### On Mobile (Android/iOS)
1. Open: **http://192.168.70.10:3000** in browser
2. Tap **Menu** (⋮) → **Add to Home Screen**
3. Name: TaskMaster (or custom)
4. Confirm
5. App appears on home screen

---

## 🔧 Server Control Menu

Run this for easy management:
```bash
server-control.bat
```

Options:
- **1** - Start in new window
- **2** - Start in background
- **3** - Stop server
- **4** - Restart server
- **5** - Check status
- **6** - Open in browser
- **7** - View startup folder
- **8** - Rebuild app
- **9** - Exit

---

## 📋 Auto-Start Configuration

### Location
```
C:\Users\[Your Username]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\TaskMasterPro-Server.lnk
```

### How It Works
1. Windows detects shortcut in Startup folder
2. At login, runs `run-server-silent.vbs`
3. This runs `run-server.bat` silently
4. Server starts with correct configuration
5. Accessible at **http://192.168.70.10:3000**

### Disable Auto-Start (Optional)
Delete the shortcut from Startup folder or right-click → Delete

### Enable Auto-Start Again
Run: `create-startup-shortcut.ps1`

---

## 🌐 Access Server

**Default URL**: http://192.168.70.10:3000

**Admin Login**:
- Username: `admin`
- Password: `admin123`

---

## 📝 Service Files

### `run-server.bat`
Main server startup script with environment setup

### `run-server-silent.vbs`
Runs batch file silently (no console window)

### `create-startup-shortcut.ps1`
Creates Windows startup shortcut (PowerShell)

### `server-control.bat`
Interactive menu for server management

---

## 🔍 Troubleshooting

### Server Not Starting
```bash
# Check if port is in use
netstat -ano | find ":3000"

# Kill any existing node process
taskkill /F /IM node.exe

# Then try again
npm start
```

### Auto-Start Not Working
1. Check Startup folder exists (should auto-create)
2. Re-create shortcut: `create-startup-shortcut.ps1`
3. Verify shortcut target path is correct

### Browser Can't Connect
1. Check server is running: `server-control.bat` → Option 5
2. Verify network: Can you ping `192.168.70.10`?
3. Check firewall isn't blocking port 3000
4. Try: http://localhost:3000 (if on same machine)

### PWA Installation Not Showing
1. Browser must be: Chrome, Edge, or Firefox (latest)
2. Needs HTTPS or localhost (HTTP at 192.168.70.10 may have limitations)
3. Try: Refresh page → Wait 3 seconds → Look for install prompt
4. Or manually: Menu → "Install app"

---

## 📊 Files Changed/Added

```
✅ NEW FILES:
- client/src/sw.ts                    (Service Worker)
- client/public/manifest.webmanifest  (PWA Manifest)
- run-server.bat                      (Server startup)
- run-server-silent.vbs               (Silent wrapper)
- create-startup-shortcut.ps1         (Create shortcut)
- server-control.bat                  (Control menu)
- PWA_AUTOSTART_SETUP.md              (Documentation)

✅ MODIFIED FILES:
- vite.config.ts                      (Added VitePWA plugin)
- client/index.html                   (Added PWA meta tags)
- client/src/main.tsx                 (Service worker registration)
- package.json                        (Added vite-plugin-pwa)
```

---

## ⚙️ Environment Variables

Automatically set when server starts:
```
HOST=192.168.70.10
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin
```

---

## 📱 PWA Features

### Works Offline
- Browse previously visited pages without internet
- API calls cached for fallback
- Automatic sync when back online

### Installable
- Desktop: Windows, Mac, Linux
- Mobile: Android, iOS
- Standalone window (no browser UI)
- App icon in taskbar

### Performance
- Cached assets load instantly
- Reduced bandwidth usage
- Works on slow connections

### Caching Strategy
| Type | Method | Duration |
|------|--------|----------|
| API | Network-first | 5 min |
| Images | Cache-first | 7 days |
| Styles | Stale-while-revalidate | Unlimited |
| Scripts | Stale-while-revalidate | Unlimited |

---

## 🎯 Next Steps

1. **Restart your computer** (to test auto-start)
2. **Visit** http://192.168.70.10:3000
3. **Install** the PWA when prompted
4. **Test offline** - disconnect internet and refresh page
5. **Manage** with `server-control.bat`

---

## 📞 Need Help?

Check these files for more details:
- `PWA_AUTOSTART_SETUP.md` - Detailed setup info
- `README.md` - General project info
- `QUICK_START.md` - Quick reference

---

**Setup Date**: December 27, 2025
**Status**: ✅ Complete & Operational
**Version**: TaskMasterPro with PWA v1.0
