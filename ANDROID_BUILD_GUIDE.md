# Android Play Store Build Guide

This guide will help you build and publish the Health Dossier app to the Google Play Store.

## Prerequisites

1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java Development Kit (JDK)** - Version 11 or higher
3. **Google Play Console Account** - https://play.google.com/console (one-time $25 fee)

## Project Setup Complete ✓

The following has been configured:
- ✓ Capacitor installed and initialized
- ✓ Android platform added
- ✓ App ID: `com.healthdossier.app`
- ✓ App Name: `Health Dossier`
- ✓ Android permissions configured (Internet, Storage, Camera)
- ✓ Build scripts added to package.json

## Building the Android App

### Step 1: Build the Angular App
```bash
npm run build:android
```
This command:
- Builds the Angular app in production mode
- Syncs the built files to the Android project

### Step 2: Open Android Studio
```bash
npm run open:android
```
Or manually open Android Studio and open the `android` folder.

### Step 3: Test on Emulator/Device
1. In Android Studio, click on the device dropdown
2. Select an emulator or connected physical device
3. Click the green "Run" button

## Preparing for Play Store Release

### 1. Generate a Keystore (One-time setup)

Open PowerShell in the project directory and run:
```powershell
keytool -genkey -v -keystore health-dossier-release.keystore -alias health-dossier -keyalg RSA -keysize 2048 -validity 10000
```

This will ask for:
- **Keystore password**: Choose a strong password (save it securely!)
- **Alias password**: Can be the same or different
- Your name, organization, city, state, country

**IMPORTANT**: Store the keystore file and passwords securely! You'll need them for all future updates.

### 2. Configure Signing in Android Studio

#### Option A: Using Android Studio UI
1. Open Android Studio
2. Go to `Build` → `Generate Signed Bundle / APK`
3. Select `Android App Bundle`
4. Choose the keystore file you created
5. Enter the passwords
6. Select `release` build variant
7. Click `Finish`

#### Option B: Using gradle.properties (Not recommended for security)
Create/edit `android/gradle.properties`:
```properties
HEALTH_DOSSIER_RELEASE_STORE_FILE=../health-dossier-release.keystore
HEALTH_DOSSIER_RELEASE_KEY_ALIAS=health-dossier
HEALTH_DOSSIER_RELEASE_STORE_PASSWORD=your_keystore_password
HEALTH_DOSSIER_RELEASE_KEY_PASSWORD=your_alias_password
```

Then update `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('HEALTH_DOSSIER_RELEASE_STORE_FILE')) {
                storeFile file(HEALTH_DOSSIER_RELEASE_STORE_FILE)
                storePassword HEALTH_DOSSIER_RELEASE_STORE_PASSWORD
                keyAlias HEALTH_DOSSIER_RELEASE_KEY_ALIAS
                keyPassword HEALTH_DOSSIER_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release AAB (Android App Bundle)

In Android Studio:
1. Go to `Build` → `Generate Signed Bundle / APK`
2. Select `Android App Bundle` (recommended by Google)
3. Follow the signing wizard
4. The AAB will be generated at: `android/app/release/app-release.aab`

Or via command line (if gradle.properties is configured):
```bash
cd android
./gradlew bundleRelease
```

## Publishing to Google Play Store

### 1. Create App in Play Console
1. Go to https://play.google.com/console
2. Click `Create app`
3. Fill in app details:
   - **App name**: Health Dossier
   - **Default language**: Greek (or your preference)
   - **App or game**: App
   - **Free or paid**: (Your choice)

### 2. Store Listing
Fill in required information:
- **App name**: Health Dossier
- **Short description**: Brief description (max 80 characters)
- **Full description**: Detailed description (max 4000 characters)
- **App icon**: 512x512 PNG (use your logo.png as base)
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: At least 2 screenshots (phone)
- **App category**: Medical (or Business)
- **Contact details**: Email, phone (optional)
- **Privacy policy**: URL to your privacy policy

### 3. Content Rating
1. Go to `Content rating` section
2. Fill out the questionnaire
3. Get your rating

### 4. Pricing & Distribution
1. Select countries where app will be available
2. Specify if app is free or paid
3. Confirm content guidelines

### 5. Upload AAB
1. Go to `Release` → `Production`
2. Click `Create new release`
3. Upload the AAB file (`app-release.aab`)
4. Fill in release notes
5. Save and review

### 6. Submit for Review
1. Review all sections to ensure everything is complete
2. Click `Submit for review`
3. Google will review (typically 1-7 days)

## App Icons & Splash Screen

To customize app icons:

1. **Generate icons** from your logo:
   - Use https://icon.kitchen/ or https://romannurik.github.io/AndroidAssetStudio/
   - Upload `src/assets/logo.png`
   - Download the generated icons

2. **Replace default icons**:
   - Copy generated files to `android/app/src/main/res/`
   - Replace folders: `mipmap-hdpi`, `mipmap-mdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`

3. **Update splash screen**:
   - Edit `android/app/src/main/res/values/styles.xml`
   - Modify splash screen colors/images

## Updating the App

When you release updates:

1. **Increment version** in `android/app/build.gradle`:
```gradle
versionCode 2  // Increment by 1
versionName "1.0.1"  // Update version name
```

2. **Build and sign** new AAB

3. **Upload to Play Console**:
   - Go to Production release
   - Create new release
   - Upload new AAB
   - Add release notes
   - Submit

## Testing Before Release

### Internal Testing
1. In Play Console, go to `Release` → `Testing` → `Internal testing`
2. Upload AAB
3. Add testers by email
4. They can install via Play Store link

### Closed/Open Testing
- **Closed testing**: Selected testers
- **Open testing**: Anyone can join

## Useful Commands

```bash
# Build for production and sync
npm run build:android

# Open Android Studio
npm run open:android

# Sync changes to Android project
npm run sync:android

# Build Angular only
npm run build -- --configuration production
```

## Troubleshooting

### Build Errors
- Clean and rebuild: In Android Studio, `Build` → `Clean Project`, then `Build` → `Rebuild Project`
- Invalidate caches: `File` → `Invalidate Caches / Restart`

### Capacitor Sync Issues
```bash
npx cap sync android --force
```

### Gradle Issues
```bash
cd android
./gradlew clean
./gradlew build
```

## Important Notes

1. **Keystore Security**: Never commit keystore files or passwords to version control
2. **App Signing**: Google Play App Signing is recommended (managed by Google)
3. **Version Management**: Always increment versionCode for updates
4. **Testing**: Test thoroughly on different devices before release
5. **Privacy Policy**: Required for apps that handle user data
6. **Firebase Configuration**: Ensure Firebase is properly configured for production

## Firebase Configuration for Android

If your app uses Firebase (which it does), you need:

1. **Download `google-services.json`**:
   - Go to Firebase Console
   - Select your project
   - Add Android app or download existing config
   - Place file at: `android/app/google-services.json`

2. The build will automatically detect and use it.

## Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Publishing to Play Store](https://developer.android.com/studio/publish)

## Support

For issues specific to this build, check:
- Capacitor logs: Use Chrome DevTools for web debugging
- Android logs: Use Android Studio Logcat
- Build issues: Check `android/app/build.gradle` and Gradle console

---

**Created**: 2026-04-10
**Last Updated**: 2026-04-10

