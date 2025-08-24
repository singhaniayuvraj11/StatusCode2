package com.jk.edumate.presentation.navigation

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.google.firebase.auth.FirebaseAuth
import com.jk.edumate.presentation.notes.NotesScreen
import com.jk.edumate.presentation.login.LoginScreen
import com.jk.edumate.presentation.login.LoginViewModel
import com.jk.edumate.presentation.notes.NotesViewModel
import com.jk.edumate.presentation.quiz.QuizScreen
import com.jk.edumate.presentation.quiz.QuizState
import com.jk.edumate.presentation.quiz.QuizViewModel
import com.jk.edumate.presentation.resume.ResumeScreen
import org.koin.androidx.compose.koinViewModel

@Composable
fun NavGraph(
    navController: NavHostController,
    paddingValues: PaddingValues,
    loginViewModel: LoginViewModel = koinViewModel(),
    notesViewModel: NotesViewModel = koinViewModel(),
    quizViewModel: QuizViewModel = koinViewModel()
) {

    val context = LocalContext.current

    val user = FirebaseAuth.getInstance().currentUser

    val start =
        if (user != null) {
            Route.Notes
        } else Route.Login

    NavHost(
        navController = navController,
        startDestination = start,
        enterTransition = { fadeIn() },
        exitTransition = { fadeOut() },
        popEnterTransition = { fadeIn() },
        popExitTransition = { fadeOut() }
    ) {

        composable<Route.Login> {

            LoginScreen(
                onClick = {
                    loginViewModel.handleGoogleSignIn(
                        context = context,
                        navigateToHome = {
                            navController.navigate(Route.Notes) {
                                popUpTo(Route.Login) { inclusive = true }
                            }
                        }
                    )
                },
                modifier = Modifier.padding(paddingValues)
            )
        }

        composable<Route.Notes> {

            val state = notesViewModel.state.collectAsStateWithLifecycle().value

            NotesScreen(
                state = state,
                onAction = notesViewModel::onAction,
                modifier = Modifier.padding(paddingValues)
            )
        }

        composable<Route.Quiz> {

            val state = quizViewModel.state.collectAsStateWithLifecycle().value

            QuizScreen(
                state = state,
                onAction = quizViewModel::onAction,
                modifier = Modifier.padding(paddingValues)
            )
        }

        composable<Route.Resume> {
            ResumeScreen(
                backHandler = {navController.navigate(Route.Notes)},
                modifier = Modifier.padding(paddingValues)
            )
        }
    }

}