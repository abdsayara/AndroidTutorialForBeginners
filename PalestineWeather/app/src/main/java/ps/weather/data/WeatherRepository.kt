package ps.weather.data

import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

data class CurrentWeather(
    val temp: Double,
    val apparent: Double,
    val humidity: Int,
    val windSpeed: Double,
    val windDirection: Int,
    val code: Int,
    val isDay: Boolean,
)

data class HourPoint(
    val time: LocalDateTime,
    val temp: Double,
    val precipProb: Int,
    val precip: Double,
    val code: Int,
    val wind: Double,
    val isDay: Boolean,
)

data class DayPoint(
    val date: LocalDate,
    val code: Int,
    val max: Double,
    val min: Double,
    val precipProbMax: Int,
    val precipSum: Double,
    val windMax: Double,
    val uvMax: Double,
    val sunrise: LocalDateTime?,
    val sunset: LocalDateTime?,
)

data class Forecast(
    val current: CurrentWeather,
    val hours: List<HourPoint>,
    val days: List<DayPoint>,
    /** Metres above sea level (negative below it), from Open-Meteo's 90 m terrain model. */
    val elevation: Double? = null,
) {
    /** Index of the current hour in [hours]. */
    val nowIndex: Int
        get() {
            val now = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS)
            return hours.indexOfFirst { !it.time.isBefore(now) }.coerceAtLeast(0)
        }
}

data class CityNow(val temp: Double, val wind: Double, val code: Int, val precipProb: Int, val elevation: Double? = null)

/** Hourly values on a regular lat/lon grid over Palestine, for the map's rain, cloud and storm layers. */
data class GridData(
    val lats: DoubleArray,
    val lons: DoubleArray,
    val times: List<LocalDateTime>,
    /** [point][hour] */
    val precip: List<DoubleArray>,
    val cloud: List<DoubleArray>,
    val cape: List<DoubleArray>,
    val nowIndex: Int,
)

/** Weather from Open-Meteo (https://open-meteo.com) — free, no API key. */
object WeatherRepository {
    private const val FORECAST = "https://api.open-meteo.com/v1/forecast"
    private const val AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"

    suspend fun forecast(lat: Double, lon: Double): Fetched<Forecast> {
        val url = "$FORECAST?latitude=$lat&longitude=$lon" +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m" +
            "&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset" +
            "&timezone=auto&forecast_days=7"
        return Http.get(url, "forecast_${lat}_$lon").map { parseForecast(JSONObject(it)) }
    }

    /** European AQI, or null when unavailable. */
    suspend fun airQuality(lat: Double, lon: Double): Int? = runCatching {
        val body = Http.get("$AIR?latitude=$lat&longitude=$lon&current=european_aqi", "aqi_${lat}_$lon").value
        JSONObject(body).getJSONObject("current").optDouble("european_aqi", Double.NaN)
            .takeIf { !it.isNaN() }?.toInt()
    }.getOrNull()

    suspend fun citiesNow(cities: List<City>): Fetched<Map<String, CityNow>> {
        val url = "$FORECAST?latitude=${cities.joinToString(",") { it.lat.toString() }}" +
            "&longitude=${cities.joinToString(",") { it.lon.toString() }}" +
            "&current=temperature_2m,wind_speed_10m,weather_code" +
            "&hourly=precipitation_probability&forecast_hours=1&timezone=auto"
        return Http.get(url, "cities_now").map { body ->
            val arr = asArray(body)
            cities.indices.associate { i ->
                val o = arr.getJSONObject(i)
                val c = o.getJSONObject("current")
                val prob = o.getJSONObject("hourly").getJSONArray("precipitation_probability").optInt(0, 0)
                cities[i].id to CityNow(
                    temp = c.optDouble("temperature_2m", 0.0),
                    wind = c.optDouble("wind_speed_10m", 0.0),
                    code = c.optInt("weather_code", 0),
                    precipProb = prob,
                    elevation = o.optDouble("elevation").takeIf { !it.isNaN() },
                )
            }
        }
    }

    suspend fun grid(): Fetched<GridData> {
        val lats = ArrayList<Double>()
        val lons = ArrayList<Double>()
        var lat = 29.5
        while (lat <= 33.25 + 1e-9) {
            var lon = 34.25
            while (lon <= 35.75 + 1e-9) {
                lats += lat; lons += lon
                lon += 0.25
            }
            lat += 0.25
        }
        val url = "$FORECAST?latitude=${lats.joinToString(",")}&longitude=${lons.joinToString(",")}" +
            "&hourly=precipitation,cloud_cover,cape&past_hours=3&forecast_hours=7&timezone=auto"
        return Http.get(url, "grid").map { body ->
            val arr = asArray(body)
            var times = emptyList<LocalDateTime>()
            val precip = ArrayList<DoubleArray>()
            val cloud = ArrayList<DoubleArray>()
            val cape = ArrayList<DoubleArray>()
            for (i in 0 until arr.length()) {
                val h = arr.getJSONObject(i).getJSONObject("hourly")
                if (i == 0) times = h.getJSONArray("time").strings().map(LocalDateTime::parse)
                precip += h.getJSONArray("precipitation").doubles()
                cloud += h.getJSONArray("cloud_cover").doubles()
                cape += h.getJSONArray("cape").doubles()
            }
            val now = LocalDateTime.now().truncatedTo(ChronoUnit.HOURS)
            val nowIndex = times.indexOfFirst { !it.isBefore(now) }.let { if (it < 0) times.size - 1 else it }
            GridData(lats.toDoubleArray(), lons.toDoubleArray(), times, precip, cloud, cape, nowIndex)
        }
    }

    private fun parseForecast(o: JSONObject): Forecast {
        val c = o.getJSONObject("current")
        val current = CurrentWeather(
            temp = c.optDouble("temperature_2m", 0.0),
            apparent = c.optDouble("apparent_temperature", 0.0),
            humidity = c.optInt("relative_humidity_2m", 0),
            windSpeed = c.optDouble("wind_speed_10m", 0.0),
            windDirection = c.optInt("wind_direction_10m", 0),
            code = c.optInt("weather_code", 0),
            isDay = c.optInt("is_day", 1) == 1,
        )

        val h = o.getJSONObject("hourly")
        val hTimes = h.getJSONArray("time").strings()
        val hTemp = h.getJSONArray("temperature_2m").doubles()
        val hProb = h.getJSONArray("precipitation_probability").doubles()
        val hPrecip = h.getJSONArray("precipitation").doubles()
        val hCode = h.getJSONArray("weather_code").doubles()
        val hWind = h.getJSONArray("wind_speed_10m").doubles()
        val hDay = h.getJSONArray("is_day").doubles()
        val hours = hTimes.indices.map { i ->
            HourPoint(
                time = LocalDateTime.parse(hTimes[i]),
                temp = hTemp[i].orZero(),
                precipProb = hProb[i].orZero().toInt(),
                precip = hPrecip[i].orZero(),
                code = hCode[i].orZero().toInt(),
                wind = hWind[i].orZero(),
                isDay = hDay[i].orZero() > 0.5,
            )
        }

        val d = o.getJSONObject("daily")
        val dTimes = d.getJSONArray("time").strings()
        val dCode = d.getJSONArray("weather_code").doubles()
        val dMax = d.getJSONArray("temperature_2m_max").doubles()
        val dMin = d.getJSONArray("temperature_2m_min").doubles()
        val dProb = d.getJSONArray("precipitation_probability_max").doubles()
        val dSum = d.getJSONArray("precipitation_sum").doubles()
        val dWind = d.getJSONArray("wind_speed_10m_max").doubles()
        val dUv = d.getJSONArray("uv_index_max").doubles()
        val dRise = d.getJSONArray("sunrise").strings()
        val dSet = d.getJSONArray("sunset").strings()
        val days = dTimes.indices.map { i ->
            DayPoint(
                date = LocalDate.parse(dTimes[i]),
                code = dCode[i].orZero().toInt(),
                max = dMax[i].orZero(),
                min = dMin[i].orZero(),
                precipProbMax = dProb[i].orZero().toInt(),
                precipSum = dSum[i].orZero(),
                windMax = dWind[i].orZero(),
                uvMax = dUv[i].orZero(),
                sunrise = dRise.getOrNull(i)?.let { runCatching { LocalDateTime.parse(it) }.getOrNull() },
                sunset = dSet.getOrNull(i)?.let { runCatching { LocalDateTime.parse(it) }.getOrNull() },
            )
        }
        return Forecast(current, hours, days, o.optDouble("elevation").takeIf { !it.isNaN() })
    }

    /** Open-Meteo returns an object for one location and an array for several. */
    private fun asArray(body: String): JSONArray =
        if (body.trimStart().startsWith("[")) JSONArray(body) else JSONArray().put(JSONObject(body))
}

internal fun JSONArray.doubles(): DoubleArray = DoubleArray(length()) { optDouble(it, Double.NaN) }
internal fun JSONArray.strings(): List<String> = List(length()) { optString(it) }
internal fun Double.orZero(): Double = if (isNaN()) 0.0 else this
