package ps.weather.ui.map

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.core.content.ContextCompat
import ps.weather.data.CITIES
import ps.weather.data.City
import ps.weather.data.CityNow
import ps.weather.data.GridData
import ps.weather.data.Locator
import ps.weather.data.PlaceKind
import ps.weather.data.PlacePoint
import ps.weather.data.PlacesRepository
import ps.weather.data.placeAt
import ps.weather.data.Quake
import ps.weather.data.QuakeRepository
import ps.weather.data.WeatherRepository
import ps.weather.ui.components.Load
import ps.weather.ui.components.PillButton
import ps.weather.ui.components.PillRow
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.RoundIconButton
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.deg
import ps.weather.ui.theme.Pw
import ps.weather.ui.weatherText
import java.time.Duration
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.roundToInt

enum class MapLayer(val label: String) {
    TEMP("الحرارة"), WIND("الرياح"), RAIN("الأمطار"),
    CLOUDS("السحب"), STORMS("العواصف"), QUAKES("الزلازل"),
}

private val OUTER = MapProjection.parse(PalestineShape.OUTER)
private val REGIONS = PalestineShape.REGION_LINES.map(MapProjection::parse)
private val LAKES = PalestineShape.LAKES.map(MapProjection::parse)

/** Map units that fit the whole country vertically at zoom 1. */
private const val FIT_HEIGHT = 372f
private const val MAX_ZOOM = 40f
/** Villages and towns appear from this zoom level. */
private const val PLACES_ZOOM = 2.2f

@Composable
fun MapScreen(initialCity: City, onOpenCity: (City) -> Unit) {
    var layer by rememberSaveable { mutableStateOf(MapLayer.TEMP) }
    val (citiesLoad, _) = rememberLoad("citiesNow") { WeatherRepository.citiesNow(CITIES) }
    val (gridLoad, _) = rememberLoad("grid") { WeatherRepository.grid() }
    var quakeDays by rememberSaveable { mutableIntStateOf(7) }
    val (quakeLoad, _) = rememberLoad("quakes", quakeDays) { QuakeRepository.recent(quakeDays) }
    // Villages and towns (Arabic names only), shown once zoomed in; skip ones that are listed cities.
    val (placesLoad, _) = rememberLoad("places") { PlacesRepository.places() }
    val places: List<PlacePoint> = (placesLoad as? Load.Ok)?.value ?: emptyList()
    val villages = remember(places) {
        places.filter { p -> CITIES.none { c -> c.name == p.name || (abs(c.lat - p.lat) < 0.018 && abs(c.lon - p.lon) < 0.02) } }
    }

    val cityNow: Map<String, CityNow> = (citiesLoad as? Load.Ok)?.value ?: emptyMap()
    val grid: GridData? = (gridLoad as? Load.Ok)?.value
    val quakes: List<Quake> = (quakeLoad as? Load.Ok)?.value ?: emptyList()

    var frame by remember { mutableIntStateOf(-1) }
    val frameIdx = when {
        grid == null -> 0
        frame < 0 || frame >= grid.times.size -> grid.nowIndex
        else -> frame
    }
    var playing by remember { mutableStateOf(false) }
    LaunchedEffect(playing, grid) {
        val g = grid ?: return@LaunchedEffect
        while (playing) {
            delay(900)
            val cur = if (frame < 0 || frame >= g.times.size) g.nowIndex else frame
            frame = (cur + 1) % g.times.size
        }
    }

    var selected by remember { mutableStateOf(initialCity) }
    // Exact GPS fix and live values for a selected village / point (cities use cityNow).
    var gps by remember { mutableStateOf(initialCity.takeIf { it.kind == PlaceKind.GPS }) }
    var placeNow by remember { mutableStateOf<CityNow?>(null) }
    var mapMessage by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(selected) {
        placeNow = null
        if (selected.isListed) return@LaunchedEffect
        runCatching { WeatherRepository.forecast(selected.lat, selected.lon) }.getOrNull()?.value?.let { fc ->
            placeNow = CityNow(fc.current.temp, fc.current.windSpeed, fc.current.code, fc.hours.getOrNull(fc.nowIndex)?.precipProb ?: 0)
        }
    }
    var selectedQuake by remember { mutableStateOf<Quake?>(null) }
    var showRegions by rememberSaveable { mutableStateOf(true) }

    // Viewport: centre in map units, zoom relative to "fit the whole country".
    // A selected village / GPS point opens the map zoomed in on it.
    val startOnPlace = !initialCity.isListed
    var cx by rememberSaveable { mutableFloatStateOf(if (startOnPlace) MapProjection.x(initialCity.lon) else 65f) }
    var cy by rememberSaveable { mutableFloatStateOf(if (startOnPlace) MapProjection.y(initialCity.lat) else 185f) }
    var zoom by rememberSaveable { mutableFloatStateOf(if (startOnPlace) 4f else 1f) }
    var box by remember { mutableStateOf(IntSize.Zero) }
    val scale = if (box.height > 0) box.height / FIT_HEIGHT * zoom else 1f
    fun toScreen(u: Offset) = Offset((u.x - cx) * scale + box.width / 2f, (u.y - cy) * scale + box.height / 2f)

    val visibleCities = CITIES.filter { it.major || zoom >= 1.8f || it.id == selected.id }
    val currentLayer by rememberUpdatedState(layer)
    val currentQuakes by rememberUpdatedState(quakes)
    val currentCities by rememberUpdatedState(visibleCities)
    val currentVillages by rememberUpdatedState(villages)

    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val locate: () -> Unit = {
        mapMessage = "جارٍ تحديد موقعك…"
        scope.launch {
            Locator.locatePlace(context)
                .onSuccess { p ->
                    mapMessage = null
                    gps = p
                    selected = p
                    cx = MapProjection.x(p.lon); cy = MapProjection.y(p.lat)
                    zoom = maxOf(zoom, 6f)
                    if (layer != MapLayer.TEMP && layer != MapLayer.WIND) layer = MapLayer.TEMP
                }
                .onFailure { mapMessage = it.message }
        }
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { granted ->
        if (granted.values.any { it }) locate() else mapMessage = "لم يُسمح بالوصول إلى موقعك"
    }

    val tm = rememberTextMeasurer()
    val dark = layer == MapLayer.STORMS || layer == MapLayer.CLOUDS
    val sea = when (layer) { MapLayer.STORMS -> Color(0xFF13202A); MapLayer.CLOUDS -> Color(0xFF1B3A55); else -> Color(0xFFCFE2EC) }
    val land = when (layer) { MapLayer.STORMS -> Color(0xFF24343F); MapLayer.CLOUDS -> Color(0xFF5E7A4E); else -> Color(0xFFF4F1E6) }
    val coast = if (dark) Color(0xFF8FA67F) else Color(0xFF6E8577)
    val lake = if (dark) Color(0xFF2C5878) else Color(0xFF9CC3DA)

    Column(Modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("خريطة فلسطين", fontSize = 22.sp, fontWeight = FontWeight.Bold)

        // Layer picker (3 × 2)
        MapLayer.entries.chunked(3).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                row.forEach { l ->
                    PillButton(l.label, l == layer, Modifier.weight(1f)) {
                        layer = l; playing = false; frame = -1
                    }
                }
            }
        }

        Box(
            Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(24.dp)).background(sea)
                .onSizeChanged { box = it }
        ) {
            Canvas(
                Modifier.fillMaxSize()
                    .semantics { contentDescription = "خريطة فلسطين التفاعلية — ${layer.label}" }
                    .pointerInput(Unit) {
                        detectTransformGestures { centroid, pan, z, _ ->
                            val base = size.height / FIT_HEIGHT
                            val s0 = base * zoom
                            val newZoom = (zoom * z).coerceIn(0.8f, MAX_ZOOM)
                            val s1 = base * newZoom
                            val ux = cx + (centroid.x - size.width / 2f) / s0
                            val uy = cy + (centroid.y - size.height / 2f) / s0
                            zoom = newZoom
                            cx = (ux - (centroid.x - size.width / 2f) / s1 - pan.x / s1).coerceIn(-20f, 150f)
                            cy = (uy - (centroid.y - size.height / 2f) / s1 - pan.y / s1).coerceIn(0f, 380f)
                        }
                    }
                    .pointerInput(Unit) {
                        detectTapGestures { p ->
                            val s = size.height / FIT_HEIGHT * zoom
                            fun scr(u: Offset) = Offset((u.x - cx) * s + size.width / 2f, (u.y - cy) * s + size.height / 2f)
                            if (currentLayer == MapLayer.QUAKES) {
                                currentQuakes.minByOrNull { (scr(MapProjection.point(it.lat, it.lon)) - p).getDistance() }
                                    ?.takeIf { (scr(MapProjection.point(it.lat, it.lon)) - p).getDistance() < 48.dp.toPx() }
                                    ?.let { selectedQuake = it }
                            } else {
                                // Nearest listed city, or village once villages are shown.
                                val cands = currentCities.map { it to (scr(MapProjection.point(it.lat, it.lon)) - p).getDistance() } +
                                    (if (zoom >= PLACES_ZOOM) currentVillages.map { v ->
                                        placeAt(v.name, v.lat, v.lon, PlaceKind.VILLAGE) to (scr(MapProjection.point(v.lat, v.lon)) - p).getDistance()
                                    } else emptyList())
                                cands.minByOrNull { it.second }?.takeIf { it.second < 40.dp.toPx() }?.let { selected = it.first }
                            }
                        }
                    }
            ) {
                val tf: (Offset) -> Offset = ::toScreen
                drawPath(MapProjection.toPath(OUTER, true, tf), land)
                drawPath(MapProjection.toPath(OUTER, true, tf), coast, style = Stroke(1.5.dp.toPx(), join = StrokeJoin.Round))
                if (showRegions) REGIONS.forEach {
                    drawPath(
                        MapProjection.toPath(it, false, tf), coast.copy(alpha = 0.8f),
                        style = Stroke(1.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 7f))),
                    )
                }
                LAKES.forEach { drawPath(MapProjection.toPath(it, true, tf), lake) }

                // Gridded layers: soft blobs per grid point.
                if (grid != null && layer in setOf(MapLayer.RAIN, MapLayer.CLOUDS, MapLayer.STORMS)) {
                    val radius = 14f * scale
                    for (i in grid.lats.indices) {
                        val (color, alpha) = when (layer) {
                            MapLayer.RAIN -> rainColor(grid.precip[i].getOrElse(frameIdx) { 0.0 })
                            MapLayer.CLOUDS -> Color.White to (grid.cloud[i].getOrElse(frameIdx) { 0.0 } / 100.0 * 0.8).toFloat()
                            else -> capeColor(grid.cape[i].getOrElse(frameIdx) { 0.0 })
                        }
                        if (alpha.isNaN() || alpha <= 0.02f) continue
                        val c = toScreen(MapProjection.point(grid.lats[i], grid.lons[i]))
                        drawCircle(
                            Brush.radialGradient(listOf(color.copy(alpha = alpha), color.copy(alpha = alpha * 0.6f), Color.Transparent), c, radius),
                            radius, c,
                        )
                    }
                }

                if (layer == MapLayer.QUAKES) {
                    quakes.forEach { q ->
                        val c = toScreen(MapProjection.point(q.lat, q.lon))
                        val r = (5 + q.mag * 4).dp.toPx() / 2
                        val strong = q.mag >= 3
                        drawCircle(if (strong) Color(0x59D9452B) else Color(0x4DC77700), r, c)
                        drawCircle(
                            if (q == selectedQuake) Pw.Ink else if (strong) Color(0xFFD9452B) else Pw.Amber, r, c,
                            style = Stroke(2.dp.toPx()),
                        )
                    }
                }

                // Villages and towns, with labels that never overlap each other or city pins.
                val taken = ArrayList<Rect>()
                fun free(r: Rect): Boolean = if (taken.any { it.overlaps(r) }) false else { taken += r; true }
                visibleCities.forEach { c ->
                    val pt = toScreen(MapProjection.point(c.lat, c.lon))
                    taken += Rect(pt.x - 24.dp.toPx(), pt.y - 12.dp.toPx(), pt.x + 24.dp.toPx(), pt.y + 32.dp.toPx())
                }
                if (zoom >= PLACES_ZOOM) {
                    val townStyle = TextStyle(fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Pw.Ink)
                    val villageStyle = TextStyle(fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Pw.Ink)
                    villages.forEach { v ->
                        val pt = toScreen(MapProjection.point(v.lat, v.lon))
                        if (pt.x < -10 || pt.y < -10 || pt.x > size.width + 10 || pt.y > size.height + 10) return@forEach
                        drawCircle(
                            if (dark) Color(0xD9FFFFFF) else if (v.isTown) Pw.Ink else Color(0xFF5C6B62),
                            (if (v.isTown) 3f else 2.2f).dp.toPx(), pt,
                        )
                        if (zoom >= (if (v.isTown) 2.8f else 4.5f)) {
                            val lbl = tm.measure(v.name, if (v.isTown) townStyle else villageStyle)
                            val tl = Offset(pt.x + 5.dp.toPx(), pt.y - lbl.size.height / 2f)
                            if (free(Rect(tl, Size(lbl.size.width + 6.dp.toPx(), lbl.size.height.toFloat())))) {
                                drawRoundRect(Color(0xC7FFFFFF), tl - Offset(3.dp.toPx(), 0f), Size(lbl.size.width + 6.dp.toPx(), lbl.size.height.toFloat()), CornerRadius(4.dp.toPx()))
                                drawText(lbl, topLeft = tl)
                            }
                        }
                    }
                }

                // City markers
                val valueStyle = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Bold)
                val nameStyle = TextStyle(fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Pw.Ink)
                val showValues = layer == MapLayer.TEMP || layer == MapLayer.WIND
                visibleCities.forEach { city ->
                    if (!showValues && !city.major) return@forEach
                    val c = toScreen(MapProjection.point(city.lat, city.lon))
                    if (c.x < -40 || c.y < -40 || c.x > size.width + 40 || c.y > size.height + 40) return@forEach
                    val name = tm.measure(city.name, nameStyle)
                    if (showValues) {
                        val now = cityNow[city.id]
                        val text = when {
                            now == null -> "…"
                            layer == MapLayer.WIND -> now.wind.roundToInt().toString()
                            else -> deg(now.temp)
                        }
                        val (bg, fg) = pinColors(layer, now)
                        val label = tm.measure(text, valueStyle.copy(color = fg))
                        val w = maxOf(label.size.width + 12.dp.toPx(), 34.dp.toPx())
                        val h = 24.dp.toPx()
                        val tl = Offset(c.x - w / 2, c.y - h / 2)
                        drawRoundRect(bg, tl, Size(w, h), CornerRadius(h / 2))
                        drawRoundRect(
                            if (city.id == selected.id) Pw.Green else Color(0x2612241B), tl, Size(w, h), CornerRadius(h / 2),
                            style = Stroke(2.dp.toPx()),
                        )
                        drawText(label, topLeft = Offset(c.x - label.size.width / 2f, c.y - label.size.height / 2f))
                        val nameTl = Offset(c.x - name.size.width / 2f, c.y + h / 2 + 1.dp.toPx())
                        drawRoundRect(Color(0xD9FFFFFF), nameTl - Offset(3.dp.toPx(), 0f), Size(name.size.width + 6.dp.toPx(), name.size.height.toFloat()), CornerRadius(4.dp.toPx()))
                        drawText(name, topLeft = nameTl)
                    } else {
                        drawCircle(Color.White, 4.dp.toPx(), c)
                        drawCircle(Pw.Ink, 2.5.dp.toPx(), c)
                        val nameTl = Offset(c.x + 6.dp.toPx(), c.y - name.size.height / 2f)
                        drawRoundRect(Color(0xD9FFFFFF), nameTl - Offset(3.dp.toPx(), 0f), Size(name.size.width + 6.dp.toPx(), name.size.height.toFloat()), CornerRadius(4.dp.toPx()))
                        drawText(name, topLeft = nameTl)
                    }
                }

                // GPS fix (blue dot, accuracy ring) and the selected village / point.
                gps?.let { g ->
                    val pt = toScreen(MapProjection.point(g.lat, g.lon))
                    val r = ((g.accuracyM ?: 0) / 1000f / MapProjection.KM_PER_UNIT) * scale
                    if (r > 8.dp.toPx()) drawCircle(Color(0x261F5FA8), r, pt)
                    drawCircle(Color.White, 9.dp.toPx(), pt)
                    drawCircle(Pw.Blue, 6.dp.toPx(), pt)
                }
                if (!selected.isListed && selected.kind != PlaceKind.GPS) {
                    val pt = toScreen(MapProjection.point(selected.lat, selected.lon))
                    drawCircle(Pw.Green, 8.dp.toPx(), pt - Offset(0f, 14.dp.toPx()))
                    drawLine(Pw.Green, pt - Offset(0f, 8.dp.toPx()), pt, 3.dp.toPx())
                    drawCircle(Color.White, 3.dp.toPx(), pt - Offset(0f, 14.dp.toPx()))
                    val lbl = tm.measure(selected.name, TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Pw.Ink))
                    val tl = Offset(pt.x - lbl.size.width / 2f, pt.y + 4.dp.toPx())
                    drawRoundRect(Color(0xEBFFFFFF), tl - Offset(4.dp.toPx(), 0f), Size(lbl.size.width + 8.dp.toPx(), lbl.size.height.toFloat()), CornerRadius(4.dp.toPx()))
                    drawText(lbl, topLeft = tl)
                }
            }

            // Controls (TopEnd is the left side in RTL)
            Column(Modifier.align(Alignment.TopEnd).padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                RoundIconButton(PwIcons.Plus, "تكبير", { zoom = (zoom * 1.4f).coerceAtMost(MAX_ZOOM) })
                RoundIconButton(PwIcons.Minus, "تصغير", { zoom = (zoom / 1.4f).coerceAtLeast(0.8f) })
                RoundIconButton(PwIcons.Expand, "عرض فلسطين كاملة", { cx = 65f; cy = 185f; zoom = 1f })
                RoundIconButton(
                    PwIcons.Regions, "حدود المناطق", { showRegions = !showRegions },
                    background = if (showRegions) Pw.Ink else Pw.Card, tint = if (showRegions) Color.White else Pw.Ink,
                )
                RoundIconButton(PwIcons.Locate, "موقعي الدقيق", {
                    val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    if (granted) locate()
                    else permission.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                }, background = Pw.Green, tint = Color.White)
            }
            Legend(layer, Modifier.align(Alignment.TopStart).padding(10.dp))
            ScaleBar(scale, Modifier.align(Alignment.BottomStart).padding(10.dp))
            val loading = when (layer) {
                MapLayer.TEMP, MapLayer.WIND -> citiesLoad is Load.Loading
                MapLayer.QUAKES -> quakeLoad is Load.Loading
                else -> gridLoad is Load.Loading
            }
            if (loading) CircularProgressIndicator(Modifier.align(Alignment.Center), color = Pw.Green)
        }

        mapMessage?.let {
            Text(
                it, fontSize = 13.sp, color = Pw.AmberInk,
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Pw.AmberTint).padding(10.dp),
            )
        }

        // Bottom panel for the active layer
        when (layer) {
            MapLayer.TEMP, MapLayer.WIND ->
                CityPanel(selected, if (selected.isListed) cityNow[selected.id] else placeNow) { onOpenCity(selected) }
            MapLayer.RAIN, MapLayer.CLOUDS, MapLayer.STORMS -> TimePanel(
                layer, grid, frameIdx, playing,
                onPlay = { playing = !playing },
                onFrame = { playing = false; frame = it },
            )
            MapLayer.QUAKES -> QuakePanel(quakeDays, quakes, selectedQuake) { quakeDays = it; selectedQuake = null }
        }
    }
}

private fun rainColor(mmPerHour: Double): Pair<Color, Float> = when {
    mmPerHour.isNaN() || mmPerHour < 0.1 -> Color.Transparent to 0f
    mmPerHour < 1 -> Color(0xFF3FA34D) to 0.55f
    mmPerHour < 4 -> Color(0xFFF2C230) to 0.65f
    else -> Color(0xFFD9452B) to 0.75f
}

private fun capeColor(cape: Double): Pair<Color, Float> = when {
    cape.isNaN() || cape < 300 -> Color.Transparent to 0f
    cape < 1000 -> Color(0xFFF2C230) to 0.4f
    cape < 2000 -> Color(0xFFF08C2E) to 0.55f
    else -> Color(0xFFD9452B) to 0.7f
}

private fun pinColors(layer: MapLayer, now: CityNow?): Pair<Color, Color> {
    if (now == null) return Color.White to Pw.Ink
    return if (layer == MapLayer.WIND) {
        if (now.wind >= 30) Pw.Ink to Color.White else Color.White to Pw.Ink
    } else when {
        now.temp >= 30 -> Color(0xFFB4441C) to Color.White
        now.temp >= 25 -> Color(0xFFF2B84B) to Color(0xFF3B2600)
        now.temp <= 8 -> Color(0xFF1F5FA8) to Color.White
        else -> Color.White to Pw.Ink
    }
}

@Composable
private fun Legend(layer: MapLayer, modifier: Modifier) {
    val items: List<Pair<Color, String>> = when (layer) {
        MapLayer.RAIN -> listOf(Color(0xFF3FA34D) to "خفيف", Color(0xFFF2C230) to "متوسط", Color(0xFFD9452B) to "غزير")
        MapLayer.CLOUDS -> listOf(Color.White to "كثافة الغيوم")
        MapLayer.STORMS -> listOf(Color(0xFFF2C230) to "ضعيف", Color(0xFFF08C2E) to "متوسط", Color(0xFFD9452B) to "مرتفع")
        MapLayer.QUAKES -> listOf(Color(0xFFD9452B) to "3 فأكثر", Pw.Amber to "أقل من 3")
        else -> emptyList()
    }
    if (items.isEmpty()) return
    Column(
        modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xEBFFFFFF)).padding(horizontal = 8.dp, vertical = 6.dp),
        verticalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        items.forEach { (c, t) ->
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Box(Modifier.size(10.dp).clip(RoundedCornerShape(3.dp)).background(if (c == Color.White) Color(0xFFB0BEC5) else c))
                Text(t, fontSize = 11.sp, color = Pw.Ink)
            }
        }
    }
}

@Composable
private fun ScaleBar(pxPerUnit: Float, modifier: Modifier) {
    // Pick a round distance whose bar fits in ~260 px.
    val pxPerKm = pxPerUnit / MapProjection.KM_PER_UNIT
    val km = listOf(100, 50, 20, 10, 5, 2, 1).firstOrNull { it * pxPerKm <= 260f } ?: 1
    Column(modifier.clip(RoundedCornerShape(8.dp)).background(Color(0xE6FFFFFF)).padding(horizontal = 8.dp, vertical = 4.dp)) {
        Canvas(Modifier.width(with(androidx.compose.ui.platform.LocalDensity.current) { (km * pxPerKm).toDp() }).height(6.dp)) {
            drawLine(Pw.Ink, Offset(0f, size.height), Offset(size.width, size.height), 2.dp.toPx())
            drawLine(Pw.Ink, Offset(0f, 0f), Offset(0f, size.height), 2.dp.toPx())
            drawLine(Pw.Ink, Offset(size.width, 0f), Offset(size.width, size.height), 2.dp.toPx())
        }
        Text("$km كم", fontSize = 11.sp, color = Pw.Ink)
    }
}

@Composable
private fun CityPanel(city: City, now: CityNow?, onOpen: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(Modifier.weight(1f)) {
            Text(city.name, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            if (!city.isListed) {
                Text(
                    listOfNotNull(
                        if (city.kind == PlaceKind.GPS) "موقعك الدقيق" + (city.accuracyM?.let { " (±$it م)" } ?: "") else null,
                        city.area,
                    ).joinToString(" · "),
                    fontSize = 13.sp, color = Pw.Muted,
                )
            }
            Text(
                if (now == null) (if (city.isListed) city.region.label else "جارٍ تحميل الطقس…")
                else "${weatherText(now.code)} · مطر ${now.precipProb}% · رياح ${now.wind.roundToInt()} كم/س",
                fontSize = 13.sp, color = Pw.Muted,
            )
        }
        Text(now?.let { deg(it.temp) } ?: "—", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        RoundIconButton(PwIcons.Forward, "تفاصيل ${city.name}", onOpen, background = Pw.Green, tint = Color.White)
    }
}

@Composable
private fun TimePanel(
    layer: MapLayer,
    grid: GridData?,
    frameIdx: Int,
    playing: Boolean,
    onPlay: () -> Unit,
    onFrame: (Int) -> Unit,
) {
    if (grid == null) {
        Text(
            "جارٍ تحميل البيانات…", color = Pw.Muted, fontSize = 13.sp,
            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(16.dp),
        )
        return
    }
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            RoundIconButton(if (playing) PwIcons.Pause else PwIcons.Play, if (playing) "إيقاف" else "تشغيل", onPlay, background = Pw.Green, tint = Color.White)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                itemsIndexed(grid.times) { i, t ->
                    val diff = Duration.between(grid.times[grid.nowIndex], t).toHours()
                    val label = if (diff == 0L) "الآن" else if (diff > 0) "+${diff}س" else "${diff}س"
                    Box(
                        Modifier.heightIn(min = 44.dp).clip(RoundedCornerShape(12.dp))
                            .background(if (i == frameIdx) Pw.Ink else if (diff > 0) Color(0xFFEEF1EE) else Pw.Ground)
                            .clickable(role = Role.Button) { onFrame(i) }
                            .padding(horizontal = 10.dp, vertical = 12.dp),
                    ) {
                        Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = if (i == frameIdx) Color.White else Pw.Ink)
                    }
                }
            }
        }
        val t = grid.times.getOrNull(frameIdx)
        val stamp = t?.format(DateTimeFormatter.ofPattern("HH:mm", Locale.US)) ?: ""
        Text(
            when (layer) {
                MapLayer.RAIN -> "الأمطار (ملم/ساعة) — $stamp · ما قبل «الآن» تقدير نموذجي وما بعده توقع"
                MapLayer.CLOUDS -> "نسبة الغيوم — $stamp"
                else -> "احتمال العواصف الرعدية (مؤشر CAPE) — $stamp · مؤشر على ملاءمة الجو للعواصف وليس رصداً مباشراً للبرق"
            },
            fontSize = 12.sp, color = Pw.Muted,
        )
    }
}

@Composable
private fun QuakePanel(days: Int, quakes: List<Quake>, selected: Quake?, onDays: (Int) -> Unit) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        PillRow(listOf(1, 7, 30), days, { mapOf(1 to "24 ساعة", 7 to "أسبوع", 30 to "شهر")[it]!! }, onDays)
        val q = selected ?: quakes.maxByOrNull { it.time }
        if (q == null) {
            Text("لا توجد هزات مسجّلة في هذه الفترة", color = Pw.Muted, fontSize = 13.sp)
        } else {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                val strong = q.mag >= 3
                Box(
                    Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(if (strong) Color(0xFFD9452B) else Color(0xFFFFE3B0)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(String.format(Locale.US, "%.1f", q.mag), fontWeight = FontWeight.Bold, color = if (strong) Color.White else Pw.AmberInk)
                }
                Column(Modifier.weight(1f)) {
                    Text(q.placeAr, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    val t = q.time.atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("d/M HH:mm", Locale.US))
                    Text("$t · عمق ${q.depthKm.roundToInt()} كم · ${quakes.size} هزة في الفترة${if (q.felt) " · شُعر بها" else ""}", fontSize = 12.sp, color = Pw.Muted)
                }
            }
        }
        Text("المصدر: هيئة المسح الجيولوجي الأمريكية USGS", fontSize = 11.sp, color = Pw.Muted)
    }
}
