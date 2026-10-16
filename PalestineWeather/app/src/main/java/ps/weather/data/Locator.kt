package ps.weather.data

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Looper
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

/** Gets a fresh, precise device position (GPS first), falling back to the last known one. */
object Locator {
    @SuppressLint("MissingPermission")
    suspend fun current(context: Context, timeoutMs: Long = 15_000): Location? {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
            .filter { runCatching { lm.isProviderEnabled(it) }.getOrDefault(false) }
        for (provider in providers) {
            val fix = withTimeoutOrNull(timeoutMs) { single(lm, provider) }
            if (fix != null) return fix
        }
        return listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
            .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }
            .maxByOrNull { it.time }
    }

    @SuppressLint("MissingPermission")
    @Suppress("DEPRECATION")
    private suspend fun single(lm: LocationManager, provider: String): Location? = suspendCancellableCoroutine { cont ->
        if (Build.VERSION.SDK_INT >= 30) {
            val signal = android.os.CancellationSignal()
            cont.invokeOnCancellation { signal.cancel() }
            lm.getCurrentLocation(provider, signal, { it.run() }) { loc -> if (cont.isActive) cont.resume(loc) }
        } else {
            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    if (cont.isActive) cont.resume(location)
                }
                override fun onProviderDisabled(provider: String) {
                    if (cont.isActive) cont.resume(null)
                }
                // Abstract before API 30; must exist for older devices.
                override fun onProviderEnabled(provider: String) {}
                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(provider: String?, status: Int, extras: android.os.Bundle?) {}
            }
            cont.invokeOnCancellation { lm.removeUpdates(listener) }
            lm.requestSingleUpdate(provider, listener, Looper.getMainLooper())
        }
    }

    /** True when the point can be served (a little wider than the Palestine outline). */
    fun inBounds(lat: Double, lon: Double) = lat in 29.3..33.5 && lon in 34.0..36.0

    /** Exact GPS place named after its Arabic village / neighbourhood. */
    suspend fun locatePlace(context: Context): Result<City> {
        val loc = current(context) ?: return Result.failure(Exception("تعذّر تحديد موقعك — تأكد من تشغيل خدمة الموقع وحاول مجدداً"))
        if (!inBounds(loc.latitude, loc.longitude)) return Result.failure(Exception("موقعك الحالي خارج فلسطين"))
        val (name, area) = PlacesRepository.reverse(loc.latitude, loc.longitude)
        return Result.success(placeAt(name, loc.latitude, loc.longitude, PlaceKind.GPS, area, loc.accuracy.toInt()))
    }
}
