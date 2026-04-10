# Play Store Release Checklist

Use this checklist to ensure you've completed all steps before submitting to Google Play Store.

## 🔧 Pre-Build Checklist

- [ ] **Firebase configured for Android**
  - [ ] `google-services.json` added to `android/app/`
  - [ ] Firebase project has Android app configured
  - [ ] Package ID matches: `com.healthdossier.app`

- [ ] **App tested locally**
  - [ ] Run `npm run build:android`
  - [ ] Test in Android emulator
  - [ ] Test on physical Android device
  - [ ] Test all major features work offline/online
  - [ ] Test login/logout functionality
  - [ ] Test file uploads (if applicable)

- [ ] **Version updated** (in `android/app/build.gradle`)
  - [ ] `versionCode` incremented (must be higher than previous)
  - [ ] `versionName` updated (e.g., "1.0.0", "1.0.1", etc.)

## 🔐 Signing Checklist

- [ ] **Keystore created** (first release only)
  - [ ] Keystore file generated with `keytool`
  - [ ] Keystore password saved securely
  - [ ] Key alias password saved securely
  - [ ] Keystore backed up to secure location

- [ ] **Release build created**
  - [ ] AAB (Android App Bundle) generated
  - [ ] File location: `android/app/release/app-release.aab`
  - [ ] File size reasonable (under 150MB)

## 🎨 Store Listing Assets

- [ ] **App icon prepared**
  - [ ] 512x512 PNG
  - [ ] No transparency
  - [ ] Meets Google Play icon guidelines

- [ ] **Feature graphic**
  - [ ] 1024x500 PNG
  - [ ] Represents app visually

- [ ] **Screenshots** (minimum 2, maximum 8)
  - [ ] Phone screenshots (at least 2)
  - [ ] Optional: 7-inch tablet screenshots
  - [ ] Optional: 10-inch tablet screenshots
  - [ ] All screenshots show actual app content

- [ ] **App video** (optional)
  - [ ] YouTube video URL
  - [ ] Shows key features

## 📝 Store Listing Content

- [ ] **App title**
  - [ ] Max 50 characters
  - [ ] Clear and descriptive

- [ ] **Short description**
  - [ ] Max 80 characters
  - [ ] Concise summary

- [ ] **Full description**
  - [ ] Max 4000 characters
  - [ ] Describes features, benefits
  - [ ] Well formatted with line breaks
  - [ ] Keywords for SEO included naturally

- [ ] **App category**
  - [ ] Category selected (e.g., Medical, Business, Productivity)

- [ ] **Contact details**
  - [ ] Email address (public)
  - [ ] Phone number (optional)
  - [ ] Website URL (optional)

- [ ] **Privacy policy**
  - [ ] URL to privacy policy page
  - [ ] Policy covers data collection
  - [ ] Policy is accessible

## ⚖️ Legal & Compliance

- [ ] **Content rating**
  - [ ] Questionnaire completed
  - [ ] Rating certificate obtained

- [ ] **Target audience**
  - [ ] Age group selected
  - [ ] Appropriate content for audience

- [ ] **App content**
  - [ ] Contains ads? (Yes/No)
  - [ ] In-app purchases? (Yes/No)
  - [ ] Data safety form completed

- [ ] **Data safety section** (required)
  - [ ] Data collection practices disclosed
  - [ ] Data sharing practices disclosed
  - [ ] Security practices disclosed
  - [ ] Data deletion option disclosed (if applicable)

## 🌍 Distribution

- [ ] **Countries**
  - [ ] Countries selected for distribution
  - [ ] Pricing set (if paid app)

- [ ] **Pricing**
  - [ ] Free or Paid selected
  - [ ] If paid: price set in all markets

## 🧪 Testing (Recommended)

- [ ] **Internal testing** (recommended)
  - [ ] Test track created
  - [ ] Testers added
  - [ ] AAB uploaded to test track
  - [ ] Testing completed successfully

- [ ] **Closed/Open testing** (optional)
  - [ ] Beta testers recruited
  - [ ] Feedback addressed

## 🚀 Production Release

- [ ] **Release created**
  - [ ] AAB uploaded to production
  - [ ] Release name/notes added
  - [ ] Rollout percentage set (or 100% for full release)

- [ ] **Final review**
  - [ ] All sections have green checkmarks
  - [ ] No warnings or errors
  - [ ] Store listing preview checked

- [ ] **Submit**
  - [ ] "Submit for review" clicked
  - [ ] Confirmation email received

## 📧 Post-Submission

- [ ] **Monitor review status**
  - [ ] Check Play Console daily
  - [ ] Respond to any messages from Google

- [ ] **After approval**
  - [ ] Test app from Play Store
  - [ ] Verify all features work in production
  - [ ] Monitor crash reports
  - [ ] Respond to user reviews

## 🔄 For Updates

When releasing updates, check:
- [ ] Version code incremented
- [ ] Version name updated
- [ ] Release notes written
- [ ] New features tested
- [ ] All previous items still valid

## 📋 Important Notes

**Review Time**: Typically 1-7 days, but can be longer

**Common Rejection Reasons**:
- Missing privacy policy
- Misleading screenshots
- Content rating issues
- Security vulnerabilities
- Broken functionality

**After First Release**:
- Keep keystore and passwords safe forever!
- You cannot update the app without the original keystore
- Consider enabling Google Play App Signing for additional security

## 🆘 Help Resources

- Play Console: https://play.google.com/console
- Play Console Help: https://support.google.com/googleplay/android-developer
- Policy Center: https://play.google.com/about/developer-content-policy/

---

**Date Created**: 2026-04-10
**App**: Health Dossier
**Package ID**: com.healthdossier.app

