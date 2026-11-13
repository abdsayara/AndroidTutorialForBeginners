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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import ps.weather.data.City
import ps.weather.data.ReportsRepository
import ps.weather.data.SatLayer
import ps.weather.data.Satellite
import ps.weather.data.SatelliteRepository
import ps.weather.ui.arabicDate
import ps.weather.ui.components.Load
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.RemoteImage
import ps.weather.ui.components.fetchImage
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.theme.Pw
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

private val Hebron: ZoneId = ZoneId.of("Asia/Hebron")
private val Clock = DateTimeFormatter.ofPattern("HH:mm", Locale.US)

// ---------------------------------------------------------------- home: the two tiles

/** «خرائط الطقس» (coming soon) beside «صور الأقمار», which opens the live satellite pictures. */
@Composable
fun MapTiles(onSatellite: () -> Unit) {
    val (load, _) = rememberLoad("satellite") { SatelliteRepository.satellite() }
    val thumb = (load as? Load.Ok)?.value?.layers?.firstOrNull { it.id == "natural" }?.thumb
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        val shape = RoundedCornerShape(24.dp)
        val tile = Modifier.weight(1f).aspectRatio(0.75f).clip(shape).border(5.dp, Color.White.copy(alpha = 0.10f), shape)
        // Weather maps: a contour-map look, not open yet.
        Box(tile.background(Brush.linearGradient(listOf(Color(0xFF1F7FD1), Color(0xFF1A5FB0), Color(0xFF1B8F9A)))), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                drawCircle(Brush.radialGradient(listOf(Color(0xFF37C27A), Color.Transparent), Offset(size.width * 0.85f, size.height * 0.08f), size.width * 0.7f), size.width * 0.7f, Offset(size.width * 0.85f, size.height * 0.08f))
                drawCircle(Brush.radialGradient(listOf(Color(0xFFE0B83A), Color.Transparent), Offset(size.width * 0.1f, size.height * 0.95f), size.width * 0.6f), size.width * 0.6f, Offset(size.width * 0.1f, size.height * 0.95f))
                drawCircle(Brush.radialGradient(listOf(Color(0xFF2FB9A3), Color.Transparent), Offset(size.width * 0.9f, size.height), size.width * 0.6f), size.width * 0.6f, Offset(size.width * 0.9f, size.height))
                val line = Color.White.copy(alpha = 0.22f)
                for (i in 1..9) {
                    drawCircle(line, i * size.width * 0.13f, Offset(size.width * 0.2f, size.height * 0.3f), style = Stroke(1.dp.toPx()))
                    drawCircle(line.copy(alpha = 0.15f), i * size.width * 0.15f, Offset(size.width * 0.85f, size.height * 0.8f), style = Stroke(1.dp.toPx()))
                }
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("خرائط الطقس", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(
                    "قريباً..", fontSize = 13.sp, color = Color.White,
                    modifier = Modifier.clip(RoundedCornerShape(50)).background(Color(0x800A1628)).padding(horizontal = 12.dp, vertical = 2.dp),
                )
            }
        }
        // Satellite pictures: the newest picture behind the title.
        Box(
            tile.background(Brush.verticalGradient(listOf(Color(0xFF3A4A5A), Color(0xFF1C2733))))
                .clickable(role = Role.Button, onClickLabel = "صور الأقمار", onClick = onSatellite),
            contentAlignment = Alignment.Center,
        ) {
            thumb?.let { RemoteImage(it, Modifier.fillMaxSize(), maxSide = 400) }
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x26081220), Color(0xB8081220)))))
            Row(
                Modifier.align(Alignment.TopStart).padding(12.dp).clip(RoundedCornerShape(50)).background(Color(0x9E0A1628)).padding(horizontal = 10.dp, vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Color(0xFFFF5A4E)))
                Text("مباشر", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Color.White)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("صور الأقمار", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("سحب · غبار · ضباب", fontSize = 13.sp, color = Color.White.copy(alpha = 0.85f))
                Box(Modifier.padding(top = 6.dp).size(44.dp).clip(CircleShape).background(Color(0x9E0A1628)), contentAlignment = Alignment.Center) {
                    Icon(PwIcons.Expand, null, tint = Color.White, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

// ---------------------------------------------------------------- home: the newest reports

/** The two newest reports: the picture, then the title under it where it reads clearly. */
@Composable
fun NewsHome(onReport: (Int) -> Unit, onReports: () -> Unit) {
    val (load, _) = rememberLoad("reports") { ReportsRepository.list() }
    val items = (load as? Load.Ok)?.value?.take(2).orEmpty()
    if (items.isEmpty()) return
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("أخبار الطقس", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
            Text(
                "كل التقارير", color = Pw.Link, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
                modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button, onClick = onReports).padding(8.dp),
            )
        }
        items.forEach { r ->
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color.White.copy(alpha = 0.10f))
                    .clickable(role = Role.Button) { onReport(r.id) },
            ) {
                r.image?.let { RemoteImage(it, Modifier.fillMaxWidth().aspectRatio(16f / 9f), maxSide = 900) }
                Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(r.title, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, lineHeight = 28.sp)
                    r.date?.let { d ->
                        runCatching { arabicDate(LocalDate.parse(d.take(10))) }.getOrNull()?.let { Text(it, fontSize = 12.sp, color = Pw.Muted) }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- the satellite pictures

@Composable
private fun DarkRound(icon: ImageVector, label: String, size: Int = 56, onClick: () -> Unit) {
    Box(
        Modifier.size(size.dp).clip(CircleShape).background(Color(0xB814181E)).clickable(role = Role.Button, onClickLabel = label, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, contentDescription = label, tint = Color.White, modifier = Modifier.size((size * 0.42f).dp)) }
}

/**
 * Live satellite pictures over the region, one kind at a time: a picker for the others, a mark
 * on the chosen place, and the last two hours in motion.
 */
@Composable
fun SatelliteScreen(city: City, onBack: () -> Unit) {
    val (load, refresh) = rememberLoad("satellite") { SatelliteRepository.satellite() }
    var layerId by rememberSaveable { mutableStateOf("clouds") }
    var picking by remember { mutableStateOf(false) }
    var playing by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        when (load) {
            is Load.Loading -> Text("جارٍ التحميل…", color = Color.White, modifier = Modifier.align(Alignment.Center))
            is Load.Error -> Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("تعذّر تحميل صور الأقمار", color = Color.White)
                Text("إعادة المحاولة", color = Pw.Link, fontWeight = FontWeight.SemiBold, modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button, onClick = refresh).padding(10.dp))
            }
            is Load.Ok -> {
                val sat = load.value
                val layer = sat.layers.firstOrNull { it.id == layerId } ?: sat.layers.first()
                val last = sat.times.lastIndex
                var frame by remember(layer.id) { mutableIntStateOf(last) }
                var loaded by remember(layer.id) { mutableIntStateOf(0) }
                var frames by remember(layer.id) { mutableStateOf<List<ImageBitmap?>>(emptyList()) }
                val newest by androidx.compose.runtime.produceState<ImageBitmap?>(null, layer.frames.last()) { value = fetchImage(layer.frames.last()) }

                // Playing: fetch the two hours' pictures first so the motion is smooth, then loop.
                LaunchedEffect(playing, layer.id) {
                    if (!playing) { frame = last; return@LaunchedEffect }
                    if (frames.size != layer.frames.size) {
                        loaded = 0
                        frames = coroutineScope { layer.frames.map { url -> async { fetchImage(url).also { loaded++ } } }.awaitAll() }
                    }
                    var i = 0
                    while (true) {
                        frame = minOf(i, last)
                        delay(550)
                        // The newest picture stays a little longer before the loop starts again.
                        i = (i + 1) % (last + 3)
                    }
                }

                val picture = if (playing) frames.getOrNull(frame) ?: newest else newest
                SatPicture(picture, sat, city)

                // Top: close and the picture's name.
                Row(
                    Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(Color(0x99000000), Color.Transparent))).padding(start = 14.dp, end = 14.dp, top = 12.dp, bottom = 24.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DarkRound(PwIcons.Close, "إغلاق", 44, onBack)
                    Text(layer.title, fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = Color.White, textAlign = TextAlign.Center, modifier = Modifier.weight(1f))
                    Box(Modifier.width(44.dp))
                }

                // Bottom: the kinds of picture, play, and the picture's time.
                Row(
                    Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xB3000000))))
                        .padding(start = 14.dp, end = 14.dp, top = 24.dp, bottom = 16.dp),
                    verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    DarkRound(PwIcons.Layers, "اختر الصورة") { picking = true }
                    DarkRound(if (playing) PwIcons.Pause else PwIcons.Play, if (playing) "إيقاف" else "تشغيل حركة آخر ساعتين") { playing = !playing }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        val at = sat.times[frame].atZone(Hebron)
                        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(Clock.format(at), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(arabicDate(at.toLocalDate()), fontSize = 14.sp, color = Color.White)
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            sat.times.indices.forEach { k ->
                                Box(Modifier.width(14.dp).height(4.dp).clip(RoundedCornerShape(2.dp)).background(if (k <= frame) Pw.Link else Color.White.copy(alpha = 0.3f)))
                            }
                        }
                        Text(
                            when {
                                playing && frames.size != layer.frames.size -> "جارٍ تحميل الصور $loaded من ${layer.frames.size}"
                                playing -> "حركة السحب في آخر ساعتين"
                                else -> layer.hint
                            },
                            fontSize = 12.sp, color = Color.White.copy(alpha = 0.75f), lineHeight = 18.sp,
                        )
                    }
                }

                if (picking) LayerPicker(sat.layers, layer.id, onPick = { layerId = it; playing = false; picking = false }, onClose = { picking = false })
            }
        }
    }
}

/** The picture filling the screen (cropped to it), with a cross where the chosen place is. */
@Composable
private fun SatPicture(picture: ImageBitmap?, sat: Satellite, city: City) {
    BoxWithConstraints(Modifier.fillMaxSize()) {
        if (picture == null) {
            Text("جارٍ تحميل الصورة…", color = Color.White.copy(alpha = 0.7f), modifier = Modifier.align(Alignment.Center))
            return@BoxWithConstraints
        }
        Image(picture, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        val (w, s, e, n) = sat.bbox
        val fx = ((city.lon - w) / (e - w)).toFloat()
        val fy = ((n - city.lat) / (n - s)).toFloat()
        if (fx !in 0f..1f || fy !in 0f..1f) return@BoxWithConstraints
        Canvas(Modifier.fillMaxSize()) {
            // Where that point of the picture lands once the picture is scaled to cover the screen.
            val scale = maxOf(size.width / picture.width, size.height / picture.height)
            val x = (size.width - picture.width * scale) / 2 + fx * picture.width * scale
            val y = (size.height - picture.height * scale) / 2 + fy * picture.height * scale
            val arm = 9.dp.toPx()
            for ((color, stroke) in listOf(Color.Black.copy(alpha = 0.6f) to 4.dp.toPx(), Color.White to 2.dp.toPx())) {
                drawLine(color, Offset(x - arm, y), Offset(x + arm, y), stroke)
                drawLine(color, Offset(x, y - arm), Offset(x, y + arm), stroke)
            }
        }
    }
}

@Composable
private fun androidx.compose.foundation.layout.BoxScope.LayerPicker(layers: List<SatLayer>, current: String, onPick: (String) -> Unit, onClose: () -> Unit) {
    Box(Modifier.fillMaxSize().clickable(onClickLabel = "إغلاق", onClick = onClose))
    Column(
        Modifier.align(Alignment.BottomCenter).fillMaxWidth().clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)).background(Color(0xF50E1218))
            .clickable(enabled = false) {}.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("اختر الصورة", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.weight(1f))
            DarkRound(PwIcons.Close, "إغلاق", 40, onClose)
        }
        layers.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                pair.forEach { l ->
                    val shape = RoundedCornerShape(14.dp)
                    Column(
                        Modifier.weight(1f).clip(shape).clickable(role = Role.Button) { onPick(l.id) },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        RemoteImage(
                            l.thumb, Modifier.fillMaxWidth().aspectRatio(1.6f).clip(shape)
                                .border(2.dp, if (l.id == current) Pw.Link else Color.White.copy(alpha = 0.25f), shape),
                            maxSide = 400,
                        )
                        Text(l.title, fontSize = 13.sp, color = Color.White, modifier = Modifier.padding(bottom = 4.dp))
                    }
                }
                if (pair.size == 1) Box(Modifier.weight(1f))
            }
        }
    }
}
