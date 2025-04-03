"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../../context/ThemeContext"
import { registerWithEmailAndPassword, loginWithSocialProvider } from "../../firebase/firebase"
import * as Google from "expo-auth-session/providers/google"
import * as Facebook from "expo-auth-session/providers/facebook"
import * as WebBrowser from "expo-web-browser"
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"

WebBrowser.maybeCompleteAuthSession()

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      handleSocialSignup(credential)
    }
  }, [googleResponse])

  // Manejar respuesta de Facebook
  useEffect(() => {
    if (fbResponse?.type === "success") {
      const { access_token } = fbResponse.params
      const credential = FacebookAuthProvider.credential(access_token)
      handleSocialSignup(credential)
    }
  }, [fbResponse])

  // Función para manejar el registro con Twitter/X
  const handleTwitterSignup = async () => {
    try {
      setLoading(true)
      setError("")

      // Aquí normalmente usarías una biblioteca como expo-auth-session para Twitter
      // Pero como es más complejo, mostramos un mensaje de que está en desarrollo
      Alert.alert("Twitter/X Signup", "Twitter/X signup is currently in development. Please use another method.", [
        { text: "OK" },
      ])
    } catch (error) {
      console.error("Twitter signup error:", error)
      setError("Error with Twitter signup. Please try another method.")
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el registro con credenciales sociales
  const handleSocialSignup = async (credential) => {
    setLoading(true)
    setError("")

    try {
      await loginWithSocialProvider(credential)
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      })
    } catch (error) {
      console.error("Social signup error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el registro con email y contraseña
  const handleRegister = async () => {
    // Validaciones mejoradas
    if (!name.trim()) {
      setError("Por favor, ingresa tu nombre completo")
      return
    }

    if (!email.trim()) {
      setError("Por favor, ingresa tu dirección de email")
      return
    }

    if (!password) {
      setError("Por favor, crea una contraseña")
      return
    }

    if (!confirmPassword) {
      setError("Por favor, confirma tu contraseña")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor, verifica e intenta de nuevo")
      return
    }

    if (password.length < 6) {
      setError("Tu contraseña debe tener al menos 6 caracteres para mayor seguridad")
      return
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa una dirección de email válida")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Registrar usuario con email y contraseña
      await registerWithEmailAndPassword(email, password, name)

      // Mostrar alerta de verificación de email y redirigir al login
      Alert.alert(
        "Verificación de Email",
        "Te hemos enviado un correo de verificación. Por favor, verifica tu email antes de continuar usando la aplicación.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }],
      )
    } catch (error) {
      console.error("Registration error:", error)

      // Mostrar mensaje de error más amigable
      if (error.code === "auth/email-already-in-use") {
        setError("Este email ya está en uso. Intenta iniciar sesión.")
      } else if (error.code === "auth/invalid-email") {
        setError("El formato del email no es válido.")
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={["#121212", "#1E1E1E"]} style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            {/*<Image source={require("../../assets/fondo_login.jpg")} style={styles.logo} resizeMode="contain" />*/}
          </View>

          <Text style={styles.title}>Crear Cuenta</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF5252" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF" }]}
              placeholder="Nombre completo"
              placeholderTextColor="#999999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF" }]}
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
              style={[styles.input, { backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF" }]}
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

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#FFFFFF" }]}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#E91E63" }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Registrarse</Text>}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  loginLink: {
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

