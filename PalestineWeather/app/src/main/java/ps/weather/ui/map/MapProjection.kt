package ps.weather.ui.map

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import kotlin.math.cos

/**
 * Equirectangular projection scaled by cos(31.5°) so east–west and north–south
 * distances match (one unit ≈ 1.2086 km). Same projection as [PalestineShape].
 */
object MapProjection {
    private val K = cos(Math.toRadians(31.5))
    const val KM_PER_UNIT = 1.2086f

    fun x(lon: Double): Float = ((lon - 34.1) * 92 * K).toFloat()
    fun y(lat: Double): Float = ((33.4 - lat) * 92).toFloat()
    fun point(lat: Double, lon: Double) = Offset(x(lon), y(lat))

    /** Parses an SVG path made only of M, L and Z commands. */
    fun parse(d: String): List<List<Offset>> {
        val rings = ArrayList<List<Offset>>()
        var current = ArrayList<Offset>()
        Regex("([MLZ])([^MLZ]*)").findAll(d).forEach { m ->
            val cmd = m.groupValues[1]
            val nums = m.groupValues[2].trim().split(Regex("[ ,]+")).filter { it.isNotEmpty() }.map { it.toFloat() }
            when (cmd) {
                "M" -> {
                    if (current.isNotEmpty()) rings += current
                    current = arrayListOf(Offset(nums[0], nums[1]))
                }
                "L" -> current += Offset(nums[0], nums[1])
                "Z" -> {}
            }
        }
        if (current.isNotEmpty()) rings += current
        return rings
    }

    /** Builds a screen path from map-unit rings with the given unit→pixel transform. */
    fun toPath(rings: List<List<Offset>>, close: Boolean, transform: (Offset) -> Offset): Path = Path().apply {
        rings.forEach { ring ->
            ring.forEachIndexed { i, p ->
                val s = transform(p)
                if (i == 0) moveTo(s.x, s.y) else lineTo(s.x, s.y)
            }
            if (close) close()
        }
    }
}
