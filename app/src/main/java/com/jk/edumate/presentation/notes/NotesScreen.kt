package com.jk.edumate.presentation.notes

import android.Manifest
import android.R.attr.onClick
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jk.edumate.R
import com.jk.edumate.presentation.util.parseMarkdown

@Composable
fun NotesScreen(
    state: NotesState,
    onAction: (NotesAction) -> Unit,
    modifier: Modifier = Modifier
) {

    val context = LocalContext.current

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
        onResult = { uri ->
            uri?.let {
                onAction(NotesAction.UpdateSelectedFile(it))
            }
        }
    )

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if(isGranted) {
                filePickerLauncher.launch(
                    arrayOf("application/pdf","application/msword","text/plain")
                )
            } else {
                Toast.makeText(context, "Permission denied", Toast.LENGTH_SHORT).show()
            }
        }
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        if(state.selectedFile == null) {

            FileSelectionSection(
                textFieldValue = state.textFieldValue,
                onClick = { permissionLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE) },
                onAction = onAction
            )
        }
        else {
            if(state.isLoading) {
                CircularProgressIndicator()
                Spacer(Modifier.height(8.dp))
                Text("Processing...", color = Color.White)
            } else if(state.isSuccess) {

                ResponseSection(
                    response = state.generatedNotes!!,
                    onClick = { onAction(NotesAction.UpdateSelectedFile(null)) }
                )
            } else { // isError
                Text("Error processing your data", color = Color.White)
            }
        }
    }
}

@Composable
fun FileSelectionSection(
    textFieldValue: String,
    onClick: () -> Unit,
    onAction: (NotesAction) -> Unit,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(R.drawable.outline_notes),
            contentDescription = "Notes",
            modifier = Modifier.size(100.dp),
            tint = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "AI Notes Generator",
            style = MaterialTheme.typography.headlineSmall,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Upload notes or paste text for AI enhancement",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(32.dp))

        TextField(
            value = textFieldValue,
            onValueChange = { onAction(NotesAction.UpdateTextFieldValue(it))},
            placeholder = { Text("Type something") }
        )

        Spacer(Modifier.height(30.dp))

        Button(onClick = {onAction(NotesAction.OnGenerateFromText)}) {
            Text("Generate")
        }

        Spacer(Modifier.height(30.dp))

        // Upload box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .border(
                    width = 1.dp,
                    color = Color.Gray,
                    shape = RoundedCornerShape(12.dp)
                )
                .background(Color(0xFF1C1C1E), shape = RoundedCornerShape(12.dp))
                .clickable {onClick()},
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Upload",
                    modifier = Modifier.size(40.dp),
                    tint = Color.Gray
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text("Drop your file here", color = Color.Gray)

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Supports PDF, DOCX, and TXT files",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

}

@Composable
fun ResponseSection(
    response: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .padding(10.dp)
    ) {

        LazyColumn {
            item {
                Text(
                    text = parseMarkdown(response),
                    color = Color.White,
                    modifier = Modifier
                        .padding(bottom = 10.dp)
                )
            }
        }

        Button(onClick = onClick, modifier = Modifier
            .fillMaxWidth()
            .align(Alignment.BottomCenter)) {
            Text("Close")
        }

    }
}

