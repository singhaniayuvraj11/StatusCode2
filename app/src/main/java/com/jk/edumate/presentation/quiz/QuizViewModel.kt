package com.jk.edumate.presentation.quiz

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.parser.PdfTextExtractor
import com.jk.edumate.BuildConfig
import com.jk.edumate.presentation.util.Constants
import com.jk.edumate.presentation.util.cleanJsonString
import com.jk.edumate.presentation.util.parseQuizJson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class QuizViewModel(
    private val context: Application
): ViewModel() {

    private val _state = MutableStateFlow(QuizState())
    val state = _state.asStateFlow()

    val aiModel = GenerativeModel(
        modelName = "gemini-2.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    fun onAction(action: QuizAction) {
        when(action) {
            is QuizAction.UpdateSelectedFile -> {
                if(action.uri == null) {
                    _state.update { it.copy(selectedFile = action.uri, isLoading = false) }
                }
                else {

                    _state.update { it.copy(selectedFile = action.uri, isLoading = true) }

                    val text = extractTextFromPdf(context = context,action.uri)

                    val message = buildQuizPrompt(
                        notes = text,
                        difficulty = state.value.difficulty,
                        type = state.value.difficulty,
                        count = state.value.questionCount
                    )

                    viewModelScope.launch {
                        val response = aiModel.startChat().sendMessage(message).text ?: "Error"

                        _state.update { it.copy(
                            selectedFile = action.uri,
                            isLoading = false,
                            isSuccess = true,
                            generatedQuiz = parseQuizJson(response)
                        ) }
                    }
                }

            }
            is QuizAction.UpdateTextFieldValue -> {
                _state.update { it.copy(textFieldValue = action.value) }
            }
            is QuizAction.UpdateDifficulty -> {
                _state.update { it.copy(difficulty = action.difficulty) }
            }
            is QuizAction.UpdateQuestionType -> {
                _state.update { it.copy(questionType = action.questionType) }
            }
            is QuizAction.UpdateQuestionCount -> {
                _state.update { it.copy(questionCount = action.questionCount) }
            }


            QuizAction.OnGenerateFromText -> {
                val text = state.value.textFieldValue

                if(text.isNotEmpty()) {

                    _state.update { it.copy(selectedFile = Uri.EMPTY, isLoading = true) }

                    val text = state.value.textFieldValue

                    val message = buildQuizPrompt(
                        notes = text,
                        difficulty = state.value.difficulty,
                        type = state.value.difficulty,
                        count = state.value.questionCount
                    )

                    viewModelScope.launch {
                        val response = aiModel.startChat().sendMessage(message).text ?: "Error"

                        _state.update { it.copy(
                            selectedFile = Uri.EMPTY,
                            isLoading = false,
                            isSuccess = true,
                            generatedQuiz = parseQuizJson(response)
                        ) }
                    }
                }
            }

            is QuizAction.SelectAnswer -> {
                state.value.selectedAnswers[action.questionIndex] = action.answer
            }
            QuizAction.SubmitQuiz -> {
                val quiz = _state.value.generatedQuiz ?: return
                val score = quiz.questions.indices.count { i ->
                    val q = quiz.questions[i]
                    val correctIdx = resolveCorrectIndex(q.options, q.answer)
                    val selected = state.value.selectedAnswers[i]
                    val pickedIdx = q.options.indexOf(selected)

                    when {
                        correctIdx != -1  -> pickedIdx == correctIdx
                        else              -> normalize(selected ?: "") == normalize(q.answer)
                    }
                }
                _state.update { it.copy(score = score) }
            }
        }
    }

    fun extractTextFromPdf(context: Context, uri: Uri): String {
        val inputStream = context.contentResolver.openInputStream(uri)
        val pdfReader = PdfReader(inputStream)
        val n = pdfReader.numberOfPages

        val sb = StringBuilder()
        for (i in 1..n) {
            sb.append(PdfTextExtractor.getTextFromPage(pdfReader, i).trim()).append("\n")
        }
        pdfReader.close()
        return sb.toString()
    }

    fun buildQuizPrompt(notes: String, difficulty: String, type: String, count: Int): String {
        return """
        Generate a quiz from the following notes:
        $notes

        Requirements:
        - Difficulty: $difficulty
        - Question Type: $type
        - Number of Questions: $count

        Format the response as **pure JSON** like this:
        {
          "questions": [
            {
              "question": "What is ...?",
              "options": ["A", "B", "C", "D"],
              "answer": "B"
            }
          ]
        }
    """.trimIndent()
    }

}