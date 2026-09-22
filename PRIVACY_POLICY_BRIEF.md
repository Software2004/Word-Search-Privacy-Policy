# Privacy Policy Brief — Media Recovery (Restora)

> **Purpose of this document**
> Factual, technical information gathered directly from the app's source code. Feed it to an AI agent with a prompt like: *"Using the facts below, write a clear and complete privacy policy web page for a Google Play app."* Then host the output (see `index.html`) and submit the URL in the Play Console.

---

## 1. App Identity

| Field | Value |
|---|---|
| **App name (Play Store listing)** | Media Recovery |
| **Branding / in-app name** | Restora |
| **Tagline** | Recover & Protect Your Files |
| **Package name (Application ID)** | `com.mediarecovery.photorecovery.videorecovery.deletedfilesrecovery.deletedimagerecovery.download.now` |
| **Code namespace** | `com.enterprises.app` |
| **Platform** | Android |
| **Minimum Android version** | Android 8.0 (API 26) |
| **Current version** | 1.0 |
| **Play status** | Not yet live; publishing soon |

> **TODO before publishing:** confirm the developer/company name and support email below match your Play Console account, and put the live policy URL in the Play Console listing.

---

## 2. What the App Does (User-Facing Features)

- **Deleted-file recovery** — scans the Android **Recycle Bin** (`MediaStore` trash, Android 11+), a **WhatsApp media folder** the user grants access to, and (optionally) performs a deeper **filesystem sweep** of legacy trash/thumbnail directories the media library doesn't index. Recoverable photos, videos, audio and documents are listed for the user to restore.
- **Restore** — selected files are either released from the system trash or copied into a public `Downloads/RecoveredMedia/` folder on the device.
- **Vault** — a private area protected by a 4-digit **PIN**, a **security question** for PIN recovery, and optional **biometric** (fingerprint/face) unlock. Files moved to the Vault are copied into the app's private internal storage and removed from their visible location where the OS allows. Users can also "hide files from device" by picking them with the system file picker.
- **Local library** — a local database records metadata for recovered and vaulted files.
- **Preferences** — language selection, dark mode, notification toggle, onboarding.
- **Premium subscription** ("Restora Pro") — optional weekly or yearly plan via Google Play Billing that removes ads. Product IDs: `restora_pro_weekly`, `restora_pro_yearly`.
- **Advertising** — the free tier shows Google AdMob ads (app-open, interstitial, native), configured via Firebase Remote Config, with a Google UMP consent step in applicable regions.

---

## 3. Data Collected Directly by the App

The app itself collects **no personally identifiable information**, has **no accounts / sign-in**, and runs **no developer server or backend**. All of the following is stored **only on the device**:

### 3a. On-Device Preferences (SharedPreferences)

| Store | Keys / contents |
|---|---|
| `restora_prefs` | Vault PIN **SHA-256 hash**; security question id + answer **SHA-256 hash**; notifications enabled; biometric enabled; premium-active cache flag; per-category last-scan timestamps; selected language; onboarding-complete flag; "sweep rationale seen" flag; the folder URI the user granted for WhatsApp media |
| `app_preferences` | Ad unit IDs and feature toggles fetched from Firebase Remote Config (cached for the ads library) |

- Not transmitted to any developer server. Deleted on "Clear storage" or uninstall.
- The Vault PIN and security answer are stored **only as one-way SHA-256 hashes**; the original values cannot be recovered by the app.

### 3b. On-Device File Library (Room / SQLite — `AppDatabase`)

| Column | What it stores |
|---|---|
| `id`, `name`, `ext`, `sizeLabel`, `category` | File identity + type/size labels |
| `origin` | Which mechanism found it (MediaStore trash / SAF WhatsApp / filesystem sweep / device pick) |
| `bucket` | Whether it is in the "Recovered" list or the "Vault" |
| `contentUri` | Local path/URI of the recovered or vaulted copy on the device |
| `ageReferenceAtMillis`, `recoveredAtMillis` | Timestamps |

- This is metadata about the user's own files. Not transmitted anywhere.

### 3c. Vaulted File Contents

- Copies of the files the user chooses to vault are stored in the app's **private internal storage** (`filesDir/vault/`). These never leave the device.

**The app has no user-generated content upload, no forms, no analytics of user behaviour, and no custom backend.**

---

## 4. Data Collected by Third-Party SDKs

The app integrates Google services through the open-source **Revenue Ads Library** wrapper (`com.github.Software2004:revenue-ads-library`, https://github.com/Software2004/revenue-ads-library). The wrapper itself collects nothing; the underlying Google services are:

### 4a. Google AdMob — Google Mobile Ads SDK (next-gen `ads-mobile-sdk`)
- **Why:** display ads in the free tier — app-open (launch + return-to-foreground), interstitial (splash exit, language screen when opened from Settings, closing the premium screen), and native (language screen, first-run flow).
- **Typically collects:** Advertising ID (GAID), IP address, device model, OS version, app signals, ad interaction data (impressions/clicks), coarse location derived from IP.
- **Governed by:** [Google's Privacy Policy](https://policies.google.com/privacy) · [How Google uses information from sites/apps that use its services](https://policies.google.com/technologies/partner-sites)

### 4b. Google UMP (User Messaging Platform)
- **Why:** show a consent form to users in the EEA, UK and Switzerland before personalised ads.
- **Collects:** the user's consent choice (stored on device and reported to Google). The app blocks ad requests until consent is resolved.
- **Governed by:** [Google's Privacy Policy](https://policies.google.com/privacy)

### 4c. Firebase Remote Config
- **Why:** remotely enable/disable ad placements and supply ad unit IDs without an app update. Fetched once on the splash screen.
- **Collects:** a Firebase installation identifier and basic device/app metadata used to deliver config.
- **Governed by:** [Firebase privacy & security](https://firebase.google.com/support/privacy) · [Google's Privacy Policy](https://policies.google.com/privacy)
- **Note:** Firebase Analytics is **not** integrated; only `firebase-config` (Remote Config) is included.

### 4d. Google Play Billing (v9)
- **Why:** process the optional "Restora Pro" subscription (weekly / yearly) and check subscription status on launch.
- **Handles:** purchase tokens and subscription state only. **The developer never receives or stores payment card data** — all payment processing is done by Google Play. An acknowledgement safety-net acknowledges completed purchases.
- **Governed by:** [Google Play Terms of Service](https://play.google.com/about/play-terms/)

There is **no image-loading SDK** (no Glide/Coil/Picasso), no crash-reporting SDK, and no third-party analytics.

---

## 5. Permissions

Merged manifest permissions (app-declared + added by SDK dependencies):

| Permission | Source | Purpose |
|---|---|---|
| `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO` | App | Read items in the device Recycle Bin / selected folders so they can be listed and recovered (Android 13+) |
| `READ_EXTERNAL_STORAGE` (maxSdk 32), `WRITE_EXTERNAL_STORAGE` (maxSdk 32) | App | Same, plus writing recovered files back, on Android 12 and older |
| `MANAGE_EXTERNAL_STORAGE` (All Files Access) | App | **Optional** — only for the deeper filesystem sweep of legacy trash/thumbnail folders; other recovery paths work without it |
| `USE_BIOMETRIC`, `USE_FINGERPRINT` | App | Optional fingerprint/face unlock for the Vault |
| `INTERNET`, `ACCESS_NETWORK_STATE` | Ads library | Ads, Firebase Remote Config, Play Billing network calls + connectivity checks. The app's own recovery/Vault features never use the network |
| `com.google.android.gms.permission.AD_ID` | AdMob SDK | Access the Google Advertising ID for ad delivery/measurement |
| `ACCESS_ADSERVICES_TOPICS` / `ACCESS_ADSERVICES_AD_ID` / `ACCESS_ADSERVICES_ATTRIBUTION` | AdMob SDK | Android Privacy Sandbox ad APIs |
| `READ_BASIC_PHONE_STATE` | Ads/attribution SDK | Basic device signal for ad fraud prevention |
| `com.android.vending.BILLING` | Play Billing SDK | In-app subscription |
| `WAKE_LOCK`, `FOREGROUND_SERVICE` | SDK components | Complete short background SDK tasks |

Also present in the manifest: `android:requestLegacyExternalStorage="true"` (legacy storage on Android 10) and **`android:allowBackup="false"`** (cloud backup disabled — see §11).

**The app does NOT request:** Camera · Microphone / Record Audio · Contacts / Call Log · Fine or Coarse Location · SMS/MMS · Calendar.

---

## 6. Network Communications

- The app's own recovery, Vault and preferences code makes **no network requests** — there is no backend, API or developer server.
- All network traffic comes from the Google SDKs in §4 (AdMob, Firebase Remote Config, Play Billing) and uses HTTPS/TLS.

---

## 7. In-App Purchases

- Optional **"Restora Pro"** subscription: **Weekly** or **Yearly**, auto-renewing, billed through the user's Google Play account.
- Benefit: removes all ads.
- Processed entirely by **Google Play Billing**; the developer stores no payment information.
- Users can restore an existing subscription via **"Restore purchases"** on the premium screen, and cancel anytime in Google Play → Subscriptions.

---

## 8. Advertising

- Free version shows **Google AdMob** ads: app-open on launch/return, interstitials at certain transitions, a native ad on the language screen. Placements are toggled via Firebase Remote Config.
- Ads may be **personalised** subject to the user's consent choice.
- Users in the **EEA, UK and Switzerland** see a **UMP consent form** before personalised ads and can choose non-personalised ads; the choice persists and can be changed where the app exposes a consent-options control.
- Anyone can limit personalisation via **Android Settings → Privacy → Ads** (reset/delete Advertising ID).
- Buying **Restora Pro** removes ads entirely. Premium status is verified against Google Play on each launch.

---

## 9. Children's Privacy

- General-purpose utility; **not** directed at children under 13; **not** enrolled in Google Play's "Designed for Families" programme.
- No knowing collection of personal information from children.
- Contact the developer (see §14) if you believe a child provided personal information.

---

## 10. Data Retention

| Data | Retention |
|---|---|
| Local file library (Room) | On-device until the user deletes files in-app, clears app storage, or uninstalls |
| App preferences (both SharedPreferences stores) | On-device until "Clear storage" or uninstall |
| Vaulted file copies (private storage) | On-device until removed in-app or uninstall |
| Advertising data (AdMob) | Per Google's retention policies |
| Firebase Remote Config / installation data | Per Google's retention policies |
| Purchase / subscription records | Per Google Play policies |

---

## 11. Data Security

- User data is stored **only locally**, in the app's private internal storage (Room DB, SharedPreferences, vault files), inaccessible to other apps.
- Vault PIN and security answer are stored as **SHA-256 hashes**, not plaintext.
- **Android Auto Backup is disabled** (`android:allowBackup="false"`): recovery data, the Vault and settings are **not** included in Google Drive backups and do **not** transfer automatically on reinstall or device change.
- All third-party SDK network communication uses HTTPS/TLS.

---

## 12. User Rights & Choices

| Action | How |
|---|---|
| Delete recovered files / empty the Vault | In-app, from the Recovered / Vault screens |
| Change or reset the Vault PIN | In-app with the current PIN, or via the security question |
| Revoke All-Files Access or a folder grant | Android Settings (App info → Permissions / "All files access") |
| Delete all local app data | Android Settings → Apps → Media Recovery → Storage → Clear storage |
| Uninstall the app | Deletes all locally stored data |
| Opt out of / limit ad personalisation | UMP consent form (where shown) + Android Settings → Privacy → Ads |
| Manage or cancel the subscription | Google Play → Payments & subscriptions → Subscriptions |
| Restore a subscription | "Restore purchases" on the premium screen |

Users in regions with statutory data-protection rights (e.g. GDPR in the EEA/UK, CCPA/CPRA in California) can exercise those rights over app-stored data using the in-app controls above; for data held by Google, use Google's account/privacy tools or contact the developer.

---

## 13. Changes to This Privacy Policy

- Updated when data practices change (new SDK, backend, or feature).
- The effective date on the published page will be updated; material changes may also be surfaced in-app.
- Continued use after changes constitutes acceptance.

---

## 14. Developer Contact

| Field | Value |
|---|---|
| **Developer / Company name** | Master Enterprises *(verify against Play Console account)* |
| **Contact email** | support.master.enterprises@gmail.com *(verify)* |
| **Play Store listing** | https://play.google.com/store/apps/details?id=com.mediarecovery.photorecovery.videorecovery.deletedfilesrecovery.deletedimagerecovery.download.now |
| **Privacy policy page URL** | *(host `index.html` and put its URL here + in the Play Console)* |

---

## Appendix A — Play Console "Data Safety" Form Guidance

Starting point for the **Data Safety** section. Confirm against your live AdMob / Firebase / Play Billing configuration before submitting.

### Data collected / shared

| Data type | Collected | Shared | Purpose | Optional? | Encrypted in transit | Deletion |
|---|---|---|---|---|---|---|
| **Device or other IDs** — Advertising ID | Yes (AdMob SDK) | Yes → Google / ad partners | Advertising, fraud prevention | Ads can be removed by subscribing | Yes | Reset/delete via device Ad ID settings |
| **App activity** — in-app ad interactions (impressions/clicks) | Yes (AdMob SDK) | Yes → Google | Advertising, analytics for ads | No | Yes | N/A (SDK-level) |
| **App info & performance** — installation ID / device metadata for Remote Config | Yes (Firebase Remote Config) | Yes → Google | App functionality (remote configuration) | No | Yes | Via Google account controls |
| **Purchase history** — subscription status / purchase token | Handled by Google Play | Google Play → developer (token/status only) | App functionality (premium), purchase management | Premium is optional | Yes | Per Google Play policies |
| **Files & docs / Photos & videos (user's own)** | Processed **on-device only**, not collected or transmitted | No | Core app function (recovery, Vault) | — | N/A (never leaves device) | Delete in-app / clear storage / uninstall |

> "Data processed only on the device and not sent off the device" is **not** counted as "collected" in Play's Data Safety form. The recovered files and Vault contents fall in this category — declare them as processed on-device only, not collected/shared.

### Data NOT collected
- Name, email address, phone number
- Physical or mailing address, precise or approximate location (beyond IP-coarse location by the ad SDK)
- Contacts, calendar
- Health / fitness data
- Messages, call logs, SMS
- Photos/videos/files *as user content sent to a server* (they never leave the device)

### Other Data Safety answers
- **Is all data encrypted in transit?** Yes (all SDK traffic is HTTPS/TLS; the app makes no other network calls).
- **Do you provide a way to request data deletion?** Yes — in-app deletion + clear storage / uninstall for on-device data; Google account tools for SDK data.
- **Committed to Play Families Policy / target children?** No.

### AdMob / Advertising ID declaration
- The app contains ads and uses the Advertising ID → declare **Yes** to "Does your app use advertising ID?" with purposes **Advertising or marketing** and **Fraud prevention, security, and compliance**.
