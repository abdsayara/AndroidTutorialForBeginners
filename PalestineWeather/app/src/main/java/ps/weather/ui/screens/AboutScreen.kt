package ps.weather.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ps.weather.R
import ps.weather.ui.components.ScreenHeader
import ps.weather.ui.theme.Pw

private const val FACEBOOK = "https://www.facebook.com/share/1Ju1vF2hbD/"
private const val WHATSAPP = "https://wa.me/970569104040"
private const val WATAN_FACEBOOK = "https://www.facebook.com/share/1CU1Tt9VAc/"

private fun open(context: Context, url: String) {
    runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
}

/** The small line under the More menu: who builds the app; opens the about page. */
@Composable
fun DeveloperLine(onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color.White.copy(alpha = 0.10f))
            .clickable(role = Role.Button, onClick = onClick).padding(14.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
    ) {
        Image(painterResource(R.drawable.nexera), null, Modifier.size(34.dp).clip(RoundedCornerShape(9.dp)).background(Color.White))
        Text("تطوير NexEra · حلول الذكاء الاصطناعي والتدريب", fontSize = 14.sp)
    }
}

/** About the app, and the company that builds it: its page on Facebook and its WhatsApp number. */
@Composable
fun AboutScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val version = remember { runCatching { context.packageManager.getPackageInfo(context.packageName, 0).versionName }.getOrNull() ?: "1.0" }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { ScreenHeader("عن التطبيق", null, onBack) }
        item {
            AboutCard {
                Image(painterResource(R.drawable.logo), null, Modifier.width(96.dp).height(73.dp))
                Text("طقس الوطن", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("الإصدار $version", fontSize = 13.sp, color = Pw.Muted)
                Text(
                    "طقس كل مدينة وقرية في فلسطين: توقعات 14 يوماً، صور الأقمار، أحوال الطرق، وتنبيهات المطر والصقيع.",
                    fontSize = 15.sp, lineHeight = 26.sp, textAlign = TextAlign.Center,
                )
                AboutButton("صفحة طقس الوطن على فيسبوك", Pw.Link, Color(0xFF17324A)) { open(context, WATAN_FACEBOOK) }
            }
        }
        item {
            AboutCard {
                Text("الشركة المطوّرة", fontSize = 13.sp, color = Pw.Muted)
                Image(painterResource(R.drawable.nexera), "NexEra", Modifier.size(150.dp).clip(RoundedCornerShape(26.dp)).background(Color.White))
                Text("NexEra", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("حلول الذكاء الاصطناعي والتدريب", fontSize = 15.sp)
                AboutButton("صفحتنا على فيسبوك", Pw.Link, Color(0xFF17324A)) { open(context, FACEBOOK) }
                AboutButton("اتصل بنا على واتساب", Color.White.copy(alpha = 0.16f), Color.White) { open(context, WHATSAPP) }
            }
        }
    }
}

@Composable
private fun AboutCard(content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Pw.Card).padding(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp),
    ) { content() }
}

@Composable
private fun AboutButton(label: String, background: Color, ink: Color, onClick: () -> Unit) {
    Box(
        Modifier.fillMaxWidth().heightIn(min = 48.dp).clip(RoundedCornerShape(14.dp)).background(background)
            .clickable(role = Role.Button, onClick = onClick).padding(horizontal = 12.dp),
        contentAlignment = Alignment.Center,
    ) { Text(label, color = ink, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, textAlign = TextAlign.Center) }
}
