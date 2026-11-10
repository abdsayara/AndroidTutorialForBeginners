package ps.weather.ui

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import ps.weather.R
import ps.weather.data.Forecast
import ps.weather.data.Sky
import ps.weather.data.skyKind
import ps.weather.data.summarize
import java.io.File
import java.time.LocalDate
import kotlin.math.roundToInt

/** The share card: one 1080×1350 picture of the weather for a place. Same layout as the website's. */
object ShareCard {
    private const val W = 1080
    private const val H = 1350
    private const val SITE = "palestine-weather.vercel.app"

    private fun skyColors(sky: Sky): IntArray = when (sky) {
        Sky.DAY -> intArrayOf(0xFF2A86C6.toInt(), 0xFF1F74B0.toInt(), 0xFF165A8A.toInt())
        Sky.NIGHT -> intArrayOf(0xFF1C3A5E.toInt(), 0xFF16304F.toInt(), 0xFF0E2038.toInt())
        Sky.DUSK -> intArrayOf(0xFFD2733E.toInt(), 0xFFA44F27.toInt(), 0xFF5E3550.toInt())
        Sky.CLOUDY -> intArrayOf(0xFF6A8597.toInt(), 0xFF4A6476.toInt(), 0xFF34495A.toInt())
        Sky.FOG -> intArrayOf(0xFF8293A0.toInt(), 0xFF5E707B.toInt(), 0xFF46545E.toInt())
        Sky.RAIN -> intArrayOf(0xFF3F5F78.toInt(), 0xFF2E4A60.toInt(), 0xFF1F3346.toInt())
        Sky.STORM -> intArrayOf(0xFF2E4157.toInt(), 0xFF213042.toInt(), 0xFF141E2B.toInt())
        Sky.SNOW -> intArrayOf(0xFF7194B3.toInt(), 0xFF4B6E8C.toInt(), 0xFF355069.toInt())
    }

    private fun deg(v: Double?) = v?.let { "${it.roundToInt()}°" } ?: "—"

    fun draw(context: Context, placeName: String, fc: Forecast): Bitmap {
        val bmp = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888)
        val cv = Canvas(bmp)
        val c = fc.current
        val today = fc.days.firstOrNull()
        val white = 0xFFFFFFFF.toInt()

        val bg = Paint().apply { shader = LinearGradient(0f, 0f, W * 0.3f, H.toFloat(), skyColors(skyKind(fc)), null, Shader.TileMode.CLAMP) }
        cv.drawRect(0f, 0f, W.toFloat(), H.toFloat(), bg)
        val glow = Paint().apply { shader = RadialGradient(250f, 470f, 420f, 0x33FFFFFF, 0x00FFFFFF, Shader.TileMode.CLAMP) }
        cv.drawRect(0f, 0f, W.toFloat(), H.toFloat(), glow)

        val right = W - 84f
        val bold = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        fun text(size: Float, color: Int = white, weight: Typeface = bold, align: Paint.Align = Paint.Align.RIGHT) =
            TextPaint(Paint.ANTI_ALIAS_FLAG).apply { textSize = size; this.color = color; typeface = weight; textAlign = align }

        // Brand row: the logo on a white tile, then the name.
        val tile = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = white }
        cv.drawRoundRect(RectF(right - 112, 76f, right, 168f), 24f, 24f, tile)
        ContextCompat.getDrawable(context, R.drawable.logo)?.apply {
            setBounds((right - 102).toInt(), 88, (right - 10).toInt(), 158)
            draw(cv)
        }
        cv.drawText("طقس فلسطين", right - 136, 136f, text(40f))

        // Place and date.
        cv.drawText(placeName, right, 320f, text(84f))
        cv.drawText(arabicDate(LocalDate.now()), right, 380f, text(36f, 0xD9FFFFFF.toInt(), Typeface.DEFAULT))

        // Temperature and condition; a sun or a moon on the left.
        cv.drawText(deg(c.temp), right, 660f, text(250f))
        cv.drawText(weatherText(c.code), right, 750f, text(52f))
        val disc = Paint(Paint.ANTI_ALIAS_FLAG)
        if (c.isDay) {
            disc.color = 0xFFFAAE3C.toInt()
            cv.drawCircle(255f, 495f, 110f, disc)
        } else {
            disc.color = white
            val moon = Path().apply { addCircle(255f, 495f, 110f, Path.Direction.CW) }
            val bite = Path().apply { addCircle(315f, 445f, 95f, Path.Direction.CW) }
            moon.op(bite, Path.Op.DIFFERENCE)
            cv.drawPath(moon, disc)
        }

        // Facts: high, low, rain and wind.
        val facts = listOf(
            "العظمى" to deg(today?.max), "الصغرى" to deg(today?.min),
            "المطر" to "${today?.precipProbMax ?: 0}%", "الرياح" to "${c.windSpeed.roundToInt()} كم/س",
        )
        val gap = 20f
        val tw = (right - 84f - gap * 3) / 4
        val box = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0x24FFFFFF }
        facts.forEachIndexed { i, (label, value) ->
            val x = right - (i + 1) * tw - i * gap
            cv.drawRoundRect(RectF(x, 820f, x + tw, 970f), 28f, 28f, box)
            cv.drawText(label, x + tw / 2, 875f, text(30f, 0xCCFFFFFF.toInt(), Typeface.DEFAULT, Paint.Align.CENTER))
            cv.drawText(value, x + tw / 2, 940f, text(42f, align = Paint.Align.CENTER))
        }

        // The summary sentence, wrapped right to left.
        val sumPaint = text(40f, weight = Typeface.DEFAULT, align = Paint.Align.LEFT)
        val summary = summarize(fc)
        val layout = StaticLayout.Builder.obtain(summary, 0, summary.length, sumPaint, (right - 84f).toInt())
            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
            .setTextDirection(TextDirectionHeuristics.RTL)
            .setLineSpacing(14f, 1f)
            .setMaxLines(3)
            .build()
        cv.save()
        cv.translate(84f, 1015f)
        layout.draw(cv)
        cv.restore()

        // Footer.
        cv.drawRect(84f, H - 130f, right, H - 128f, Paint().apply { color = 0x2EFFFFFF })
        cv.drawText(SITE, 84f, H - 70f, text(32f, 0xE6FFFFFF.toInt(), Typeface.DEFAULT, Paint.Align.LEFT))
        cv.drawText("الطقس في كل مدينة وقرية فلسطينية", right, H - 70f, text(32f, 0xE6FFFFFF.toInt(), Typeface.DEFAULT))
        return bmp
    }

    /** Draws the card, saves it to the cache and opens the system share sheet. */
    fun share(context: Context, placeName: String, fc: Forecast) {
        val dir = File(context.cacheDir, "share").apply { mkdirs() }
        val file = File(dir, "palestine-weather.png")
        file.outputStream().use { draw(context, placeName, fc).compress(Bitmap.CompressFormat.PNG, 100, it) }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.share", file)
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "image/png"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_TEXT, "الطقس في $placeName: ${deg(fc.current.temp)}، ${weatherText(fc.current.code)} — $SITE")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(send, "مشاركة الطقس").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
}
