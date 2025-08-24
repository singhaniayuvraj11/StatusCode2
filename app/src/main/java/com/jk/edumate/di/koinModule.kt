package com.jk.edumate.di

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.jk.edumate.presentation.login.LoginViewModel
import com.jk.edumate.presentation.notes.NotesViewModel
import com.jk.edumate.presentation.quiz.QuizViewModel
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module

val koinModule = module {
    single { FirebaseAuth.getInstance() }
    single { FirebaseFirestore.getInstance() }

    viewModelOf(::LoginViewModel)
    viewModelOf(::NotesViewModel)
    viewModelOf(::QuizViewModel)
}