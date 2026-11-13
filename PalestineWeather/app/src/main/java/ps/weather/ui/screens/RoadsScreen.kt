package ps.weather.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import ps.weather.data.Checkpoint
import ps.weather.data.RoadStatus
import ps.weather.data.Roads
import ps.weather.data.RoadsRepository
import ps.weather.ui.ago
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PillButton
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.RoundIconButton
import ps.weather.ui.components.ScreenHeader
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.map.MapProjection
import ps.weather.ui.map.PalestineShape
import ps.weather.ui.theme.Pw
import java.time.Duration
import java.time.Instant
import java.time.ZoneId

/** Reports older than this are faded: the road may have changed since. */
private const val FRESH_MINUTES = 180L

/** Status colours, readable on the glass: the dot, and the chip's ground and text. */
fun roadColor(s: RoadStatus): Color = when (s) {
    RoadStatus.OPEN -> Color(0xFF3FCF8A)
    RoadStatus.BUSY -> Color(0xFFFFC14D)
    RoadStatus.CRISIS -> Color(0xFFFF7A59)
    RoadStatus.CLOSED -> Color(0xFFFF5A4E)
    RoadStatus.UNKNOWN -> Color(0xFFB3BEC6)
}

private fun isOld(c: Checkpoint) = c.at == null || Duration.between(c.at, Instant.now()).toMinutes() > FRESH_MINUTES
private fun agoText(i: Instant?) = i?.let { ago(it.atZone(ZoneId.systemDefault())) } ?: "لا تحديث"

/** The checkpoints in both directions, refreshed every two minutes; same as the website's roads page. */
@Composable
fun RoadsScreen() {
    val (load, refresh) = rememberLoad("roads") { RoadsRepository.roads() }
    LaunchedEffect(Unit) { while (true) { delay(2 * 60_000L); refresh() } }
    var city by rememberSaveable { mutableStateOf("") }
    var status by rememberSaveable { mutableStateOf<String?>(null) }
    var query by rememberSaveable { mutableStateOf("") }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            ScreenHeader("أحوال الطرق", "حالة الحواجز في الاتجاهين، تتحدّث كل دقيقتين") {
                RoundIconButton(PwIcons.Refresh, "تحديث", refresh)
            }
        }
        item {
            Text(
                "الحالة قد تتغيّر في أي لحظة. انظر دائماً إلى وقت آخر تحديث وتحقّق قبل السفر.",
                fontSize = 13.sp, color = Pw.AmberInk,
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Pw.AmberTint).padding(12.dp),
            )
        }
        item {
            LoadBox(load, refresh) { roads ->
                RoadsBody(roads, city, status, query, { city = it }, { status = it }, { query = it })
            }
        }
    }
}

@Composable
private fun RoadsBody(
    roads: Roads, city: String, status: String?, query: String,
    onCity: (String) -> Unit, onStatus: (String?) -> Unit, onQuery: (String) -> Unit,
) {
    if (!roads.anySource) {
        Column(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text("مصدر أحوال الطرق غير متاح الآن", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text("سنعرض حالة الحواجز هنا تلقائياً فور عودة المصدر.", color = Pw.Muted, fontSize = 13.sp)
        }
        return
    }
    val all = roads.checkpoints
    fun count(vararg s: RoadStatus) = all.count { it.status in s }

    // Summary: tap a tile to filter by it.
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(
            Triple("open", "سالك", count(RoadStatus.OPEN)) to RoadStatus.OPEN,
            Triple("busy", "أزمة", count(RoadStatus.BUSY, RoadStatus.CRISIS)) to RoadStatus.BUSY,
            Triple("closed", "مغلق", count(RoadStatus.CLOSED)) to RoadStatus.CLOSED,
        ).forEach { (t, st) ->
            val (key, label, n) = t
            val on = status == key
            Column(
                Modifier.weight(1f).clip(RoundedCornerShape(18.dp))
                    .background(if (on) roadColor(st).copy(alpha = 0.28f) else Pw.Card)
                    .border(1.dp, if (on) roadColor(st) else Pw.Line, RoundedCornerShape(18.dp))
                    .clickable(role = Role.Button) { onStatus(if (on) null else key) }
                    .padding(vertical = 14.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("$n", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = roadColor(st))
                Text(label, fontSize = 13.sp)
            }
        }
    }

    val shown = all
        .filter { city.isEmpty() || it.city == city }
        .filter {
            when (status) {
                null -> true
                "open" -> it.status == RoadStatus.OPEN
                "busy" -> it.status == RoadStatus.BUSY || it.status == RoadStatus.CRISIS
                "closed" -> it.status == RoadStatus.CLOSED
                else -> true
            }
        }
        .filter { query.isBlank() || it.name.contains(query.trim()) || (it.city ?: "").contains(query.trim()) }

    RoadsMap(all.filter { city.isEmpty() || it.city == city })
    Row(horizontalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.fillMaxWidth()) {
        listOf(RoadStatus.OPEN, RoadStatus.BUSY, RoadStatus.CRISIS, RoadStatus.CLOSED).forEach { s ->
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Box(Modifier.size(9.dp).clip(CircleShape).background(roadColor(s)))
                Text(s.label, fontSize = 11.sp, color = Pw.Muted)
            }
        }
    }
    val newest = all.mapNotNull { it.at }.maxOrNull()
    Text(
        "${all.count { it.lat != null }} حاجزاً على الخريطة · آخر تحديث ${agoText(newest)}",
        fontSize = 12.sp, color = Pw.Muted,
    )

    OutlinedTextField(
        value = query, onValueChange = onQuery, singleLine = true,
        placeholder = { Text("ابحث عن حاجز أو مدينة") },
        leadingIcon = { Icon(PwIcons.Search, null, tint = Pw.Muted) },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Pw.Ink, unfocusedTextColor = Pw.Ink, cursorColor = Pw.Ink,
            focusedBorderColor = Pw.Ink, unfocusedBorderColor = Pw.Border,
            focusedPlaceholderColor = Pw.Faint, unfocusedPlaceholderColor = Pw.Faint,
            focusedContainerColor = Pw.Card, unfocusedContainerColor = Pw.Card,
        ),
    )
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        PillButton("كل المدن", city.isEmpty()) { onCity("") }
        roads.cities.forEach { c -> PillButton(c, city == c) { onCity(c) } }
    }

    if (shown.isEmpty()) {
        Text("لا حواجز مطابقة", color = Pw.Muted, modifier = Modifier.padding(20.dp))
    }
    // Grouped by city, the newest report first inside each (as on the website).
    shown.groupBy { it.city ?: "أخرى" }.forEach { (name, cps) ->
        Text("$name (${cps.size})", fontSize = 15.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(horizontal = 14.dp, vertical = 4.dp)) {
            cps.sortedWith(compareByDescending<Checkpoint> { it.at ?: Instant.EPOCH }.thenBy { it.name }).forEachIndexed { i, c ->
                if (i > 0) Box(Modifier.fillMaxWidth().heightIn(min = 1.dp, max = 1.dp).background(Pw.Line))
                CheckpointRow(c)
            }
        }
    }
}

@Composable
private fun CheckpointRow(c: Checkpoint) {
    val old = isOld(c)
    Row(
        Modifier.fillMaxWidth().heightIn(min = 60.dp).padding(vertical = 8.dp).alpha(if (old) 0.6f else 1f),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(Modifier.size(10.dp).clip(CircleShape).background(roadColor(c.status)))
        Column(Modifier.weight(1f)) {
            Text(c.name, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Text(agoText(c.at) + if (old) " · قد يكون الوضع تغيّر" else "", fontSize = 12.sp, color = Pw.Muted)
        }
        Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            if (c.into == c.out) DirChip("الاتجاهان", c.into)
            else {
                DirChip("دخول", c.into)
                DirChip("خروج", c.out)
            }
        }
    }
}

@Composable
private fun DirChip(label: String, s: RoadStatus) {
    Text(
        "$label ${s.label}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = roadColor(s),
        modifier = Modifier.widthIn(min = 64.dp).clip(RoundedCornerShape(10.dp)).background(roadColor(s).copy(alpha = 0.16f))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    )
}

/** The West Bank part of the outline, with the checkpoints we can place as coloured dots. */
@Composable
private fun RoadsMap(cps: List<Checkpoint>) {
    val outer = androidx.compose.runtime.remember { MapProjection.parse(PalestineShape.OUTER) }
    val regions = androidx.compose.runtime.remember { PalestineShape.REGION_LINES.map(MapProjection::parse) }
    // The same window as the website's roads map: x 54..120, y 76..184 map units.
    val x0 = 54f; val y0 = 76f; val w = 66f; val h = 108f
    Box(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.fillMaxWidth(0.82f).aspectRatio(w / h)) {
            val k = size.width / w
            fun t(p: Offset) = Offset((p.x - x0) * k, (p.y - y0) * k)
            drawPath(MapProjection.toPath(outer, true, ::t), Color(0xFFF8F6EE).copy(alpha = 0.93f))
            drawPath(MapProjection.toPath(outer, true, ::t), Color(0xFF6E8577), style = Stroke(1.2f))
            regions.forEach { drawPath(MapProjection.toPath(it, false, ::t), Color(0xFF6B786F).copy(alpha = 0.7f), style = Stroke(1f)) }
            cps.filter { it.lat != null && it.lon != null }.sortedBy { it.status.rank }.forEach { c ->
                val p = t(MapProjection.point(c.lat!!, c.lon!!))
                val r = if (c.status == RoadStatus.UNKNOWN) 3.5f else 6f
                drawCircle(Color.White, r + 1.5f, p, alpha = if (isOld(c)) 0.5f else 1f)
                drawCircle(roadColor(c.status), r, p, alpha = if (isOld(c)) 0.5f else 1f)
            }
        }
    }
}

/** A short roads summary for the home screen: counts and the closed checkpoints. */
@Composable
fun RoadsSummaryCard(onOpen: () -> Unit) {
    val (load, _) = rememberLoad("roads_home") { RoadsRepository.roads() }
    val roads = (load as? ps.weather.ui.components.Load.Ok)?.value ?: return
    if (!roads.anySource) return
    val all = roads.checkpoints
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card)
            .clickable(role = Role.Button, onClick = onOpen).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(PwIcons.Road, null, tint = Pw.Link, modifier = Modifier.size(20.dp))
            Text("أحوال الطرق", fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text("كل الحواجز", color = Pw.Link, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(
                "سالك" to (all.count { it.status == RoadStatus.OPEN } to RoadStatus.OPEN),
                "أزمة" to (all.count { it.status == RoadStatus.BUSY || it.status == RoadStatus.CRISIS } to RoadStatus.BUSY),
                "مغلق" to (all.count { it.status == RoadStatus.CLOSED } to RoadStatus.CLOSED),
            ).forEach { (label, v) ->
                Row(
                    Modifier.clip(RoundedCornerShape(50)).background(Pw.Card).padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text("${v.first}", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = roadColor(v.second))
                    Text(label, fontSize = 13.sp)
                }
            }
        }
        val closed = all.filter { it.status == RoadStatus.CLOSED }.take(4).map { it.name }
        if (closed.isNotEmpty()) Text("مغلق الآن: ${closed.joinToString("، ")}", fontSize = 13.sp, color = Pw.Muted)
    }
}
