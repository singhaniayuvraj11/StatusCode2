package com.jk.edumate.presentation.quiz

import android.net.Uri

sealed interface QuizAction {
    data class UpdateTextFieldValue(val value: String): QuizAction
    data class UpdateDifficulty(val difficulty: String): QuizAction
    data class UpdateQuestionType(val questionType: String): QuizAction
    data class UpdateQuestionCount(val questionCount: Int): QuizAction
    data class UpdateSelectedFile(val uri: Uri?): QuizAction
    object OnGenerateFromText: QuizAction
    data class SelectAnswer(val questionIndex: Int, val answer: String) : QuizAction
    object SubmitQuiz : QuizAction
}