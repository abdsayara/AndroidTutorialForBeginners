package ps.weather.data

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

enum class Region(val label: String) {
    WEST_BANK("الضفة"),
    GAZA("قطاع غزة"),
    INTERIOR("الداخل"),
}

enum class PlaceKind { CITY, VILLAGE, GPS }

/**
 * A place the user can pick: one of the listed [CITIES], a village / town found on the
 * map or by search, or the exact GPS position. Non-city places take the region of the
 * nearest listed city.
 */
data class City(
    val id: String,
    val name: String,
    val lat: Double,
    val lon: Double,
    val region: Region,
    /** Major cities are always labelled on the map; the rest appear when zoomed in. */
    val major: Boolean,
    val kind: PlaceKind = PlaceKind.CITY,
    /** Governorate / nearby town, for villages and GPS points. */
    val area: String? = null,
    /** GPS accuracy in metres. */
    val accuracyM: Int? = null,
    /** Metres above sea level, when the source gives it (search results). */
    val elevation: Double? = null,
) {
    val isListed: Boolean get() = kind == PlaceKind.CITY
}

/** Builds a village / GPS place, naming its area after the nearest listed city when unknown. */
fun placeAt(
    name: String?, lat: Double, lon: Double, kind: PlaceKind,
    area: String? = null, accuracyM: Int? = null, elevation: Double? = null,
): City {
    val near = nearestCity(lat, lon)
    return City(
        id = if (kind == PlaceKind.GPS) "gps" else "p${"%.4f".format(java.util.Locale.US, lat)}_${"%.4f".format(java.util.Locale.US, lon)}",
        name = name ?: "قرب ${near.name}",
        lat = lat, lon = lon, region = near.region, major = false,
        kind = kind, area = area ?: near.name, accuracyM = accuracyM, elevation = elevation,
    )
}

val CITIES = listOf(
    City("jerusalem", "القدس", 31.7683, 35.2137, Region.WEST_BANK, true),
    City("ramallah", "رام الله", 31.9038, 35.2034, Region.WEST_BANK, false),
    City("nablus", "نابلس", 32.2211, 35.2544, Region.WEST_BANK, true),
    City("jenin", "جنين", 32.4646, 35.3027, Region.WEST_BANK, false),
    City("tulkarm", "طولكرم", 32.3104, 35.0286, Region.WEST_BANK, false),
    City("qalqilya", "قلقيلية", 32.1896, 34.9706, Region.WEST_BANK, false),
    City("hebron", "الخليل", 31.5326, 35.0998, Region.WEST_BANK, true),
    City("bethlehem", "بيت لحم", 31.7054, 35.2024, Region.WEST_BANK, false),
    City("jericho", "أريحا", 31.8667, 35.4444, Region.WEST_BANK, true),
    City("tubas", "طوباس", 32.3209, 35.3699, Region.WEST_BANK, false),
    City("salfit", "سلفيت", 32.0836, 35.1806, Region.WEST_BANK, false),
    City("gaza", "غزة", 31.5017, 34.4668, Region.GAZA, true),
    City("khanyunis", "خان يونس", 31.3462, 34.3063, Region.GAZA, false),
    City("rafah", "رفح", 31.2969, 34.2654, Region.GAZA, false),
    City("deirbalah", "دير البلح", 31.4181, 34.3517, Region.GAZA, false),
    City("haifa", "حيفا", 32.7940, 34.9896, Region.INTERIOR, true),
    City("akka", "عكا", 32.9281, 35.0818, Region.INTERIOR, false),
    City("jaffa", "يافا", 32.0504, 34.7520, Region.INTERIOR, true),
    City("lydd", "اللد", 31.9514, 34.8955, Region.INTERIOR, false),
    City("nazareth", "الناصرة", 32.6996, 35.3035, Region.INTERIOR, true),
    City("safad", "صفد", 32.9646, 35.4960, Region.INTERIOR, false),
    City("tiberias", "طبريا", 32.7922, 35.5312, Region.INTERIOR, false),
    City("beersheba", "بئر السبع", 31.2518, 34.7913, Region.INTERIOR, true),
    City("umrashrash", "أم الرشراش", 29.5577, 34.9519, Region.INTERIOR, true),
)

fun cityById(id: String?): City = CITIES.firstOrNull { it.id == id } ?: CITIES.first()

/** Great-circle distance in km. */
fun distanceKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val r = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
    return 2 * r * asin(sqrt(a))
}

fun nearestCity(lat: Double, lon: Double): City = CITIES.minBy { distanceKm(lat, lon, it.lat, it.lon) }
