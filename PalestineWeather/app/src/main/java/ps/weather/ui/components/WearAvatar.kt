package ps.weather.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import ps.weather.data.DayPoint

enum class WearKind { COLD, COOL, MILD, WARM }

/** The avatar's outfit for a day: by its high, plus an umbrella when rain is likely. Same rule as the website. */
fun wearKind(day: DayPoint?): Pair<WearKind, Boolean> {
    if (day == null) return WearKind.MILD to false
    val kind = when {
        day.max < 12 -> WearKind.COLD
        day.max < 18 -> WearKind.COOL
        day.max < 26 -> WearKind.MILD
        else -> WearKind.WARM
    }
    return kind to (day.precipProbMax >= 50)
}

private val SKIN = Color(0xFFF2C29B)
private val INK = Color(0xFF2B2B2B)

/**
 * The «شو نلبس؟» figure, dressed for the day: a coat, scarf and woolly hat in the cold, a jacket
 * when it is cool, a sweater when mild, a t-shirt, cap and sunglasses when warm, an umbrella for
 * rain. Drawn on the website's 120×120 grid (public/avatar.js) and gently bobbing.
 */
@Composable
fun WearAvatar(kind: WearKind, rain: Boolean, size: Dp = 84.dp, modifier: Modifier = Modifier) {
    val t = rememberInfiniteTransition(label = "avatar")
    val bob = t.animateFloat(0f, 1f, infiniteRepeatable(tween(1600, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "bob")
    val (top, legs) = when (kind) {
        WearKind.COLD -> Color(0xFFC8453B) to Color(0xFF2E4A6B)
        WearKind.COOL -> Color(0xFF2F6FB5) to Color(0xFF33475E)
        WearKind.MILD -> Color(0xFF2F9E6E) to Color(0xFF3B4F66)
        WearKind.WARM -> Color(0xFFF2B33D) to Color(0xFF5A7FA8)
    }
    Canvas(modifier.size(size)) {
        val k = this.size.minDimension / 120f
        translate(top = -3f * k * bob.value) {
            rotate(-2f * bob.value, pivot = Offset(this.size.width / 2, this.size.height)) {
                scale(k, k, pivot = Offset.Zero) { figure(kind, rain, top, legs) }
            }
        }
    }
}

private fun DrawScope.rr(x: Float, y: Float, w: Float, h: Float, r: Float, c: Color) =
    drawRoundRect(c, Offset(x, y), Size(w, h), CornerRadius(r, r))

private fun DrawScope.figure(kind: WearKind, rain: Boolean, top: Color, legs: Color) {
    if (rain) {
        val canopy = Path().apply {
            moveTo(22f, 30f); quadraticBezierTo(66f, -8f, 110f, 30f)
            quadraticBezierTo(99f, 23f, 88f, 30f); quadraticBezierTo(77f, 23f, 66f, 30f)
            quadraticBezierTo(55f, 23f, 44f, 30f); quadraticBezierTo(33f, 23f, 22f, 30f); close()
        }
        drawPath(canopy, Color(0xFF3E7CC4))
        val handle = Path().apply { moveTo(88f, 28f); lineTo(88f, 88f); quadraticBezierTo(88f, 94f, 83f, 94f) }
        drawPath(handle, INK, style = Stroke(2.6f, cap = StrokeCap.Round))
    }
    // Legs and shoes.
    rr(46f, 86f, 11f, 26f, 5f, legs); rr(63f, 86f, 11f, 26f, 5f, legs)
    drawOval(INK, Offset(42f, 109f), Size(16f, 8f)); drawOval(INK, Offset(62f, 109f), Size(16f, 8f))
    // Arms: short sleeves show the skin.
    val short = kind == WearKind.WARM
    for (x in listOf(28f, 80f)) {
        rr(x, 60f, 12f, 27f, 6f, if (short) SKIN else top)
        if (short) rr(x, 58f, 12f, 12f, 5f, top)
    }
    drawCircle(SKIN, 5.5f, Offset(34f, 88f)); drawCircle(SKIN, 5.5f, Offset(86f, 88f))
    rr(38f, 55f, 44f, 37f, 14f, top)
    if (kind == WearKind.COOL || kind == WearKind.COLD) drawLine(Color.White.copy(alpha = 0.55f), Offset(60f, 58f), Offset(60f, 91f), 2f)
    if (kind == WearKind.COLD) { rr(43f, 51f, 34f, 9f, 4.5f, Color(0xFFF2B33D)); rr(65f, 56f, 7f, 20f, 3f, Color(0xFFF2B33D)) }
    // Head and face.
    drawCircle(SKIN, 18f, Offset(60f, 38f))
    drawCircle(Color(0xFFF08A8A).copy(alpha = 0.45f), 3.2f, Offset(49f, 43.5f))
    drawCircle(Color(0xFFF08A8A).copy(alpha = 0.45f), 3.2f, Offset(71f, 43.5f))
    val smile = Path().apply { moveTo(53f, 45f); quadraticBezierTo(60f, 51f, 67f, 45f) }
    drawPath(smile, Color(0xFF5B3A29), style = Stroke(2.2f, cap = StrokeCap.Round))
    if (kind == WearKind.WARM) {
        rr(47f, 33f, 11f, 7f, 3f, Color(0xFF1F2A36)); rr(62f, 33f, 11f, 7f, 3f, Color(0xFF1F2A36))
        drawLine(Color(0xFF1F2A36), Offset(58f, 36f), Offset(62f, 36f), 2f)
    } else {
        drawCircle(INK, 2.3f, Offset(53f, 37f)); drawCircle(INK, 2.3f, Offset(67f, 37f))
    }
    // Hair or hat.
    when (kind) {
        WearKind.COLD -> {
            drawPath(Path().apply { moveTo(41f, 33f); quadraticBezierTo(41f, 15f, 60f, 15f); quadraticBezierTo(79f, 15f, 79f, 33f); close() }, Color(0xFF2F6FB5))
            rr(40f, 29f, 40f, 7f, 3.5f, Color(0xFF24599A))
            drawCircle(Color.White, 4.5f, Offset(60f, 14f))
        }
        WearKind.WARM -> {
            drawPath(Path().apply { moveTo(42f, 30f); quadraticBezierTo(42f, 18f, 60f, 18f); quadraticBezierTo(78f, 18f, 78f, 30f); close() }, Color(0xFFE8505B))
            rr(58f, 27f, 30f, 5f, 2.5f, Color(0xFFC93C47))
        }
        else -> drawPath(
            Path().apply {
                moveTo(42f, 36f); quadraticBezierTo(42f, 18f, 60f, 18f); quadraticBezierTo(78f, 18f, 78f, 36f)
                quadraticBezierTo(71f, 27f, 60f, 27f); quadraticBezierTo(49f, 27f, 42f, 36f); close()
            },
            Color(0xFF4A3426),
        )
    }
}
