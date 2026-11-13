package ps.weather.data

import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

// Roads, the detailed bulletin, the daily reports and the weather stations come from the
// Palestine Weather web API, the same one the website uses, so the app and the site show
// the same thing and phones don't each scrape the sources.

private const val API = PlacesRepository.API

private fun JSONObject.str(key: String): String? = if (isNull(key)) null else optString(key).takeIf { it.isNotBlank() }
private fun JSONObject.num(key: String): Double? = if (isNull(key) || !has(key)) null else optDouble(key).takeIf { !it.isNaN() }
private fun <T> JSONArray.list(f: (JSONObject) -> T): List<T> = List(length()) { f(getJSONObject(it)) }

// ---------------------------------------------------------------- roads

enum class RoadStatus(val label: String, val rank: Int) {
    UNKNOWN("لا أخبار", 0), OPEN("سالك", 1), BUSY("أزمة", 2), CRISIS("أزمة خانقة", 3), CLOSED("مغلق", 4);

    companion object {
        fun of(s: String?) = when (s) {
            "open" -> OPEN; "busy" -> BUSY; "crisis" -> CRISIS; "closed" -> CLOSED; else -> UNKNOWN
        }
    }
}

data class Checkpoint(
    val id: String,
    val name: String,
    val city: String?,
    val lat: Double?,
    val lon: Double?,
    val into: RoadStatus,
    val out: RoadStatus,
    val status: RoadStatus,
    val at: Instant?,
)

data class Roads(val checkpoints: List<Checkpoint>, val cities: List<String>, val anySource: Boolean)

object RoadsRepository {
    suspend fun roads(): Fetched<Roads> = Http.get("$API/roads", "roads").map { body ->
        val d = JSONObject(body).getJSONObject("data")
        val cps = d.getJSONArray("checkpoints").list { o ->
            Checkpoint(
                id = o.getString("id"), name = o.getString("name"), city = o.str("city"),
                lat = o.num("lat"), lon = o.num("lon"),
                into = RoadStatus.of(o.str("into")), out = RoadStatus.of(o.str("out")),
                status = RoadStatus.of(o.str("status")),
                at = o.str("at")?.let { runCatching { Instant.parse(it) }.getOrNull() },
            )
        }
        val cities = d.optJSONArray("cities")?.list { it.getString("name") } ?: cps.mapNotNull { it.city }.distinct()
        val ok = d.optJSONArray("sources")?.list { it.optBoolean("ok") }?.any { it } ?: cps.isNotEmpty()
        Roads(cps, cities, ok)
    }
}

// ---------------------------------------------------------------- the detailed bulletin

data class BulletinDay(val day: String, val text: String)

/** The detailed bulletin's days, and the «شو نلبس بكرا؟» advice from the same page. */
data class Bulletin(val days: List<BulletinDay>, val wear: String?)

/** "الثلاثاء 10/11/2026" → that date, or null when the day has no date. */
fun bulletinDate(day: String): java.time.LocalDate? {
    // The site writes day/month/year, and sometimes year/month/day.
    Regex("(\\d{4})[/.\\-](\\d{1,2})[/.\\-](\\d{1,2})").find(day)?.destructured?.let { (y, m, d) ->
        return runCatching { java.time.LocalDate.of(y.toInt(), m.toInt(), d.toInt()) }.getOrNull()
    }
    return Regex("(\\d{1,2})[/.\\-](\\d{1,2})[/.\\-](\\d{4})").find(day)?.destructured?.let { (d, m, y) ->
        runCatching { java.time.LocalDate.of(y.toInt(), m.toInt(), d.toInt()) }.getOrNull()
    }
}

object BulletinRepository {
    suspend fun bulletin(): Fetched<Bulletin> = Http.get("$API/bulletin", "bulletin").map { body ->
        val d = JSONObject(body).getJSONObject("data")
        val today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Hebron"))
        Bulletin(
            d.getJSONArray("days").list { BulletinDay(it.optString("day"), it.optString("text")) }
                .filter { it.text.isNotBlank() }
                // A day's bulletin goes away once that day is over, even from the offline copy.
                .filter { bulletinDate(it.day)?.isBefore(today) != true },
            d.str("wear"),
        )
    }
}

// ---------------------------------------------------------------- daily reports

data class ReportItem(val id: Int, val title: String, val excerpt: String?, val tag: String?, val date: String?, val image: String?)

data class ReportArticle(val id: Int, val title: String, val date: String?, val tag: String?, val image: String?, val html: String)

object ReportsRepository {
    suspend fun list(): Fetched<List<ReportItem>> = Http.get("$API/reports", "reports").map { body ->
        JSONObject(body).getJSONArray("data").list { o ->
            ReportItem(o.getInt("id"), o.optString("title"), o.str("excerpt"), o.str("tag"), o.str("date"), o.str("image"))
        }
    }

    suspend fun article(id: Int): Fetched<ReportArticle> = Http.get("$API/report?id=$id", "report_$id").map { body ->
        val o = JSONObject(body).getJSONObject("data")
        ReportArticle(o.getInt("id"), o.optString("title"), o.str("date"), o.str("tag"), o.str("image"), o.optString("html"))
    }
}

// ---------------------------------------------------------------- weather stations

data class StationNow(
    val temp: Double?, val feelsLike: Double?, val high: Double?, val highAt: Instant?, val low: Double?, val lowAt: Instant?,
    val humidity: Double?, val wind: Double?, val gust: Double?, val windDir: Double?,
    val rain: Double?, val seasonalRain: Double?, val pressure: Double?, val pressureTrend: String?, val at: Instant?,
    val unitTemp: String, val unitWind: String, val unitRain: String, val unitPressure: String,
)

data class Station(val id: String, val name: String, val now: StationNow?)

object StationsRepository {
    private fun inst(s: String?) = s?.let { runCatching { Instant.parse(it) }.getOrNull() }

    suspend fun stations(): Fetched<List<Station>> = Http.get("$API/stations", "stations").map { body ->
        JSONObject(body).getJSONArray("data").list { o ->
            val n = o.optJSONObject("now")
            Station(
                o.getString("id"), o.optString("name"),
                n?.let {
                    StationNow(
                        it.num("temp"), it.num("feelsLike"), it.num("high"), inst(it.str("highAt")), it.num("low"), inst(it.str("lowAt")),
                        it.num("humidity"), it.num("wind"), it.num("gust"), it.num("windDir"),
                        it.num("rain"), it.num("seasonalRain"), it.num("pressure"), it.str("pressureTrend"),
                        inst(it.str("updated")),
                        it.optJSONObject("units")?.str("temp") ?: "°C", it.optJSONObject("units")?.str("wind") ?: "كم/س",
                        it.optJSONObject("units")?.str("rain") ?: "ملم", it.optJSONObject("units")?.str("pressure") ?: "مليبار",
                    )
                },
            )
        }
    }
}
