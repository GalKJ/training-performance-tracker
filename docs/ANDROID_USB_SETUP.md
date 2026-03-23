# Android USB Development Setup

## 1. Prerequisites

- Android Studio installed (SDK + platform tools)
- A physical Android phone with Developer Options enabled
- USB debugging enabled on the phone

## 2. Verify adb connection

Run:

```bash
adb devices
```

Your phone should appear as `device` (not `unauthorized`).

## 3. Environment checks

If needed, add Android SDK paths to your shell profile:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

Reload your shell and re-run `adb devices`.

## 4. Run the app on the phone

From the project root:

```bash
npm run android
```

This uses `expo run:android` and installs the native build to your connected device.

## 5. Notes

- First native build can take several minutes.
- If Gradle cache issues appear, run `cd android && ./gradlew clean` and retry.
- If Metro port issues appear, run `npx expo start --clear`.
