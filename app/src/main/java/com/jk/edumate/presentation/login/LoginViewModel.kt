package com.jk.edumate.presentation.login

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.widget.Toast
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.AuthResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.jk.edumate.domain.model.User
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import com.jk.edumate.R

class LoginViewModel: ViewModel() {

    val user = MutableLiveData<User>(null)

    fun handleGoogleSignIn(
        context: Context,
        navigateToHome : () -> Unit
    ) {
        viewModelScope.launch {
            googleSignIn(context).collect { result ->
                result.fold(
                    onSuccess = { authResult ->
                        val currentUser = authResult.user

                        if(currentUser != null) {
                            user.value = User(
                                id = currentUser.uid,
                                name = currentUser.displayName!!,
                                imageUrl = currentUser.photoUrl.toString(),
                                email = currentUser.email!!
                            )

//                            insertUser()

                            Toast.makeText(context,"Logged In", Toast.LENGTH_SHORT).show()
                            navigateToHome()
                        }
                    },
                    onFailure = {

                        try {
                            context.startActivity(Intent(Settings.ACTION_ADD_ACCOUNT).apply {
                                putExtra(Settings.EXTRA_ACCOUNT_TYPES, arrayOf("com.google"))
                            })
                        } catch (e : Exception) {
                            Toast.makeText(context,"Something went wrong : ${it.message}", Toast.LENGTH_LONG).show()
                        }
                    }
                )
            }
        }
    }

    private fun googleSignIn(context: Context) : Flow<Result<AuthResult>> {

        val firebaseAuth = FirebaseAuth.getInstance()

        return callbackFlow {
            try {
                val credentialManager = CredentialManager.create(context)

                credentialManager.clearCredentialState(request = ClearCredentialStateRequest())

                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setAutoSelectEnabled(false)
                    .setServerClientId(context.getString(R.string.web_client_id))
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(context,request)
                val credential = result.credential

                if(credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {

                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

                    val authCredential = GoogleAuthProvider.getCredential(googleIdTokenCredential.idToken, null)

                    val authResult = firebaseAuth.signInWithCredential(authCredential).await()

                    trySend(Result.success(authResult))
                } else {
                    throw RuntimeException("Received an invalid credential type")
                }
            } catch (e : GetCredentialCancellationException) {
                trySend(Result.failure(Exception("Sign-in was cancelled")))
            } catch (e : Exception) {
                trySend(Result.failure(e))
            }

            awaitClose {  }
        }
    }

//    fun insertUser() {
//        viewModelScope.launch {
//            repository.insertUser()
//        }
//    }

}