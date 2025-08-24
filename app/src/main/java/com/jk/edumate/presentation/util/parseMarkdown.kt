package com.jk.edumate.presentation.util

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

fun parseMarkdown(input: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    val lines = input.lines()

    lines.forEachIndexed { index, line ->
        when {
            // Heading detection
            line.startsWith("# ") -> {
                builder.pushStyle(
                    SpanStyle(
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                )
                builder.append(line.removePrefix("# "))
                builder.pop()
            }

            else -> {
                var i = 0
                while (i < line.length) {
                    if (i + 1 < line.length && line[i] == '*' && line[i + 1] == '*') {
                        i += 2
                        val start = i
                        while (i + 1 < line.length && !(line[i] == '*' && line[i + 1] == '*')) {
                            i++
                        }
                        val boldText = line.substring(start, i)
                        builder.pushStyle(SpanStyle(fontWeight = FontWeight.Bold))
                        builder.append(boldText)
                        builder.pop()
                        i += 2
                    } else {
                        builder.append(line[i])
                        i++
                    }
                }
            }
        }

        if (index != lines.lastIndex) {
            builder.append("\n")
        }
    }

    return builder.toAnnotatedString()
}