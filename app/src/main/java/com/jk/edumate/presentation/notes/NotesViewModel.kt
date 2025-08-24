package com.jk.edumate.presentation.notes

import android.app.Application
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.parser.PdfTextExtractor
import com.jk.edumate.BuildConfig
import com.jk.edumate.presentation.util.Constants
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class NotesViewModel(
    private val context: Application
): ViewModel() {

    private val _state = MutableStateFlow(NotesState())
    val state = _state.asStateFlow()

    val aiModel = GenerativeModel(
        modelName = "gemini-2.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    val initialisingMessage = Constants.NOTE_GENERATOR_INITIALISING_MESSAGE

    fun onAction(action: NotesAction) {
        when(action) {
            is NotesAction.UpdateSelectedFile -> {

                if(action.uri == null) {
                    _state.update { it.copy(selectedFile = action.uri, isLoading = false) }
                }
                else {
                    _state.update { it.copy(selectedFile = action.uri, isLoading = true) }

                    val text = extractTextFromPdf(context = context,action.uri!!)

                    viewModelScope.launch {
                        val response = aiModel.startChat().sendMessage(initialisingMessage + text).text ?: "Error"

                        _state.update { it.copy(
                            selectedFile = action.uri,
                            isLoading = false,
                            isSuccess = true,
                            generatedNotes = response
                        ) }
                    }
                }
            }

            is NotesAction.UpdateTextFieldValue -> {
                _state.update { it.copy(textFieldValue = action.value) }
            }

            NotesAction.OnGenerateFromText -> {
                val text = state.value.textFieldValue

                if(text.isNotEmpty()) {

                    _state.update { it.copy(selectedFile = Uri.EMPTY, isLoading = true) }

                    viewModelScope.launch {
                        val response = aiModel.startChat().sendMessage(initialisingMessage + text).text ?: "Error"

                        _state.update { it.copy(
                            selectedFile = Uri.EMPTY,
                            isLoading = false,
                            isSuccess = true,
                            generatedNotes = response
                        ) }
                    }
                }
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

}