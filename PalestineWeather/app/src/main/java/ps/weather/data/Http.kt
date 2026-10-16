package ps.weather.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** A value plus where it came from: the network, or the on-disk copy of the last good response. */
data class Fetched<T>(val value: T, val fromCache: Boolean, val savedAt: Long) {
    fun <R> map(transform: (T) -> R): Fetched<R> = Fetched(transform(value), fromCache, savedAt)
}

/**
 * Tiny HTTP client. Every successful response is written to disk so the app keeps
 * working offline (connectivity is often unreliable): when a request fails, the last
 * saved copy is returned and flagged as [Fetched.fromCache].
 */
object Http {
    private lateinit var dir: File

    fun init(context: Context) {
        dir = File(context.filesDir, "http-cache").apply { mkdirs() }
    }

    suspend fun get(url: String, cacheKey: String): Fetched<String> = withContext(Dispatchers.IO) {
        val file = File(dir, cacheKey.replace(Regex("[^A-Za-z0-9_.-]"), "_") + ".cache")
        try {
            val body = download(url)
            file.writeText(body)
            Fetched(body, fromCache = false, savedAt = System.currentTimeMillis())
        } catch (e: Exception) {
            if (file.exists()) Fetched(file.readText(), fromCache = true, savedAt = file.lastModified())
            else throw e
        }
    }

    private fun download(url: String): String {
        val conn = URL(url).openConnection() as HttpURLConnection
        try {
            conn.connectTimeout = 10_000
            conn.readTimeout = 20_000
            conn.setRequestProperty("User-Agent", "PalestineWeather/1.0 (Android)")
            val code = conn.responseCode
            if (code !in 200..299) throw IOException("HTTP $code")
            return conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }
}
