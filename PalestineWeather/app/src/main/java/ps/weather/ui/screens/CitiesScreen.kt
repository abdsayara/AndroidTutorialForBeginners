package ps.weather.ui.screens

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
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
import ps.weather.data.Prefs
import ps.weather.data.Region
import ps.weather.data.WeatherRepository
import ps.weather.data.nearestCity
import ps.weather.ui.components.Load
import ps.weather.ui.components.OfflineBanner
import ps.weather.ui.components.PillButton
import ps.weather.ui.components.PwIcons
import ps.weather.ui.components.rememberLoad
import ps.weather.ui.deg
import ps.weather.ui.theme.Pw
import ps.weather.ui.weatherText

@Composable
fun CitiesScreen(prefs: Prefs, current: City, onSelect: (City) -> Unit) {
    val context = LocalContext.current
    val (load, _) = rememberLoad("citiesNow") { WeatherRepository.citiesNow(CITIES) }
    var query by rememberSaveable { mutableStateOf("") }
    var region by rememberSaveable { mutableStateOf<Region?>(null) }
    var favorites by remember { mutableStateOf(prefs.favorites) }
    var locationMessage by remember { mutableStateOf<String?>(null) }

    val locate: () -> Unit = {
        val loc = lastKnownLocation(context)
        if (loc == null) {
            locationMessage = "تعذّر تحديد موقعك الآن — شغّل خدمة الموقع وحاول مجدداً"
        } else {
            onSelect(nearestCity(loc.first, loc.second))
        }
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) locate() else locationMessage = "لم يُسمح بالوصول إلى الموقع"
    }

    val now = (load as? Load.Ok)?.value ?: emptyMap()
    val list = CITIES
        .filter { region == null || it.region == region }
        .filter { query.isBlank() || it.name.contains(query.trim()) }
        .sortedByDescending { it.id in favorites }

    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text("المدن", fontSize = 24.sp, fontWeight = FontWeight.Bold) }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("ابحث عن مدينة") },
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
                    .clickable(role = Role.Button) {
                        val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                        if (granted) locate() else permission.launch(Manifest.permission.ACCESS_COARSE_LOCATION)
                    }
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Icon(PwIcons.Locate, null, tint = Pw.Green, modifier = Modifier.size(20.dp))
                Text("استخدم موقعي الحالي", color = Pw.Green, fontWeight = FontWeight.SemiBold)
            }
            locationMessage?.let { Text(it, color = Pw.Red, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp)) }
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
                    Text("${city.region.label}${n?.let { " · " + weatherText(it.code) } ?: ""}", fontSize = 12.sp, color = Pw.Muted)
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

@SuppressLint("MissingPermission")
private fun lastKnownLocation(context: Context): Pair<Double, Double>? {
    val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    return listOf(LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }
        .maxByOrNull { it.time }
        ?.let { it.latitude to it.longitude }
}
