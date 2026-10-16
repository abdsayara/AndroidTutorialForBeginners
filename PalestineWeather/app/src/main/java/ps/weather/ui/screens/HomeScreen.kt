package ps.weather.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.data.City
import ps.weather.data.Forecast
import ps.weather.data.PlaceKind
import ps.weather.data.WeatherRepository
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
import kotlin.math.roundToInt

@Composable
fun HomeScreen(city: City, onPickCity: () -> Unit, onHourly: () -> Unit, onElevation: (Double) -> Unit = {}) {
    val (load, refresh) = rememberLoad(city.id) { WeatherRepository.forecast(city.lat, city.lon) }
    val elevation = (load as? Load.Ok)?.value?.elevation ?: city.elevation
    LaunchedEffect(elevation) { elevation?.let(onElevation) }
    val aqi by produceState<Int?>(null, city.id) { value = WeatherRepository.airQuality(city.lat, city.lon) }

    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(PwIcons.Pin, null, tint = Pw.Green, modifier = Modifier.size(20.dp))
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
                RoundIconButton(PwIcons.Refresh, "تحديث", refresh)
                Spacer(Modifier.width(8.dp))
                RoundIconButton(PwIcons.Search, "تغيير المدينة", onPickCity)
            }
        }
        item {
            LoadBox(load, refresh) { fc -> HomeContent(fc, aqi, onHourly) }
        }
    }
}

@Composable
private fun HomeContent(fc: Forecast, aqi: Int?, onHourly: () -> Unit) {
    val now = fc.nowIndex
    val today = fc.days.firstOrNull()
    val c = fc.current

    // Hero
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(Pw.Green).padding(22.dp),
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
    }

    // Next hours
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("الساعات القادمة", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
        Text(
            "التفاصيل", color = Pw.Green, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
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

    // Details
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile("الرطوبة", "${c.humidity}%", Modifier.weight(1f))
            StatTile("الأشعة فوق البنفسجية", today?.let { "${it.uvMax.roundToInt()} · ${uvText(it.uvMax)}" } ?: "—", Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatTile(
                "الشروق / الغروب",
                today?.let { d -> "${d.sunrise?.let { clock(it.toLocalTime()) } ?: "—"} · ${d.sunset?.let { clock(it.toLocalTime()) } ?: "—"}" } ?: "—",
                Modifier.weight(1f),
            )
            StatTile("جودة الهواء", aqi?.let { "$it · ${aqiText(it)}" } ?: "—", Modifier.weight(1f))
        }
    }

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
                Row(Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)).background(Pw.Line)) {
                    val start = ((d.min - lo) / span).toFloat()
                    val len = ((d.max - d.min) / span).toFloat()
                    Spacer(Modifier.weight(start.coerceAtLeast(0.001f)))
                    Box(Modifier.weight(len.coerceAtLeast(0.02f)).fillMaxHeight().clip(RoundedCornerShape(3.dp)).background(Pw.Amber))
                    Spacer(Modifier.weight((1f - start - len).coerceAtLeast(0.001f)))
                }
                Text(deg(d.max), fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
    Text("المصدر: Open-Meteo", fontSize = 11.sp, color = Pw.Muted)
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
