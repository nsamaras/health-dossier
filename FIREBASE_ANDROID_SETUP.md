# Firebase Configuration for Android

## Important: Add google-services.json

Your app uses Firebase, so you need to configure it for Android.

### Steps to Add Firebase Android Configuration

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `health-dossier`

2. **Add Android App (or download existing config)**
   - Click on "Project Settings" (gear icon)
   - Scroll down to "Your apps" section
   - If Android app exists:
     - Click on the Android icon
     - Download `google-services.json`
   - If Android app doesn't exist:
     - Click "Add app" → Android icon
     - **Android package name**: `com.healthdossier.app`
     - **App nickname**: Health Dossier Android (optional)
     - **Debug signing certificate SHA-1**: Leave blank for now
     - Click "Register app"
     - Download `google-services.json`

3. **Place the file**
   - Copy `google-services.json` to:
     ```
     android/app/google-services.json
     ```

4. **Verify**
   - The file should be automatically detected during build
   - Check build logs for confirmation

### Why This Is Needed

Firebase requires platform-specific configuration files:
- **Web**: Firebase config in `environment.ts` ✓ (already configured)
- **Android**: `google-services.json` ⚠️ (you need to add this)
- **iOS**: `GoogleService-Info.plist` (if you add iOS later)

### Security Note

The `google-services.json` file is already added to `.gitignore` to prevent accidental commits.

If you work in a team, each developer will need to download this file separately from Firebase Console.

### Troubleshooting

**Build error about missing google-services.json?**
- Make sure the file is at: `android/app/google-services.json`
- Verify file name is exactly `google-services.json` (case-sensitive on some systems)

**Push notifications not working?**
- You may need to add the SHA-1 certificate fingerprint in Firebase Console
- Get SHA-1 with: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey`
- Password: `android`

---

**Current Firebase Project**: health-dossier
**Current Package ID**: com.healthdossier.app

