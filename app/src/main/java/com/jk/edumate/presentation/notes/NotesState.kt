package com.jk.edumate.presentation.notes

import android.net.Uri

data class NotesState(
    val textFieldValue: String = "",
    val selectedFile: Uri? = null,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isError: Boolean = false,
    val generatedNotes: String? = null
)