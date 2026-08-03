# Harbor Google TV / Android TV Conversion Guide

This document provides complete instructions for building Harbor as a native Google TV / Android TV application.

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 22.04+ recommended), macOS 11+, or Windows 10/11
- **Disk Space**: Minimum 20GB free space
- **RAM**: Minimum 8GB (16GB recommended)
- **Node.js**: v20+ 
- **pnpm**: v9+
- **Rust**: 1.75+
- **Android Studio**: Arctic Fox or newer
- **Android SDK**: API levels 29-34
- **Android NDK**: r27 (version 27.0.12077973)
- **Java JDK**: 17+

### Install Android SDK and NDK

```bash
# Install Android Studio and command-line tools
# Then install required SDK components:

sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "ndk;27.0.12077973"

# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.0.12077973
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## Project Configuration

### 1. Tauri Android Configuration

The project uses `tauri.tv.conf.json` for TV-specific configuration:

```json
{
  "bundle": {
    "targets": ["apk", "aab"],
    "android": {
      "minSdkVersion": 29,
      "targetSdkVersion": 34,
      "compileSdkVersion": 34,
      "ndkVersion": "27.0.12077973",
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "FOREGROUND_SERVICE",
        "WAKE_LOCK"
      ],
      "leanbackLaunchActivity": "app.harbor.MainActivity",
      "tvBanner": "@mipmap/ic_banner",
      "tvConfig": {
        "required": false,
        "supportsLeanback": true
      }
    }
  }
}
```

### 2. Android Manifest Updates

Create or update `src-tauri/gen/android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- TV Feature Declarations -->
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application
        android:banner="@mipmap/ic_banner"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.Harbor">
        
        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="landscape"
            android:stateNotNeeded="true">
            
            <!-- Standard launcher intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Leanback launcher intent for Android TV -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## TV Banner Icon

Create TV banner images (320x180 pixels) in the following locations:

```
src-tauri/icons/android/mipmap-hdpi/ic_banner.png
src-tauri/icons/android/mipmap-xhdpi/ic_banner.png
src-tauri/icons/android/mipmap-xxhdpi/ic_banner.png
src-tauri/icons/android/mipmap-xxxhdpi/ic_banner.png
```

The banner should:
- Be 320x180 pixels (16:9 aspect ratio)
- Have no text overlay
- Use high contrast colors
- Represent the app brand clearly

## Building for Android TV

### Development Build

```bash
# Install dependencies
pnpm install

# Setup binaries and fonts
pnpm run setup

# Build for Android (debug APK)
pnpm tauri android dev --config src-tauri/tauri.tv.conf.json
```

### Release APK

```bash
# Build release APK
pnpm tauri android build --config src-tauri/tauri.tv.conf.json --apk

# Output: src-tauri/target/aarch64-linux-android/release/app.harbor.apk
```

### Android App Bundle (AAB) for Google Play

```bash
# Build AAB
pnpm tauri android build --config src-tauri/tauri.tv.conf.json --aab

# Output: src-tauri/target/aarch64-linux-android/release/app.harbor.aab
```

### Signed Release Build

1. Generate a keystore:
```bash
keytool -genkey -v -keystore harbor-release-key.keystore -alias harbor -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `src-tauri/.android-signing.json`:
```json
{
  "keystorePath": "/path/to/harbor-release-key.keystore",
  "keystorePassword": "your-keystore-password",
  "keyAlias": "harbor",
  "keyPassword": "your-key-password"
}
```

3. Build with signing:
```bash
pnpm tauri android build --config src-tauri/tauri.tv.conf.json --sign
```

## TV-Specific Optimizations

### 1. Focus Navigation

The existing keyboard navigation system (`src/lib/keyboard-navigation.ts`) already supports D-pad navigation. Key mappings:

- Arrow keys → D-pad directions
- Enter/Space → Center/Select button
- Escape/Back → Back button
- Menu button → Context menu

### 2. TV UI Components

All interactive elements must support focus states. The focus system provides:
- Animated focus indicator
- Scaling effect on focused items
- Glow effect
- Focus memory and restoration
- Nested focus groups
- Grid and list navigation

### 3. Video Playback Optimization

For hardware-accelerated playback on Android TV:

```typescript
// Enable hardware decoding in player settings
{
  hwdec: "mediacodec",
  vo: "gpu",
  gpu-context: "android",
  hwdec-codecs: "h264,hevc,vp9,av1"
}
```

### 4. Performance Tuning

Key optimizations for low-end TV hardware:

- Enable GPU acceleration
- Use efficient caching strategies
- Lazy load content
- Optimize image sizes for TV resolutions
- Reduce animation complexity on lower-end devices

## Testing on Android TV Emulator

### Create TV Emulator

1. Open Android Studio → Device Manager
2. Create new device → Select TV (1080p)
3. Choose system image: Android TV 13 or 14
4. Enable hardware acceleration

### Run on Emulator

```bash
# List available emulators
pnpm tauri android list-devices

# Run on specific emulator
pnpm tauri android dev --target emulator-5554
```

## Testing on Physical Devices

### Enable Developer Mode

1. Settings → About → Build number (tap 7 times)
2. Settings → Developer options → USB debugging (enable)
3. Connect device via USB

### Deploy to Device

```bash
# List connected devices
pnpm tauri android list-devices

# Deploy to device
pnpm tauri android dev --target <device-id>
```

## Google Play Store Submission

### Requirements for TV Apps

1. **TV Banner**: Required for Google Play TV listing
2. **Leanback Support**: Must declare leanback launcher category
3. **Landscape Orientation**: App must support landscape mode
4. **D-pad Navigation**: All features must be navigable with remote
5. **No Touchscreen Requirement**: Must work without touchscreen

### AAB Upload

1. Build signed AAB
2. Go to Google Play Console
3. Create new release
4. Upload AAB file
5. Complete store listing with TV screenshots
6. Submit for review

## Troubleshooting

### Common Issues

**Build fails with "SDK not found"**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/27.0.12077973
```

**APK crashes on launch**
- Check logcat: `adb logcat | grep harbor`
- Verify all permissions are declared
- Ensure leanback feature is declared as optional if not required

**Focus navigation issues**
- Verify all interactive elements have proper focus attributes
- Check keyboard-navigation.ts for custom focus handling
- Test with actual TV remote, not just keyboard

**Video playback issues**
- Enable hardware decoding in player settings
- Check codec support on target device
- Verify media permissions

## Supported Devices

Tested and supported devices:
- Google TV Streamer
- Chromecast with Google TV (HD & 4K)
- NVIDIA Shield TV / Shield TV Pro
- Sony BRAVIA TVs with Google TV
- TCL TVs with Google TV
- Hisense TVs with Google TV
- Philips TVs with Google TV
- Xiaomi Mi Box / Mi Stick
- Onn Google TV devices

## Architecture Overview

```
Harbor Android TV App
├── Frontend (React 19 + TypeScript)
│   ├── TV-optimized UI components
│   ├── Focus navigation engine
│   ├── Remote control handlers
│   └── Responsive layouts
├── Tauri v2 Runtime
│   ├── Android WebView
│   ├── Rust backend
│   └── Native bridges
├── Harbor Core (Rust/WASM)
│   ├── Stream processing
│   ├── Torrent engine
│   └── Media handling
└── Android Integration
    ├── MediaSession
    ├── Picture-in-Picture
    ├── Background services
    └── Deep links
```

## Next Steps

1. Set up development environment with Android SDK/NDK
2. Install project dependencies: `pnpm install`
3. Generate Android project: `pnpm tauri android init`
4. Add TV banner icons
5. Configure signing for release builds
6. Test on emulator or physical device
7. Optimize performance for target devices
8. Build release APK/AAB
9. Submit to Google Play Store (optional)

## Resources

- [Tauri v2 Android Documentation](https://v2.tauri.app/start/prerequisites/)
- [Android TV Developer Guide](https://developer.android.com/docs/tv)
- [Google TV Design Guidelines](https://design.google/library/ designing-for-google-tv/)
- [Android TV Best Practices](https://developer.android.com/docs/tv/fundamentals/best-practices)
