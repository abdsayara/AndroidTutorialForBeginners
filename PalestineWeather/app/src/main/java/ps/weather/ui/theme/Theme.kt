package ps.weather.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import ps.weather.R
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import ps.weather.data.Sky

/**
 * The app's colours. In the glass theme (every screen but the map) the screens sit on the sky
 * of the chosen place and every surface is frosted glass over it, so the tokens turn light on
 * dark. Both switches are snapshot state: changing them recomposes whatever read a colour.
 */
object Pw {
    /** Glass over the sky; off on the map, which is drawn for a light page. */
    var glass by mutableStateOf(true)
    /** The sky of the chosen place, set by the home screen. */
    var sky by mutableStateOf(Sky.DAY)

    private fun pick(glassColor: Color, light: Color) = if (glass) glassColor else light
    private val W = Color.White

    // Brand: the logo's cloud blue, darkened so white text and links stay readable.
    val Brand = Color(0xFF1F74B0)
    val BrandDark = Color(0xFF165A8A)
    val BrandTint get() = pick(W.copy(alpha = 0.18f), Color(0xFFE8F2FA))
    /** Links and accents in text: warm yellow on the sky, brand blue on a light page. */
    val Link get() = pick(Color(0xFFFFD27A), Brand)
    // Status "good / suitable": stays green whatever the brand.
    val Ok get() = pick(Color(0xFF74E2AA), Color(0xFF0F7A4A))
    val OkTint get() = pick(Color(0xFF74E2AA).copy(alpha = 0.16f), Color(0xFFE3F1E9))
    val Ink get() = pick(W, Color(0xFF12241B))
    val Ground get() = pick(Color.Transparent, Color(0xFFF6F7F5))
    val Card get() = pick(W.copy(alpha = 0.13f), W)
    val Muted get() = pick(W.copy(alpha = 0.80f), Color(0xFF4F5E55))
    val Faint get() = pick(W.copy(alpha = 0.60f), Color(0xFF6B786F))
    val Line get() = pick(W.copy(alpha = 0.16f), Color(0xFFE3E6E1))
    val Border get() = pick(W.copy(alpha = 0.26f), Color(0xFFDCE2DD))
    val Amber get() = pick(Color(0xFFFFC870), Color(0xFFC77700))
    val AmberTint get() = pick(Color(0xFFFFC870).copy(alpha = 0.18f), Color(0xFFFFF4DE))
    val AmberInk get() = pick(Color(0xFFFFE4B8), Color(0xFF5C3800))
    val Blue get() = pick(Color(0xFFAED7FF), Color(0xFF1F5FA8))
    val BlueTint get() = pick(Color(0xFFAED7FF).copy(alpha = 0.16f), Color(0xFFE7ECF5))
    val BlueInk get() = pick(Color(0xFFD9EDFF), Color(0xFF1F3F6E))
    val Red get() = pick(Color(0xFFFF9F90), Color(0xFFB42318))
    val RedTint get() = pick(Color(0xFFFF9F90).copy(alpha = 0.18f), Color(0xFFFBE2DD))
    val Sun = Color(0xFFFAAE3C) // the logo's sun rays
    /** A raised panel (the next prayer, the converter): dark ink on a light page, brighter glass on the sky. */
    val Panel get() = pick(W.copy(alpha = 0.20f), Color(0xFF12241B))
    /** The selected pill and its text. */
    val Selected get() = pick(W, Color(0xFF12241B))
    val OnSelected get() = pick(Color(0xFF17324A), W)
    /** The bottom bar. */
    val Bar get() = pick(Color(0xFF0A1928).copy(alpha = 0.38f), W)

    /** Top, middle and bottom of each sky; the same as the website's. */
    fun skyStops(s: Sky = sky): List<Color> = when (s) {
        Sky.DAY -> listOf(Color(0xFF3C8FD0), Color(0xFF1F74B0), Color(0xFF134B76))
        Sky.NIGHT -> listOf(Color(0xFF23446B), Color(0xFF16304F), Color(0xFF0C1B30))
        Sky.CLOUDY -> listOf(Color(0xFF8299A9), Color(0xFF4A6476), Color(0xFF2F4252))
        Sky.FOG -> listOf(Color(0xFF91A1AC), Color(0xFF5E707B), Color(0xFF3E4C55))
        Sky.RAIN -> listOf(Color(0xFF4D6E86), Color(0xFF2E4A60), Color(0xFF18293A))
        Sky.STORM -> listOf(Color(0xFF37506A), Color(0xFF213042), Color(0xFF0F1823))
        Sky.SNOW -> listOf(Color(0xFF86A6C2), Color(0xFF4B6E8C), Color(0xFF2F4B63))
    }

    /** The page behind every screen: the sky in glass, the plain ground on the map. */
    fun background(): Brush = if (glass) Brush.verticalGradient(skyStops()) else Brush.verticalGradient(listOf(Color(0xFFF6F7F5), Color(0xFFF6F7F5)))
}

/** Readex Pro (SIL Open Font License, res/font): a rounded modern Arabic face, every weight from one variable file. */
@OptIn(ExperimentalTextApi::class)
val Readex = FontFamily(
    listOf(300, 400, 500, 600, 700, 800).map { w ->
        Font(R.font.readex_pro, FontWeight(w), variationSettings = FontVariation.Settings(FontVariation.weight(w)))
    },
)

/** Material's type scale, all in Readex Pro. */
private val AppTypography = Typography().let { t ->
    fun TextStyle.r() = copy(fontFamily = Readex)
    Typography(
        displayLarge = t.displayLarge.r(), displayMedium = t.displayMedium.r(), displaySmall = t.displaySmall.r(),
        headlineLarge = t.headlineLarge.r(), headlineMedium = t.headlineMedium.r(), headlineSmall = t.headlineSmall.r(),
        titleLarge = t.titleLarge.r(), titleMedium = t.titleMedium.r(), titleSmall = t.titleSmall.r(),
        bodyLarge = t.bodyLarge.r(), bodyMedium = t.bodyMedium.r(), bodySmall = t.bodySmall.r(),
        labelLarge = t.labelLarge.r(), labelMedium = t.labelMedium.r(), labelSmall = t.labelSmall.r(),
    )
}

@Composable
fun PalestineWeatherTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        typography = AppTypography,
        colorScheme = if (Pw.glass) darkColorScheme(
            primary = Color.White,
            onPrimary = Color(0xFF17324A),
            secondary = Pw.Amber,
            background = Color.Transparent,
            onBackground = Color.White,
            surface = Pw.Card,
            onSurface = Color.White,
            onSurfaceVariant = Pw.Muted,
        ) else lightColorScheme(
            primary = Pw.Brand,
            onPrimary = Color.White,
            secondary = Pw.Amber,
            background = Pw.Ground,
            onBackground = Pw.Ink,
            surface = Pw.Card,
            onSurface = Pw.Ink,
            onSurfaceVariant = Pw.Muted,
        ),
        content = content,
    )
}
