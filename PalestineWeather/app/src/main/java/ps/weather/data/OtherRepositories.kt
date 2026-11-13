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
 * a time for every day of the year at al-Aqsa Mosque, on winter time, and a few minutes'
 * difference for other towns. Read from the app itself: no formula, no network. The same
 * table and rules as the website (server/prayer.js).
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

    /** The timetable's own differences: latitude, longitude, minutes after Jerusalem. */
    private val TOWNS = listOf(
        // No difference: Jerusalem, Ramallah, Bethlehem, Jenin, Nablus, Nazareth, Umm al-Fahm.
        Triple(31.778, 35.235, 0.0), Triple(31.903, 35.204, 0.0), Triple(31.705, 35.203, 0.0), Triple(32.461, 35.300, 0.0),
        Triple(32.222, 35.262, 0.0), Triple(32.699, 35.303, 0.0), Triple(32.519, 35.153, 0.0),
        // A minute before: Jericho, Tiberias, Safed, Beisan.
        Triple(31.857, 35.460, -1.0), Triple(32.794, 35.531, -1.0), Triple(32.966, 35.496, -1.0), Triple(32.497, 35.497, -1.0),
        // A minute after: Hebron, Idna, Dura, Beit Awwa, Haifa, Acre, Tulkarm, Kafr Qasim, Taybeh.
        Triple(31.530, 35.094, 1.0), Triple(31.558, 34.976, 1.0), Triple(31.507, 35.028, 1.0), Triple(31.508, 34.952, 1.0), Triple(32.794, 34.989, 1.0),
        Triple(32.928, 35.076, 1.0), Triple(32.310, 35.029, 1.0), Triple(32.114, 34.977, 1.0), Triple(32.266, 35.010, 1.0),
        // A minute and a half after: Lod, Ramla, Qalqilya.
        Triple(31.951, 34.888, 1.5), Triple(31.929, 34.867, 1.5), Triple(32.190, 34.970, 1.5),
        // Two minutes after: Beersheba, Jaffa. Three: Gaza. Four: Rafah, Khan Younis, Deir al-Balah.
        Triple(31.252, 34.791, 2.0), Triple(32.050, 34.752, 2.0), Triple(31.501, 34.467, 3.0),
        Triple(31.287, 34.259, 4.0), Triple(31.346, 34.306, 4.0), Triple(31.418, 34.351, 4.0),
    )
    private const val AQSA_LON = 35.2356

    /**
     * Minutes a place is after Jerusalem. A town the timetable names (or a place within 6 km of
     * one) takes its difference; anywhere else, four minutes for each degree of longitude west
     * of al-Aqsa, the rule the timetable's own numbers follow. Half minutes round up.
     */
    fun minutesAfterJerusalem(lat: Double, lon: Double): Int {
        val near = TOWNS.map { (la, lo, diff) -> kotlin.math.hypot((lat - la) * 111, (lon - lo) * 111 * cos(Math.toRadians(lat))) to diff }
            .filter { it.first < 6 }.minByOrNull { it.first }?.second
        return kotlin.math.floor((near ?: ((AQSA_LON - lon) * 4)) + 0.5).toInt()
    }

    /** The day's times at a place, on Palestine's clock (an hour later in summer time). */
    fun day(lat: Double, lon: Double, date: LocalDate): PrayerDay {
        val row = table.getJSONArray("${date.monthValue}-${date.dayOfMonth}")
        val summer = if (HEBRON.rules.isDaylightSavings(date.atTime(12, 0).atZone(HEBRON).toInstant())) 60 else 0
        val shift = minutesAfterJerusalem(lat, lon) + summer
        val times = NAMES.mapIndexed { i, name -> name to LocalTime.MIDNIGHT.plusMinutes((row.getInt(i) + shift).toLong()) }
        val h = java.time.chrono.HijrahDate.from(date)
        val hijri = "${h.get(java.time.temporal.ChronoField.DAY_OF_MONTH)} ${HIJRI_MONTHS[h.get(java.time.temporal.ChronoField.MONTH_OF_YEAR) - 1]} ${h.get(java.time.temporal.ChronoField.YEAR)} هـ"
        return PrayerDay(times, hijri)
    }

    suspend fun today(lat: Double, lon: Double): Fetched<PrayerDay> =
        Fetched(day(lat, lon, LocalDate.now(HEBRON)), fromCache = false, savedAt = System.currentTimeMillis())

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

