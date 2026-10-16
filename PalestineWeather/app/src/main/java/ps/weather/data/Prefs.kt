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

    /** The selected place: a chosen village / GPS point if any, else the selected listed city. */
    fun selectedPlace(): City = runCatching {
        sp.getString("place", null)?.let { s ->
            val o = JSONObject(s)
            City(
                id = o.getString("id"), name = o.getString("name"),
                lat = o.getDouble("lat"), lon = o.getDouble("lon"),
                region = Region.valueOf(o.getString("region")), major = false,
                kind = PlaceKind.valueOf(o.getString("kind")),
                area = o.optString("area").takeIf { !o.isNull("area") },
                accuracyM = if (o.has("acc")) o.getInt("acc") else null,
            )
        }
    }.getOrNull() ?: cityById(cityId)

    fun select(place: City) {
        if (place.isListed) {
            sp.edit().putString("city", place.id).remove("place").apply()
        } else {
            val o = JSONObject()
                .put("id", place.id).put("name", place.name).put("lat", place.lat).put("lon", place.lon)
                .put("region", place.region.name).put("kind", place.kind.name).put("area", place.area ?: JSONObject.NULL)
            place.accuracyM?.let { o.put("acc", it) }
            sp.edit().putString("place", o.toString()).apply()
        }
    }

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
