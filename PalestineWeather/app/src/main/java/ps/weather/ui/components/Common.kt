package ps.weather.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.data.Fetched
import ps.weather.ui.theme.Pw
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

// ---------------------------------------------------------------- loading state

sealed interface Load<out T> {
    data object Loading : Load<Nothing>
    data class Error(val message: String) : Load<Nothing>
    data class Ok<T>(val value: T, val fromCache: Boolean, val savedAt: Long) : Load<T>
}

/** Runs [block] whenever [keys] change (or the returned refresh lambda is called). */
@Composable
fun <T> rememberLoad(vararg keys: Any?, block: suspend () -> Fetched<T>): Pair<Load<T>, () -> Unit> {
    var nonce by remember { mutableIntStateOf(0) }
    val state by produceState<Load<T>>(Load.Loading, *keys, nonce) {
        value = Load.Loading
        value = try {
            val f = block()
            Load.Ok(f.value, f.fromCache, f.savedAt)
        } catch (e: Exception) {
            Load.Error(e.message ?: "تعذّر تحميل البيانات")
        }
    }
    return state to { nonce++ }
}

@Composable
fun <T> LoadBox(load: Load<T>, retry: () -> Unit, content: @Composable (T) -> Unit) {
    when (load) {
        is Load.Loading -> Box(Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Pw.Green)
        }
        is Load.Error -> Column(
            Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("لا يوجد اتصال بالإنترنت ولا توجد بيانات محفوظة", color = Pw.Muted, textAlign = TextAlign.Center)
            PillButton("إعادة المحاولة", selected = true, onClick = retry)
        }
        is Load.Ok -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (load.fromCache) OfflineBanner(load.savedAt)
            content(load.value)
        }
    }
}

@Composable
fun OfflineBanner(savedAt: Long) {
    val t = Instant.ofEpochMilli(savedAt).atZone(ZoneId.systemDefault())
    Text(
        "غير متصل — آخر تحديث ${t.format(DateTimeFormatter.ofPattern("d/M HH:mm"))}",
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Pw.AmberTint).padding(10.dp),
        color = Pw.AmberInk,
        fontSize = 13.sp,
    )
}

// ---------------------------------------------------------------- building blocks

@Composable
fun SectionCard(
    modifier: Modifier = Modifier,
    color: Color = Pw.Card,
    padding: Dp = 16.dp,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(color).padding(padding),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        content = content,
    )
}

@Composable
fun ScreenHeader(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null, action: @Composable RowScope.() -> Unit = {}) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        if (onBack != null) RoundIconButton(PwIcons.Back, "رجوع", onBack)
        Column(Modifier.weight(1f)) {
            Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Pw.Ink)
            if (subtitle != null) Text(subtitle, fontSize = 13.sp, color = Pw.Muted)
        }
        action()
    }
}

@Composable
fun RoundIconButton(icon: ImageVector, label: String, onClick: () -> Unit, background: Color = Pw.Card, tint: Color = Pw.Ink) {
    Box(
        Modifier.size(44.dp).clip(CircleShape).background(background)
            .clickable(role = Role.Button, onClickLabel = label, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, contentDescription = label, tint = tint, modifier = Modifier.size(22.dp)) }
}

@Composable
fun PillButton(text: String, selected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val shape = RoundedCornerShape(22.dp)
    Box(
        modifier.heightIn(min = 44.dp).clip(shape)
            .background(if (selected) Pw.Ink else Pw.Card)
            .border(BorderStroke(1.dp, if (selected) Pw.Ink else Pw.Border), shape)
            .clickable(role = Role.Tab, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 1,
            color = if (selected) Color.White else Pw.Ink,
        )
    }
}

/** A row of equal-width pills where exactly one is selected. */
@Composable
fun <T> PillRow(options: List<T>, selected: T, label: (T) -> String, onSelect: (T) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { o -> PillButton(label(o), o == selected, Modifier.weight(1f)) { onSelect(o) } }
    }
}

@Composable
fun Toggle(on: Boolean, label: String, onChange: (Boolean) -> Unit) {
    Box(
        Modifier.size(52.dp, 32.dp).clip(RoundedCornerShape(16.dp))
            .background(if (on) Pw.Green else Color(0xFFB9C3BC))
            .clickable(role = Role.Switch, onClickLabel = label) { onChange(!on) }
            .padding(3.dp),
        contentAlignment = if (on) Alignment.CenterStart else Alignment.CenterEnd,
    ) { Box(Modifier.size(26.dp).clip(CircleShape).background(Color.White)) }
}

@Composable
fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier.clip(RoundedCornerShape(18.dp)).background(Pw.Card).padding(horizontal = 14.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        Text(label, fontSize = 12.sp, color = Pw.Muted)
        Text(value, fontSize = 19.sp, fontWeight = FontWeight.SemiBold, color = Pw.Ink)
    }
}
