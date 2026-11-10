package ps.weather.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.R
import ps.weather.data.City
import ps.weather.data.AirInfo
import ps.weather.data.DustAlert
import ps.weather.data.DayPoint
import ps.weather.data.Forecast
import ps.weather.data.PrayerDay
import ps.weather.data.PrayerMethod
import ps.weather.data.PrayerRepository
import ps.weather.data.clothingAdvice
import ps.weather.data.dustAlert
import ps.weather.data.minutesText
import ps.weather.data.prayerWeather
import ps.weather.data.moonPhase
import ps.weather.data.seasonCard
import ps.weather.data.sunDay
import ps.weather.data.Nowcast
import ps.weather.data.Sky
import ps.weather.data.rainNowcast
import ps.weather.data.skyKind
import ps.weather.data.summarize
import ps.weather.data.PlaceKind
import ps.weather.data.WeatherRepository
import ps.weather.ui.ShareCard
import ps.weather.ui.aqiText
import ps.weather.ui.arabicDate
import ps.weather.ui.clock
import ps.weather.ui.components.Load
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.RoundIconButton
import ps.weather.ui.components.StatTile
import ps.weather.ui.components.WeatherIcon
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.deg
import ps.weather.ui.elevationText
import ps.weather.ui.hourLabel
import ps.weather.ui.relativeDayName
import ps.weather.ui.theme.Pw
import ps.weather.ui.uvText
import ps.weather.ui.weatherText
import ps.weather.ui.windDirectionName
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

@Composable
fun HomeScreen(
    city: City, onPickCity: () -> Unit, onHourly: () -> Unit, onElevation: (Double) -> Unit = {},
    prayerMethod: PrayerMethod = PrayerMethod.EGYPT,
) {
    val context = LocalContext.current
    val (load, refresh) = rememberLoad(city.id) { WeatherRepository.forecast(city.lat, city.lon) }
    val elevation = (load as? Load.Ok)?.value?.elevation ?: city.elevation
    LaunchedEffect(elevation) { elevation?.let(onElevation) }
    val air by produceState<AirInfo?>(null, city.id) { value = WeatherRepository.air(city.lat, city.lon) }
    val prayer by produceState<PrayerDay?>(null, city.id, prayerMethod) {
        value = runCatching { PrayerRepository.today(city.lat, city.lon, prayerMethod).value }.getOrNull()
    }

    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painterResource(R.drawable.logo), contentDescription = null,
                    modifier = Modifier.width(54.dp).height(41.dp),
                )
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(PwIcons.Pin, null, tint = Pw.Brand, modifier = Modifier.size(20.dp))
                        Text(city.name, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(
                        listOfNotNull(
                            if (city.kind == PlaceKind.GPS) "موقعك الحالي" else null,
                            if (city.isListed) null else city.area,
                            elevationText(elevation),
                            arabicDate(LocalDate.now()),
                        ).joinToString(" · "),
                        fontSize = 13.sp, color = Pw.Muted,
                    )
                }
                (load as? Load.Ok)?.value?.let { fc ->
                    RoundIconButton(PwIcons.Share, "مشاركة الطقس كصورة", onClick = { ShareCard.share(context, city.name, fc) })
                    Spacer(Modifier.width(8.dp))
                }
                RoundIconButton(PwIcons.Refresh, "تحديث", refresh)
                Spacer(Modifier.width(8.dp))
                RoundIconButton(PwIcons.Search, "تغيير المدينة", onPickCity)
            }
        }
        item {
            LoadBox(load, refresh) { fc -> HomeContent(fc, air, prayer, onHourly) }
        }
    }
}

@Composable
private fun HomeContent(fc: Forecast, air: AirInfo?, prayer: PrayerDay?, onHourly: () -> Unit) {
    val aqi = air?.aqi
    val now = fc.nowIndex
    val today = fc.days.firstOrNull()
    val c = fc.current
    // The hero's colour follows the sky; every one keeps white text readable.
    val heroColor = when (skyKind(fc)) {
        Sky.DAY -> Pw.Brand
        Sky.NIGHT -> Color(0xFF16304F)
        Sky.DUSK -> Color(0xFFA44F27)
        Sky.CLOUDY -> Color(0xFF4A6476)
        Sky.FOG -> Color(0xFF5E707B)
        Sky.RAIN -> Color(0xFF2E4A60)
        Sky.STORM -> Color(0xFF213042)
        Sky.SNOW -> Color(0xFF4B6E8C)
    }

    // Hero
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(heroColor).padding(22.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(deg(c.temp), fontSize = 72.sp, fontWeight = FontWeight.ExtraBold, color = Color.White, lineHeight = 76.sp)
                Text(weatherText(c.code), fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                if (today != null) Text(
                    "العظمى ${deg(today.max)} · الصغرى ${deg(today.min)} · الإحساس ${deg(c.apparent)}",
                    fontSize = 14.sp, color = Color.White.copy(alpha = 0.9f),
                )
            }
            WeatherIcon(c.code, isDay = c.isDay, size = 96.dp, cloudColor = Color.White, sunColor = Pw.Sun)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            HeroChip(PwIcons.Drop, "مطر ${fc.hours.getOrNull(now)?.precipProb ?: 0}%", Modifier.weight(1f))
            HeroChip(PwIcons.Wind, "${c.windSpeed.roundToInt()} كم/س ${windDirectionName(c.windDirection)}", Modifier.weight(1f))
        }
        HorizontalDivider(color = Color.White.copy(alpha = 0.22f))
        Text(summarize(fc), fontSize = 15.sp, fontWeight = FontWeight.Medium, color = Color.White, lineHeight = 24.sp)
    }

    dustAlert(air)?.let { DustCard(it) }
    rainNowcast(fc.minutely, fc.currentTime ?: LocalDateTime.now())?.let { NowcastCard(it) }

    // Next hours
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("الساعات القادمة", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
        Text(
            "التفاصيل", color = Pw.Brand, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
            modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button, onClick = onHourly).padding(8.dp),
        )
    }
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(fc.hours.drop(now).take(24)) { h ->
            val isNow = h == fc.hours.getOrNull(now)
            Column(
                Modifier.width(56.dp).clip(RoundedCornerShape(16.dp)).background(if (isNow) Pw.Ink else Pw.Card).padding(vertical = 10.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                val fg = if (isNow) Color.White else Pw.Ink
                Text(if (isNow) "الآن" else hourLabel(h.time), fontSize = 12.sp, color = fg)
                WeatherIcon(h.code, isDay = h.isDay, size = 22.dp, cloudColor = if (isNow) Color.White else Pw.Muted)
                Text(deg(h.temp), fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = fg)
                if (h.precipProb >= 20) Text("${h.precipProb}%", fontSize = 11.sp, color = if (isNow) Color.White else Pw.Blue)
            }
        }
    }

    // "شو نلبس؟", the next prayer's weather and the farming season
    val nowTime = fc.currentTime ?: LocalDateTime.now()
    val late = nowTime.hour >= 15
    clothingAdvice(if (late) fc.days.getOrNull(1) else fc.days.firstOrNull())?.let {
        MiniCard(PwIcons.Thermometer, if (late) "شو نلبس بكرا؟" else "شو نلبس اليوم؟", it)
    }
    prayer?.let { prayerWeather(it.times, fc.hours, nowTime) }?.let { pw ->
        val whenText = when {
            pw.tomorrow -> "غداً"
            pw.minutes < 15 -> "بعد ${pw.minutes} دقائق"
            pw.minutes < 180 -> "بعد ${minutesText((pw.minutes + 7) / 15 * 15)}"
            else -> "الساعة ${clock(pw.time)}"
        }
        val wx = pw.hour?.let { "، والطقس وقتها ${weatherText(it.code)} ${deg(it.temp)}" } ?: ""
        MiniCard(PwIcons.Moon, "${pw.name} $whenText", "أذان ${pw.name} الساعة ${clock(pw.time)}$wx")
    }
    seasonCard(fc.days, nowTime.toLocalDate()) { relativeDayName(it) }?.let { MiniCard(PwIcons.Leaf, it.title, it.text) }

    // Details
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile("الرطوبة", "${c.humidity}%", Modifier.weight(1f))
            StatTile("الأشعة فوق البنفسجية", today?.let { "${it.uvMax.roundToInt()} · ${uvText(it.uvMax)}" } ?: "—", Modifier.weight(1f))
        }
        StatTile("جودة الهواء", aqi?.let { "$it · ${aqiText(it)}" } ?: "—", Modifier.fillMaxWidth())
    }

    // The sun's path today and tonight's moon
    if (today != null) SkyCard(today, nowTime)

    // 7 days
    val lo = fc.days.minOfOrNull { it.min } ?: 0.0
    val hi = fc.days.maxOfOrNull { it.max } ?: 1.0
    val span = (hi - lo).coerceAtLeast(1.0)
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 6.dp)) {
        fc.days.forEachIndexed { i, d ->
            if (i > 0) HorizontalDivider(color = Pw.Line)
            Row(Modifier.fillMaxWidth().height(48.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(relativeDayName(d.date), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, modifier = Modifier.width(64.dp))
                WeatherIcon(d.code, size = 22.dp)
                Text(if (d.precipProbMax >= 10) "${d.precipProbMax}%" else "", fontSize = 12.sp, color = Pw.Blue, modifier = Modifier.width(36.dp))
                Text(deg(d.min), fontSize = 14.sp, color = Pw.Muted)
                BoxWithConstraints(Modifier.weight(1f).height(14.dp), contentAlignment = Alignment.CenterStart) {
                    Row(Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).background(Pw.Line)) {
                        val start = ((d.min - lo) / span).toFloat()
                        val len = ((d.max - d.min) / span).toFloat()
                        Spacer(Modifier.weight(start.coerceAtLeast(0.001f)))
                        Box(Modifier.weight(len.coerceAtLeast(0.02f)).fillMaxHeight().clip(RoundedCornerShape(3.dp)).background(Pw.Amber))
                        Spacer(Modifier.weight((1f - start - len).coerceAtLeast(0.001f)))
                    }
                    // Today's bar carries a dot at the temperature right now.
                    if (i == 0) {
                        val f = ((c.temp.coerceIn(d.min, d.max) - lo) / span).toFloat().coerceIn(0f, 1f)
                        Box(
                            Modifier.padding(start = (maxWidth - 12.dp) * f).size(12.dp).clip(CircleShape)
                                .background(Pw.Brand).padding(3.dp).clip(CircleShape).background(Color.White),
                        )
                    }
                }
                Text(deg(d.max), fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

/** The sun's arc across today's sky (sunrise on the right, where an Arabic line starts) and the moon's phase. */
@Composable
private fun SkyCard(today: DayPoint, now: LocalDateTime) {
    val sun = sunDay(today.sunrise, today.sunset, now)
    val moon = moonPhase()
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        if (sun != null) {
            val p = sun.progress.coerceIn(0.0, 1.0).toFloat()
            Canvas(Modifier.fillMaxWidth().height(110.dp)) {
                val r = minOf(size.width / 2f - 12f, size.height - 14f)
                val cx = size.width / 2f
                val cy = size.height - 4f
                val box = Size(r * 2, r * 2)
                val tl = Offset(cx - r, cy - r)
                drawLine(Pw.Line, Offset(0f, cy), Offset(size.width, cy), strokeWidth = 3f)
                drawArc(Pw.Line, 180f, 180f, false, tl, box, style = Stroke(5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 12f))))
                // Canvas angles run clockwise from 3 o'clock: sunrise sits at 0°, going back over the top to 180°.
                if (p > 0f) drawArc(Pw.Sun, 0f, -180f * p, false, tl, box, style = Stroke(6f, cap = StrokeCap.Round))
                if (sun.up) {
                    val a = Math.PI * p
                    val o = Offset(cx + r * cos(a).toFloat(), cy - r * sin(a).toFloat())
                    drawCircle(Color.White, 20f, o)
                    drawCircle(Pw.Sun, 15f, o)
                }
            }
            Row {
                Text("الشروق ${today.sunrise?.let { clock(it.toLocalTime()) } ?: "—"}", fontSize = 13.sp, color = Pw.Muted, modifier = Modifier.weight(1f))
                Text("الغروب ${today.sunset?.let { clock(it.toLocalTime()) } ?: "—"}", fontSize = 13.sp, color = Pw.Muted)
            }
            Text("طول النهار ${sun.length}", fontSize = 12.sp, color = Pw.Muted, modifier = Modifier.align(Alignment.CenterHorizontally))
            HorizontalDivider(color = Pw.Line)
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Canvas(Modifier.size(52.dp)) {
                val r = size.minDimension / 2f - 2f
                val cx = size.width / 2f
                val cy = size.height / 2f
                drawCircle(Color(0xFF2B3A4A), r)
                drawCircle(Color(0xFF8796A6), r, style = Stroke(2f))
                if (moon.lit > 0.98) drawCircle(Color(0xFFF3EED8), r)
                else if (moon.lit >= 0.02) {
                    // The lit limb is half the disc; the terminator is half an ellipse whose width follows the phase.
                    val right = moon.fraction < 0.5
                    val rx = r * abs(cos(2 * Math.PI * moon.fraction)).toFloat()
                    val gibbous = moon.lit > 0.5
                    val bulgeRight = if (right) !gibbous else gibbous
                    val path = Path().apply {
                        moveTo(cx, cy - r)
                        arcTo(Rect(cx - r, cy - r, cx + r, cy + r), -90f, if (right) 180f else -180f, false)
                        arcTo(Rect(cx - rx, cy - r, cx + rx, cy + r), 90f, if (bulgeRight) -180f else 180f, false)
                        close()
                    }
                    drawPath(path, Color(0xFFF3EED8))
                }
            }
            Column {
                Text(moon.name, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("مضاء ${(moon.lit * 100).roundToInt()}% · عمر القمر ${moon.age.roundToInt()} يوماً", fontSize = 13.sp, color = Pw.Muted)
            }
        }
    }
}

@Composable
private fun DustCard(d: DustAlert) {
    val (bg, line, tint) = if (d.heavy) Triple(Color(0xFFFDEDE8), Color(0xFFF1C2B5), Pw.Red)
    else Triple(Color(0xFFFFF8EA), Color(0xFFF0D9A8), Pw.Amber)
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(bg)
            .border(1.dp, line, RoundedCornerShape(20.dp)).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(PwIcons.Wind, null, tint = tint, modifier = Modifier.size(20.dp))
            Text(d.title, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }
        Text(d.text, fontSize = 14.sp, lineHeight = 24.sp)
    }
}

@Composable
private fun MiniCard(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, text: String) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Pw.Card)
            .border(1.dp, Pw.Line, RoundedCornerShape(18.dp)).padding(horizontal = 14.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(icon, null, tint = Pw.Brand, modifier = Modifier.size(18.dp))
            Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        Text(text, fontSize = 14.sp, color = Pw.Muted, lineHeight = 23.sp)
    }
}

/** Rain in the next two hours: one sentence and eight 15-minute bars. */
@Composable
private fun NowcastCard(nc: Nowcast) {
    val peak = maxOf(1.0, nc.steps.maxOf { it.precip })
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Color(0xFFF3F8FC))
            .border(1.dp, Color(0xFFCFE2F1), RoundedCornerShape(20.dp)).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(PwIcons.Drop, null, tint = Pw.Brand, modifier = Modifier.size(20.dp))
            Text(nc.text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        Row(Modifier.fillMaxWidth().height(44.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Bottom) {
            nc.steps.forEach { s ->
                val wet = s.precip >= 0.1
                Box(
                    Modifier.weight(1f).fillMaxHeight(maxOf(0.06f, (s.precip / peak).toFloat()))
                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp, bottomStart = 2.dp, bottomEnd = 2.dp))
                        .background(if (wet) Pw.Brand else Color(0xFFD8E3EA)),
                )
            }
        }
        Row {
            Text("الآن", fontSize = 12.sp, color = Pw.Muted, modifier = Modifier.weight(1f))
            Text("بعد ساعتين", fontSize = 12.sp, color = Pw.Muted)
        }
    }
}

@Composable
private fun HeroChip(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String, modifier: Modifier) {
    Row(
        modifier.clip(RoundedCornerShape(14.dp)).background(Color.White.copy(alpha = 0.16f)).padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Icon(icon, null, tint = Color.White, modifier = Modifier.size(16.dp))
        Text(text, color = Color.White, fontSize = 13.sp, maxLines = 1)
    }
}
