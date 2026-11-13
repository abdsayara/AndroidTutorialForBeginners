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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import ps.weather.data.Prefs
import ps.weather.ui.components.wearKind
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import ps.weather.ui.components.wearItems
import ps.weather.ui.components.WearAvatar
import ps.weather.ui.components.SCALE
import ps.weather.ui.components.MetricTile
import ps.weather.data.BulletinRepository
import ps.weather.ui.components.Toggle
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import ps.weather.ui.arabicDayName
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.foundation.layout.requiredWidth
import androidx.compose.ui.draw.rotate
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
    city: City, prefs: Prefs, onPickCity: () -> Unit, onHourly: () -> Unit, onOpenRoads: () -> Unit, onAlerts: () -> Unit,
    onPrayer: () -> Unit = {},
    onElevation: (Double) -> Unit = {},
    prayerMethod: PrayerMethod = PrayerMethod.EGYPT,
) {
    val context = LocalContext.current
    var order by remember { mutableStateOf(homeOrder(prefs.homeOrder)) }
    var hidden by remember { mutableStateOf(prefs.homeHidden) }
    val onChange: (List<String>, Set<String>) -> Unit = { o, h ->
        order = o; hidden = h
        prefs.homeOrder = o; prefs.homeHidden = h
    }
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
            Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painterResource(R.drawable.logo), contentDescription = null,
                    modifier = Modifier.width(42.dp).height(32.dp),
                )
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(PwIcons.Pin, null, tint = Pw.Link, modifier = Modifier.size(16.dp))
                        Text(city.name, fontSize = 21.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
                    }
                }
                // The bell opens «التنبيهات السابقة»; a dot marks alerts not seen yet.
                val unseen = remember(load) { prefs.hasUnseenAlerts() }
                Box {
                    RoundIconButton(PwIcons.Bell, if (unseen) "التنبيهات، فيها جديد" else "التنبيهات", onAlerts, size = 40.dp)
                    if (unseen) Box(
                        Modifier.align(Alignment.TopEnd).padding(6.dp).size(10.dp).clip(CircleShape)
                            .background(Color(0xFFFF5A4E)).border(1.5.dp, Color.White, CircleShape),
                    )
                }
                Spacer(Modifier.width(4.dp))
                (load as? Load.Ok)?.value?.let { fc ->
                    RoundIconButton(PwIcons.Share, "مشاركة الطقس كصورة", onClick = { ShareCard.share(context, city.name, fc) }, size = 40.dp)
                    Spacer(Modifier.width(4.dp))
                }
                RoundIconButton(PwIcons.Refresh, "تحديث", refresh, size = 40.dp)
                Spacer(Modifier.width(4.dp))
                RoundIconButton(PwIcons.Search, "تغيير المدينة", onPickCity, size = 40.dp)
            }
            Text(
                listOfNotNull(
                    if (city.kind == PlaceKind.GPS) "موقعك الحالي" else null,
                    if (city.isListed) null else city.area,
                    elevationText(elevation),
                    arabicDate(LocalDate.now()),
                ).joinToString(" · "),
                fontSize = 13.sp, color = Pw.Muted, modifier = Modifier.padding(top = 6.dp),
            )
            }
        }
        item {
            LoadBox(load, refresh) { fc -> HomeContent(fc, air, prayer, onHourly, onOpenRoads, order, hidden, onChange, onPrayer, prefs) }
        }
    }
}

@Composable
private fun HomeContent(
    fc: Forecast, air: AirInfo?, prayer: PrayerDay?, onHourly: () -> Unit, onOpenRoads: () -> Unit,
    order: List<String>, hidden: Set<String>, onChange: (List<String>, Set<String>) -> Unit,
    onPrayer: () -> Unit, prefs: Prefs,
) {
    val aqi = air?.aqi
    val now = fc.nowIndex
    val today = fc.days.firstOrNull()
    val c = fc.current
    // The hero's colour follows the sky; every one keeps white text readable.
    val heroColor = when (skyKind(fc)) {
        Sky.DAY -> Pw.Brand
        Sky.NIGHT -> Color(0xFF16304F)
        Sky.CLOUDY -> Color(0xFF4A6476)
        Sky.FOG -> Color(0xFF5E707B)
        Sky.RAIN -> Color(0xFF2E4A60)
        Sky.STORM -> Color(0xFF213042)
        Sky.SNOW -> Color(0xFF4B6E8C)
    }

    // The whole screen takes this place's sky; the hero is glass over it.
    val sky = skyKind(fc)
    LaunchedEffect(sky) { Pw.sky = sky }

    // Hero
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp))
            .background(if (Pw.glass) Color.White.copy(alpha = 0.14f) else heroColor)
            .border(1.dp, if (Pw.glass) Color.White.copy(alpha = 0.2f) else Color.Transparent, RoundedCornerShape(28.dp))
            .padding(22.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(deg(c.temp), fontSize = 72.sp, fontWeight = FontWeight.Normal, color = Color.White, lineHeight = 76.sp)
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

    val nowTime = fc.currentTime ?: LocalDateTime.now()
    // The sections the person keeps, in the order they chose.
    order.filter { it !in hidden }.forEach { id ->
        when (id) {
            "hours" -> HoursSection(fc, onHourly)
            "today" -> TodaySection(fc, prayer, nowTime)
            "bulletin" -> BulletinCard()
            "roads" -> RoadsSummaryCard(onOpenRoads)
            "sky" -> if (today != null) Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                PrayerSunRow(today, prayer, onPrayer)
                SkyCard(today, nowTime, withSun = false)
            }
            "details" -> DetailsSection(fc, aqi)
            "week" -> WeekSection(fc, prefs)
        }
    }
    CustomizeHome(order, hidden, onChange)
}

/** The home sections the person can move or hide, in their default order; same as the website. */
val HOME_SECTIONS = listOf(
    "hours" to "الساعات القادمة",
    "today" to "شو نلبس والصلاة والموسم",
    "bulletin" to "النشرة التفصيلية",
    "roads" to "أحوال الطرق",
    "sky" to "الصلاة والشروق والغروب والقمر",
    "details" to "الرطوبة والأشعة والهواء",
    "week" to "توقعات 14 يوماً",
)

/** The saved order, with any section added since put back at its default place. */
fun homeOrder(saved: List<String>): List<String> {
    val ids = HOME_SECTIONS.map { it.first }
    val out = saved.filter { it in ids }.toMutableList()
    ids.forEachIndexed { i, id -> if (id !in out) out.add(minOf(i, out.size), id) }
    return out
}

@Composable
private fun HoursSection(fc: Forecast, onHourly: () -> Unit) {
    val now = fc.nowIndex
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("الساعات القادمة", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
            Text(
                "التفاصيل", color = Pw.Link, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
                modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button, onClick = onHourly).padding(8.dp),
            )
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            // The next 24 hours, with the new day's name just before its 12 at night.
            val next = fc.hours.drop(now).take(24)
            val entries: List<Any> = next.flatMapIndexed { i, h -> if (i > 0 && h.time.hour == 0) listOf(h.time.toLocalDate(), h) else listOf(h) }
            items(entries) { e ->
                if (e is LocalDate) {
                    Box(
                        Modifier.width(44.dp).height(118.dp).clip(RoundedCornerShape(16.dp)).background(Pw.BrandTint),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            arabicDayName(e), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Pw.Link, maxLines = 1,
                            softWrap = false, modifier = Modifier.rotate(-90f).requiredWidth(110.dp), textAlign = TextAlign.Center,
                        )
                    }
                    return@items
                }
                val h = e as ps.weather.data.HourPoint
                val isNow = h == fc.hours.getOrNull(now)
                Column(
                    Modifier.width(56.dp).clip(RoundedCornerShape(16.dp)).background(if (isNow) Pw.Panel else Pw.Card).padding(vertical = 10.dp),
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

    }
}

@Composable
private fun TodaySection(fc: Forecast, prayer: PrayerDay?, nowTime: LocalDateTime) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // «شو نلبس بكرا؟»: the day's bulletin advice (ours until it loads), with a figure dressed for tomorrow.
        val tomorrow = fc.days.getOrNull(1) ?: fc.days.firstOrNull()
        val (bulletinLoad, _) = rememberLoad("bulletin") { BulletinRepository.bulletin() }
        val wearText = (bulletinLoad as? Load.Ok)?.value?.wear ?: clothingAdvice(tomorrow)
        if (wearText != null) WearCard(tomorrow, wearText)
        // The next prayer's weather and the farming season
        seasonCard(fc.days, nowTime.toLocalDate()) { relativeDayName(it) }?.let { MiniCard(PwIcons.Leaf, it.title, it.text) }

    }
}

@Composable
private fun DetailsSection(fc: Forecast, aqi: Int?) {
    val c = fc.current
    val today = fc.days.firstOrNull()
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MetricTile(
                PwIcons.Drop, "الرطوبة", "${c.humidity}%",
                when { c.humidity < 30 -> "جافة"; c.humidity < 60 -> "مريحة"; c.humidity < 80 -> "رطبة"; else -> "رطبة جداً" },
                c.humidity / 100f, null, Modifier.weight(1f),
            )
            MetricTile(
                PwIcons.Sun, "الأشعة فوق البنفسجية", today?.let { "${it.uvMax.roundToInt()}" } ?: "—",
                today?.let { uvText(it.uvMax) }, today?.let { (it.uvMax / 11.0).toFloat() }, SCALE, Modifier.weight(1f),
            )
        }
        MetricTile(
            PwIcons.Wind, "جودة الهواء", aqi?.toString() ?: "—", aqi?.let { aqiText(it) },
            aqi?.let { it / 100f }, SCALE, Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun WeekSection(fc: Forecast, prefs: Prefs) {
    var columns by remember { mutableStateOf(prefs.weekColumns) }
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text("توقعات ${fc.days.size} يوماً", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
        // List or columns, like the reference design's two little buttons.
        listOf(false to "قائمة", true to "أعمدة").forEach { (mode, label) ->
            Box(
                Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(if (columns == mode) Pw.Card else Color.Transparent)
                    .clickable(role = Role.Tab, onClickLabel = "عرض $label") { columns = mode; prefs.weekColumns = mode },
                contentAlignment = Alignment.Center,
            ) {
                Canvas(Modifier.size(18.dp)) {
                    val col = if (columns == mode) Color.White else Color.White.copy(alpha = 0.55f)
                    val st = androidx.compose.ui.graphics.drawscope.Stroke(1.8.dp.toPx())
                    if (!mode) {
                        drawRoundRect(col, androidx.compose.ui.geometry.Offset(1f, 1f), androidx.compose.ui.geometry.Size(size.width - 2, size.height / 2 - 3), androidx.compose.ui.geometry.CornerRadius(4f), style = st)
                        drawRoundRect(col, androidx.compose.ui.geometry.Offset(1f, size.height / 2 + 2), androidx.compose.ui.geometry.Size(size.width - 2, size.height / 2 - 3), androidx.compose.ui.geometry.CornerRadius(4f), style = st)
                    } else {
                        drawRoundRect(col, androidx.compose.ui.geometry.Offset(1f, 1f), androidx.compose.ui.geometry.Size(size.width / 2 - 3, size.height - 2), androidx.compose.ui.geometry.CornerRadius(4f), style = st)
                        drawRoundRect(col, androidx.compose.ui.geometry.Offset(size.width / 2 + 2, 1f), androidx.compose.ui.geometry.Size(size.width / 2 - 3, size.height - 2), androidx.compose.ui.geometry.CornerRadius(4f), style = st)
                    }
                }
            }
        }
    }
    if (columns) { WeekColumns(fc); return }
    val c = fc.current
    val lo = fc.days.minOfOrNull { it.min } ?: 0.0
    val hi = fc.days.maxOfOrNull { it.max } ?: 1.0
    val span = (hi - lo).coerceAtLeast(1.0)
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 6.dp)) {
        fc.days.forEachIndexed { i, d ->
            if (i > 0) HorizontalDivider(color = Pw.Line)
            Row(Modifier.fillMaxWidth().height(56.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Column(Modifier.width(64.dp)) {
                    Text(relativeDayName(d.date), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1)
                    Text("${d.date.dayOfMonth}/${d.date.monthValue}", fontSize = 11.sp, color = Pw.Muted)
                }
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

/** «تخصيص الرئيسية»: ↑ / ↓ to move a section, a switch to show or hide it. */
@Composable
private fun CustomizeHome(order: List<String>, hidden: Set<String>, onChange: (List<String>, Set<String>) -> Unit) {
    var open by rememberSaveable { mutableStateOf(false) }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
        Row(
            Modifier.clip(RoundedCornerShape(12.dp)).clickable(role = Role.Button) { open = !open }.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(PwIcons.Edit, null, tint = Pw.Link, modifier = Modifier.size(16.dp))
            Text(if (open) "تم" else "تخصيص الرئيسية", color = Pw.Link, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
        }
    }
    if (!open) return
    val names = HOME_SECTIONS.toMap()
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("تخصيص الرئيسية", fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text(
                "الترتيب الأصلي", color = Pw.Link, fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button) { onChange(homeOrder(emptyList()), emptySet()) }.padding(8.dp),
            )
        }
        Text("رتّب أقسام الصفحة الرئيسية كما تحب، وأخفِ ما لا تحتاجه.", fontSize = 12.sp, color = Pw.Muted)
        order.forEachIndexed { i, id ->
            HorizontalDivider(color = Pw.Line, modifier = Modifier.padding(top = 8.dp))
            Row(Modifier.fillMaxWidth().height(52.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    names[id] ?: id, fontSize = 14.sp, modifier = Modifier.weight(1f),
                    fontWeight = if (id in hidden) FontWeight.Normal else FontWeight.SemiBold,
                    color = if (id in hidden) Pw.Faint else Pw.Ink,
                )
                MoveButton("↑", "نقل ${names[id]} للأعلى", i > 0) {
                    onChange(order.toMutableList().apply { add(i - 1, removeAt(i)) }, hidden)
                }
                MoveButton("↓", "نقل ${names[id]} للأسفل", i < order.size - 1) {
                    onChange(order.toMutableList().apply { add(i + 1, removeAt(i)) }, hidden)
                }
                Toggle(id !in hidden, "إظهار ${names[id]}") { show ->
                    onChange(order, if (show) hidden - id else hidden + id)
                }
            }
        }
    }
}

@Composable
private fun MoveButton(label: String, description: String, enabled: Boolean, onClick: () -> Unit) {
    Box(
        Modifier.size(36.dp).clip(CircleShape).background(Pw.Card)
            .clickable(enabled = enabled, role = Role.Button, onClickLabel = description, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(label, fontSize = 16.sp, color = if (enabled) Pw.Ink else Pw.Faint) }
}

/** The sun's arc across today's sky (sunrise on the right, where an Arabic line starts) and the moon's phase. */
@Composable
private fun SkyCard(today: DayPoint, now: LocalDateTime, withSun: Boolean = true) {
    val sun = if (withSun) sunDay(today.sunrise, today.sunset, now) else null
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
    val (bg, line, tint) = when {
        Pw.glass && d.heavy -> Triple(Pw.RedTint, Pw.Red.copy(alpha = 0.45f), Pw.Red)
        Pw.glass -> Triple(Pw.AmberTint, Pw.Amber.copy(alpha = 0.4f), Pw.Amber)
        d.heavy -> Triple(Color(0xFFFDEDE8), Color(0xFFF1C2B5), Pw.Red)
        else -> Triple(Color(0xFFFFF8EA), Color(0xFFF0D9A8), Pw.Amber)
    }
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

/** «شو نلبس بكرا؟»: the avatar dressed for tomorrow (tap it to say hello), day or night, and what it wears. */
@Composable
private fun WearCard(day: DayPoint?, text: String) {
    var night by rememberSaveable { mutableStateOf(false) }
    val (kind, rain) = wearKind(day, night)
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Pw.Card)
            .border(1.dp, Pw.Line, RoundedCornerShape(18.dp)).padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(PwIcons.Thermometer, null, tint = Pw.Link, modifier = Modifier.size(18.dp))
                Text("شو نلبس بكرا؟", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            Text(text, fontSize = 14.sp, color = Pw.Muted, lineHeight = 23.sp)
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                wearItems(kind, rain).forEach {
                    Text(
                        it, fontSize = 12.sp,
                        modifier = Modifier.clip(RoundedCornerShape(50)).border(1.dp, Pw.Border, RoundedCornerShape(50))
                            .padding(horizontal = 10.dp, vertical = 3.dp),
                    )
                }
            }
        }
        WearAvatar(kind, rain, 96.dp)
        // Day or night outfit, like a small switch beside the figure.
        Column(
            Modifier.clip(RoundedCornerShape(50)).background(Pw.Card).padding(4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            listOf(false to PwIcons.Sun, true to PwIcons.Moon).forEach { (isNight, ic) ->
                val on = night == isNight
                Box(
                    Modifier.size(32.dp).clip(CircleShape).background(if (on) Pw.Selected else Color.Transparent)
                        .clickable(role = Role.Tab, onClickLabel = if (isNight) "ملابس الليل" else "ملابس النهار") { night = isNight },
                    contentAlignment = Alignment.Center,
                ) { Icon(ic, null, tint = if (on) Pw.OnSelected else Pw.Ink, modifier = Modifier.size(18.dp)) }
            }
        }
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
            Icon(icon, null, tint = Pw.Link, modifier = Modifier.size(18.dp))
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
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(if (Pw.glass) Pw.BlueTint else Color(0xFFF3F8FC))
            .border(1.dp, if (Pw.glass) Pw.Blue.copy(alpha = 0.32f) else Color(0xFFCFE2F1), RoundedCornerShape(20.dp)).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(PwIcons.Drop, null, tint = Pw.Link, modifier = Modifier.size(20.dp))
            Text(nc.text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        }
        Row(Modifier.fillMaxWidth().height(44.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Bottom) {
            nc.steps.forEach { s ->
                val wet = s.precip >= 0.1
                Box(
                    Modifier.weight(1f).fillMaxHeight(maxOf(0.06f, (s.precip / peak).toFloat()))
                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp, bottomStart = 2.dp, bottomEnd = 2.dp))
                        .background(if (wet) (if (Pw.glass) Color(0xFF9AD2FF) else Pw.Brand) else if (Pw.glass) Color.White.copy(alpha = 0.22f) else Color(0xFFD8E3EA)),
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
