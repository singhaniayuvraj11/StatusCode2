package com.jk.edumate.presentation.navigation

import androidx.annotation.Keep
import kotlinx.serialization.Serializable

sealed interface Route {

    @Keep
    @Serializable
    data object Login: Route

    @Keep
    @Serializable
    data object Notes: Route

    @Keep
    @Serializable
    data object Quiz: Route

    @Keep
    @Serializable
    data object Resume: Route
}