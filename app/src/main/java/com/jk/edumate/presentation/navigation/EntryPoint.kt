package com.jk.edumate.presentation.navigation

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.jk.edumate.presentation.theme.EduMateTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EntryPoint() {

    val navController = rememberNavController()
    val navBackStackEntry = navController.currentBackStackEntryAsState().value
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = when {
        currentRoute == null -> false
        currentRoute.contains("Login") -> false
        else -> true
    }

    EduMateTheme {
        Scaffold(
            containerColor = Color.Black,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = currentRoute?.substringAfterLast(".") ?: "",
                            color = Color.White
                        )
                    }
                )
            },
            bottomBar = {
                BottomBar(
                    currentRoute = currentRoute,
                    onClick = { navController.navigate(it) { popUpTo(0) } },
                    showBottomBar = showBottomBar
                )
            }
        ) { innerpadding ->
            NavGraph(
                navController = navController,
                paddingValues = innerpadding
            )
        }
    }

}