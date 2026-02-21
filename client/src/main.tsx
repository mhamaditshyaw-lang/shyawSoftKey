import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";

// Register PWA service worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(new URL("./sw.ts", import.meta.url), {
        type: "module",
      })
      .then((registration) => {
        console.log("✓ Service Worker registered successfully");
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.warn("⚠ Service Worker registration failed:", error);
      });
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("✓ New service worker activated");
  });
}

createRoot(document.getElementById("root")!).render(<App />);
