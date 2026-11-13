package ps.weather.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import ps.weather.MainActivity
import ps.weather.R
import ps.weather.data.City
import ps.weather.data.Forecast
import ps.weather.data.Sky
import ps.weather.data.skyKind
import ps.weather.data.summarize
import ps.weather.ui.deg
import ps.weather.ui.weatherText
import ps.weather.work.RainSoonWorker

/**
 * Home-screen widget: the selected place's temperature, sky and one-line summary.
 * The system never wakes it on a timer; the workers that already fetch the forecast
 * (the 30-minute rain check, the morning summary) call [render] with what they got.
 */
class WeatherWidget : AppWidgetProvider() {

    // A fresh widget: fetch now rather than wait for the next scheduled check.
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) = refreshSoon(context)

    companion object {
        /** Fetch and redraw as soon as there is a connection (new widget, new place). */
        fun refreshSoon(context: Context) {
            WorkManager.getInstance(context).enqueueUniqueWork(
                "widget_now", ExistingWorkPolicy.REPLACE,
                OneTimeWorkRequestBuilder<RainSoonWorker>()
                    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                    .build(),
            )
        }

        /** Draws every widget instance with this forecast. */
        fun render(context: Context, place: City, fc: Forecast) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, WeatherWidget::class.java))
            if (ids.isEmpty()) return
            val views = RemoteViews(context.packageName, R.layout.widget_weather).apply {
                setTextViewText(R.id.widget_place, place.name)
                setTextViewText(R.id.widget_temp, deg(fc.current.temp))
                setTextViewText(R.id.widget_sky, weatherText(fc.current.code))
                setTextViewText(R.id.widget_summary, summarize(fc))
                setInt(
                    R.id.widget_root, "setBackgroundResource",
                    when (skyKind(fc)) {
                        Sky.DAY -> R.drawable.widget_bg_day
                        Sky.NIGHT -> R.drawable.widget_bg_night
                        Sky.RAIN, Sky.STORM -> R.drawable.widget_bg_rain
                        Sky.CLOUDY, Sky.FOG, Sky.SNOW -> R.drawable.widget_bg_cloudy
                    },
                )
                setOnClickPendingIntent(
                    R.id.widget_root,
                    PendingIntent.getActivity(
                        context, 1, Intent(context, MainActivity::class.java),
                        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
                    ),
                )
            }
            manager.updateAppWidget(ids, views)
        }
    }
}
