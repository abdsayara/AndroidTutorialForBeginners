package ps.weather.data

import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder

/** A named village, town or city from OpenStreetMap, for the map. */
data class PlacePoint(val name: String, val lat: Double, val lon: Double, val isTown: Boolean)

/**
 * Villages, search and place names come from the Palestine Weather web API, which pulls
 * them from OpenStreetMap / GeoNames, keeps Arabic names only (never Hebrew), filters to
 * the Palestine outline and caches them — so phones don't each query OpenStreetMap.
 */
object PlacesRepository {
    const val API = "https://palestine-weather.vercel.app/api"

    /** Arabic script and no Hebrew letters. Checked again here in case the API ever changes. */
    fun isArabic(s: String?): Boolean =
        s != null && s.any { it in '؀'..'ۿ' } && s.none { it in '֐'..'׿' }

    suspend fun places(): Fetched<List<PlacePoint>> = Http.get("$API/places", "places").map { body ->
        val arr = JSONObject(body).getJSONArray("data")
        List(arr.length()) { i -> arr.getJSONArray(i) }
            .filter { isArabic(it.optString(0)) }
            .map { PlacePoint(it.getString(0), it.getDouble(1), it.getDouble(2), it.optString(3) != "v") }
    }

    /** Arabic (name, area) of the village / neighbourhood at a point; nulls when unknown. */
    suspend fun reverse(lat: Double, lon: Double): Pair<String?, String?> = runCatching {
        val body = Http.get("$API/reverse?lat=${round(lat)}&lon=${round(lon)}", "rev_${round(lat)}_${round(lon)}").value
        val d = JSONObject(body).getJSONObject("data")
        val name = d.optString("name").takeIf { !d.isNull("name") && isArabic(it) }
        val area = d.optString("area").takeIf { !d.isNull("area") && isArabic(it) }
        name to area
    }.getOrDefault(null to null)

    suspend fun search(query: String): List<City> {
        val q = URLEncoder.encode(query, "UTF-8")
        val body = Http.get("$API/search?q=$q", "search_${query.hashCode()}").value
        val arr: JSONArray = JSONObject(body).getJSONArray("data")
        return List(arr.length()) { arr.getJSONObject(it) }
            .filter { isArabic(it.optString("name")) }
            .map { o ->
                val area = o.optString("area").takeIf { !o.isNull("area") && isArabic(it) }
                placeAt(o.getString("name"), o.getDouble("lat"), o.getDouble("lon"), PlaceKind.VILLAGE, area)
            }
    }

    private fun round(v: Double) = "%.3f".format(java.util.Locale.US, v)
}
