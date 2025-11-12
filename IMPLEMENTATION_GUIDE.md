# React Native Activity Tracker - Implementation Guide

## Overview

This is a React Native application for Android that monitors user activities in the background, including app usage, screenshots, screen recording, and share events. The app uses native Kotlin services for background monitoring and syncs data to Supabase.

## Architecture

### Technology Stack
- **Frontend**: React Native 0.82.1 with TypeScript
- **Backend**: Supabase (PostgreSQL database)
- **Native**: Kotlin for Android background services
- **Design**: Material 3 with liquid glass aesthetic

### Key Features
- Continuous background monitoring until manually stopped
- Detects: app open/close, screenshots, screen recording, share events
- Real-time event streaming from native to JS
- Automatic batch synchronization to Supabase
- Search, filter, and sort functionality
- Modern Material 3 UI with glassmorphism effects

## Directory Structure

```
project/
├── android/
│   └── app/
│       ├── build.gradle (updated with dependencies)
│       └── src/main/
│           ├── AndroidManifest.xml (permissions & services)
│           ├── res/
│           │   ├── values/strings.xml
│           │   └── xml/accessibility_service_config.xml
│           └── java/com/rnactivitytracker/
│               ├── MainActivity.kt
│               ├── MainApplication.kt (bridge package registered)
│               ├── modules/
│               │   ├── ActivityTrackerModule.kt (React Native bridge)
│               │   └── ActivityTrackerPackage.kt
│               ├── services/
│               │   ├── ActivityMonitorService.kt (foreground service)
│               │   └── AccessibilityMonitorService.kt (accessibility service)
│               └── utils/
│                   ├── EventEmitter.kt
│                   └── AppInfoHelper.kt
├── src/
│   ├── components/
│   │   ├── PermissionGate.tsx (permission request flow)
│   │   ├── SearchBar.tsx
│   │   ├── FilterButton.tsx
│   │   ├── SortButton.tsx
│   │   └── EventListItem.tsx
│   ├── screens/
│   │   └── MainScreen.tsx (main UI)
│   ├── hooks/
│   │   ├── usePermissions.ts
│   │   └── useActivityMonitor.ts
│   ├── services/
│   │   └── ActivityService.ts (Supabase sync)
│   ├── types/
│   │   ├── index.ts (TypeScript types)
│   │   └── native.ts (native module types)
│   ├── utils/
│   │   ├── supabase.ts (Supabase client)
│   │   └── nativeModule.ts (native bridge)
│   └── styles/
│       └── theme.ts (Material 3 theme)
├── App.tsx (entry point)
└── package.json
```

## Native Android Components

### 1. ActivityMonitorService (Foreground Service)
**Location**: `android/app/src/main/java/com/rnactivitytracker/services/ActivityMonitorService.kt`

**Purpose**: Runs continuously in the background to monitor:
- App open/close events using UsageStatsManager
- Screenshots using ContentObserver on MediaStore

**Key Features**:
- Polls UsageStats every 2 seconds
- Displays persistent notification (required for foreground services)
- Filters out system apps
- Emits events to React Native via EventEmitter

### 2. AccessibilityMonitorService
**Location**: `android/app/src/main/java/com/rnactivitytracker/services/AccessibilityMonitorService.kt`

**Purpose**: Detects share events and other accessibility-based actions

**Key Features**:
- Listens to window state changes and view clicks
- Detects ShareSheet and ChooserActivity
- Identifies share buttons by content description

### 3. ActivityTrackerModule (React Native Bridge)
**Location**: `android/app/src/main/java/com/rnactivitytracker/modules/ActivityTrackerModule.kt`

**Exposed Methods**:
```typescript
startMonitoring(): Promise<boolean>
stopMonitoring(): Promise<boolean>
isServiceRunning(): Promise<boolean>
checkPermissions(): Promise<PermissionStatus>
requestUsageStatsPermission(): Promise<boolean>
requestAccessibilityPermission(): Promise<boolean>
requestNotificationPermission(): Promise<boolean>
getDeviceId(): Promise<string>
```

**Events Emitted**:
- `ActivityEvent`: Real-time event stream from native services

## Supabase Database Schema

### Table: activity_events
```sql
- id (uuid, primary key)
- timestamp (timestamptz) - When event occurred
- event_type (text) - Type: app_open, app_close, screenshot, etc.
- app_package_name (text) - Android package name
- app_name (text) - Human-readable app name
- device_id (text) - Device identifier
- metadata (jsonb) - Additional event data
- created_at (timestamptz) - Record creation time
```

### Table: app_metadata
```sql
- id (uuid, primary key)
- package_name (text, unique)
- app_name (text)
- icon_url (text, optional)
- first_seen (timestamptz)
- last_seen (timestamptz)
- event_count (integer)
```

**Automatic Updates**: Trigger function updates app_metadata on each new event.

## React Native Components

### PermissionGate
Guards the main app and displays permission request UI when needed.

**Required Permissions**:
1. Usage Stats (PACKAGE_USAGE_STATS)
2. Accessibility Service
3. Post Notifications (Android 13+)

### MainScreen
Single screen with:
- **Header**: Title + Status toggle (Active/Stopped)
- **Search Bar**: Real-time app name filtering
- **Filter Button**: Multi-select event types
- **Sort Button**: Date, app name, or event type
- **Event List**: Virtualized FlatList with pull-to-refresh

### Event List Items
Displays each event with:
- Color-coded icon based on event type
- App name and package name
- Event type label
- Relative timestamp (e.g., "5m ago")

## Data Flow

### 1. Event Detection (Native)
```
User Action → UsageStatsManager/AccessibilityService
→ ActivityMonitorService/AccessibilityMonitorService
→ EventEmitter.sendEvent()
```

### 2. Event Handling (React Native)
```
ActivityEvent listener
→ ActivityService.addEvent()
→ Local queue + UI update
→ Batch sync to Supabase (every 10 events or 30s)
```

### 3. Event Display
```
Supabase fetch on app launch
→ Combined with real-time native events
→ Filtered & sorted in useMemo
→ Rendered in FlatList
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- Android Studio
- Android device or emulator (API 24+)

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Build Android App**
```bash
npm run android
```

3. **Grant Permissions**
When app launches:
- Tap "Grant" for Usage Stats → Enable in system settings
- Tap "Grant" for Accessibility → Enable "Activity Monitor" service
- Tap "Grant" for Notifications → Allow in permission dialog

4. **Start Monitoring**
- Tap the "Stopped" button in header
- Status changes to "Active" (green)
- Notification appears showing monitoring is active

5. **Use Other Apps**
- Open and close different apps
- Take screenshots
- Share content
- Return to Activity Tracker to see logged events

### Testing

**Test Event Detection**:
1. Start monitoring in Activity Tracker
2. Open Chrome → Event: "App Open" for Chrome
3. Press home → Event: "App Close" for Chrome
4. Take screenshot → Event: "Screenshot"
5. Share from any app → Event: "Share"

**Test Filtering**:
1. Tap "Filter" button
2. Check "Screenshot" only
3. Tap "Apply" → Only screenshot events shown

**Test Sorting**:
1. Tap "Sort" button
2. Select "App Name (A-Z)"
3. Events sorted alphabetically by app name

**Test Search**:
1. Type app name in search bar
2. List filters in real-time

## Material 3 Design Implementation

### Color System
- Primary: #0066CC (blue)
- Secondary: #00D4AA (teal)
- Background: White/Dark (#FFFFFF/#121212)
- Surface Glass: Semi-transparent with backdrop blur effect

### Typography
- H1: 32px, weight 700
- H2: 24px, weight 600
- Body: 16px, weight 400
- Caption: 12px, weight 400

### Spacing System
- 8px base unit (xs, sm, md, lg, xl, xxl)

### Glassmorphism
- Semi-transparent surfaces (70% opacity)
- Subtle shadows for depth
- Rounded corners (8-24px)

## Troubleshooting

### Events Not Appearing
- Check permissions are granted (all 3 required)
- Verify monitoring status is "Active"
- Check native logs: `adb logcat | grep ActivityTracker`

### Service Stops Unexpectedly
- Android may kill background services for battery optimization
- Add app to battery optimization whitelist
- Ensure foreground notification is visible

### Accessibility Service Not Detecting Shares
- Some apps use custom share implementations
- Service detects standard Android ShareSheet only
- Check accessibility service is enabled in system settings

### Supabase Sync Failing
- Verify `.env` has correct Supabase URL and key
- Check internet connection
- Events queue locally and retry on next sync

## Performance Considerations

- **Polling Interval**: 2s for UsageStats (configurable in ActivityMonitorService)
- **Batch Size**: 10 events before sync (configurable in ActivityService)
- **Auto Sync**: Every 30s regardless of batch size
- **List Virtualization**: FlatList handles thousands of events efficiently

## Security Notes

- Device ID used for multi-device support (not user authentication)
- RLS policies set to public (no authentication implemented)
- For production, implement user authentication and restrict RLS by user ID
- API keys in `.env` should be protected in production builds

## Future Enhancements

1. **Screen Recording Detection**: Add MediaProjection callback (requires additional permissions)
2. **App Icons**: Fetch and cache app icons for better UI
3. **Export Functionality**: CSV/JSON export of events
4. **Statistics Dashboard**: Charts for app usage patterns
5. **User Authentication**: Add Supabase auth for multi-user support
6. **Data Retention**: Automatic cleanup of old events
7. **Notification Actions**: Quick stop/start from notification

## License

This is a demonstration project. Ensure compliance with privacy laws and app store policies before deploying.
