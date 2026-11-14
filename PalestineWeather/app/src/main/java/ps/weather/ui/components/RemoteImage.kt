package ps.weather.ui.components

import android.graphics.BitmapFactory
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import ps.weather.ui.theme.Pw
import java.net.HttpURLConnection
import java.net.URL

/** Report and satellite pictures kept in memory, sized down so they stay light. */
private object ImageCache {
    val memory = object : LruCache<String, ImageBitmap>(48 * 1024 * 1024) {
        override fun sizeOf(key: String, value: ImageBitmap) = value.width * value.height * 4
    }

    suspend fun load(url: String, maxSide: Int): ImageBitmap? = memory.get(url) ?: withContext(Dispatchers.IO) {
        runCatching {
            val conn = URL(url).openConnection() as HttpURLConnection
            conn.connectTimeout = 10_000
            conn.readTimeout = 20_000
            conn.setRequestProperty("User-Agent", "PalestineWeather/1.0 (Android)")
            // Pictures come from the web: only over https, and never larger than 12 MB.
            if (!url.startsWith("https://")) return@runCatching null
            val bytes = try { conn.inputStream.use { ps.weather.data.Http.readCapped(it, 12 * 1024 * 1024) } } finally { conn.disconnect() }
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
            var sample = 1
            while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= maxSide) sample *= 2
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = sample })
                ?.asImageBitmap()?.also { memory.put(url, it) }
        }.getOrNull()
    }
}

/** A picture from the web as a bitmap, or null when it cannot be fetched. */
suspend fun fetchImage(url: String, maxSide: Int = 1080): ImageBitmap? = ImageCache.load(url, maxSide)

/** A picture from the web; an empty glass box while it loads or when it cannot be fetched. */
@Composable
fun RemoteImage(url: String, modifier: Modifier = Modifier, maxSide: Int = 1080, contentScale: ContentScale = ContentScale.Crop) {
    val image by produceState<ImageBitmap?>(null, url) { value = ImageCache.load(url, maxSide) }
    val img = image
    if (img != null) Image(img, contentDescription = null, modifier = modifier, contentScale = contentScale)
    else Box(modifier.background(Pw.Card))
}
