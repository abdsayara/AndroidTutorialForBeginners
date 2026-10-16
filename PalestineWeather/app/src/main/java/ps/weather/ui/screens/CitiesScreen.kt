package ps.weather.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import ps.weather.data.CITIES
import ps.weather.data.City
import ps.weather.data.Locator
import ps.weather.data.PlaceKind
import ps.weather.data.PlacesRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ps.weather.data.Prefs
import ps.weather.data.Region
import ps.weather.data.WeatherRepository
import ps.weather.ui.components.Load
import ps.weather.ui.components.OfflineBanner
import ps.weather.ui.components.PillButton
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.deg
import ps.weather.ui.elevationText
import ps.weather.ui.theme.Pw
import ps.weather.ui.weatherText

@Composable
fun CitiesScreen(prefs: Prefs, current: City, onSelect: (City) -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val (load, _) = rememberLoad("citiesNow") { WeatherRepository.citiesNow(CITIES) }
    var query by rememberSaveable { mutableStateOf("") }
    var region by rememberSaveable { mutableStateOf<Region?>(null) }
    var favorites by remember { mutableStateOf(prefs.favorites) }
    var message by remember { mutableStateOf<String?>(null) }
    var locating by remember { mutableStateOf(false) }

    // Villages and towns matching the query (debounced), from the places API.
    var found by remember { mutableStateOf<List<City>>(emptyList()) }
    var searching by remember { mutableStateOf(false) }
    var searchFailed by remember { mutableStateOf(false) }
    LaunchedEffect(query) {
        val q = query.trim()
        found = emptyList()
        searchFailed = false
        if (q.length < 2) { searching = false; return@LaunchedEffect }
        searching = true
        delay(350)
        val r = runCatching { PlacesRepository.search(q) }
        found = r.getOrDefault(emptyList())
        searchFailed = r.isFailure
        searching = false
    }

    val locate: () -> Unit = {
        locating = true
        message = "جارٍ تحديد موقعك…"
        scope.launch {
            Locator.locatePlace(context)
                .onSuccess { message = null; onSelect(it) }
                .onFailure { message = it.message }
            locating = false
        }
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { granted ->
        if (granted.values.any { it }) locate() else message = "لم يُسمح بالوصول إلى موقعك — اسمح بذلك من إعدادات التطبيق"
    }

    val now = (load as? Load.Ok)?.value ?: emptyMap()
    val list = CITIES
        .filter { region == null || it.region == region }
        .filter { query.isBlank() || it.name.contains(query.trim()) }
        .sortedByDescending { it.id in favorites }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text("المدن والقرى", fontSize = 24.sp, fontWeight = FontWeight.Bold) }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("ابحث عن مدينة أو بلدة أو قرية") },
                leadingIcon = { Icon(PwIcons.Search, null, tint = Pw.Muted) },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Pw.Card, unfocusedContainerColor = Pw.Card,
                    focusedBorderColor = Pw.Green, unfocusedBorderColor = Pw.Border,
                ),
            )
        }
        item {
            Row(
                Modifier.fillMaxWidth().heightIn(min = 48.dp).clip(RoundedCornerShape(16.dp))
                    .border(BorderStroke(1.dp, Pw.Green), RoundedCornerShape(16.dp))
                    .clickable(role = Role.Button, enabled = !locating) {
                        val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                        if (granted) locate()
                        else permission.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                    }
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Icon(PwIcons.Locate, null, tint = Pw.Green, modifier = Modifier.size(20.dp))
                Text("استخدم موقعي الدقيق", color = Pw.Green, fontWeight = FontWeight.SemiBold)
            }
            message?.let {
                Text(it, color = if (locating) Pw.Muted else Pw.Red, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
            }
        }
        if (!current.isListed) {
            item { Text("الموقع المختار", fontSize = 13.sp, color = Pw.Muted) }
            item { PlaceRow(current, selected = true) { onSelect(current) } }
        }
        if (query.trim().length >= 2) {
            item { Text("قرى وبلدات", fontSize = 13.sp, color = Pw.Muted) }
            when {
                searching -> item { Text("جارٍ البحث…", fontSize = 13.sp, color = Pw.Muted) }
                searchFailed -> item { Text("تعذّر البحث الآن — تحقق من الاتصال", fontSize = 13.sp, color = Pw.Red) }
                found.isEmpty() -> item { Text("لا توجد قرى بهذا الاسم", fontSize = 13.sp, color = Pw.Muted) }
                else -> items(found, key = { "f_" + it.id }) { p -> PlaceRow(p, selected = p.id == current.id) { onSelect(p) } }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PillButton("الكل", region == null) { region = null }
                Region.entries.forEach { r -> PillButton(r.label, region == r) { region = r } }
            }
        }
        if (load is Load.Ok && load.fromCache) item { OfflineBanner(load.savedAt) }
        items(list, key = { it.id }) { city ->
            val n = now[city.id]
            val fav = city.id in favorites
            Row(
                Modifier.fillMaxWidth().heightIn(min = 60.dp).clip(RoundedCornerShape(18.dp))
                    .background(if (city.id == current.id) Pw.GreenTint else Pw.Card)
                    .clickable(role = Role.Button) { onSelect(city) }
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Column(Modifier.weight(1f)) {
                    Text(city.name, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                    Text(
                        listOfNotNull(city.region.label, n?.let { weatherText(it.code) }, elevationText(n?.elevation)).joinToString(" · "),
                        fontSize = 12.sp, color = Pw.Muted,
                    )
                }
                Icon(
                    if (fav) PwIcons.StarFilled else PwIcons.Star,
                    contentDescription = if (fav) "إزالة من المفضلة" else "إضافة إلى المفضلة",
                    tint = if (fav) Pw.Amber else Pw.Muted,
                    modifier = Modifier.size(44.dp).clip(RoundedCornerShape(22.dp))
                        .clickable(role = Role.Button) {
                            favorites = if (fav) favorites - city.id else favorites + city.id
                            prefs.favorites = favorites
                        }
                        .padding(11.dp),
                )
                Text(n?.let { deg(it.temp) } ?: "—", fontSize = 22.sp, fontWeight = FontWeight.Bold, modifier = Modifier.width(52.dp))
            }
        }
    }
}

/** A village / GPS place row. */
@Composable
private fun PlaceRow(place: City, selected: Boolean, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 60.dp).clip(RoundedCornerShape(18.dp))
            .background(if (selected) Pw.GreenTint else Pw.Card)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        if (place.kind == PlaceKind.GPS) Icon(PwIcons.Locate, null, tint = Pw.Green, modifier = Modifier.size(18.dp))
        Column(Modifier.weight(1f)) {
            Text(place.name, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Text(
                listOfNotNull(
                    if (place.kind == PlaceKind.GPS) "موقعك الدقيق" + (place.accuracyM?.let { " (±$it م)" } ?: "") else null,
                    place.area,
                    elevationText(place.elevation),
                ).joinToString(" · "),
                fontSize = 12.sp, color = Pw.Muted,
            )
        }
    }
}
