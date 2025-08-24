package com.jk.edumate.presentation.quiz

import android.net.Uri
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.snapshots.SnapshotStateMap
import com.jk.edumate.domain.model.Quiz

data class QuizState(
    val textFieldValue: String = "",
    val difficulty: String = "easy",
    val questionType: String = "mixed",
    val questionCount: Int = 5,
    val selectedFile: Uri? = null,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isError: Boolean = false,
    val generatedQuiz: Quiz? = null,
    val selectedAnswers: SnapshotStateMap<Int, String> = mutableStateMapOf(),
    val score: Int = 0
)