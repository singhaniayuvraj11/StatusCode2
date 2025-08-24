package com.jk.edumate.domain.model

data class Quiz(
    val questions: List<Question>
)

data class Question(
    val question: String,
    val options: List<String>,
    val answer: String
)