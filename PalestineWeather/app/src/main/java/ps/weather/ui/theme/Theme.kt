package ps.weather.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

object Pw {
    val Green = Color(0xFF146B45)
    val GreenDark = Color(0xFF0E4F33)
    val GreenTint = Color(0xFFE3F0E8)
    val Ink = Color(0xFF12241B)
    val Ground = Color(0xFFF4F6F3)
    val Card = Color.White
    val Muted = Color(0xFF4F5E55)
    val Line = Color(0xFFE3E8E4)
    val Border = Color(0xFFDCE2DD)
    val Amber = Color(0xFFC77700)
    val AmberTint = Color(0xFFFFF4DE)
    val AmberInk = Color(0xFF5C3800)
    val Blue = Color(0xFF1F5FA8)
    val BlueTint = Color(0xFFE7ECF5)
    val BlueInk = Color(0xFF1F3F6E)
    val Red = Color(0xFFB42318)
    val RedTint = Color(0xFFFBE2DD)
    val Sun = Color(0xFFFFC24A)
}

@Composable
fun PalestineWeatherTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Pw.Green,
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
