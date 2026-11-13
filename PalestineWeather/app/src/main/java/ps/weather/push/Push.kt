package ps.weather.push

import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import ps.weather.data.AlertLevel
import ps.weather.data.AlertRecord
import ps.weather.data.AlertType
import ps.weather.data.Prefs
import ps.weather.work.AlertWorker

/**
 * Alerts the owner sends by hand from the Firebase console, one Firebase topic per kind of
 * alert (see [AlertType.topic]): a phone follows a topic while that alert's switch is on.
 */
object Push {
    /** Follow the topics of the alerts that are switched on, and leave the others. */
    fun sync(context: Context) {
        val prefs = Prefs(context.applicationContext)
        runCatching {
            val fm = FirebaseMessaging.getInstance()
            AlertType.entries.forEach { type ->
                val topic = type.topic ?: return@forEach
                if (prefs.alertEnabled(type)) fm.subscribeToTopic(topic) else fm.unsubscribeFromTopic(topic)
            }
        }
    }

    /** The history key of a pushed alert: its id from the console, so it can be withdrawn by it. */
    fun key(id: String) = "push_$id"
}

/**
 * Receives the console's messages. A message carries a title and a text, and in its custom data:
 *  - `type`: an alert kind by its topic name (rain, frost, heat, wind, quake, early_warning, general);
 *  - `id`: the owner's own id for the alert (so it can be withdrawn later);
 *  - `level`: info, warn or high;
 *  - `action` = `delete` with an `id`: takes that alert out of the phone's history and its notification away.
 */
class PushService : FirebaseMessagingService() {
    /**
     * Every message comes through here, also the console's "notification" messages while the app
     * is closed, which the system would otherwise show by itself without the app recording them.
     */
    override fun handleIntent(intent: Intent) {
        val x = intent.extras
        val isMessage = intent.action == "com.google.android.c2dm.intent.RECEIVE" && x != null && x.getString("message_type").let { it == null || it == "gcm" }
        if (!isMessage || x == null) { super.handleIntent(intent); return }
        fun s(key: String) = x.getString(key)?.trim()?.takeIf { it.isNotEmpty() }

        val prefs = Prefs(applicationContext)
        val id = s("id") ?: s("google.message_id") ?: System.currentTimeMillis().toString()
        if (s("action")?.lowercase() == "delete") {
            val key = Push.key(id)
            prefs.removeAlert(key)
            runCatching { NotificationManagerCompat.from(applicationContext).cancel(key.hashCode()) }
            return
        }
        val title = s("gcm.notification.title") ?: s("title") ?: return
        val body = s("gcm.notification.body") ?: s("body") ?: ""
        val type = AlertType.entries.firstOrNull { it.topic == s("type")?.lowercase() } ?: AlertType.GENERAL
        if (!prefs.alertEnabled(type)) return
        val level = when (s("level")?.lowercase()) { "high" -> AlertLevel.HIGH; "info" -> AlertLevel.INFO; "warn" -> AlertLevel.WARN; else -> if (type == AlertType.EARLY) AlertLevel.HIGH else AlertLevel.INFO }
        val record = AlertRecord(Push.key(id), type, level, title, body, "", System.currentTimeMillis())
        if (prefs.addAlert(record)) AlertWorker.show(applicationContext, record)
    }

    override fun onNewToken(token: String) = Push.sync(applicationContext)
}
