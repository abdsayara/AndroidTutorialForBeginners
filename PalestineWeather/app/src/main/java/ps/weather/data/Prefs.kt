package ps.weather.data

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

enum class AlertType(val label: String) {
    RAIN("مطر"),
    FROST("صقيع"),
    HEAT("حر"),
    WIND("رياح وغبار"),
    QUAKE("زلازل"),
}

enum class AlertLevel(val label: String) { INFO("للعلم"), WARN("تحذير"), HIGH("خطر") }

data class AlertRecord(
    val key: String,
    val type: AlertType,
    val level: AlertLevel,
    val title: String,
    val body: String,
    val cityName: String,
    val time: Long,
)

/** User settings and the alert history, kept in SharedPreferences. */
class Prefs(context: Context) {
    private val sp: SharedPreferences = context.getSharedPreferences("pw", Context.MODE_PRIVATE)

    var cityId: String
        get() = sp.getString("city", CITIES.first().id)!!
        set(v) = sp.edit().putString("city", v).apply()

    var favorites: Set<String>
        get() = sp.getStringSet("favorites", setOf("jerusalem", "gaza"))!!
        set(v) = sp.edit().putStringSet("favorites", v).apply()

    var prayerMethod: PrayerMethod
        get() = runCatching { PrayerMethod.valueOf(sp.getString("prayerMethod", null)!!) }.getOrDefault(PrayerMethod.EGYPT)
        set(v) = sp.edit().putString("prayerMethod", v.name).apply()

    fun alertEnabled(type: AlertType): Boolean = sp.getBoolean("alert_${type.name}", type != AlertType.HEAT)
    fun setAlertEnabled(type: AlertType, on: Boolean) = sp.edit().putBoolean("alert_${type.name}", on).apply()

    // ---------------------------------------------------------- alert history

    fun alerts(): List<AlertRecord> {
        val arr = JSONArray(sp.getString("alerts", "[]"))
        return List(arr.length()) { i ->
            val o = arr.getJSONObject(i)
            AlertRecord(
                key = o.getString("key"),
                type = AlertType.valueOf(o.getString("type")),
                level = AlertLevel.valueOf(o.getString("level")),
                title = o.getString("title"),
                body = o.getString("body"),
                cityName = o.optString("city"),
                time = o.getLong("time"),
            )
        }
    }

    /** Adds the alert unless one with the same key exists. Returns true when it is new. */
    fun addAlert(a: AlertRecord): Boolean {
        val current = alerts()
        if (current.any { it.key == a.key }) return false
        val cutoff = System.currentTimeMillis() - 30L * 24 * 3600 * 1000
        val kept = (listOf(a) + current).filter { it.time >= cutoff }.take(200)
        val arr = JSONArray()
        kept.forEach {
            arr.put(
                JSONObject()
                    .put("key", it.key).put("type", it.type.name).put("level", it.level.name)
                    .put("title", it.title).put("body", it.body).put("city", it.cityName).put("time", it.time)
            )
        }
        sp.edit().putString("alerts", arr.toString()).apply()
        return true
    }

    fun clearAlerts() = sp.edit().putString("alerts", "[]").apply()
}
