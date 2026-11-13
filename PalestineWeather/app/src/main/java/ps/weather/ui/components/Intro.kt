package ps.weather.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ps.weather.data.Sky
import ps.weather.ui.theme.Pw

private val SUN = Color(0xFFFAAE3C)
private val CLOUD = Color(0xFF2686C7)
private val ACCENT = Color(0xFF60A6D6)
private val LETTER = Color(0xFFFEFEFE)

/**
 * The opening: on the moving sky, the cloud rises into place, then the sun's rays come out of
 * its centre one by one from left round to right, then the name. Tap to skip; [onDone] runs at
 * the end. When the phone's animations are off it is shown briefly, still.
 */
@Composable
fun Intro(sky: Sky, onDone: () -> Unit) {
    val rays = remember { LogoPaths.RAYS.map { PathParser().parsePathString(it).toPath() } }
    val cloud = remember { PathParser().parsePathString(LogoPaths.CLOUD).toPath() }
    val accent = remember { PathParser().parsePathString(LogoPaths.CLOUD_ACCENT).toPath() }
    val letter = remember { PathParser().parsePathString(LogoPaths.LETTER).toPath() }

    val cloudIn = remember { Animatable(0f) }
    val letterIn = remember { Animatable(0f) }
    val rayIn = remember { List(rays.size) { Animatable(0f) } }
    val titleIn = remember { Animatable(0f) }
    val out = remember { Animatable(1f) }

    LaunchedEffect(Unit) {
        launch { cloudIn.animateTo(1f, tween(650, easing = FastOutSlowInEasing)) }
        delay(350)
        launch { letterIn.animateTo(1f, tween(450)) }
        // Each ray springs out of the sun's centre, a beat after the one before.
        rayIn.forEachIndexed { i, a -> launch { delay(i * 95L); a.animateTo(1f, tween(420, easing = { t -> overshoot(t) })) } }
        delay(rays.size * 95L + 250)
        titleIn.animateTo(1f, tween(450))
        delay(700)
        out.animateTo(0f, tween(350, easing = LinearEasing))
        onDone()
    }

    Box(
        Modifier.fillMaxSize().alpha(out.value)
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { onDone() },
    ) {
        SkyBackground(sky, Modifier.fillMaxSize())
        Column(
            Modifier.fillMaxSize().navigationBarsPadding().padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Canvas(Modifier.width(220.dp).height(220.dp * (LogoPaths.HEIGHT / LogoPaths.WIDTH))) {
                val k = size.width / LogoPaths.WIDTH
                scale(k, k, pivot = Offset.Zero) {
                    translate(LogoPaths.SHIFT_X, LogoPaths.SHIFT_Y) {
                        val cx = LogoPaths.SUN_X - LogoPaths.SHIFT_X
                        val cy = LogoPaths.SUN_Y - LogoPaths.SHIFT_Y
                        rays.forEachIndexed { i, p ->
                            val v = rayIn[i].value
                            if (v > 0f) scale(v, v, pivot = Offset(cx, cy)) { drawPath(p, SUN, alpha = v.coerceIn(0f, 1f)) }
                        }
                        // The cloud rises a little as it appears, over the rays.
                        translate(top = (1f - cloudIn.value) * 60f) {
                            drawPath(cloud, CLOUD, alpha = cloudIn.value)
                            drawPath(accent, ACCENT, alpha = cloudIn.value)
                            drawPath(letter, LETTER, alpha = letterIn.value)
                        }
                    }
                }
            }
            Text(
                "طقس فلسطين", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color.White,
                modifier = Modifier.padding(top = 22.dp).alpha(titleIn.value),
            )
            Text(
                "الطقس في كل مدينة وقرية فلسطينية", fontSize = 14.sp, color = Pw.Muted,
                modifier = Modifier.padding(top = 6.dp).alpha(titleIn.value),
            )
        }
    }
}

/** Ease out with a small overshoot, so each ray springs into place. */
private fun overshoot(t: Float): Float {
    val s = 1.7f
    val u = t - 1f
    return u * u * ((s + 1) * u + s) + 1f
}
