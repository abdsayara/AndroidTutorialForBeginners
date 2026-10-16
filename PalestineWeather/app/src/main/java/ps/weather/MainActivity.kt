package ps.weather

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.data.City
import ps.weather.data.Http
import ps.weather.data.Prefs
import ps.weather.ui.components.PwIcons
import ps.weather.ui.map.MapScreen
import ps.weather.ui.screens.AboutScreen
import ps.weather.ui.screens.AlertsScreen
import ps.weather.ui.screens.CitiesScreen
import ps.weather.ui.screens.CurrencyScreen
import ps.weather.ui.screens.FarmingScreen
import ps.weather.ui.screens.HomeScreen
import ps.weather.ui.screens.HourlyScreen
import ps.weather.ui.screens.MoreScreen
import ps.weather.ui.screens.NewsScreen
import ps.weather.ui.screens.PrayerScreen
import ps.weather.ui.screens.Sub
import ps.weather.ui.theme.Pw
import ps.weather.ui.theme.PalestineWeatherTheme
import ps.weather.work.AlertWorker

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Http.init(this)
        AlertWorker.ensureChannel(this)
        AlertWorker.schedule(this)
        val openAlerts = intent?.getBooleanExtra("openAlerts", false) == true
        setContent {
            PalestineWeatherTheme {
                // The whole app is Arabic: force right-to-left whatever the device language.
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    App(if (openAlerts) Sub.ALERTS else null)
                }
            }
        }
    }
}

private enum class Tab(val label: String, val icon: ImageVector) {
    HOME("الرئيسية", PwIcons.Home),
    MAP("الخريطة", PwIcons.Map),
    CITIES("المدن", PwIcons.Pin),
    FARMING("الزراعة", PwIcons.Leaf),
    MORE("المزيد", PwIcons.More),
}

@Composable
private fun App(initialSub: Sub?) {
    val context = LocalContext.current
    val prefs = remember { Prefs(context.applicationContext) }
    var city by remember { mutableStateOf(prefs.selectedPlace()) }
    var tab by rememberSaveable { mutableStateOf(Tab.HOME) }
    var sub by rememberSaveable { mutableStateOf(initialSub) }

    val notifPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= 33) notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
    }

    fun selectCity(c: City) {
        city = c
        prefs.select(c)
        sub = null
        tab = Tab.HOME
    }

    BackHandler(enabled = sub != null || tab != Tab.HOME) {
        if (sub != null) sub = null else tab = Tab.HOME
    }

    Column(Modifier.fillMaxSize().background(Pw.Ground).statusBarsPadding()) {
        Box(Modifier.weight(1f).fillMaxWidth()) {
            val back = { sub = null }
            when (sub) {
                Sub.HOURLY -> HourlyScreen(city, back)
                Sub.PRAYER -> PrayerScreen(city, prefs, back)
                Sub.ALERTS -> AlertsScreen(prefs, back)
                Sub.NEWS -> NewsScreen(back)
                Sub.CURRENCY -> CurrencyScreen(back)
                Sub.ABOUT -> AboutScreen(back)
                null -> when (tab) {
                    Tab.HOME -> HomeScreen(
                        city, onPickCity = { tab = Tab.CITIES }, onHourly = { sub = Sub.HOURLY },
                        // Keep a village / GPS point's height so the cities page can show it too.
                        onElevation = { e -> if (!city.isListed && city.elevation != e) { city = city.copy(elevation = e); prefs.select(city) } },
                    )
                    Tab.MAP -> MapScreen(city, onOpenCity = ::selectCity)
                    Tab.CITIES -> CitiesScreen(prefs, city, onSelect = ::selectCity)
                    Tab.FARMING -> FarmingScreen(city, prefs)
                    Tab.MORE -> MoreScreen(onOpen = { sub = it })
                }
            }
        }
        HorizontalDivider(color = Pw.Line)
        Row(Modifier.fillMaxWidth().background(Pw.Card).navigationBarsPadding().height(72.dp)) {
            Tab.entries.forEach { t ->
                val active = sub == null && tab == t
                Column(
                    Modifier.weight(1f).fillMaxHeight()
                        .semantics { selected = active }
                        .clickable(role = Role.Tab) { sub = null; tab = t },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterVertically),
                ) {
                    val color = if (active) Pw.Green else Pw.Muted
                    Icon(t.icon, null, tint = color, modifier = Modifier.size(24.dp))
                    Text(t.label, fontSize = 12.sp, color = color, fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal)
                }
            }
        }
    }
}
