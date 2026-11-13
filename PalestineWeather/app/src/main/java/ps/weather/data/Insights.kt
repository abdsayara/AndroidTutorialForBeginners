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

enum class Sky { DAY, NIGHT, CLOUDY, RAIN, STORM, FOG, SNOW }

/** The kind of sky for the hero background. */
fun skyKind(fc: Forecast, now: LocalDateTime = fc.currentTime ?: LocalDateTime.now()): Sky {
    val code = fc.current.code
    return when {
        code >= 95 -> Sky.STORM
        code in 51..67 || code in 80..82 -> Sky.RAIN
        code in 71..77 || code == 85 || code == 86 -> Sky.SNOW
        code == 45 || code == 48 -> Sky.FOG
        code == 3 -> Sky.CLOUDY
        fc.current.isDay -> Sky.DAY
        else -> Sky.NIGHT
    }
}

// ---------------------------------------------------------------- Palestinian touches

private fun clock12(t: java.time.LocalTime): String {
    val h = t.hour % 12
    return "${if (h == 0) 12 else h}:${t.minute.toString().padStart(2, '0')} ${if (t.hour < 12) "ص" else "م"}"
}

data class DustAlert(val heavy: Boolean, val title: String, val text: String)

/** Khamaseen and dust: a warning when dust passes 100 µg/m³ in the next 24 hours. */
fun dustAlert(air: AirInfo?): DustAlert? {
    val peak = air?.dustMax ?: return null
    if (peak < 100) return null
    val heavy = peak >= 300
    val at = air.dustMaxAt
    val tomorrow = at != null && air.time != null && at.toLocalDate().isAfter(air.time.toLocalDate())
    val whenText = when {
        (air.dust ?: 0.0) >= 100 -> "الآن"
        at != null -> "${if (tomorrow) "غداً " else ""}نحو الساعة ${clock12(at.toLocalTime())}"
        else -> "خلال الساعات القادمة"
    }
    val advice = if (heavy) "أغلق النوافذ وقلّل الخروج، خاصة لمرضى الربو والحساسية وكبار السن."
    else "يُفضّل لمرضى الربو والحساسية تجنّب المجهود في الخارج."
    return DustAlert(
        heavy,
        if (heavy) "موجة غبار كثيف" else "غبار في الأجواء",
        "${if (heavy) "غبار كثيف" else "غبار متوسط"} $whenText. $advice",
    )
}

/** "شو نلبس؟" for a day: what to wear from its high, low, rain and wind. */
fun clothingAdvice(day: DayPoint?): String? {
    day ?: return null
    val text = when {
        day.max >= 30 -> "ملابس صيفية خفيفة وفاتحة، وقبعة للشمس"
        day.max >= 24 -> if (day.min < 17) "ملابس خفيفة نهاراً، وطبقة رقيقة للمساء" else "ملابس خفيفة"
        day.max >= 17 -> "قميص بأكمام طويلة أو كنزة خفيفة"
        day.max >= 10 -> "كنزة وجاكيت"
        else -> "معطف شتوي وطبقات دافئة"
    }
    val extra = listOfNotNull(
        "مظلة أو جاكيت للمطر".takeIf { day.precipProbMax >= 50 },
        "شيء يقي من الرياح".takeIf { day.windMax >= 35 },
    )
    return if (extra.isEmpty()) text else "$text، و${extra.joinToString(" و")}"
}

data class PrayerWeather(val name: String, val time: java.time.LocalTime, val minutes: Int, val tomorrow: Boolean, val hour: HourPoint?)

/** The next prayer and the weather at its hour; after the last prayer, tomorrow's Fajr. */
fun prayerWeather(times: List<Pair<String, java.time.LocalTime>>, hours: List<HourPoint>, now: LocalDateTime): PrayerWeather? {
    val prayers = times.filter { it.first != "الشروق" }
    if (prayers.isEmpty()) return null
    val today = prayers.firstOrNull { it.second.isAfter(now.toLocalTime()) }
    val next = today ?: prayers.first()
    val date = if (today != null) now.toLocalDate() else now.toLocalDate().plusDays(1)
    val at = date.atTime(next.second)
    return PrayerWeather(
        next.first, next.second,
        Duration.between(now, at).toMinutes().toInt(),
        today == null,
        hours.firstOrNull { it.time == at.withMinute(0) },
    )
}

data class SeasonCard(val title: String, val text: String)

/** A frost warning for the cold months (December to February), or null. */
fun seasonCard(days: List<DayPoint>, date: java.time.LocalDate, dayName: (java.time.LocalDate) -> String): SeasonCard? {
    val week = days.take(7)
    val m = date.monthValue
    if (m == 12 || m == 1 || m == 2) {
        val frost = week.take(3).filter { it.min <= 3 }.map { dayName(it.date) }
        if (frost.isEmpty()) return null
        return SeasonCard("تحذير صقيع", "ليالٍ باردة قد يتكوّن فيها الصقيع: ${frost.joinToString("، ")}. غطِّ المزروعات الحساسة ليلاً.")
    }
    return null
}

// ---------------------------------------------------------------- sun and moon

data class SunDay(val length: String, val progress: Double, val up: Boolean)

/** Day length, and how far the sun has gone across today's sky (0 at sunrise, 1 at sunset). */
fun sunDay(sunrise: LocalDateTime?, sunset: LocalDateTime?, now: LocalDateTime): SunDay? {
    if (sunrise == null || sunset == null) return null
    val len = Duration.between(sunrise, sunset).toMinutes()
    if (len <= 0) return null
    val gone = Duration.between(sunrise, now).toMinutes()
    return SunDay("${len / 60} س ${len % 60} د", gone.toDouble() / len, !now.isBefore(sunrise) && !now.isAfter(sunset))
}

data class MoonPhase(val name: String, val age: Double, val fraction: Double, val lit: Double)

private const val SYNODIC = 29.530588853
/** A known new moon: 6 January 2000, 18:14 UTC. */
private val NEW_MOON = java.time.Instant.parse("2000-01-06T18:14:00Z")
private val PHASES = listOf(
    0.0339 to "محاق", 0.2161 to "هلال متزايد", 0.2839 to "تربيع أول", 0.4661 to "أحدب متزايد", 0.5339 to "بدر",
    0.7161 to "أحدب متناقص", 0.7839 to "تربيع أخير", 0.9661 to "هلال متناقص", 1.0 to "محاق",
)

/** The moon's phase: its Arabic name, age in days, place in the cycle (0..1) and lit share. Same as the website. */
fun moonPhase(at: java.time.Instant = java.time.Instant.now()): MoonPhase {
    val days = Duration.between(NEW_MOON, at).toMillis() / 86_400_000.0
    val age = ((days % SYNODIC) + SYNODIC) % SYNODIC
    val fraction = age / SYNODIC
    val name = PHASES.first { fraction < it.first || it.first == 1.0 }.second
    return MoonPhase(name, age, fraction, (1 - kotlin.math.cos(2 * Math.PI * fraction)) / 2)
}
