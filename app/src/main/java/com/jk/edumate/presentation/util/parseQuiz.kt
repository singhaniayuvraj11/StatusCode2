package com.jk.edumate.presentation.util

import com.jk.edumate.domain.model.Question
import com.jk.edumate.domain.model.Quiz
import org.json.JSONObject

fun cleanJsonString(raw: String): String {
    return raw
        .replace("```json", "")
        .replace("```", "")
        .trim()
}

fun parseQuizJson(jsonString: String): Quiz {
    val cleaned = cleanJsonString(jsonString)
    val root = JSONObject(cleaned)
    val questionsJson = root.getJSONArray("questions")
    val questions = mutableListOf<Question>()

    for (i in 0 until questionsJson.length()) {
        val qObj = questionsJson.getJSONObject(i)
        val question = qObj.getString("question")
        val optionsJson = qObj.getJSONArray("options")
        val options = mutableListOf<String>()
        for (j in 0 until optionsJson.length()) {
            options.add(optionsJson.getString(j))
        }
        val answer = qObj.getString("answer")
        questions.add(Question(question, options, answer))
    }

    return Quiz(questions)
}