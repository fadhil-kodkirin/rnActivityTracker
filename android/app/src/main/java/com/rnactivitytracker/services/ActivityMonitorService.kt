package com.rnactivitytracker.services

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.database.ContentObserver
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.MediaStore
import androidx.core.app.NotificationCompat
import com.rnactivitytracker.R
import com.rnactivitytracker.utils.AppInfoHelper
import com.rnactivitytracker.utils.EventEmitter
import kotlinx.coroutines.*

class ActivityMonitorService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var isMonitoring = false
    private var lastEventTime = 0L
    private var screenshotObserver: ContentObserver? = null

    companion object {
        const val CHANNEL_ID = "ActivityMonitorChannel"
        const val NOTIFICATION_ID = 1
        const val ACTION_STOP = "com.rnactivitytracker.STOP_MONITORING"
        private const val POLL_INTERVAL = 2000L
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        lastEventTime = System.currentTimeMillis()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopMonitoring()
            return START_NOT_STICKY
        }

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        if (!isMonitoring) {
            startMonitoring()
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startMonitoring() {
        isMonitoring = true
        startUsageStatsMonitoring()
        startScreenshotDetection()
    }

    private fun stopMonitoring() {
        isMonitoring = false
        serviceScope.cancel()
        screenshotObserver?.let {
            contentResolver.unregisterContentObserver(it)
        }
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startUsageStatsMonitoring() {
        serviceScope.launch {
            while (isActive && isMonitoring) {
                checkUsageStats()
                delay(POLL_INTERVAL)
            }
        }
    }

    private fun checkUsageStats() {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val currentTime = System.currentTimeMillis()
        val events = usageStatsManager.queryEvents(lastEventTime, currentTime)

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)

            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND -> {
                    if (!AppInfoHelper.isSystemApp(this, event.packageName)) {
                        emitActivityEvent(
                            eventType = "app_open",
                            packageName = event.packageName,
                            timestamp = event.timeStamp
                        )
                    }
                }
                UsageEvents.Event.MOVE_TO_BACKGROUND -> {
                    if (!AppInfoHelper.isSystemApp(this, event.packageName)) {
                        emitActivityEvent(
                            eventType = "app_close",
                            packageName = event.packageName,
                            timestamp = event.timeStamp
                        )
                    }
                }
            }
        }

        lastEventTime = currentTime
    }

    private fun startScreenshotDetection() {
        screenshotObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean, uri: Uri?) {
                super.onChange(selfChange, uri)
                uri?.let {
                    if (it.toString().contains("screenshot", ignoreCase = true)) {
                        emitActivityEvent(
                            eventType = "screenshot",
                            packageName = "system",
                            timestamp = System.currentTimeMillis()
                        )
                    }
                }
            }
        }

        contentResolver.registerContentObserver(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            true,
            screenshotObserver!!
        )
    }

    private fun emitActivityEvent(eventType: String, packageName: String, timestamp: Long) {
        val appName = AppInfoHelper.getAppName(this, packageName)
        val event = EventEmitter.createActivityEvent(
            timestamp = timestamp,
            eventType = eventType,
            appPackageName = packageName,
            appName = appName
        )
        EventEmitter.sendEvent("ActivityEvent", event)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.notification_channel_description)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val stopIntent = Intent(this, ActivityMonitorService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            0,
            stopIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.monitoring_notification_title))
            .setContentText(getString(R.string.monitoring_notification_text))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(
                R.drawable.rn_edit_text_material,
                "Stop",
                stopPendingIntent
            )
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopMonitoring()
    }
}
