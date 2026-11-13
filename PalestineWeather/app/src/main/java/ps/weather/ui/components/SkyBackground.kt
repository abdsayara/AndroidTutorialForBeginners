package ps.weather.ui.components

import android.provider.Settings
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.LocalContext
import ps.weather.data.Sky
import ps.weather.ui.theme.Pw
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

private class Speck(val x: Float, val y: Float, val size: Float, val phase: Float, val speed: Int)

/** A puffy cloud: a few soft round lobes, crossing the screen [laps] times per loop. */
private class Cloud(val x0: Float, val y: Float, val width: Float, val laps: Int, val lobes: List<Triple<Float, Float, Float>>)

private fun clouds(seed: Int, n: Int, yMin: Float, yMax: Float, wMin: Float, wMax: Float): List<Cloud> {
    val r = Random(seed)
    return List(n) {
        val lobes = List(5 + r.nextInt(3)) { i ->
            // Lobes along the cloud's length, the middle ones taller.
            val t = i / 6f
            Triple(t, -0.10f - 0.16f * sin(PI.toFloat() * t) * (0.7f + r.nextFloat() * 0.6f), 0.18f + 0.10f * sin(PI.toFloat() * t) + r.nextFloat() * 0.05f)
        }
        Cloud(r.nextFloat(), yMin + r.nextFloat() * (yMax - yMin), wMin + r.nextFloat() * (wMax - wMin), 1 + r.nextInt(2), lobes)
    }
}

/**
 * The living sky behind every screen, by the weather of the chosen place:
 * - day: a glowing sun whose light rays turn slowly, puffy clouds drifting across;
 * - cloudy and fog: layers of clouds moving at different speeds;
 * - rain and storm: dark clouds, falling rain, and lightning in a storm;
 * - snow: clouds and falling flakes; night: twinkling stars, the moon's glow, a shooting star.
 * Animated values are read only while drawing, so nothing recomposes. Still when the phone's
 * animations are turned off.
 */
@Composable
fun SkyBackground(sky: Sky, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val still = remember {
        runCatching { Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f }.getOrDefault(false)
    }
    val specks = remember {
        val r = Random(7)
        List(110) { Speck(r.nextFloat(), r.nextFloat(), 0.6f + r.nextFloat() * 1.4f, r.nextFloat(), 1 + r.nextInt(2)) }
    }
    val near = remember { clouds(3, 3, 0.10f, 0.55f, 0.45f, 0.70f) }
    val far = remember { clouds(11, 4, 0.04f, 0.75f, 0.30f, 0.50f) }

    val t = rememberInfiniteTransition(label = "sky")
    val rainA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(900, easing = LinearEasing)), label = "rain")
    val twinkleA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(6000, easing = LinearEasing)), label = "twinkle")
    val snowA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(12000, easing = LinearEasing)), label = "snow")
    val cloudA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(90_000, easing = LinearEasing)), label = "clouds")
    val raysA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(60_000, easing = LinearEasing)), label = "rays")
    val breatheA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(4500, easing = LinearEasing), RepeatMode.Reverse), label = "breathe")
    val flashA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(9000, easing = LinearEasing)), label = "flash")
    val shootA = t.animateFloat(0f, 1f, infiniteRepeatable(tween(11_000, easing = LinearEasing)), label = "shoot")
    val zero = remember { mutableFloatStateOf(0f) }
    val half = remember { mutableFloatStateOf(0.5f) }
    fun v(s: State<Float>, rest: State<Float> = zero) = if (still) rest.value else s.value

    Canvas(modifier) {
        drawRect(Brush.verticalGradient(Pw.skyStops(sky)))
        val c = v(cloudA)
        when (sky) {
            Sky.DAY -> {
                sun(v(breatheA, half), v(raysA))
                drawClouds(far, c, Color.White, 0.10f, 0.6f)
                drawClouds(near, c, Color.White, 0.16f, 1f)
            }
            Sky.CLOUDY, Sky.FOG -> {
                drawClouds(far, c, Color.White, 0.16f, 0.7f)
                drawClouds(near, c, Color.White, 0.22f, 1.2f)
                if (sky == Sky.FOG) drawRect(Brush.verticalGradient(listOf(Color.Transparent, Color.White.copy(alpha = 0.12f))))
            }
            Sky.NIGHT -> {
                glow(Offset(size.width * 0.82f, size.height * 0.10f), size.width * 0.35f, Color(0xFFDDE7FF), 0.16f)
                val tw = v(twinkleA)
                specks.forEach { s ->
                    val a = 0.35f + 0.65f * (0.5f + 0.5f * sin(2 * PI.toFloat() * (tw + s.phase)))
                    drawCircle(Color.White.copy(alpha = a), s.size * 1.1f, Offset(s.x * size.width, s.y * size.height * 0.85f))
                }
                shootingStar(v(shootA))
                drawClouds(far, c, Color.White, 0.05f, 0.6f)
            }
            Sky.RAIN, Sky.STORM -> {
                drawClouds(far, c, Color(0xFF1B2A38), 0.30f, 0.9f)
                drawClouds(near, c, Color(0xFF2A3B4B), 0.35f, 1.2f)
                val rv = v(rainA)
                specks.forEach { s ->
                    // A whole number of screen heights per loop, so the fall never jumps.
                    val y = (s.y * size.height + rv * size.height * s.speed) % size.height
                    val x = s.x * size.width
                    val len = 14f + 10f * s.size
                    drawLine(Color.White.copy(alpha = 0.12f + 0.06f * s.size), Offset(x, y), Offset(x - len * 0.28f, y + len), 1.4f, StrokeCap.Round)
                }
                if (sky == Sky.STORM && v(flashA) in 0.955f..0.975f) drawRect(Color.White.copy(alpha = 0.16f))
            }
            Sky.SNOW -> {
                drawClouds(far, c, Color.White, 0.14f, 0.7f)
                val sv = v(snowA)
                specks.forEach { s ->
                    val y = (s.y * size.height + sv * size.height) % size.height
                    val x = s.x * size.width + 10f * sin(2 * PI.toFloat() * (sv * 3 + s.phase))
                    drawCircle(Color.White.copy(alpha = 0.8f), 1.5f + s.size, Offset(x, y))
                }
            }
        }
    }
}

private fun DrawScope.glow(center: Offset, radius: Float, color: Color, alpha: Float) {
    drawCircle(Brush.radialGradient(listOf(color.copy(alpha = alpha), Color.Transparent), center, radius), radius, center)
}

/** The sun at the top corner: a breathing glow, a bright disc and long rays turning slowly. */
private fun DrawScope.sun(breathe: Float, turn: Float) {
    val center = Offset(size.width * 0.86f, size.height * 0.07f)
    glow(center, size.width * 0.9f, Color(0xFFFAAE3C), 0.26f + 0.12f * breathe)
    val reach = size.height * 0.75f
    rotate(turn * 360f, pivot = center) {
        repeat(8) { i ->
            val a = (i / 8f) * 2 * PI.toFloat()
            val spread = 0.07f
            val ray = Path().apply {
                moveTo(center.x, center.y)
                lineTo(center.x + reach * cos(a - spread), center.y + reach * sin(a - spread))
                lineTo(center.x + reach * cos(a + spread), center.y + reach * sin(a + spread))
                close()
            }
            drawPath(ray, Brush.radialGradient(listOf(Color.White.copy(alpha = 0.10f), Color.Transparent), center, reach))
        }
    }
    glow(center, size.width * 0.16f, Color(0xFFFFF4D6), 0.55f)
}

/** Clouds drifting left to right; each crosses whole laps per loop, so the drift never jumps. */
private fun DrawScope.drawClouds(list: List<Cloud>, t: Float, color: Color, alpha: Float, scale: Float) {
    list.forEach { cl ->
        val w = cl.width * size.width * scale
        val span = size.width + 2 * w
        val x = ((cl.x0 + t * cl.laps) % 1f) * span - w
        val y = cl.y * size.height
        cl.lobes.forEach { (lx, ly, lr) ->
            val center = Offset(x + lx * w, y + ly * w)
            val r = lr * w
            drawCircle(Brush.radialGradient(listOf(color.copy(alpha = alpha), color.copy(alpha = alpha * 0.6f), Color.Transparent), center, r), r, center)
        }
    }
}

/** Once a loop, a short streak crosses the upper sky. */
private fun DrawScope.shootingStar(t: Float) {
    if (t > 0.10f) return
    val p = t / 0.10f
    val start = Offset(size.width * 0.15f, size.height * 0.08f)
    val end = Offset(size.width * 0.65f, size.height * 0.30f)
    val head = Offset(start.x + (end.x - start.x) * p, start.y + (end.y - start.y) * p)
    val tail = Offset(head.x - (end.x - start.x) * 0.18f, head.y - (end.y - start.y) * 0.18f)
    drawLine(
        Brush.linearGradient(listOf(Color.Transparent, Color.White.copy(alpha = 0.9f * (1f - p))), tail, head),
        tail, head, 2.4f, StrokeCap.Round,
    )
}
