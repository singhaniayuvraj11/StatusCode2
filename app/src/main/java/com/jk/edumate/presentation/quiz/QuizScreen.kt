package com.jk.edumate.presentation.quiz

import android.Manifest
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jk.edumate.R
import com.jk.edumate.domain.model.Quiz
import com.jk.edumate.presentation.notes.NotesAction

@Composable
fun QuizScreen(
    state: QuizState,
    onAction: (QuizAction) -> Unit,
    modifier: Modifier = Modifier
) {

    val context = LocalContext.current

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
        onResult = { uri ->
            uri?.let {
                onAction(QuizAction.UpdateSelectedFile(it))
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
                state = state,
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
                    response = state.generatedQuiz!!,
                    state = state,
                    onAction = onAction
                )
            } else { // isError
                Text("Error processing your data", color = Color.White)
            }
        }
    }
}

@Composable
fun FileSelectionSection(
    state: QuizState,
    onClick: () -> Unit,
    onAction: (QuizAction) -> Unit,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier.verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(R.drawable.outline_quiz),
            contentDescription = "Quiz",
            modifier = Modifier.size(100.dp),
            tint = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "AI Quiz Generator",
            style = MaterialTheme.typography.headlineSmall,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Generate AI Quiz",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(32.dp))

        QuizOptions(
            state = state,
            onAction = onAction
        )

        Spacer(modifier = Modifier.height(32.dp))

        TextField(
            value = state.textFieldValue,
            onValueChange = { onAction(QuizAction.UpdateTextFieldValue(it))},
            placeholder = { Text("Type something") }
        )

        Spacer(Modifier.height(30.dp))

        Button(onClick = {onAction(QuizAction.OnGenerateFromText)}) {
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
                .clickable {
                    onClick()
                },
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
fun QuizOptions(
    state: QuizState,
    onAction: (QuizAction) -> Unit
) {

    var isDifficultyMenuOpen by remember { mutableStateOf(false) }
    var isCountMenuOpen by remember { mutableStateOf(false) }

    Column {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .width(300.dp)
                .align(Alignment.CenterHorizontally)
                .clip(RoundedCornerShape(10.dp))
                .background(Color.White.copy(0.2f))
                .padding(horizontal = 10.dp)
        ) {
            Text(
                text = "Difficulty",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.White
            )

            Box {

                SuggestionChip(
                    onClick = { isDifficultyMenuOpen = !isDifficultyMenuOpen },
                    label = { Text(
                        text = state.difficulty,
                        style = MaterialTheme.typography.bodyLarge
                    ) }
                )

                DropdownMenu(
                    expanded = isDifficultyMenuOpen,
                    onDismissRequest = { isDifficultyMenuOpen = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Easy") },
                        onClick = {
                            onAction(QuizAction.UpdateDifficulty("Easy"))
                            isDifficultyMenuOpen = false
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Medium") },
                        onClick = {
                            onAction(QuizAction.UpdateDifficulty("Medium"))
                            isDifficultyMenuOpen = false
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("Hard") },
                        onClick = {
                            onAction(QuizAction.UpdateDifficulty("Hard"))
                            isDifficultyMenuOpen = false
                        }
                    )
                }
            }

        }

        Spacer(Modifier.height(10.dp))


        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .width(300.dp)
                .align(Alignment.CenterHorizontally)
                .clip(RoundedCornerShape(10.dp))
                .background(Color.White.copy(0.2f))
                .padding(horizontal = 10.dp)
        ) {
            Text(
                text = "Count",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.White
            )

            Box {

                SuggestionChip(
                    onClick = { isCountMenuOpen = !isCountMenuOpen },
                    label = { Text(
                        text = "${state.questionCount}",
                        style = MaterialTheme.typography.bodyLarge
                    ) }
                )

                DropdownMenu(
                    expanded = isCountMenuOpen,
                    onDismissRequest = { isCountMenuOpen = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("5") },
                        onClick = {
                            onAction(QuizAction.UpdateQuestionCount(5))
                            isCountMenuOpen = false
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("10") },
                        onClick = {
                            onAction(QuizAction.UpdateQuestionCount(10))
                            isCountMenuOpen = false
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("15") },
                        onClick = {
                            onAction(QuizAction.UpdateQuestionCount(15))
                            isCountMenuOpen = false
                        }
                    )

                    DropdownMenuItem(
                        text = { Text("20") },
                        onClick = {
                            onAction(QuizAction.UpdateQuestionCount(20))
                            isCountMenuOpen = false
                        }
                    )
                }
            }

        }
    }
}


@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ResponseSection(
    response: Quiz,
    state: QuizState,
    onAction: (QuizAction) -> Unit,
    modifier: Modifier = Modifier
) {
    var isSubmitted by remember { mutableStateOf(false) }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 120.dp)
        ) {
            itemsIndexed(response.questions) { ind, q ->
                val correctIndex = remember(q) { resolveCorrectIndex(q.options, q.answer) }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                ) {
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Top
                    ) {
                        Text(
                            text = "${ind + 1}. ${q.question}",
                            style = MaterialTheme.typography.titleMedium
                        )

                        Spacer(Modifier.height(16.dp))

                        q.options.forEachIndexed { optIdx, option ->
                            val isSelected = state.selectedAnswers[ind] == option
                            val isCorrectOption =
                                (correctIndex != -1 && optIdx == correctIndex) ||
                                        option.trim().equals(q.answer.trim(), ignoreCase = true)

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                            ) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = {
                                        if (!isSubmitted) {
                                            onAction(QuizAction.SelectAnswer(ind, option))
                                        }
                                    },
                                    enabled = !isSubmitted
                                )

                                Text(
                                    text = option,
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(start = 8.dp)
                                )

                                if (isSubmitted) {
                                    when {
                                        isCorrectOption -> Text("✓", color = MaterialTheme.colorScheme.primary)
                                        isSelected && !isCorrectOption -> Text("✗", color = MaterialTheme.colorScheme.error)
                                    }
                                }
                            }
                        }

                        if (isSubmitted) {
                            val selected = state.selectedAnswers[ind]
                            val pickedIdx = q.options.indexOf(selected)
                            val correctLabel =
                                if (correctIndex in q.options.indices) q.options[correctIndex] else q.answer

                            if (pickedIdx != correctIndex) {
                                Spacer(Modifier.height(12.dp))
                                Text(
                                    text = "Correct answer: $correctLabel",
                                    color = MaterialTheme.colorScheme.primary,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        }

        Column(
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            Button(
                onClick = {
                    if (!isSubmitted) {
                        onAction(QuizAction.SubmitQuiz)
                        isSubmitted = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(5.dp)
            ) {
                Text(
                    if (isSubmitted)
                        "Score: ${state.score}/${response.questions.size}"
                    else "Submit Quiz"
                )
            }

            Button(
                onClick = {
                    onAction(QuizAction.UpdateSelectedFile(null))
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(5.dp)
            ) {
                Text("Close")
            }
        }
    }
}


// --- helpers (keep in same file) ---
fun normalize(s: String) =
    s.trim().lowercase().replace(Regex("[^\\p{Alnum}]"), "")

fun resolveCorrectIndex(options: List<String>, answer: String): Int {
    // 1) exact (trim/case-insensitive)
    var idx = options.indexOfFirst { it.trim().equals(answer.trim(), ignoreCase = true) }
    if (idx != -1) return idx

    // 2) letter based: "A", "B", "C", "D", including "(A)", "A.", "option A"
    Regex("(?i)^(?:option\\s+)?\\(?([ABCD])\\)?[\\.)]?$")
        .find(answer.trim())
        ?.groupValues?.get(1)?.lowercase()?.let { letter ->
            return "abcd".indexOf(letter)
        }

    // 3) normalized text match (strip punctuation/spaces)
    val ansNorm = normalize(answer)
    idx = options.indexOfFirst { normalize(it) == ansNorm }
    return idx // may be -1 (fallback handled in UI)
}

