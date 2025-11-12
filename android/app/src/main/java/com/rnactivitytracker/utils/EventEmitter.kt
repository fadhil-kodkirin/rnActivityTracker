package com.rnactivitytracker.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

object EventEmitter {
    private var reactContext: ReactApplicationContext? = null

    fun initialize(context: ReactApplicationContext) {
        reactContext = context
    }

    fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    fun createActivityEvent(
        timestamp: Long,
        eventType: String,
        appPackageName: String,
        appName: String,
        metadata: Map<String, Any>? = null
    ): WritableMap {
        val event = Arguments.createMap()
        event.putDouble("timestamp", timestamp.toDouble())
        event.putString("eventType", eventType)
        event.putString("appPackageName", appPackageName)
        event.putString("appName", appName)

        if (metadata != null) {
            val metadataMap = Arguments.createMap()
            metadata.forEach { (key, value) ->
                when (value) {
                    is String -> metadataMap.putString(key, value)
                    is Int -> metadataMap.putInt(key, value)
                    is Double -> metadataMap.putDouble(key, value)
                    is Boolean -> metadataMap.putBoolean(key, value)
                }
            }
            event.putMap("metadata", metadataMap)
        }

        return event
    }
}
