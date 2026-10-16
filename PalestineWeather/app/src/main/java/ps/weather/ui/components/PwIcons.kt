package ps.weather.ui.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp

/** Line icons from the app's design, built from SVG path data (24×24, 2px stroke). */
object PwIcons {
    private fun circle(cx: Float, cy: Float, r: Float) =
        "M${cx - r} ${cy}a$r $r 0 1 0 ${2 * r} 0a$r $r 0 1 0 ${-2 * r} 0"

    private fun icon(name: String, vararg paths: String, filled: Boolean = false): ImageVector =
        ImageVector.Builder(name, 24.dp, 24.dp, 24f, 24f).apply {
            paths.forEach { d ->
                addPath(
                    pathData = PathParser().parsePathString(d).toNodes(),
                    fill = if (filled) SolidColor(Color.Black) else null,
                    stroke = if (filled) null else SolidColor(Color.Black),
                    strokeLineWidth = 2f,
                    strokeLineCap = StrokeCap.Round,
                    strokeLineJoin = StrokeJoin.Round,
                )
            }
        }.build()

    val Home = icon("home", "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z")
    val Map = icon("map", "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z", "M9 4v14M15 6v14")
    val Pin = icon("pin", "M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z", circle(12f, 9f, 2.5f))
    val Leaf = icon("leaf", "M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z", "M5 19l7-7")
    val More = icon("more", circle(5f, 12f, 1f), circle(12f, 12f, 1f), circle(19f, 12f, 1f))
    val Search = icon("search", circle(11f, 11f, 7f), "M20 20l-4-4")
    val Back = icon("back", "M9 6l6 6-6 6")
    val Forward = icon("forward", "M15 6l-6 6 6 6")
    val Clock = icon("clock", circle(12f, 12f, 9f), "M12 7v5l3 2")
    val Bell = icon("bell", "M6 16V11a6 6 0 0 1 12 0v5l2 2H4z", "M10 21h4")
    val Refresh = icon("refresh", "M20 11a8 8 0 1 0-2.3 5.7", "M20 4v7h-7")
    val Star = icon("star", "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z")
    val StarFilled = icon("starFilled", "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z", filled = true)
    val Play = icon("play", "M17 5v14L6 12z", filled = true)
    val Pause = icon("pause", "M6 5h4v14H6zM14 5h4v14h-4z", filled = true)
    val Plus = icon("plus", "M12 5v14M5 12h14")
    val Minus = icon("minus", "M5 12h14")
    val Expand = icon("expand", "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5")
    val Regions = icon("regions", "M4 4h4M12 4h4M20 4v4M20 12v4M20 20h-4M12 20H8M4 20v-4M4 12V8")
    val Locate = icon("locate", circle(12f, 12f, 3f), "M12 2v3M12 19v3M2 12h3M19 12h3")
    val Drop = icon("drop", "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z")
    val Wind = icon("wind", "M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3")
    val Moon = icon("moon", "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z")
    val Compass = icon("compass", circle(12f, 12f, 10f), "M12 12l5-7-2 8z")
    val News = icon("news", "M4 5h13v14H6a2 2 0 0 1-2-2z", "M17 9h3v8a2 2 0 0 1-2 2", "M8 9h5M8 13h5")
    val Coins = icon("coins", circle(9f, 9f, 6f), "M15.5 9.6A6 6 0 1 1 9.6 15.5")
    val Trash = icon("trash", "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3")
}
