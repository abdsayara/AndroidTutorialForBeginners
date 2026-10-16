package ps.weather.ui.components

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
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import ps.weather.ui.theme.Pw
import kotlin.math.cos
import kotlin.math.sin

private enum class Kind { SUN, MOON, PARTLY, CLOUD, RAIN, SNOW, STORM, FOG }

private fun kindOf(code: Int, isDay: Boolean): Kind = when (code) {
    0, 1 -> if (isDay) Kind.SUN else Kind.MOON
    2 -> Kind.PARTLY
    3 -> Kind.CLOUD
    45, 48 -> Kind.FOG
    in 51..67, in 80..82 -> Kind.RAIN
    in 71..77, 85, 86 -> Kind.SNOW
    in 95..99 -> Kind.STORM
    else -> Kind.CLOUD
}

/** A small drawn weather icon for a WMO weather code. */
@Composable
fun WeatherIcon(
    code: Int,
    modifier: Modifier = Modifier,
    isDay: Boolean = true,
    size: Dp = 24.dp,
    cloudColor: Color = Pw.Muted,
    sunColor: Color = Pw.Amber,
) {
    val kind = kindOf(code, isDay)
    Canvas(modifier.size(size)) {
        val s = this.size.minDimension
        val stroke = Stroke(width = s * 0.08f, cap = StrokeCap.Round)
        when (kind) {
            Kind.SUN -> sun(Offset(s / 2, s / 2), s * 0.2f, s * 0.14f, sunColor, stroke)
            Kind.MOON -> {
                val p = Path().apply {
                    addOval(androidx.compose.ui.geometry.Rect(Offset(s * 0.5f, s * 0.5f), s * 0.3f))
                }
                drawPath(p, cloudColor, style = stroke)
                drawCircle(sunColor, s * 0.06f, Offset(s * 0.62f, s * 0.38f))
            }
            Kind.PARTLY -> {
                sun(Offset(s * 0.36f, s * 0.34f), s * 0.13f, s * 0.09f, sunColor, stroke)
                cloud(Offset(s * 0.1f, s * 0.38f), s * 0.85f, cloudColor)
            }
            Kind.CLOUD -> cloud(Offset(s * 0.05f, s * 0.2f), s * 0.9f, cloudColor)
            Kind.FOG -> for (i in 0..2) {
                val y = s * (0.35f + i * 0.17f)
                drawLine(cloudColor, Offset(s * 0.15f, y), Offset(s * 0.85f, y), s * 0.08f, StrokeCap.Round)
            }
            Kind.RAIN, Kind.SNOW, Kind.STORM -> {
                cloud(Offset(s * 0.05f, s * 0.05f), s * 0.9f, cloudColor)
                when (kind) {
                    Kind.RAIN -> for (i in 0..2) {
                        val x = s * (0.3f + i * 0.2f)
                        drawLine(Pw.Blue, Offset(x, s * 0.72f), Offset(x - s * 0.06f, s * 0.9f), s * 0.08f, StrokeCap.Round)
                    }
                    Kind.SNOW -> for (i in 0..2) drawCircle(Pw.Blue, s * 0.05f, Offset(s * (0.3f + i * 0.2f), s * 0.82f))
                    else -> {
                        val bolt = Path().apply {
                            moveTo(s * 0.55f, s * 0.6f); lineTo(s * 0.42f, s * 0.8f); lineTo(s * 0.54f, s * 0.8f); lineTo(s * 0.46f, s * 0.98f)
                        }
                        drawPath(bolt, sunColor, style = stroke)
                    }
                }
            }
        }
    }
}

private fun DrawScope.sun(c: Offset, r: Float, ray: Float, color: Color, stroke: Stroke) {
    drawCircle(color, r, c)
    for (i in 0 until 8) {
        val a = Math.toRadians(i * 45.0)
        val from = Offset(c.x + cos(a).toFloat() * (r + ray * 0.45f), c.y + sin(a).toFloat() * (r + ray * 0.45f))
        val to = Offset(c.x + cos(a).toFloat() * (r + ray * 1.2f), c.y + sin(a).toFloat() * (r + ray * 1.2f))
        drawLine(color, from, to, stroke.width, StrokeCap.Round)
    }
}

/** Filled cloud inside a box whose top-left is [o] and width [w] (height ≈ 0.6 w). */
private fun DrawScope.cloud(o: Offset, w: Float, color: Color) {
    drawCircle(color, w * 0.2f, Offset(o.x + w * 0.32f, o.y + w * 0.4f))
    drawCircle(color, w * 0.25f, Offset(o.x + w * 0.55f, o.y + w * 0.3f))
    drawCircle(color, w * 0.17f, Offset(o.x + w * 0.76f, o.y + w * 0.43f))
    drawRoundRect(
        color, Offset(o.x + w * 0.12f, o.y + w * 0.38f), Size(w * 0.8f, w * 0.22f),
        CornerRadius(w * 0.11f, w * 0.11f),
    )
}
