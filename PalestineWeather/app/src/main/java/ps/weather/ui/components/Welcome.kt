package ps.weather.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import ps.weather.ui.theme.Pw

/**
 * First launch: a sheet slides up over the dimmed app, a hand waves hello, and asks for the
 * person's town so the forecast is theirs. [onPick] opens the cities; [onLater] just closes.
 */
@Composable
fun WelcomeSheet(placeName: String, onPick: () -> Unit, onLater: () -> Unit) {
    val shown = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) { shown.animateTo(1f, tween(450, easing = FastOutSlowInEasing)) }
    fun close(then: () -> Unit) = scope.launch { shown.animateTo(0f, tween(250)); then() }

    val t = rememberInfiniteTransition(label = "hand")
    val wave = t.animateFloat(-14f, 18f, infiniteRepeatable(tween(420, easing = LinearEasing), RepeatMode.Reverse), label = "wave")

    Box(Modifier.fillMaxSize()) {
        Box(
            Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.45f * shown.value))
                .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { close(onLater) },
        )
        Column(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                .graphicsLayer { translationY = (1f - shown.value) * size.height }
                .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                .background(Color(0xFF1F3A55)).navigationBarsPadding().padding(horizontal = 24.dp, vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Box(Modifier.width(40.dp).height(4.dp).clip(RoundedCornerShape(2.dp)).background(Color.White.copy(alpha = 0.35f)))
            Text(
                "👋", fontSize = 54.sp,
                modifier = Modifier.padding(top = 6.dp).graphicsLayer { rotationZ = wave.value; transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0.7f, 0.9f) },
            )
            Text("مرحباً", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(
                "اختر بلدتك لتكون التوقعات والتنبيهات لمكانك أنت. المختار الآن: $placeName.",
                fontSize = 14.sp, color = Color.White.copy(alpha = 0.85f), textAlign = TextAlign.Center, lineHeight = 22.sp,
            )
            Box(
                Modifier.padding(top = 6.dp).fillMaxWidth().heightIn(min = 50.dp).clip(RoundedCornerShape(16.dp)).background(Color.White)
                    .clickable(role = Role.Button) { close(onPick) },
                contentAlignment = Alignment.Center,
            ) { Text("اختر بلدتك", color = Color(0xFF17324A), fontWeight = FontWeight.Bold, fontSize = 16.sp) }
            Text(
                "لاحقاً", color = Pw.Link, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
                modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(role = Role.Button) { close(onLater) }.padding(10.dp).alpha(1f),
            )
        }
    }
}
