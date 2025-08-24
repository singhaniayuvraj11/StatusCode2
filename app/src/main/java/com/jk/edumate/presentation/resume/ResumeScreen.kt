package com.jk.edumate.presentation.resume

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.net.toUri

@Composable
fun ResumeScreen(
    backHandler: () -> Unit,
    modifier: Modifier = Modifier
) {

    val context = LocalContext.current

    val url = "https://scholar-ai-resume-builder.vercel.app/"

    backHandler()

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .fillMaxSize()
    ) {

        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = url.toUri()
        }

        context.startActivity(intent)

    }

}