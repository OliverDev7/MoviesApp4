"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../../context/ThemeContext"
import {
  loginWithEmailAndPassword,
  loginWithSocialProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  auth,
} from "../../firebase/firebase"
import * as Google from "expo-auth-session/providers/google"
import * as Facebook from "expo-auth-session/providers/facebook"
import * as WebBrowser from "expo-web-browser"
import { GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword } from "firebase/auth"
import * as Localization from 'expo-localization';

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Configuración para autenticación con Google
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: "TU_GOOGLE_CLIENT_ID", // Reemplaza con tu ID de cliente de Google
    androidClientId: "TU_ANDROID_CLIENT_ID", // Si tienes uno específico para Android
    iosClientId: "TU_IOS_CLIENT_ID", // Si tienes uno específico para iOS
  })

  // Configuración para autenticación con Facebook
  const [fbRequest, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: "TU_FACEBOOK_APP_ID", // Reemplaza con tu ID de app de Facebook
  })

  // Manejar respuesta de Google
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params
      const credential = GoogleAuthProvider.credential(id_token)
      handleSocialLogin(credential)
    }
  }, [googleResponse])

  // Manejar respuesta de Facebook
  useEffect(() => {
    if (fbResponse?.type === "success") {
      const { access_token } = fbResponse.params
      const credential = FacebookAuthProvider.credential(access_token)
      handleSocialLogin(credential)
    }
  }, [fbResponse])

  // Función para manejar el inicio de sesión con Twitter/X
  const handleTwitterLogin = async () => {
    try {
      setLoading(true)
      setError("")

      // Aquí normalmente usarías una biblioteca como expo-auth-session para Twitter
      // Pero como es más complejo, mostramos un mensaje de que está en desarrollo
      Alert.alert("Twitter/X Login", "Twitter/X login is currently in development. Please use another method.", [
        { text: "OK" },
      ])
    } catch (error) {
      console.error("Twitter login error:", error)
      setError("Error with Twitter login. Please try another method.")
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el inicio de sesión con credenciales sociales
  const handleSocialLogin = async (credential) => {
    setLoading(true)
    setError("")

    try {
      await loginWithSocialProvider(credential)
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      })
    } catch (error) {
      console.error("Social login error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el inicio de sesión con email y contraseña
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa email y contraseña")
      return
    }

    setLoading(true)
    setError("")

    try {
      const user = await loginWithEmailAndPassword(email, password)

      // Verificar si el email está verificado
      if (!user.emailVerified) {
        setError("Por favor, verifica tu email antes de iniciar sesión")
        // Opcionalmente, ofrecer reenviar el email de verificación
        Alert.alert("Email no verificado", "¿Deseas que te enviemos un nuevo correo de verificación?", [
          { text: "No", style: "cancel" },
          {
            text: "Sí",
            onPress: async () => {
              try {
                await sendEmailVerification(auth.currentUser)
                Alert.alert("Email enviado", "Por favor, revisa tu bandeja de entrada")
              } catch (error) {
                console.error("Error sending verification email:", error)
                Alert.alert("Error", "No se pudo enviar el email de verificación")
              }
            },
          },
        ])
        setLoading(false)
        return
      }

      // Navegar a la pantalla principal
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      })
    } catch (error) {
      console.error("Login error:", error)

      switch (error.code) {
        case "auth/user-not-found":
          setError("No encontramos ninguna cuenta con este email. ¿Deseas registrarte?")
          break
        case "auth/wrong-password":
          setError("La contraseña ingresada es incorrecta. Inténtalo de nuevo")
          break
        case "auth/too-many-requests":
          setError("Demasiados intentos fallidos. Por favor, intenta más tarde o restablece tu contraseña")
          break
        case "auth/invalid-email":
          setError("El formato del email no es válido. Por favor, verifica e intenta de nuevo")
          break
        case "auth/user-disabled":
          setError("Esta cuenta ha sido desactivada. Contacta a soporte para más información")
          break
        case "auth/network-request-failed":
          setError("Problema de conexión. Verifica tu conexión a internet e intenta de nuevo")
          break
        case "auth/email-not-verified":
          // Ofrecer reenviar el email de verificación con un mensaje más amigable
          Alert.alert(
            "Verificación pendiente",
            "Necesitamos verificar tu email antes de que puedas iniciar sesión. ¿Deseas recibir un nuevo correo de verificación?",
            [
              { text: "No ahora", style: "cancel" },
              {
                text: "Enviar email",
                onPress: async () => {
                  try {
                    // Intentar iniciar sesión para obtener el usuario actual
                    const userCredential = await signInWithEmailAndPassword(auth, email, password)
                    await sendEmailVerification(userCredential.user)
                    Alert.alert(
                      "Email enviado",
                      "Hemos enviado un nuevo correo de verificación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones",
                    )
                  } catch (error) {
                    console.error("Error sending verification email:", error)
                    Alert.alert("No pudimos enviar el email", "Por favor, intenta de nuevo más tarde")
                  }
                },
              },
            ],
          )
          break
        default:
          setError("No pudimos iniciar sesión. Por favor, verifica tus datos e intenta de nuevo")
      }
    } finally {
      setLoading(false)
    }
  }

   // Función para manejar el olvido de contraseña
   const handleForgotPassword = () => {
    navigation.navigate("EmailVerificationScreen")
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={["#000", "#000"]} style={styles.container}>
          <View style={styles.logoContainer}>
            {/*<Image source={require("../../assets/fondo_login.jpg")} style={styles.logo} resizeMode="contain" />*/}
          </View>

          <Text style={styles.title}>Iniciar Sesión</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF5252" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: "rgba(54, 54, 54, 0.7)", color: "#FFFFFF" }]}
              placeholder="Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: "rgba(54, 54, 54, 0.7)", color: "#FFFFFF" }]}
              placeholder="Contraseña"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          

          <LinearGradient
  colors={['#E91E63', '#9C27B0']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.button}
>
  <TouchableOpacity
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    onPress={handleLogin}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.buttonText}>Iniciar Sesión</Text>
    )}
  </TouchableOpacity>
</LinearGradient>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  input: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#E91E63",
    fontSize: 14,
  },
  button: {
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "#FFFFFF",
    paddingHorizontal: 10,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  signupLink: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF5252",
    textAlign: "center",
    marginBottom: 15,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#FF5252",
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: "#FF5252",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
})

