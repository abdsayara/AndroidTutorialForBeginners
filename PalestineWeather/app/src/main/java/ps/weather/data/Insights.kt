package ps.weather.data

import java.time.Duration
import java.time.LocalDateTime
import kotlin.math.abs
import kotlin.math.roundToInt

// Plain-language readings of a forecast: the rain nowcast, a one-line summary and the
// kind of sky for the hero's background. Same rules as the website (public/insights.js).

/** Rain this heavy in a 15-minute step counts as rain (mm). */
private const val WET = 0.1

/** "ربع ساعة", "ساعة ونصف", "ساعتين": a duration in minutes, in words. */
fun minutesText(min: Int): String {
    val h = min / 60
    val m = min % 60
    val hours = when (h) { 0 -> ""; 1 -> "ساعة"; 2 -> "ساعتين"; else -> "$h ساعات" }
    val part = when {
        m == 0 -> ""
        m == 15 -> "ربع"
        m == 30 -> "نصف"
        else -> "$m دقيقة"
    }
    if (hours.isEmpty()) return when (m) { 15 -> "ربع ساعة"; 30 -> "نصف ساعة"; else -> part }
    return if (part.isEmpty()) hours else "$hours و$part"
}

private fun intensity(mm: Double) = when { mm >= 2 -> "غزير"; mm >= 0.5 -> "متوسط"; else -> "خفيف" }

data class Nowcast(val raining: Boolean, val text: String, val steps: List<MinutePoint>)

/** What the rain does over the next two hours, or null when it stays dry. */
fun rainNowcast(minutely: List<MinutePoint>, now: LocalDateTime): Nowcast? {
    if (minutely.isEmpty()) return null
    // The step that contains "now", and the ones after it.
    val first = minutely.indices.firstOrNull { i -> minutely.getOrNull(i + 1)?.time?.isAfter(now) ?: true } ?: return null
    val steps = minutely.drop(first).take(8)
    val wet = steps.map { it.precip >= WET }
    if (wet.none { it }) return null
    val kind = intensity(steps.maxOf { it.precip })
    if (wet[0]) {
        val stop = wet.indexOf(false)
        val text = if (stop < 0) "مطر $kind مستمر خلال ${minutesText(steps.size * 15)} القادمة"
        else "مطر $kind الآن، ويتوقف بعد ${minutesText(stop * 15)}"
        return Nowcast(true, text, steps)
    }
    val start = wet.indexOf(true)
    val after = wet.drop(start).indexOf(false)
    val lasts = if (after < 0) "" else " ويستمر ${minutesText(after * 15)}"
    return Nowcast(false, "يبدأ مطر $kind بعد ${minutesText(start * 15)}$lasts", steps)
}

private fun dayPart(h: Int) = when {
    h < 5 -> "فجراً"; h < 11 -> "صباحاً"; h < 14 -> "ظهراً"; h < 17 -> "بعد الظهر"; h < 20 -> "مساءً"; else -> "ليلاً"
}

/** One or two short sentences a person would say about the day. */
fun summarize(fc: Forecast, now: LocalDateTime = fc.currentTime ?: LocalDateTime.now()): String {
    val parts = ArrayList<String>()
    val today = fc.days.firstOrNull()
    val hourNow = now.withMinute(0).withSecond(0).withNano(0)
    val next = fc.hours.filter { !it.time.isBefore(hourNow) }.take(24)
    val rain = next.firstOrNull { it.precipProb >= 50 && it.precip >= 0.2 }
    // The 15-minute nowcast is the sharper reading for the next two hours: it wins.
    val nc = rainNowcast(fc.minutely, now)
    when {
        nc != null -> parts += if (nc.raining) "مطر في هذه الأثناء" else "مطر قريب خلال الساعتين القادمتين"
        rain != null -> parts += if (rain.time == hourNow) "أمطار في هذه الساعات" else {
            val day = if (rain.time.toLocalDate() == now.toLocalDate()) "اليوم" else "غداً"
            "أمطار متوقعة $day ${dayPart(rain.time.hour)}"
        }
        else -> parts += "لا أمطار متوقعة في الساعات القادمة"
    }
    val yMax = fc.yesterdayMax
    if (today != null && yMax != null) {
        val diff = (today.max - yMax).roundToInt()
        if (abs(diff) >= 2) {
            val n = abs(diff)
            val deg = when { n == 2 -> "درجتين"; n <= 10 -> "$n درجات"; else -> "$n درجة" }
            parts += "${if (diff < 0) "أبرد" else "أدفأ"} من أمس بـ$deg"
        }
    }
    if (today != null) when {
        today.max >= 35 -> parts += "حرارة مرتفعة نهاراً"
        today.min <= 3 -> parts += "برد شديد ليلاً واحتمال صقيع"
        today.windMax >= 40 -> parts += "رياح نشطة تصل إلى ${today.windMax.roundToInt()} كم/س"
    }
    return parts.take(3).joinToString("، ") + "."
}

enum class Sky { DAY, NIGHT, DUSK, CLOUDY, RAIN, STORM, FOG, SNOW }

/** The kind of sky for the hero background. */
fun skyKind(fc: Forecast, now: LocalDateTime = fc.currentTime ?: LocalDateTime.now()): Sky {
    val code = fc.current.code
    return when {
        code >= 95 -> Sky.STORM
        code in 51..67 || code in 80..82 -> Sky.RAIN
        code in 71..77 || code == 85 || code == 86 -> Sky.SNOW
        code == 45 || code == 48 -> Sky.FOG
        code == 3 -> Sky.CLOUDY
        // Within 40 minutes of sunrise or sunset the sky is warm.
        listOfNotNull(fc.days.firstOrNull()?.sunrise, fc.days.firstOrNull()?.sunset)
            .any { abs(Duration.between(it, now).toMinutes()) <= 40 } -> Sky.DUSK
        fc.current.isDay -> Sky.DAY
        else -> Sky.NIGHT
    }
}
