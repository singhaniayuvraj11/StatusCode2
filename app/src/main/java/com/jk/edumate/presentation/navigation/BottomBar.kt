package com.jk.edumate.presentation.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.size
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBarDefaults
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.dimensionResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.jk.edumate.presentation.theme.PrimaryBlue
import com.jk.edumate.R

@Composable
fun BottomBar(
    currentRoute: String?,
    onClick: (Route) -> Unit,
    showBottomBar: Boolean
) {

    val list = listOf<Route>(
        Route.Notes, Route.Quiz, Route.Resume
    )

    AnimatedVisibility(showBottomBar) {
        BottomAppBar {
            list.forEach {
                NavigationBarItem(
                    colors = NavigationBarItemDefaults.colors(
                        indicatorColor = PrimaryBlue
                    ),
                    selected = currentRoute?.contains(it::class.simpleName.toString()) == true,
                    onClick = {
                        if (currentRoute?.contains(it::class.simpleName.toString()) == false) {
                            onClick(it)
                        }
                    },
                    icon = {
                        when (it) {
                            Route.Notes -> {
                                Icon(
                                    painter = painterResource(R.drawable.outline_notes),
                                    contentDescription = null,
                                    tint = Color.White.copy(),
                                    modifier = Modifier.size(30.dp)
                                )
                            }

                            Route.Quiz -> {
                                Icon(
                                    painter = painterResource(R.drawable.outline_quiz),
                                    contentDescription = null,
                                    tint = Color.White.copy(),
                                    modifier = Modifier.size(30.dp)
                                )
                            }

                            Route.Resume -> {
                                Icon(
                                    painter = painterResource(R.drawable.outline_resume),
                                    contentDescription = null,
                                    tint = Color.White.copy(),
                                    modifier = Modifier.size(30.dp)
                                )
                            }

                            else -> {}
                        }
                    }
                )
            }
        }
    }

}