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

// ---------------------------------------------------------------- Prayer times (Aladhan)

data class PrayerDay(val times: List<Pair<String, LocalTime>>, val hijri: String)

enum class PrayerMethod(val id: Int, val label: String) {
    EGYPT(5, "الهيئة المصرية العامة للمساحة"),
    MWL(3, "رابطة العالم الإسلامي"),
    UMM_AL_QURA(4, "أم القرى — مكة"),
    JORDAN(23, "وزارة الأوقاف الأردنية"),
}

/** Prayer times from https://aladhan.com (free, no key). */
object PrayerRepository {
    private val NAMES = listOf(
        "Fajr" to "الفجر", "Sunrise" to "الشروق", "Dhuhr" to "الظهر",
        "Asr" to "العصر", "Maghrib" to "المغرب", "Isha" to "العشاء",
    )

    suspend fun today(lat: Double, lon: Double, method: PrayerMethod): Fetched<PrayerDay> {
        val date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy", Locale.US))
        val url = "https://api.aladhan.com/v1/timings/$date?latitude=$lat&longitude=$lon&method=${method.id}"
        return Http.get(url, "prayer_${lat}_${lon}_${method.id}").map { body ->
            val data = JSONObject(body).getJSONObject("data")
            val t = data.getJSONObject("timings")
            val times = NAMES.map { (key, ar) -> ar to LocalTime.parse(t.getString(key).take(5)) }
            val h = data.getJSONObject("date").getJSONObject("hijri")
            val hijri = "${h.optString("day").trimStart('0')} ${h.getJSONObject("month").optString("ar")} ${h.optString("year")} هـ"
            PrayerDay(times, hijri)
        }
    }

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

// ---------------------------------------------------------------- News (Google News RSS)

data class NewsItem(val title: String, val link: String, val source: String, val published: ZonedDateTime?)

enum class NewsTopic(val label: String, val query: String) {
    WEATHER("الطقس", "طقس فلسطين"),
    CLIMATE("المناخ", "تغير المناخ فلسطين"),
    FARMING("الزراعة", "الزراعة فلسطين الطقس"),
}

object NewsRepository {
    suspend fun headlines(topic: NewsTopic): Fetched<List<NewsItem>> {
        val q = URLEncoder.encode(topic.query, "UTF-8")
        val url = "https://news.google.com/rss/search?q=$q&hl=ar&gl=PS&ceid=PS:ar"
        return Http.get(url, "news_${topic.name}").map(::parseRss)
    }

    private fun parseRss(xml: String): List<NewsItem> {
        val parser = Xml.newPullParser()
        parser.setInput(xml.reader())
        val items = ArrayList<NewsItem>()
        var title = ""; var link = ""; var source = ""; var date = ""
        var inItem = false
        var tag = ""
        while (parser.next() != XmlPullParser.END_DOCUMENT) {
            when (parser.eventType) {
                XmlPullParser.START_TAG -> {
                    tag = parser.name
                    if (tag == "item") { inItem = true; title = ""; link = ""; source = ""; date = "" }
                }
                XmlPullParser.TEXT -> if (inItem) when (tag) {
                    "title" -> title += parser.text
                    "link" -> link += parser.text
                    "source" -> source += parser.text
                    "pubDate" -> date += parser.text
                }
                XmlPullParser.END_TAG -> {
                    if (parser.name == "item") {
                        inItem = false
                        // Google News appends " - Source" to titles.
                        val clean = if (source.isNotBlank()) title.removeSuffix(" - $source") else title
                        val published = runCatching { ZonedDateTime.parse(date.trim(), DateTimeFormatter.RFC_1123_DATE_TIME) }.getOrNull()
                        items += NewsItem(clean.trim(), link.trim(), source.trim(), published)
                    }
                    tag = ""
                }
            }
        }
        return items
    }
}
