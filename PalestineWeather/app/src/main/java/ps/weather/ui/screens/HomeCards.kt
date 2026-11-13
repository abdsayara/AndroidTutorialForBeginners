package ps.weather.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.absoluteOffset
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import ps.weather.data.DayPoint
import ps.weather.data.Forecast
import ps.weather.data.PrayerDay
import ps.weather.data.sunDay
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.WeatherIcon
import ps.weather.ui.relativeDayName
import ps.weather.ui.theme.Pw
import java.time.Duration
import java.time.LocalDateTime
import java.time.LocalTime
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/** The prayer ring's teal and the sun arc's gold, as in the reference design. */
private val TEAL = Color(0xFF3CCFC4)
private val GOLD = Color(0xFFF1C75B)

private fun clock12(t: LocalTime): String {
    val h = t.hour % 12
    return "${if (h == 0) 12 else h}:${t.minute.toString().padStart(2, '0')} ${if (t.hour < 12) "ص" else "م"}"
}

@Composable
private fun HalfCard(modifier: Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier.clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 14.dp, vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) { content() }
}

/** «الصلاة القادمة» and «الشروق والغروب», side by side. */
@Composable
fun PrayerSunRow(today: DayPoint, prayer: PrayerDay?, onPrayer: () -> Unit) {
    var now by remember { mutableStateOf(LocalDateTime.now()) }
    LaunchedEffect(Unit) { while (true) { delay(1000); now = LocalDateTime.now() } }
    Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        if (prayer != null) PrayerRingCard(prayer, now, onPrayer, Modifier.weight(1f).fillMaxHeight())
        SunArcCard(today, now, Modifier.weight(1f).fillMaxHeight())
    }
}

/** The next prayer: a ring that fills from the last prayer to the next, the time left ticking. */
@Composable
private fun PrayerRingCard(prayer: PrayerDay, now: LocalDateTime, onPrayer: () -> Unit, modifier: Modifier) {
    val list = prayer.times.filter { it.first != "الشروق" }
    if (list.isEmpty()) return
    val today = now.toLocalDate()
    val stamps = list.map { it.first to today.atTime(it.second) }
    val next = stamps.firstOrNull { it.second.isAfter(now) } ?: (list.first().first to today.plusDays(1).atTime(list.first().second))
    val prev = stamps.lastOrNull { !it.second.isAfter(now) } ?: (list.last().first to today.minusDays(1).atTime(list.last().second))
    val total = Duration.between(prev.second, next.second).seconds.coerceAtLeast(1)
    val left = Duration.between(now, next.second).seconds.coerceAtLeast(0)
    val progress = (1f - left.toFloat() / total).coerceIn(0f, 1f)
    val night = next.first in listOf("المغرب", "العشاء", "الفجر")
    HalfCard(modifier) {
        Text("الصلاة القادمة", fontSize = 15.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())
        Box(Modifier.size(132.dp), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                val stroke = 9.dp.toPx()
                val inset = stroke / 2
                val box = Size(size.width - stroke, size.height - stroke)
                drawArc(Color.White.copy(alpha = 0.12f), 135f, 270f, false, Offset(inset, inset), box, style = Stroke(stroke, cap = StrokeCap.Round))
                drawArc(TEAL, 135f + 270f * (1 - progress), 270f * progress, false, Offset(inset, inset), box, style = Stroke(stroke, cap = StrokeCap.Round))
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Icon(if (night) PwIcons.Moon else PwIcons.Sun, null, tint = if (night) Color(0xFFDCE6F5) else GOLD, modifier = Modifier.size(22.dp))
                Text("الوقت المتبقي", fontSize = 11.sp, color = Pw.Muted)
                val h = left / 3600; val m = (left % 3600) / 60; val s = left % 60
                Text(
                    "⁦%02d:%02d:%02d⁩".format(h, m, s), fontSize = 20.sp, fontWeight = FontWeight.Bold,
                )
            }
        }
        Text(clock12(next.second.toLocalTime()), fontSize = 15.sp, color = Pw.Muted)
        Text("صلاة ${next.first}", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.weight(1f))
        Row(
            Modifier.clip(RoundedCornerShape(12.dp)).background(Color.White.copy(alpha = 0.10f))
                .clickable(role = Role.Button, onClick = onPrayer).padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text("عرض الكل", fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Icon(PwIcons.Back, null, modifier = Modifier.size(14.dp))
        }
    }
}

/** Sunrise and sunset: a golden arc with the sun on it, the two times, and the day's length. */
@Composable
private fun SunArcCard(today: DayPoint, now: LocalDateTime, modifier: Modifier) {
    val sun = sunDay(today.sunrise, today.sunset, now)
    HalfCard(modifier) {
        Text("الشروق والغروب", fontSize = 15.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())
        Canvas(Modifier.fillMaxWidth().height(96.dp).padding(top = 8.dp)) {
            val stroke = 3.dp.toPx()
            val r = minOf(size.width / 2f - stroke * 2, size.height - stroke * 2)
            val c = Offset(size.width / 2f, size.height - stroke)
            val tl = Offset(c.x - r, c.y - r)
            val box = Size(r * 2, r * 2)
            // Sunrise on the right (where the line starts), sunset on the left.
            drawArc(
                Brush.horizontalGradient(listOf(GOLD.copy(alpha = 0.25f), GOLD), startX = tl.x, endX = tl.x + box.width),
                180f, 180f, false, tl, box, style = Stroke(stroke, cap = StrokeCap.Round),
            )
            val p = (sun?.progress ?: 0.0).coerceIn(0.0, 1.0).toFloat()
            val a = Math.PI * p
            val dot = Offset(c.x + r * cos(a).toFloat(), c.y - r * sin(a).toFloat())
            drawCircle(Brush.radialGradient(listOf(GOLD.copy(alpha = 0.55f), Color.Transparent), dot, 22f), 22f, dot)
            drawCircle(GOLD, 9f, dot)
        }
        Row(Modifier.fillMaxWidth()) {
            Column(Modifier.weight(1f)) {
                Text("الشروق", fontSize = 12.sp, color = Pw.Muted)
                Text(today.sunrise?.let { clock12(it.toLocalTime()) } ?: "—", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("الغروب", fontSize = 12.sp, color = Pw.Muted)
                Text(today.sunset?.let { clock12(it.toLocalTime()) } ?: "—", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }
        Canvas(Modifier.fillMaxWidth().height(1.dp).padding(vertical = 0.dp)) {
            drawLine(Color.White.copy(alpha = 0.25f), Offset(0f, 0f), Offset(size.width, 0f), 1.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f)))
        }
        Spacer(Modifier.weight(1f))
        Text("طول فترة النهار", fontSize = 12.sp, color = Pw.Muted)
        Text(sun?.length?.replace(" س ", "س ")?.replace(" د", "د") ?: "—", fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
}

/**
 * The coming days as columns, like the reference design: each a day half and a night half
 * (sun and moon at the top), the day's weather and high above a curve that runs from each
 * high down to that night's low and up to the next day's high.
 */
@Composable
fun WeekColumns(fc: Forecast) {
    val days = fc.days
    if (days.isEmpty()) return
    val colW = 96.dp
    val gap = 10.dp
    val chartTop = 132.dp
    val chartH = 150.dp
    val height = chartTop + chartH + 70.dp
    val total = colW * days.size + gap * (days.size - 1)
    val hi = days.maxOf { it.max }
    val lo = days.minOf { it.min }
    val span = (hi - lo).coerceAtLeast(1.0)
    val density = LocalDensity.current
    // The night's weather: the hour around 22:00 of that day, when there is one.
    val nightCode = days.map { d -> fc.hours.firstOrNull { it.time.toLocalDate() == d.date && it.time.hour == 22 }?.code ?: d.code }

    Box(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
        // Positions below are absolute (left to right) and already put the first day on the right.
        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Box(Modifier.width(total).height(height)) {
            // Column i, from the right (the start in Arabic).
            fun colX(i: Int) = total - colW * (i + 1) - gap * i
            fun y(t: Double) = chartTop + chartH * 0.12f + chartH * 0.76f * ((hi - t) / span).toFloat()
            days.forEachIndexed { i, d ->
                Column(
                    Modifier.absoluteOffset(x = colX(i)).width(colW).height(height).clip(RoundedCornerShape(18.dp))
                        .background(Pw.Card)
                        .then(if (i == 0) Modifier.border(1.5.dp, Color.White.copy(alpha = 0.55f), RoundedCornerShape(18.dp)) else Modifier),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(relativeDayName(d.date), fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 12.dp), maxLines = 1)
                    Text("${d.date.dayOfMonth}/${d.date.monthValue}", fontSize = 11.sp, color = Pw.Muted)
                    // Night half on the left, day half on the right (the day comes first in Arabic).
                    Row(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                        Box(Modifier.weight(1f).height(30.dp).background(Color.Black.copy(alpha = 0.22f)), contentAlignment = Alignment.Center) {
                            Icon(PwIcons.Moon, null, tint = Pw.Muted, modifier = Modifier.size(16.dp))
                        }
                        Box(Modifier.weight(1f).height(30.dp).background(Color.Black.copy(alpha = 0.10f)), contentAlignment = Alignment.Center) {
                            Icon(PwIcons.Sun, null, tint = Pw.Muted, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
            // The curve: high (day half) → low (night half) → next day's high …
            Canvas(Modifier.width(total).height(height)) {
                val pts = ArrayList<Offset>()
                days.forEachIndexed { i, d ->
                    val x0 = with(density) { colX(i).toPx() }
                    val w = with(density) { colW.toPx() }
                    pts += Offset(x0 + w * 0.75f, with(density) { y(d.max).toPx() })
                    pts += Offset(x0 + w * 0.25f, with(density) { y(d.min).toPx() })
                }
                val line = Path().apply {
                    moveTo(pts[0].x, pts[0].y)
                    for (k in 1 until pts.size) {
                        val a = pts[k - 1]; val b = pts[k]
                        val mx = (a.x + b.x) / 2
                        cubicTo(mx, a.y, mx, b.y, b.x, b.y)
                    }
                }
                val bottom = size.height
                val fill = Path().apply { addPath(line); lineTo(pts.last().x, bottom); lineTo(pts.first().x, bottom); close() }
                drawPath(fill, Brush.verticalGradient(listOf(Color(0xFF3CCFC4).copy(alpha = 0.22f), Color.Transparent), startY = with(density) { chartTop.toPx() }, endY = bottom))
                drawPath(line, GOLD.copy(alpha = 0.85f), style = Stroke(2.2.dp.toPx(), cap = StrokeCap.Round))
                pts.forEach {
                    drawCircle(Color(0x33FFFFFF), 9.dp.toPx(), it)
                    drawCircle(Color.White, 5.dp.toPx(), it)
                }
            }
            // Labels: icon and high above the day point, low and night icon below the night point.
            days.forEachIndexed { i, d ->
                val dayX = colX(i) + colW * 0.75f
                val nightX = colX(i) + colW * 0.25f
                Column(
                    Modifier.absoluteOffset(x = dayX - 26.dp, y = y(d.max) - 64.dp).width(52.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    WeatherIcon(d.code, isDay = true, size = 26.dp, cloudColor = Color.White, sunColor = Pw.Sun)
                    Text("⁦${d.max.roundToInt()}°⁩", fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                }
                Column(
                    Modifier.absoluteOffset(x = nightX - 26.dp, y = y(d.min) + 12.dp).width(52.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("⁦${d.min.roundToInt()}°⁩", fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    WeatherIcon(nightCode[i], isDay = false, size = 26.dp, cloudColor = Color.White, sunColor = Pw.Sun)
                }
            }
        }
        }
    }
}
