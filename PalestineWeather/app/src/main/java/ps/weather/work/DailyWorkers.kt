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
import ps.weather.data.Http
import ps.weather.data.Prefs
import ps.weather.data.AlertType
import ps.weather.data.AlertRecord
import ps.weather.data.AlertLevel
import ps.weather.data.WeatherRepository
import ps.weather.data.rainNowcast
import ps.weather.data.summarize
import ps.weather.ui.deg
import ps.weather.ui.weatherText
import ps.weather.widget.WeatherWidget
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.concurrent.TimeUnit

/**
 * Every 30 minutes: reads the selected place's forecast, warns once when rain is due
 * within the hour (the 15-minute nowcast), and redraws the home-screen widget.
 */
class RainSoonWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        Http.init(applicationContext)
        val prefs = Prefs(applicationContext)
        val place = prefs.selectedPlace()
        val fetched = runCatching { WeatherRepository.forecast(place.lat, place.lon) }.getOrNull() ?: return Result.success()
        val fc = fetched.value
        WeatherWidget.render(applicationContext, place, fc)
        if (fetched.fromCache || !prefs.rainSoonEnabled) return Result.success()

        val nc = rainNowcast(fc.minutely, fc.currentTime ?: LocalDateTime.now()) ?: return Result.success()
        val startsSoon = !nc.raining && nc.steps.take(4).any { it.precip >= 0.1 } // within the hour
        // One warning per shower: not again within 3 hours of the last one.
        val quiet = System.currentTimeMillis() - prefs.lastRainSoonAt > 3 * 3600 * 1000L
        if (startsSoon && quiet) {
            prefs.lastRainSoonAt = System.currentTimeMillis()
            DailyWorkers.post(applicationContext, 7001, "المطر قادم · ${place.name}", nc.text, DailyWorkers.CHANNEL_RAIN)
            // Kept in «التنبيهات السابقة» too.
            prefs.addAlert(
                AlertRecord("rainsoon_${place.id}_${prefs.lastRainSoonAt / 60000}", AlertType.RAIN, AlertLevel.INFO, "المطر قادم", nc.text, place.name, prefs.lastRainSoonAt),
            )
        }
        return Result.success()
    }
}

/** Once a day around 7:00: the morning in one notification. */
class MorningWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        Http.init(applicationContext)
        val prefs = Prefs(applicationContext)
        val today = LocalDate.now().toString()
        if (!prefs.morningEnabled || prefs.lastMorningDate == today) return Result.success()
        // Too late in the day (the phone was off at 7): skip rather than say "good morning" at noon.
        if (LocalTime.now().isAfter(LocalTime.of(10, 30))) return Result.success()
        val place = prefs.selectedPlace()
        val fetched = runCatching { WeatherRepository.forecast(place.lat, place.lon) }.getOrNull() ?: return Result.retry()
        if (fetched.fromCache) return Result.retry()
        val fc = fetched.value
        prefs.lastMorningDate = today
        WeatherWidget.render(applicationContext, place, fc)
        val body = "${deg(fc.current.temp)} الآن، ${weatherText(fc.current.code)}. ${summarize(fc)}"
        DailyWorkers.post(applicationContext, 7002, "صباح الخير · ${place.name}", body, DailyWorkers.CHANNEL_MORNING)
        // Kept in «التنبيهات السابقة» too.
        prefs.addAlert(AlertRecord("morning_$today", AlertType.MORNING, AlertLevel.INFO, "صباح الخير", body, place.name, System.currentTimeMillis()))
        return Result.success()
    }
}

object DailyWorkers {
    const val CHANNEL_MORNING = "morning_summary"
    const val CHANNEL_RAIN = "rain_soon"

    fun ensureChannels(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java)
        if (nm.getNotificationChannel(CHANNEL_MORNING) == null) {
            nm.createNotificationChannel(NotificationChannel(CHANNEL_MORNING, "الملخص الصباحي", NotificationManager.IMPORTANCE_LOW))
        }
        if (nm.getNotificationChannel(CHANNEL_RAIN) == null) {
            nm.createNotificationChannel(NotificationChannel(CHANNEL_RAIN, "المطر قادم", NotificationManager.IMPORTANCE_DEFAULT))
        }
    }

    fun schedule(ctx: Context) {
        val online = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val wm = WorkManager.getInstance(ctx)
        wm.enqueueUniquePeriodicWork(
            "rain_soon", ExistingPeriodicWorkPolicy.KEEP,
            PeriodicWorkRequestBuilder<RainSoonWorker>(30, TimeUnit.MINUTES).setConstraints(online).build(),
        )
        // First run at the next 7:00, then daily (WorkManager may run it a little later).
        val now = LocalDateTime.now()
        var next = now.toLocalDate().atTime(7, 0)
        if (!next.isAfter(now)) next = next.plusDays(1)
        wm.enqueueUniquePeriodicWork(
            "morning", ExistingPeriodicWorkPolicy.KEEP,
            PeriodicWorkRequestBuilder<MorningWorker>(1, TimeUnit.DAYS)
                .setInitialDelay(Duration.between(now, next).toMinutes(), TimeUnit.MINUTES)
                .setConstraints(online)
                .build(),
        )
    }

    fun post(ctx: Context, id: Int, title: String, body: String, channel: String) {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return
        ensureChannels(ctx)
        val open = PendingIntent.getActivity(
            ctx, id, Intent(ctx, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val n = NotificationCompat.Builder(ctx, channel)
            .setSmallIcon(R.drawable.ic_stat_weather)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        runCatching { NotificationManagerCompat.from(ctx).notify(id, n) }
    }
}
