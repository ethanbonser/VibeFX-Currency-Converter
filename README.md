# VibeFX Currency Converter (v1.0.0)

A sleek, cozy-neon Progressive Web App (PWA) currency converter purpose-built for **Google Chrome on Android**. 

🌐 **Live Permanent URL on GitHub Pages**:  
👉 **[https://ethanbonser.github.io/VibeFX-Currency-Converter/](https://ethanbonser.github.io/VibeFX-Currency-Converter/)**

Engineered with mobile-first ergonomics, full offline caching, Android haptic feedback, native Web Share sheet integration, an on-screen tactile math keypad, and real-time live exchange rate feeds covering **160+ world currencies**.

---

## ✨ Features Tailored for Chrome on Android

- **📱 True Progressive Web App (PWA) (v1.0.0)**
  - Seamlessly installable via Chrome's native *"Add to Home screen"* or *"Install app"* banner.
  - Standalone fullscreen display (`display: standalone`) that hides browser URL chrome for an authentic native Android app feel.
  - Safe-area inset support (`env(safe-area-inset-*)`) designed around Android front camera cutouts and navigation pills.

- **⚡ Offline-First Architecture**
  - Powered by Service Worker (`sw.js`) with cache-first and stale-while-revalidate strategies.
  - Bundled with a comprehensive baseline rate matrix for 160+ world currencies and top cryptocurrencies (BTC, ETH, SOL).
  - Automatically caches the latest rates in `localStorage` and Indexed Cache so the app functions 100% offline in airplane mode.

- **📳 Android Tactile Haptics**
  - Native `navigator.vibrate` integration on keypresses, currency swaps, and copy actions.
  - Can be toggled on/off in the Preferences & Tools menu.

- **⌨️ Dual Input Modes**
  - **Tactile On-Screen Keypad**: Thumb-friendly buttons with built-in calculator operators (`+`, `−`, `×`, `÷`, `=`). Calculate split bills, tips, or multi-item purchases before converting without clunky keyboard shifts.
  - **Native Android Keyboard Mode**: Toggle with one tap to open Gboard/Samsung Keyboard with `inputmode="decimal"`.

- **📤 Native Web Share Sheet**
  - Tap **Share** to invoke Android's native bottom share sheet (`navigator.share`) to send exchange breakdowns directly to WhatsApp, Telegram, SMS, or Google Keep.
  - One-tap **Copy** to clipboard with haptic confirmation and toast notifications.

- **📊 Multi-Currency Live Watchlist**
  - Real-time comparison grid displaying converted values across your favorite currencies (e.g., EUR, GBP, JPY, CAD, AUD, MXN) simultaneously as you type.
  - Add or remove custom currencies with persistent state.

- **📜 Conversion History Tape**
  - Pin important conversions to a local history reel.
  - Tap any saved historical entry to instantly reload the currencies and amounts.

- **🔍 Smart Currency Search & Region Filters**
  - Bottom-sheet drawer with instant fuzzy search by currency code (e.g., `JPY`), currency name (`Yen`), or country name (`Japan`).
  - Region filter chips: *All*, *Popular*, *Americas*, *Europe*, *Asia-Pacific*, *Middle East*, *Africa*, and *Crypto*.

- **🎨 Cozy / Neon Aesthetic**
  - Midnight space-black palette (`#090a10`), glowing neon cyan (`#00f2fe`), neon violet (`#a855f7`), and emerald status indicators (`#10b981`).
  - Frosted glassmorphism panels with smooth hardware-accelerated animations.

---

## 📁 File Structure

```text
Currency-Converter-Android (v1.0.0)/
├── index.html                 # Mobile-first semantic HTML5 layout & PWA meta tags
├── styles.css                 # Cozy-neon responsive stylesheet optimized for mobile touch
├── app.js                     # Core application logic, math engine, Web Share, & haptics
├── currencies.js              # Comprehensive currency database with fallback exchange rates
├── sw.js                      # Service Worker (v1.0.0) for offline caching & background sync
├── manifest.webmanifest       # Chrome Android PWA manifest (standalone, theme colors, icons)
├── icon.svg                   # Scalable vector logo with glowing neon arrows
├── icon-192.png               # High-res PWA icon (192x192)
├── icon-512.png               # High-res PWA icon (512x512)
├── icon-maskable-512.png      # Android adaptive maskable icon (512x512)
├── favicon.png                # Browser favicon
├── serve.py                   # Local development server with ASCII QR Code generator
├── start_server.bat           # 1-Click Windows launcher
├── update_rates.py            # Utility script to re-fetch and refresh baseline currencies.js
└── README.md                  # Project documentation (v1.0.0)
```

---

## 🚀 How to Run & Test on Chrome for Android

### Method 1: Local Wi-Fi with QR Code (Recommended)
1. Double-click `start_server.bat` (or run `python serve.py` from the project folder in terminal).
2. The terminal displays your local LAN IP (e.g., `http://192.168.0.110:8080`) and prints an **ASCII QR Code**.
3. Open your Android phone's camera, point it at the QR code on your computer screen, and tap to open in **Chrome for Android**.
4. In Chrome on Android:
   - Tap the **Install on Android** banner at the top, or
   - Tap the three dots menu (**⋮**) in Chrome $\rightarrow$ select **"Install app"** or **"Add to Home screen"**.
5. Once added, launch VibeFX from your Android home screen or app drawer. It will launch as an app with no browser URL bar!

### Method 2: Chrome Remote Debugging & Port Forwarding
1. Connect your Android phone to your PC with a USB cable (with USB debugging enabled).
2. In desktop Chrome, open `chrome://inspect/#devices`.
3. Under **Port forwarding**, map port `8080` to `localhost:8080`.
4. On your Android phone, open Chrome and navigate to `http://localhost:8080`.

### Method 3: Deploying Online (Free HTTPS for Full PWA Features)
To make your currency converter accessible anywhere in the world:
- **GitHub Pages**: Push this directory to a GitHub repository, open **Settings** $\rightarrow$ **Pages** $\rightarrow$ select `main` branch.
- **Vercel / Netlify**: Drag and drop this folder directly into [Vercel](https://vercel.com) or [Netlify Drop](https://app.netlify.com/drop).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Pure modern Vanilla JavaScript (ES modules), HTML5, CSS3 Custom Properties. Zero heavy external dependencies or bundlers required.
- **API Feed**: `open.er-api.com` (CORS-enabled, free, high-availability exchange rates feed updated daily).
- **Offline Storage**: Cache Storage API + `localStorage` for rates and preferences.
- **Haptics API**: `navigator.vibrate` for native Android device vibrations.
- **Share API**: `navigator.share` triggering Android's native intent picker.

---

## 📝 License & Credits
Developed by ChillVibez Studios &bull; Version (v1.0.0).
Free to use and modify for personal and travel finance!

---

## 👤 Author & Studio

**Ethan Tyler Bonser of ChillVibez Studios/Labs**  
- **Author**: Ethan Tyler Bonser  
- **Studio**: ChillVibez Studios & ChillVibez Labs  
- **Repository**: Private Repository
