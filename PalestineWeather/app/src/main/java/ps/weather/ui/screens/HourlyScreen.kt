package ps.weather.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.data.City
import ps.weather.data.WeatherRepository
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PillRow
import ps.weather.ui.components.ScreenHeader
import ps.weather.ui.components.WeatherIcon
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.deg
import ps.weather.ui.hourLabel
import ps.weather.ui.relativeDayName
import ps.weather.ui.theme.Pw
import ps.weather.ui.weatherText
import kotlin.math.roundToInt

@Composable
fun HourlyScreen(city: City, onBack: () -> Unit) {
    val (load, refresh) = rememberLoad(city.id) { WeatherRepository.forecast(city.lat, city.lon) }
    var day by rememberSaveable { mutableIntStateOf(0) }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { ScreenHeader("تفاصيل الطقس", city.name, onBack) }
        item {
            LoadBox(load, refresh) { fc ->
                val days = fc.days.take(4)
                PillRow(days.indices.toList(), day, { relativeDayName(days[it].date) }) { day = it }
                val date = days.getOrNull(day)?.date
                val hours = fc.hours.filter { it.time.toLocalDate() == date }

                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text("احتمال الأمطار", fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    Row(Modifier.fillMaxWidth().height(96.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                        hours.forEach { h ->
                            Box(
                                Modifier.weight(1f).fillMaxHeight((h.precipProb / 100f).coerceAtLeast(0.03f))
                                    .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)).background(Pw.Blue)
                            )
                        }
                    }
                    Row(Modifier.fillMaxWidth()) {
                        listOf("12 ص", "6 ص", "12 م", "6 م", "11 م").forEach {
                            Text(it, fontSize = 11.sp, color = Pw.Muted, modifier = Modifier.weight(1f), textAlign = TextAlign.Center)
                        }
                    }
                }

                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp)) {
                    hours.forEachIndexed { i, h ->
                        if (i > 0) HorizontalDivider(color = Pw.Line)
                        Row(Modifier.fillMaxWidth().height(48.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(hourLabel(h.time), fontSize = 14.sp, color = Pw.Muted, modifier = Modifier.width(52.dp))
                            WeatherIcon(h.code, isDay = h.isDay, size = 20.dp)
                            Text(weatherText(h.code), fontSize = 13.sp, color = Pw.Muted, modifier = Modifier.weight(1f))
                            Text("${h.wind.roundToInt()} كم/س", fontSize = 12.sp, color = Pw.Muted)
                            Text("${h.precipProb}%", fontSize = 12.sp, color = Pw.Blue, modifier = Modifier.width(36.dp))
                            Text(deg(h.temp), fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.width(36.dp))
                        }
                    }
                }
            }
        }
    }
}
