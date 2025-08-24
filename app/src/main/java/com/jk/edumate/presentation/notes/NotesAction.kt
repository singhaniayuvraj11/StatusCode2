package com.jk.edumate.presentation.notes

import android.net.Uri

sealed interface NotesAction {
    data class UpdateSelectedFile(val uri: Uri?): NotesAction
    data class UpdateTextFieldValue(val value : String): NotesAction
    object OnGenerateFromText: NotesAction
}