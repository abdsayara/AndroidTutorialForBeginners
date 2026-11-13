package ps.weather.data

import android.util.Xml
import org.json.JSONObject
import org.xmlpull.v1.XmlPullParser
import java.net.URLEncoder
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

// ---------------------------------------------------------------- Earthquakes (USGS)

data class Quake(
    val id: String,
    val mag: Double,
    val lat: Double,
    val lon: Double,
    val depthKm: Double,
    val time: Instant,
    val placeAr: String,
    val felt: Boolean,
)

/** Earthquakes from the USGS FDSN event service (public domain). */
object QuakeRepository {
    suspend fun recent(days: Int): Fetched<List<Quake>> {
        val start = LocalDate.now().minusDays(days.toLong()).toString()
        val url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
            "&minlatitude=29&maxlatitude=34&minlongitude=33&maxlongitude=37" +
            "&starttime=$start&minmagnitude=1&orderby=time"
        return Http.get(url, "quakes_$days").map { body ->
            val features = JSONObject(body).getJSONArray("features")
            List(features.length()) { i ->
                val f = features.getJSONObject(i)
                val p = f.getJSONObject("properties")
                val c = f.getJSONObject("geometry").getJSONArray("coordinates")
                val lon = c.getDouble(0)
                val lat = c.getDouble(1)
                Quake(
                    id = f.optString("id"),
                    mag = p.optDouble("mag", 0.0),
                    lat = lat,
                    lon = lon,
                    depthKm = c.optDouble(2, 0.0),
                    time = Instant.ofEpochMilli(p.optLong("time")),
                    placeAr = describePlace(lat, lon),
                    felt = !p.isNull("felt") && p.optInt("felt", 0) > 0,
                )
            }
        }
    }

    /** Arabic place description relative to the nearest known city. */
    fun describePlace(lat: Double, lon: Double): String {
        val city = nearestCity(lat, lon)
        val km = distanceKm(lat, lon, city.lat, city.lon).roundToInt()
        return if (km <= 5) "قرب ${city.name}" else "$km كم من ${city.name}"
    }
}

// ---------------------------------------------------------------- Prayer times (Dar al-Ifta's timetable)

data class PrayerDay(val times: List<Pair<String, LocalTime>>, val hijri: String)

/**
 * Prayer times from Dar al-Ifta's perpetual timetable («توقيت الصلاة الدهري», Jerusalem 2012):
 * a time for every day of the year at al-Aqsa Mosque, on winter time. Every place takes
 * Jerusalem's times as they are (the owner's choice: no differences between towns). Read
 * from the app itself: no formula, no network. The same table as the website (server/prayer.js).
 */
object PrayerRepository {
    private val NAMES = listOf("الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء")
    private val HEBRON: java.time.ZoneId = java.time.ZoneId.of("Asia/Hebron")
    private val HIJRI_MONTHS = listOf(
        "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
    )

    /** "month-day" → fajr, sunrise, dhuhr, asr, maghrib, isha: minutes after midnight, winter time, at al-Aqsa. */
    private val table: JSONObject by lazy {
        JSONObject(PrayerRepository::class.java.getResourceAsStream("/prayer-times.json")!!.bufferedReader().use { it.readText() })
    }

    /** The day's times, Jerusalem's for every place, on Palestine's clock (an hour later in summer time). */
    fun day(date: LocalDate): PrayerDay {
        val row = table.getJSONArray("${date.monthValue}-${date.dayOfMonth}")
        val summer = if (HEBRON.rules.isDaylightSavings(date.atTime(12, 0).atZone(HEBRON).toInstant())) 60 else 0
        val shift = summer
        val times = NAMES.mapIndexed { i, name -> name to LocalTime.MIDNIGHT.plusMinutes((row.getInt(i) + shift).toLong()) }
        val h = java.time.chrono.HijrahDate.from(date)
        val hijri = "${h.get(java.time.temporal.ChronoField.DAY_OF_MONTH)} ${HIJRI_MONTHS[h.get(java.time.temporal.ChronoField.MONTH_OF_YEAR) - 1]} ${h.get(java.time.temporal.ChronoField.YEAR)} هـ"
        return PrayerDay(times, hijri)
    }

    suspend fun today(): Fetched<PrayerDay> =
        Fetched(day(LocalDate.now(HEBRON)), fromCache = false, savedAt = System.currentTimeMillis())

    /** Bearing to the Kaaba in degrees from true north. */
    fun qiblaBearing(lat: Double, lon: Double): Double {
        val kLat = Math.toRadians(21.4225)
        val kLon = Math.toRadians(39.8262)
        val p = Math.toRadians(lat)
        val dL = kLon - Math.toRadians(lon)
        val b = atan2(sin(dL), cos(p) * kotlin.math.tan(kLat) - sin(p) * cos(dL))
        return (Math.toDegrees(b) + 360) % 360
    }
}

// ---------------------------------------------------------------- Currency (open.er-api.com)

data class Rates(val ilsPer: Map<String, Double>, val updated: String)

/** Daily reference rates from https://open.er-api.com (free, no key). */
object CurrencyRepository {
    val CODES = listOf(
        "USD" to "دولار أمريكي",
        "JOD" to "دينار أردني",
        "EUR" to "يورو",
        "EGP" to "جنيه مصري",
        "GBP" to "جنيه إسترليني",
        "SAR" to "ريال سعودي",
        "AED" to "درهم إماراتي",
        "TRY" to "ليرة تركية",
    )

    suspend fun latest(): Fetched<Rates> =
        Http.get("https://open.er-api.com/v6/latest/ILS", "rates_ils").map { body ->
            val o = JSONObject(body)
            val r = o.getJSONObject("rates")
            // The API gives units of each currency per 1 ILS; invert to ILS per unit.
            val ils = CODES.mapNotNull { (code, _) ->
                r.optDouble(code, Double.NaN).takeIf { !it.isNaN() && it > 0 }?.let { code to 1.0 / it }
            }.toMap()
            Rates(ils, o.optString("time_last_update_utc"))
        }
}

