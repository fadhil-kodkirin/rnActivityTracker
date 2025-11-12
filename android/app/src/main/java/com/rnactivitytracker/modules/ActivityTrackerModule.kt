package com.rnactivitytracker.modules

import android.app.ActivityManager
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.rnactivitytracker.services.ActivityMonitorService
import com.rnactivitytracker.utils.EventEmitter

class ActivityTrackerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        EventEmitter.initialize(reactContext)
    }

    override fun getName(): String = "ActivityTrackerModule"

    @ReactMethod
    fun startMonitoring(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, ActivityMonitorService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_ERROR", "Failed to start monitoring: ${e.message}")
        }
    }

    @ReactMethod
    fun stopMonitoring(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, ActivityMonitorService::class.java)
            reactApplicationContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", "Failed to stop monitoring: ${e.message}")
        }
    }

    @ReactMethod
    fun isServiceRunning(promise: Promise) {
        try {
            val manager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val running = manager.getRunningServices(Integer.MAX_VALUE).any {
                it.service.className == ActivityMonitorService::class.java.name
            }
            promise.resolve(running)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", "Failed to check service status: ${e.message}")
        }
    }

    @ReactMethod
    fun checkPermissions(promise: Promise) {
        try {
            val result = Arguments.createMap()
            result.putBoolean("usageStats", hasUsageStatsPermission())
            result.putBoolean("accessibility", isAccessibilityServiceEnabled())
            result.putBoolean("notifications", hasNotificationPermission())
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", "Failed to check permissions: ${e.message}")
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            if (!hasUsageStatsPermission()) {
                val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(false)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request usage stats permission: ${e.message}")
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            if (!isAccessibilityServiceEnabled()) {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(false)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request accessibility permission: ${e.message}")
        }
    }

    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (!hasNotificationPermission()) {
                    currentActivity?.requestPermissions(
                        arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),
                        1001
                    )
                    promise.resolve(false)
                } else {
                    promise.resolve(true)
                }
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "Failed to request notification permission: ${e.message}")
        }
    }

    @ReactMethod
    fun getDeviceId(promise: Promise) {
        try {
            val deviceId = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ANDROID_ID
            )
            promise.resolve(deviceId)
        } catch (e: Exception) {
            promise.reject("DEVICE_ID_ERROR", "Failed to get device ID: ${e.message}")
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val service = "${reactApplicationContext.packageName}/com.rnactivitytracker.services.AccessibilityMonitorService"
        val enabledServices = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        return enabledServices?.contains(service) == true
    }

    private fun hasNotificationPermission(): Boolean {
        return NotificationManagerCompat.from(reactApplicationContext).areNotificationsEnabled()
    }

    @ReactMethod
    fun addListener(eventName: String) {
    }

    @ReactMethod
    fun removeListeners(count: Int) {
    }
}
