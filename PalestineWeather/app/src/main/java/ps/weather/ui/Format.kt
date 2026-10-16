package ps.weather.ui

import java.time.DayOfWeek
import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZonedDateTime
import kotlin.math.roundToInt

private val MONTHS = listOf(
    "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
    "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
)

fun arabicDayName(date: LocalDate): String = when (date.dayOfWeek!!) {
    DayOfWeek.SATURDAY -> "السبت"
    DayOfWeek.SUNDAY -> "الأحد"
    DayOfWeek.MONDAY -> "الإثنين"
    DayOfWeek.TUESDAY -> "الثلاثاء"
    DayOfWeek.WEDNESDAY -> "الأربعاء"
    DayOfWeek.THURSDAY -> "الخميس"
    DayOfWeek.FRIDAY -> "الجمعة"
}

fun relativeDayName(date: LocalDate): String = when (date) {
    LocalDate.now() -> "اليوم"
    LocalDate.now().plusDays(1) -> "غداً"
    else -> arabicDayName(date)
}

fun arabicDate(date: LocalDate): String = "${arabicDayName(date)}، ${date.dayOfMonth} ${MONTHS[date.monthValue - 1]}"

/** 12-hour clock with ص / م. */
fun clock(t: LocalTime): String {
    val h = t.hour % 12
    return "${if (h == 0) 12 else h}:${t.minute.toString().padStart(2, '0')}"
}

fun clockWithPeriod(t: LocalTime): String = clock(t) + if (t.hour < 12) " ص" else " م"

fun hourLabel(t: LocalDateTime): String {
    val h = t.hour % 12
    return "${if (h == 0) 12 else h} ${if (t.hour < 12) "ص" else "م"}"
}

fun deg(v: Double): String = "${v.roundToInt()}°"

/** Height above / below sea level: "754 م فوق سطح البحر", "258 م تحت سطح البحر". */
fun elevationText(m: Double?): String? {
    if (m == null) return null
    val v = m.roundToInt()
    if (v == 0) return "عند مستوى سطح البحر"
    return "${kotlin.math.abs(v)} م ${if (v > 0) "فوق" else "تحت"} سطح البحر"
}

fun ago(at: ZonedDateTime?): String {
    if (at == null) return ""
    val d = Duration.between(at.toInstant(), java.time.Instant.now())
    return when {
        d.toMinutes() < 60 -> "قبل ${d.toMinutes().coerceAtLeast(1)} دقيقة"
        d.toHours() < 24 -> "قبل ${d.toHours()} ساعة"
        d.toDays() == 1L -> "أمس"
        else -> "قبل ${d.toDays()} أيام"
    }
}

fun windDirectionName(deg: Int): String {
    val names = listOf("شمالية", "شمالية شرقية", "شرقية", "جنوبية شرقية", "جنوبية", "جنوبية غربية", "غربية", "شمالية غربية")
    return names[((deg % 360 + 22.5) / 45).toInt() % 8]
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
fun weatherText(code: Int): String = when (code) {
    0 -> "صافٍ"
    1 -> "صافٍ غالباً"
    2 -> "غائم جزئياً"
    3 -> "غائم"
    45, 48 -> "ضباب"
    51, 53, 55 -> "رذاذ"
    56, 57 -> "رذاذ متجمد"
    61 -> "مطر خفيف"
    63 -> "مطر"
    65 -> "مطر غزير"
    66, 67 -> "مطر متجمد"
    71, 73, 75, 77 -> "ثلج"
    80, 81 -> "زخات مطر"
    82 -> "زخات غزيرة"
    85, 86 -> "زخات ثلج"
    95 -> "عاصفة رعدية"
    96, 99 -> "عاصفة رعدية مع برد"
    else -> "—"
}

fun uvText(uv: Double): String = when {
    uv < 3 -> "منخفض"
    uv < 6 -> "معتدل"
    uv < 8 -> "مرتفع"
    uv < 11 -> "مرتفع جداً"
    else -> "شديد"
}

fun aqiText(aqi: Int): String = when {
    aqi <= 20 -> "جيدة جداً"
    aqi <= 40 -> "جيدة"
    aqi <= 60 -> "مقبولة"
    aqi <= 80 -> "رديئة"
    else -> "رديئة جداً"
}
