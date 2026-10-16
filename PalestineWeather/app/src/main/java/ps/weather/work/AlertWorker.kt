package ps.weather.work

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import ps.weather.MainActivity
import ps.weather.R
import ps.weather.data.AlertLevel
import ps.weather.data.AlertRecord
import ps.weather.data.AlertType
import ps.weather.data.Http
import ps.weather.data.Prefs
import ps.weather.data.QuakeRepository
import ps.weather.data.WeatherRepository
import ps.weather.data.cityById
import ps.weather.ui.arabicDayName
import java.time.LocalDate
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt

/**
 * Runs every few hours: reads the forecast for the chosen city and recent earthquakes,
 * records any new alert in the history and posts a notification for it.
 */
class AlertWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        Http.init(applicationContext)
        val prefs = Prefs(applicationContext)
        val city = cityById(prefs.cityId)
        val found = ArrayList<AlertRecord>()
        val now = System.currentTimeMillis()

        runCatching { WeatherRepository.forecast(city.lat, city.lon) }.getOrNull()
            ?.takeIf { !it.fromCache }?.value?.let { fc ->
                for (day in fc.days.take(3)) {
                    val when_ = if (day.date == LocalDate.now()) "اليوم" else arabicDayName(day.date)
                    if (day.precipProbMax >= 60) found += AlertRecord(
                        "rain_${city.id}_${day.date}", AlertType.RAIN,
                        if (day.precipSum >= 20) AlertLevel.WARN else AlertLevel.INFO,
                        "أمطار متوقعة $when_",
                        "احتمال ${day.precipProbMax}% وكمية نحو ${day.precipSum.roundToInt()} ملم",
                        city.name, now,
                    )
                    if (day.min <= 3) found += AlertRecord(
                        "frost_${city.id}_${day.date}", AlertType.FROST,
                        if (day.min <= 0) AlertLevel.HIGH else AlertLevel.WARN,
                        "خطر صقيع $when_", "الصغرى ${day.min.roundToInt()}° — احمِ المزروعات ليلاً",
                        city.name, now,
                    )
                    if (day.max >= 35) found += AlertRecord(
                        "heat_${city.id}_${day.date}", AlertType.HEAT,
                        if (day.max >= 40) AlertLevel.HIGH else AlertLevel.WARN,
                        "موجة حر $when_", "العظمى ${day.max.roundToInt()}° — تجنّب الشمس وقت الظهيرة",
                        city.name, now,
                    )
                    if (day.windMax >= 50) found += AlertRecord(
                        "wind_${city.id}_${day.date}", AlertType.WIND, AlertLevel.WARN,
                        "رياح قوية $when_", "هبات حتى ${day.windMax.roundToInt()} كم/س وقد يرافقها غبار",
                        city.name, now,
                    )
                }
            }

        runCatching { QuakeRepository.recent(1) }.getOrNull()
            ?.takeIf { !it.fromCache }?.value
            ?.filter { it.mag >= 3.0 && now - it.time.toEpochMilli() < 12 * 3600 * 1000 }
            ?.forEach { q ->
                found += AlertRecord(
                    "quake_${q.id}", AlertType.QUAKE,
                    if (q.mag >= 4.5) AlertLevel.HIGH else AlertLevel.WARN,
                    "هزة أرضية بقوة ${"%.1f".format(java.util.Locale.US, q.mag)}",
                    "${q.placeAr} · عمق ${q.depthKm.roundToInt()} كم",
                    q.placeAr, now,
                )
            }

        for (alert in found) {
            if (prefs.addAlert(alert) && prefs.alertEnabled(alert.type)) notify(alert)
        }
        return Result.success()
    }

    private fun notify(a: AlertRecord) {
        val ctx = applicationContext
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return
        ensureChannel(ctx)
        val open = PendingIntent.getActivity(
            ctx, 0, Intent(ctx, MainActivity::class.java).putExtra("openAlerts", true),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val n = NotificationCompat.Builder(ctx, CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_weather)
            .setContentTitle(a.title)
            .setContentText("${a.cityName} · ${a.body}")
            .setStyle(NotificationCompat.BigTextStyle().bigText("${a.cityName} · ${a.body}"))
            .setPriority(if (a.level == AlertLevel.HIGH) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        runCatching { NotificationManagerCompat.from(ctx).notify(a.key.hashCode(), n) }
    }

    companion object {
        private const val CHANNEL = "weather_alerts"

        fun ensureChannel(ctx: Context) {
            val nm = ctx.getSystemService(NotificationManager::class.java)
            if (nm.getNotificationChannel(CHANNEL) == null) {
                nm.createNotificationChannel(
                    NotificationChannel(CHANNEL, "تنبيهات الطقس", NotificationManager.IMPORTANCE_DEFAULT)
                )
            }
        }

        fun schedule(ctx: Context) {
            val req = PeriodicWorkRequestBuilder<AlertWorker>(3, TimeUnit.HOURS)
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(ctx).enqueueUniquePeriodicWork("alerts", ExistingPeriodicWorkPolicy.KEEP, req)
        }
    }
}
