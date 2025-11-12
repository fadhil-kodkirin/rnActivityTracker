package com.rnactivitytracker.services

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import com.rnactivitytracker.utils.AppInfoHelper
import com.rnactivitytracker.utils.EventEmitter

class AccessibilityMonitorService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChange(event)
            }
            AccessibilityEvent.TYPE_VIEW_CLICKED -> {
                handleViewClick(event)
            }
        }
    }

    private fun handleWindowStateChange(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        val className = event.className?.toString() ?: return

        if (className.contains("ShareSheet") ||
            className.contains("ChooserActivity") ||
            className.contains("ShareActivity")) {
            emitActivityEvent(
                eventType = "share",
                packageName = packageName
            )
        }
    }

    private fun handleViewClick(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        val contentDescription = event.contentDescription?.toString() ?: ""
        val text = event.text?.toString() ?: ""

        if (contentDescription.contains("share", ignoreCase = true) ||
            text.contains("share", ignoreCase = true)) {
            emitActivityEvent(
                eventType = "share",
                packageName = packageName
            )
        }
    }

    private fun emitActivityEvent(eventType: String, packageName: String) {
        val appName = AppInfoHelper.getAppName(this, packageName)
        val event = EventEmitter.createActivityEvent(
            timestamp = System.currentTimeMillis(),
            eventType = eventType,
            appPackageName = packageName,
            appName = appName
        )
        EventEmitter.sendEvent("ActivityEvent", event)
    }

    override fun onInterrupt() {
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
    }
}
