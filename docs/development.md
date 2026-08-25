# NeoTunes Development & Build Guide

## 1. Local Development Setup

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Access Web App
http://localhost:3002
```

---

## 2. Type Check & Verification

```bash
# Run TypeScript compilation check
npx tsc --noEmit
```

---

## 3. Android APK Compilation

```bash
# Navigate to android directory and compile Debug APK
cd android
gradlew.bat assembleDebug
```

Output APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`.
