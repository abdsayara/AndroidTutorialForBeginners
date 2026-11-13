package ps.weather.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import ps.weather.data.AlertLevel
import ps.weather.data.AlertRecord
import ps.weather.data.AlertType
import ps.weather.data.City
import ps.weather.data.CurrencyRepository
import ps.weather.data.PrayerMethod
import ps.weather.data.PrayerRepository
import ps.weather.data.Prefs
import ps.weather.work.AlertWorker
import ps.weather.ui.ago
import ps.weather.ui.arabicDate
import ps.weather.ui.clock
import ps.weather.ui.components.LoadBox
import ps.weather.ui.components.PillButton
import ps.weather.ui.components.PillRow
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.ScreenHeader
import ps.weather.ui.components.SectionCard
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.theme.Pw
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

enum class Sub { FARMING, HOURLY, PRAYER, ALERTS, REPORTS, REPORT, STATIONS, CURRENCY, SATELLITE, ABOUT }

// ---------------------------------------------------------------- "More" hub

@Composable
fun MoreScreen(onOpen: (Sub) -> Unit) {
    val entries = listOf(
        Triple(Sub.FARMING, PwIcons.Leaf, "الزراعة والتنبيهات"),
        Triple(Sub.HOURLY, PwIcons.Clock, "تفاصيل اليوم ساعة بساعة"),
        Triple(Sub.PRAYER, PwIcons.Moon, "أوقات الصلاة والقبلة"),
        Triple(Sub.ALERTS, PwIcons.Bell, "التنبيهات السابقة"),
        Triple(Sub.REPORTS, PwIcons.News, "التقارير اليومية"),
        Triple(Sub.STATIONS, PwIcons.Thermometer, "محطات الطقس"),
        Triple(Sub.CURRENCY, PwIcons.Coins, "أسعار العملات"),
        Triple(Sub.ABOUT, PwIcons.Info, "عن التطبيق والشركة المطوّرة"),
    )
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text("المزيد", fontSize = 24.sp, fontWeight = FontWeight.Bold) }
        items(entries) { (sub, icon, label) -> MenuRow(icon, label) { onOpen(sub) } }
        item { DeveloperLine { onOpen(Sub.ABOUT) } }
    }
}

@Composable
private fun MenuRow(icon: ImageVector, label: String, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 60.dp).clip(RoundedCornerShape(18.dp)).background(Pw.Card)
            .clickable(role = Role.Button, onClick = onClick).padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(Modifier.size(40.dp).clip(CircleShape).background(Pw.BrandTint), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = Pw.Link, modifier = Modifier.size(22.dp))
        }
        Text(label, fontSize = 16.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
        Icon(PwIcons.Forward, null, tint = Pw.Muted, modifier = Modifier.size(20.dp))
    }
}

// ---------------------------------------------------------------- Prayer times

@Composable
fun PrayerScreen(city: City, prefs: Prefs, onBack: () -> Unit) {
    val (load, refresh) = rememberLoad(city.id) { PrayerRepository.today(city.lat, city.lon, prefs.prayerMethod) }
    var now by remember { mutableStateOf(LocalTime.now()) }
    LaunchedEffect(Unit) { while (true) { delay(30_000); now = LocalTime.now() } }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ScreenHeader("أوقات الصلاة", "${city.name} · ${arabicDate(LocalDate.now())}", onBack) }
        item {
            LoadBox(load, refresh) { day ->
                val prayers = day.times.filter { it.first != "الشروق" }
                val next = prayers.firstOrNull { it.second.isAfter(now) } ?: prayers.first()
                val untilMin = Duration.between(now, next.second).toMinutes().let { if (it < 0) it + 24 * 60 else it }

                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(Pw.Panel).padding(22.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text(day.hijri, color = Color.White.copy(alpha = 0.85f), fontSize = 14.sp)
                    Text("الصلاة القادمة", color = Color.White, fontSize = 15.sp)
                    Text("${next.first} · ${clock(next.second)}", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.ExtraBold)
                    Text(
                        "بعد ${untilMin / 60} ساعة و ${untilMin % 60} دقيقة",
                        color = Color.White, fontSize = 14.sp,
                        modifier = Modifier.clip(RoundedCornerShape(14.dp)).background(Color.White.copy(alpha = 0.14f)).padding(horizontal = 14.dp, vertical = 6.dp),
                    )
                }

                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp)) {
                    day.times.forEachIndexed { i, (name, t) ->
                        if (i > 0) HorizontalDivider(color = Pw.Line)
                        val isNext = name == next.first
                        val past = t.isBefore(now) && !isNext
                        Row(Modifier.fillMaxWidth().heightIn(min = 54.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(8.dp).clip(CircleShape).background(if (isNext) Pw.Link else Color.Transparent))
                            Text(
                                name, fontSize = 16.sp, modifier = Modifier.weight(1f).padding(start = 12.dp),
                                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Medium,
                                color = if (past) Pw.Faint else Pw.Ink,
                            )
                            Text(
                                clock(t), fontSize = 17.sp,
                                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Medium,
                                color = if (past) Pw.Faint else Pw.Ink,
                            )
                        }
                    }
                }
            }
        }
        item {
            val bearing = PrayerRepository.qiblaBearing(city.lat, city.lon)
            SectionCard {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Icon(PwIcons.ArrowUp, null, tint = Pw.Link, modifier = Modifier.size(36.dp).rotate(bearing.toFloat()))
                    Column {
                        Text("اتجاه القبلة", fontSize = 12.sp, color = Pw.Muted)
                        Text("${bearing.toInt()}° من الشمال", fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- Alert history

@Composable
fun AlertsScreen(prefs: Prefs, onBack: () -> Unit) {
    val context = LocalContext.current
    var all by remember { mutableStateOf(prefs.alerts()) }
    var checkedAt by remember { mutableStateOf(prefs.lastAlertCheck) }
    var checking by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        // The website's alerts for all of Palestine join the list at once.
        runCatching { ps.weather.data.ServerAlerts.fetch() }.getOrNull()?.forEach { prefs.addAlert(it) }
        all = prefs.alerts()
        // Opening the history marks everything in it as seen (the home bell's dot goes out).
        prefs.alertsSeenAt = System.currentTimeMillis()
    }
    // «افحص الآن»: run the check, then show what it found once it reports back.
    LaunchedEffect(checking) {
        if (!checking) return@LaunchedEffect
        val before = prefs.lastAlertCheck
        repeat(40) {
            delay(1500)
            if (prefs.lastAlertCheck != before) { all = prefs.alerts(); checkedAt = prefs.lastAlertCheck; checking = false; return@LaunchedEffect }
        }
        checking = false
    }
    var filter by rememberSaveable { mutableStateOf<AlertType?>(null) }
    val list = all.filter { filter == null || it.type == filter }
    val dateFmt = DateTimeFormatter.ofPattern("d/M", Locale.US)

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            ScreenHeader("التنبيهات السابقة", "آخر 30 يوماً · ${list.size} تنبيه", onBack) {
                if (all.isNotEmpty()) {
                    Box(
                        Modifier.size(44.dp).clip(CircleShape).background(Pw.Card)
                            .clickable(role = Role.Button, onClickLabel = "مسح السجل") { prefs.clearAlerts(); all = emptyList() },
                        contentAlignment = Alignment.Center,
                    ) { Icon(PwIcons.Trash, "مسح السجل", tint = Pw.Ink, modifier = Modifier.size(20.dp)) }
                }
            }
        }
        item {
            // The watch, made visible: when it last looked, and a way to look now.
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Pw.Card).padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        if (checkedAt == 0L) "لم يجرِ فحص بعد" else "آخر فحص ${ago(Instant.ofEpochMilli(checkedAt).atZone(ZoneId.systemDefault()))}",
                        fontSize = 14.sp, fontWeight = FontWeight.SemiBold,
                    )
                    Text("يفحص التطبيق المطر والصقيع والحر والرياح والغبار والزلازل كل 3 ساعات", fontSize = 12.sp, color = Pw.Muted)
                }
                Text(
                    if (checking) "جارٍ الفحص…" else "افحص الآن", color = Pw.Link, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
                    modifier = Modifier.clip(RoundedCornerShape(10.dp)).clickable(enabled = !checking, role = Role.Button) {
                        AlertWorker.runNow(context); checking = true
                    }.padding(8.dp),
                )
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                PillButton("الكل", filter == null) { filter = null }
                AlertType.entries.take(3).forEach { t -> PillButton(t.label, filter == t) { filter = t } }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 6.dp)) {
                AlertType.entries.drop(3).forEach { t -> PillButton(t.label, filter == t) { filter = t } }
            }
        }
        if (list.isEmpty()) item {
            Text(
                "لا توجد تنبيهات بعد. يفحص التطبيق التوقعات والزلازل كل 3 ساعات ويسجّل التنبيهات هنا.",
                color = Pw.Muted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(24.dp),
            )
        }
        var lastDate = ""
        list.forEach { a ->
            val date = Instant.ofEpochMilli(a.time).atZone(ZoneId.systemDefault()).toLocalDate()
            val label = when (date) {
                LocalDate.now() -> "اليوم"
                LocalDate.now().minusDays(1) -> "أمس"
                else -> date.format(dateFmt)
            }
            if (label != lastDate) {
                lastDate = label
                item { Text(label, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Pw.Muted, modifier = Modifier.padding(top = 4.dp)) }
            }
            item { AlertCard(a) }
        }
    }
}

@Composable
private fun AlertCard(a: AlertRecord) {
    val (tint, ink) = when (a.type) {
        AlertType.RAIN -> Pw.BlueTint to Pw.BlueInk
        AlertType.FROST -> Color(0xFFE4F1F5) to Color(0xFF1C5566)
        AlertType.HEAT -> Color(0xFFFBE7DF) to Color(0xFF8C2F12)
        AlertType.WIND -> Color(0xFFF3ECDD) to Color(0xFF6A4B12)
        AlertType.QUAKE -> Color(0xFFF1E6F3) to Color(0xFF5E2A6B)
        AlertType.MORNING -> Color(0xFFFFF1D6) to Color(0xFF7A4B00)
    }
    val (lvlBg, lvlFg) = when (a.level) {
        AlertLevel.INFO -> Color(0xFFEEF1EE) to Color(0xFF3A4A40)
        AlertLevel.WARN -> Pw.AmberTint to Pw.AmberInk
        AlertLevel.HIGH -> Pw.RedTint to Color(0xFF8C1D0E)
    }
    val icon = when (a.type) {
        AlertType.RAIN -> PwIcons.Drop
        AlertType.FROST -> PwIcons.Snowflake
        AlertType.HEAT -> PwIcons.Thermometer
        AlertType.WIND -> PwIcons.Wind
        AlertType.QUAKE -> PwIcons.Wave
        AlertType.MORNING -> PwIcons.Bell
    }
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Pw.Card).padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(tint), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = ink, modifier = Modifier.size(22.dp))
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Row {
                Text(a.title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                Text(
                    Instant.ofEpochMilli(a.time).atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("HH:mm", Locale.US)),
                    fontSize = 12.sp, color = Pw.Muted,
                )
            }
            Text("${a.cityName} · ${a.body}", fontSize = 13.sp, color = Pw.Muted)
            Text(
                a.level.label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = lvlFg,
                modifier = Modifier.padding(top = 2.dp).clip(RoundedCornerShape(8.dp)).background(lvlBg).padding(horizontal = 8.dp, vertical = 2.dp),
            )
        }
    }
}

// ---------------------------------------------------------------- Currency

@Composable
fun CurrencyScreen(onBack: () -> Unit) {
    val (load, refresh) = rememberLoad("rates") { CurrencyRepository.latest() }
    var amount by rememberSaveable { mutableStateOf("100") }
    var from by rememberSaveable { mutableStateOf("USD") }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ScreenHeader("أسعار العملات", "مقابل الشيكل", onBack) }
        item {
            LoadBox(load, refresh) { rates ->
                val rate = rates.ilsPer[from]
                val n = amount.replace(',', '.').toDoubleOrNull() ?: 0.0
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(Pw.Panel).padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    OutlinedTextField(
                        value = amount, onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' || c == ',' } },
                        label = { Text("المبلغ") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 22.sp, fontWeight = FontWeight.Bold, textDirection = TextDirection.Ltr),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedLabelColor = Color.White, unfocusedLabelColor = Color.White.copy(alpha = 0.8f),
                            focusedBorderColor = Color.White, unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                            cursorColor = Color.White,
                        ),
                    )
                    CurrencyRepository.CODES.map { it.first }.chunked(4).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            row.forEach { code ->
                                val sel = code == from
                                Box(
                                    Modifier.weight(1f).heightIn(min = 44.dp).clip(RoundedCornerShape(12.dp))
                                        .background(if (sel) Color.White else Color.White.copy(alpha = 0.12f))
                                        .clickable(role = Role.RadioButton) { from = code },
                                    contentAlignment = Alignment.Center,
                                ) { Text(code, color = if (sel) Color(0xFF17324A) else Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp) }
                            }
                        }
                    }
                    HorizontalDivider(color = Color.White.copy(alpha = 0.2f))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        val name = CurrencyRepository.CODES.firstOrNull { it.first == from }?.second ?: from
                        Text("$amount $name =", color = Color.White.copy(alpha = 0.85f), fontSize = 14.sp, modifier = Modifier.weight(1f))
                        Text(
                            if (rate == null) "—" else String.format(Locale.US, "%,.2f ₪", n * rate),
                            color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold,
                        )
                    }
                }

                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(horizontal = 16.dp, vertical = 4.dp)) {
                    CurrencyRepository.CODES.forEachIndexed { i, (code, name) ->
                        if (i > 0) HorizontalDivider(color = Pw.Line)
                        Row(Modifier.fillMaxWidth().heightIn(min = 56.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(name, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                                Text(code, fontSize = 12.sp, color = Pw.Muted)
                            }
                            val r = rates.ilsPer[code]
                            Text(
                                if (r == null) "—" else String.format(Locale.US, if (r < 1) "%.3f ₪" else "%.2f ₪", r),
                                fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.width(96.dp),
                                textAlign = TextAlign.End,
                            )
                        }
                    }
                }
                Text(
                    "أسعار مرجعية يومية (${rates.updated.take(16)}). أسعار الصرافين للبيع والشراء تختلف عنها.",
                    fontSize = 11.sp, color = Pw.Muted,
                )
            }
        }
    }
}

