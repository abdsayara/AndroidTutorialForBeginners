package ps.weather.ui.components

import android.provider.Settings
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.runtime.State
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.platform.LocalContext
import ps.weather.data.Sky
import ps.weather.ui.theme.Pw
import kotlin.math.PI
import kotlin.math.sin
import kotlin.random.Random

private class Speck(val x: Float, val y: Float, val size: Float, val phase: Float, val speed: Int)

/**
 * The living sky behind every screen: the sun's glow breathes by day, clouds drift when it
 * is cloudy, stars twinkle at night, rain and snow fall and a storm flashes. The same moods
 * as the website. Drawn on one canvas; the animated values are read only while drawing, so
 * nothing recomposes. When the phone's animations are turned off, the sky stays still.
 */
@Composable
fun SkyBackground(sky: Sky, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val still = remember {
        runCatching { Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f }.getOrDefault(false)
    }
    val zero = remember { mutableFloatStateOf(0f) }
    val half = remember { mutableFloatStateOf(0.5f) }
    val specks = remember {
        val r = Random(7)
        List(90) { Speck(r.nextFloat(), r.nextFloat(), 0.6f + r.nextFloat() * 1.4f, r.nextFloat(), 1 + r.nextInt(2)) }
    }
    val t = rememberInfiniteTransition(label = "sky")
    val rainA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(900, easing = LinearEasing)), label = "rain")
    val twinkleA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(6000, easing = LinearEasing)), label = "twinkle")
    val snowA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(12000, easing = LinearEasing)), label = "snow")
    val driftA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(40000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "drift")
    val breatheA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(4500, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "breathe")
    val flashA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(9000, easing = LinearEasing)), label = "flash")
    // Read inside the draw block only; a still sky reads them as fixed values.
    val rain = if (still) zero else rainA
    val twinkle = if (still) zero else twinkleA
    val snow = if (still) zero else snowA
    val drift = if (still) half else driftA
    val breathe = if (still) half else breatheA
    val flash = if (still) zero else flashA

    Canvas(modifier) {
        drawRect(Brush.verticalGradient(Pw.skyStops(sky)))
        when (sky) {
            Sky.DAY -> {
                glow(Offset(size.width * 0.88f, -size.height * 0.02f), size.width * 0.75f, Color(0xFFFAAE3C), 0.30f + 0.14f * breathe.value)
                clouds(drift.value, 0.09f)
            }
            Sky.DUSK -> {
                glow(Offset(size.width * 0.15f, size.height * 1.04f), size.width * 0.95f, Color(0xFFFAAE3C), 0.32f + 0.14f * breathe.value)
                clouds(drift.value, 0.07f)
            }
            Sky.CLOUDY, Sky.FOG -> clouds(drift.value, 0.16f, many = true)
            Sky.NIGHT -> specks.forEach { s ->
                val a = 0.35f + 0.65f * (0.5f + 0.5f * sin(2 * PI.toFloat() * (twinkle.value + s.phase)))
                drawCircle(Color.White.copy(alpha = a), s.size * 1.1f, Offset(s.x * size.width, s.y * size.height))
            }
            Sky.RAIN, Sky.STORM -> {
                specks.forEach { s ->
                    // A whole number of screen heights per loop, so the fall never jumps.
                    val y = (s.y * size.height + rain.value * size.height * s.speed) % size.height
                    val x = s.x * size.width
                    val len = 14f + 10f * s.size
                    drawLine(Color.White.copy(alpha = 0.10f + 0.06f * s.size), Offset(x, y), Offset(x - len * 0.28f, y + len), 1.4f, StrokeCap.Round)
                }
                if (sky == Sky.STORM && flash.value in 0.955f..0.975f) drawRect(Color.White.copy(alpha = 0.12f))
            }
            Sky.SNOW -> specks.forEach { s ->
                val y = (s.y * size.height + snow.value * size.height) % size.height
                val x = s.x * size.width + 10f * sin(2 * PI.toFloat() * (snow.value * 3 + s.phase))
                drawCircle(Color.White.copy(alpha = 0.75f), 1.5f + s.size, Offset(x, y))
            }
        }
    }
}

private fun DrawScope.glow(center: Offset, radius: Float, color: Color, alpha: Float) {
    drawCircle(Brush.radialGradient(listOf(color.copy(alpha = alpha), Color.Transparent), center, radius), radius, center)
}

/** Soft cloud banks drifting side to side. */
private fun DrawScope.clouds(drift: Float, alpha: Float, many: Boolean = false) {
    val banks = if (many) listOf(
        Triple(0.20f, 0.16f, 0.55f), Triple(0.78f, 0.42f, 0.65f), Triple(0.30f, 0.74f, 0.50f), Triple(0.70f, 0.90f, 0.45f),
    ) else listOf(Triple(0.22f, 0.24f, 0.60f), Triple(0.72f, 0.60f, 0.50f))
    banks.forEachIndexed { i, (x, y, w) ->
        val dir = if (i % 2 == 0) 1f else -1f
        val c = Offset((x + dir * (drift - 0.5f) * 0.14f) * size.width, y * size.height)
        val rx = w * size.width
        val ry = rx * 0.28f
        drawOval(
            Brush.radialGradient(listOf(Color.White.copy(alpha = alpha), Color.Transparent), c, rx),
            topLeft = Offset(c.x - rx, c.y - ry), size = Size(rx * 2, ry * 2),
        )
    }
}
