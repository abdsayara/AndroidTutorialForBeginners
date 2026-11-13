package ps.weather.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.text.HtmlCompat
import kotlinx.coroutines.delay
import ps.weather.data.BulletinDay
import ps.weather.data.BulletinRepository
import ps.weather.data.ReportsRepository
import ps.weather.data.Station
import ps.weather.data.StationsRepository
import ps.weather.ui.ago
import ps.weather.ui.arabicDate
import ps.weather.ui.components.Load
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.RemoteImage
import ps.weather.ui.components.RoundIconButton
import ps.weather.ui.components.ScreenHeader
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.theme.Pw
import ps.weather.ui.windDirectionName
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

private fun dateText(iso: String?): String? = iso?.let { runCatching { arabicDate(LocalDate.parse(it.take(10))) }.getOrNull() }

// ---------------------------------------------------------------- the detailed bulletin (home)

/** The detailed bulletin: today's text, and the coming days behind one tap. */
@Composable
fun BulletinCard() {
    val (load, _) = rememberLoad("bulletin") { BulletinRepository.bulletin() }
    val days: List<BulletinDay> = (load as? Load.Ok)?.value?.days ?: return
    if (days.isEmpty()) return
    var open by rememberSaveable { mutableStateOf(false) }
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(PwIcons.News, null, tint = Pw.Link, modifier = Modifier.size(20.dp))
            Text("النشرة التفصيلية", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
        (if (open) days else days.take(1)).forEachIndexed { i, d ->
            if (i > 0) androidx.compose.foundation.layout.Box(Modifier.fillMaxWidth().height(1.dp).background(Pw.Line))
            Text(d.day, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text(d.text, fontSize = 14.sp, lineHeight = 24.sp, color = Pw.Ink.copy(alpha = 0.92f))
        }
        if (days.size > 1) Text(
            if (open) "إخفاء الأيام القادمة" else "الأيام القادمة (${days.size - 1})",
            color = Pw.Link, fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
            modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button) { open = !open }.padding(vertical = 6.dp),
        )
    }
}

// ---------------------------------------------------------------- daily reports

@Composable
fun ReportsScreen(onOpen: (Int) -> Unit, onBack: () -> Unit) {
    val (load, refresh) = rememberLoad("reports") { ReportsRepository.list() }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ScreenHeader("التقارير اليومية", "تقارير الطقس والمناخ", onBack) { RoundIconButton(PwIcons.Refresh, "تحديث", refresh) } }
        item {
            LoadBox(load, refresh) { list ->
                if (list.isEmpty()) Text("لا توجد تقارير الآن", color = Pw.Muted, modifier = Modifier.padding(20.dp))
                list.forEach { r ->
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card)
                            .clickable(role = Role.Button) { onOpen(r.id) }.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        r.image?.let { RemoteImage(it, Modifier.size(84.dp).clip(RoundedCornerShape(14.dp)), maxSide = 300) }
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(r.title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Pw.Link, lineHeight = 22.sp)
                            r.excerpt?.let { Text(it, fontSize = 13.sp, color = Pw.Muted, maxLines = 2, lineHeight = 20.sp) }
                            Text(listOfNotNull(r.tag, dateText(r.date)).joinToString(" · "), fontSize = 12.sp, color = Pw.Muted)
                        }
                    }
                }
            }
        }
    }
}

/** Text paragraphs and pictures of a report, in their order. */
private sealed interface Block {
    data class Para(val text: String) : Block
    data class Pic(val url: String) : Block
}

private fun blocks(html: String): List<Block> {
    val out = ArrayList<Block>()
    val img = Regex("""<img[^>]*src="([^"]+)"[^>]*>""", RegexOption.IGNORE_CASE)
    var last = 0
    fun text(part: String) {
        // Table rows read as lines, cells joined by a dot.
        val prepared = part.replace(Regex("(?i)</t[dh]>"), " · ").replace(Regex("(?i)</tr>"), "<br>")
        HtmlCompat.fromHtml(prepared, HtmlCompat.FROM_HTML_MODE_LEGACY).toString()
            .split(Regex("\n\\s*\n+")).map { it.replace(Regex("[ \t ]+"), " ").replace(Regex(" · \n"), "\n").trim().trimEnd('·', ' ') }
            .filter { it.isNotBlank() && it != "￼" }
            .forEach { out += Block.Para(it.replace("￼", "").trim()) }
    }
    img.findAll(html).forEach { m ->
        text(html.substring(last, m.range.first))
        out += Block.Pic(m.groupValues[1])
        last = m.range.last + 1
    }
    text(html.substring(last))
    return out
}

@Composable
fun ReportScreen(id: Int, onBack: () -> Unit) {
    val (load, refresh) = rememberLoad("report", id) { ReportsRepository.article(id) }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ScreenHeader("تقرير", null, onBack) }
        item {
            LoadBox(load, refresh) { a ->
                val parts = remember(a.html) { blocks(a.html) }
                Text(a.title, fontSize = 22.sp, fontWeight = FontWeight.Bold, lineHeight = 32.sp)
                Text(listOfNotNull(a.tag, dateText(a.date)).joinToString(" · "), fontSize = 12.sp, color = Pw.Muted)
                if (parts.none { it is Block.Pic }) a.image?.let {
                    RemoteImage(it, Modifier.fillMaxWidth().aspectRatio(16f / 9f).clip(RoundedCornerShape(18.dp)))
                }
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    parts.forEach { b ->
                        when (b) {
                            is Block.Para -> Text(b.text, fontSize = 15.sp, lineHeight = 27.sp)
                            is Block.Pic -> RemoteImage(
                                b.url, Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)), contentScale = ContentScale.FillWidth,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- weather stations

private val clockFmt = DateTimeFormatter.ofPattern("HH:mm", Locale.US)
private fun one(v: Double?) = v?.let { String.format(Locale.US, "%.1f", it) } ?: "—"
private fun clockOf(i: Instant?) = i?.atZone(ZoneId.systemDefault())?.format(clockFmt)

@Composable
fun StationsScreen(onBack: () -> Unit) {
    val (load, refresh) = rememberLoad("stations") { StationsRepository.stations() }
    LaunchedEffect(Unit) { while (true) { delay(5 * 60_000L); refresh() } }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { ScreenHeader("محطات الطقس", "قراءات مباشرة من محطات الرصد", onBack) { RoundIconButton(PwIcons.Refresh, "تحديث", refresh) } }
        item { Text("تتحدّث القراءات كل بضع دقائق", fontSize = 13.sp, color = Pw.Muted) }
        item {
            LoadBox(load, refresh) { list ->
                if (list.isEmpty()) Text("لا توجد محطات الآن", color = Pw.Muted, modifier = Modifier.padding(20.dp))
                list.forEach { StationCard(it) }
            }
        }
    }
}

@Composable
private fun StationCard(s: Station) {
    val n = s.now
    val old = n?.at?.let { Duration.between(it, Instant.now()).toHours() >= 3 } ?: false
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp).alpha(if (old) 0.7f else 1f),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(s.name, fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            n?.at?.let { Text(ago(it.atZone(ZoneId.systemDefault())), fontSize = 12.sp, color = Pw.Muted) }
        }
        if (n == null) {
            Text("تعذّر جلب قراءات المحطة الآن.", fontSize = 13.sp, color = Pw.Muted)
            return@Column
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("⁦${one(n.temp)}${n.unitTemp}⁩", fontSize = 40.sp, fontWeight = FontWeight.ExtraBold)
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text("الإحساس ${n.feelsLike?.let { "${it.roundToInt()}°" } ?: "—"}", fontSize = 13.sp)
                Text("العظمى ${n.high?.let { "${it.roundToInt()}°" } ?: "—"} ${clockOf(n.highAt) ?: ""}", fontSize = 13.sp)
                Text("الصغرى ${n.low?.let { "${it.roundToInt()}°" } ?: "—"} ${clockOf(n.lowAt) ?: ""}", fontSize = 13.sp)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StationTile("الرطوبة", "${one(n.humidity)}%", null, Modifier.weight(1f))
            StationTile(
                "الرياح", "${one(n.wind)} ${n.unitWind} ${n.windDir?.let { windDirectionName(it.roundToInt()) } ?: ""}",
                n.gust?.let { "هبّات حتى ${one(it)}" }, Modifier.weight(1f),
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StationTile(
                if (n.seasonalRain != null) "المطر اليوم / الموسم" else "المطر اليوم",
                "${one(n.rain)}${n.seasonalRain?.let { " / ${one(it)}" } ?: ""} ${n.unitRain}", null, Modifier.weight(1f),
            )
            StationTile("الضغط الجوي", "${one(n.pressure)} ${n.unitPressure}", n.pressureTrend, Modifier.weight(1f))
        }
        if (old) Text(
            "آخر قراءة قديمة — قد تكون المحطة متوقفة.", fontSize = 13.sp, color = Pw.AmberInk,
            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Pw.AmberTint).padding(10.dp),
        )
    }
}

@Composable
private fun StationTile(label: String, value: String, note: String?, modifier: Modifier) {
    Column(modifier.clip(RoundedCornerShape(16.dp)).background(Pw.Card).padding(12.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(label, fontSize = 12.sp, color = Pw.Muted)
        Text(value, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        note?.let { Text(it, fontSize = 11.sp, color = Pw.Muted) }
    }
}
