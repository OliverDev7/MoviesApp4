"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"

export default function EmailVerificationScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const auth = getAuth()
  const db = getFirestore()

  // Validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Verificar si el email existe en la base de datos
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", email))
      const querySnapshot = await getDocs(q)

      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking email existence:", error)
      return false
    }
  }

  const handleResetPassword = async () => {
    // Limpiar error previo
    setError("")

    // Validar que se ingresó un email
    if (!email.trim()) {
      setError("Por favor, ingresa tu dirección de email")
      return
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      setError("Por favor, ingresa una dirección de email válida")
      return
    }

    setLoading(true)

    try {
      // Verificar si el email existe en la base de datos
      const emailExists = await checkEmailExists(email)

      if (!emailExists) {
        setError("No encontramos ninguna cuenta con este email")
        setLoading(false)
        return
      }

      // Enviar email de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, email)

      // Mostrar mensaje de éxito
      Alert.alert("Correo de verificación enviado", "Por favor, revisa tu bandeja de entrada.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ])
    } catch (error) {
      console.error("Error sending password reset email:", error)

      // Mensajes de error personalizados
      switch (error.code) {
        case "auth/invalid-email":
          setError("El formato del email no es válido")
          break
        case "auth/user-not-found":
          // No mostramos este error específico por seguridad
          setError("Si tu email está registrado, recibirás un correo de restablecimiento")
          break
        case "auth/too-many-requests":
          setError("Demasiadas solicitudes. Por favor, intenta más tarde")
          break
        case "auth/network-request-failed":
          setError("Problema de conexión. Verifica tu conexión a internet")
          break
        default:
          setError("No pudimos enviar el email. Por favor, intenta de nuevo más tarde")
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

          <View style={styles.contentContainer}>
            <Ionicons name="lock-open" size={80} color="#E91E63" style={styles.icon} />

            <Text style={styles.title}>Restablecer Contraseña</Text>

            <Text style={styles.instructions}>Ingresa tu correo para restablecer la contraseña.</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#FF5252" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#E91E63" }]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Restablecer Contraseña</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLinkText}>Volver a Iniciar Sesión</Text>
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 60,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 25,
  },
  input: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FFFFFF",
    width: "100%",
  },
  button: {
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 15,
    padding: 10,
  },
  loginLinkText: {
    color: "#E91E63",
    fontSize: 16,
    fontWeight: "bold",
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
    width: "100%",
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

