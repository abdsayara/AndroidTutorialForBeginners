package ps.weather.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.data.AlertType
import ps.weather.data.City
import ps.weather.data.DayPoint
import ps.weather.data.Prefs
import ps.weather.data.WeatherRepository
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.SectionCard
import ps.weather.ui.components.StatTile
import ps.weather.ui.components.Toggle
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.relativeDayName
import ps.weather.ui.theme.Pw
import kotlin.math.roundToInt

private enum class Suitability(val label: String, val bg: Color, val fg: Color) {
    GREAT("ممتاز", Color(0xFF146B45), Color.White),
    OK("جيد", Color(0xFFE3F0E8), Color(0xFF0E4F33)),
    RAINY("ماطر", Color(0xFFE7ECF5), Color(0xFF1F3F6E)),
    HARSH("غير مناسب", Color(0xFFFBE2DD), Color(0xFF8C1D0E)),
}

/** Rough rule for outdoor field work such as olive picking. */
private fun suitability(d: DayPoint): Suitability = when {
    d.precipProbMax >= 50 -> Suitability.RAINY
    d.max >= 36 || d.windMax >= 40 -> Suitability.HARSH
    d.precipProbMax < 25 && d.windMax < 25 && d.max in 12.0..32.0 -> Suitability.GREAT
    else -> Suitability.OK
}

@Composable
fun FarmingScreen(city: City, prefs: Prefs) {
    val (load, refresh) = rememberLoad(city.id) { WeatherRepository.forecast(city.lat, city.lon) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item {
            Column {
                Text("الزراعة والتنبيهات", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Text(city.name, fontSize = 13.sp, color = Pw.Muted)
            }
        }
        item {
            LoadBox(load, refresh) { fc ->
                val days = fc.days
                val nextRain = days.drop(1).firstOrNull { it.precipProbMax >= 60 }
                val nextFrost = days.firstOrNull { it.min <= 3 }

                if (nextRain != null || nextFrost != null) {
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.AmberTint).padding(14.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Icon(PwIcons.Bell, null, tint = Pw.AmberInk, modifier = Modifier.size(24.dp))
                        Column {
                            if (nextRain != null) {
                                Text("أمطار متوقعة ${relativeDayName(nextRain.date)}", fontWeight = FontWeight.SemiBold, color = Pw.AmberInk)
                                Text("احتمال ${nextRain.precipProbMax}% — أنهِ القطف وغطِّ المحصول المقطوف قبلها.", fontSize = 13.sp, color = Pw.AmberInk)
                            }
                            if (nextFrost != null) {
                                Text("خطر صقيع ${relativeDayName(nextFrost.date)}", fontWeight = FontWeight.SemiBold, color = Pw.AmberInk)
                                Text("الصغرى ${nextFrost.min.roundToInt()}° — احمِ الشتلات والمزروعات الحساسة.", fontSize = 13.sp, color = Pw.AmberInk)
                            }
                        }
                    }
                }

                SectionCard {
                    Text("ملاءمة الأيام للعمل في الأرض", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                    Text("قطف الزيتون والأعمال الحقلية: مطر قليل ورياح هادئة وحرارة معتدلة", fontSize = 12.sp, color = Pw.Muted)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        days.take(5).forEach { d ->
                            val s = suitability(d)
                            Column(
                                Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(s.bg).padding(vertical = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Text(relativeDayName(d.date), fontSize = 12.sp, color = s.fg, maxLines = 1)
                                Text(s.label, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = s.fg, textAlign = TextAlign.Center, maxLines = 1)
                            }
                        }
                    }
                }

                val rain3 = days.take(3).sumOf { it.precipSum }
                val sprayDay = days.take(4).firstOrNull { it.precipProbMax < 20 && it.windMax < 15 }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile(
                        "الري",
                        if (rain3 >= 5) "أجّل الري — ${rain3.roundToInt()} ملم متوقعة" else "الري مناسب — لا أمطار مؤثرة",
                        Modifier.weight(1f),
                    )
                    StatTile(
                        "الرش والمبيدات",
                        sprayDay?.let { "مناسب ${relativeDayName(it.date)}" } ?: "رياح أو أمطار — انتظر",
                        Modifier.weight(1f),
                    )
                }
            }
        }
        item { AlertToggles(prefs) }
    }
}

@Composable
private fun AlertToggles(prefs: Prefs) {
    val hints = mapOf(
        AlertType.RAIN to "قبل وصول المنخفضات",
        AlertType.FROST to "لحماية المزروعات ليلاً",
        AlertType.HEAT to "حرارة فوق 35°",
        AlertType.WIND to "رياح قوية وغبار",
        AlertType.QUAKE to "هزات بقوة 3 فأكثر",
    )
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 8.dp)) {
        Text("إشعارات أريد استلامها", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 8.dp))
        AlertType.entries.forEach { type ->
            var on by remember { mutableStateOf(prefs.alertEnabled(type)) }
            HorizontalDivider(color = Pw.Line)
            Row(Modifier.fillMaxWidth().heightIn(min = 56.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(type.label, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    Text(hints[type] ?: "", fontSize = 12.sp, color = Pw.Muted)
                }
                Toggle(on, type.label) { on = it; prefs.setAlertEnabled(type, it) }
            }
        }
    }
}
