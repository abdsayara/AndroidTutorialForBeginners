package ps.weather.ui.components

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.ui.theme.Pw

/** UV and air-quality scales, low to high: green, yellow, orange, red, violet. */
val SCALE = listOf(Color(0xFF3FCF8A), Color(0xFFF2D14A), Color(0xFFF59E3B), Color(0xFFE5484D), Color(0xFF9B5DE5))

/**
 * A detail tile like the big weather apps': a small icon and label, the value large, a short
 * note, and a bar (a scale with a dot, or a fill). A big soft-focus copy of the icon sits in
 * the corner (blurred on Android 12+, faint everywhere).
 */
@Composable
fun MetricTile(
    icon: ImageVector, label: String, value: String, note: String?,
    fraction: Float?, scale: List<Color>?, modifier: Modifier = Modifier,
) {
    Box(
        modifier.clip(RoundedCornerShape(18.dp)).background(Pw.Card).border(1.dp, Pw.Line, RoundedCornerShape(18.dp)),
    ) {
        // The soft-focus emblem.
        Icon(
            icon, null, tint = Color.White,
            modifier = Modifier.align(Alignment.BottomEnd).offset(x = 14.dp, y = 14.dp).size(92.dp).alpha(0.10f)
                .then(if (Build.VERSION.SDK_INT >= 31) Modifier.blur(4.dp) else Modifier),
        )
        Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(icon, null, tint = Pw.Muted, modifier = Modifier.size(16.dp))
                Text(label, fontSize = 12.sp, color = Pw.Muted, maxLines = 1)
            }
            Text(value, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            note?.let { Text(it, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
            if (fraction != null) {
                val f = fraction.coerceIn(0f, 1f)
                BoxWithConstraints(Modifier.fillMaxWidth().height(10.dp).padding(top = 2.dp), contentAlignment = Alignment.CenterStart) {
                    if (scale != null) {
                        // A coloured scale with a dot at the value (start = low, in the reading direction).
                        Box(Modifier.fillMaxWidth().height(5.dp).clip(RoundedCornerShape(3.dp)).background(Brush.horizontalGradient(scale)))
                        Box(
                            Modifier.padding(start = (maxWidth - 10.dp) * f).size(10.dp).clip(CircleShape)
                                .background(Color.White).border(2.dp, Color(0x6612241B), CircleShape),
                        )
                    } else {
                        Box(Modifier.fillMaxWidth().height(5.dp).clip(RoundedCornerShape(3.dp)).background(Pw.Line))
                        Box(Modifier.fillMaxWidth(f).height(5.dp).clip(RoundedCornerShape(3.dp)).background(Color(0xFF9AD2FF)))
                    }
                }
            }
        }
    }
}
