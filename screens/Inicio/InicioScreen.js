"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

const { width, height } = Dimensions.get("window")

const WelcomeScreen = ({ navigation }) => {
  // Animaciones para contenido
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [scaleAnim] = useState(new Animated.Value(0.9))

  // Estado para la imagen de fondo
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // Imágenes de películas populares para el carrusel de fondo
  const backgroundImages = [
    "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", // Imagen de película popular
    "https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg", // Otra imagen de película
    "https://image.tmdb.org/t/p/original/6KErczPBROQty7QoIsaa6wJYXZi.jpg", // Otra imagen de película
  ]

  // Animación de entrada inicial
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Cambiar imagen de fondo cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Imagen de fondo simple */}
      <ImageBackground
        source={{ uri: backgroundImages[currentBgIndex] }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay con gradiente para mejorar legibilidad */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.88)", "rgba(0, 0, 0, 0.81)", "rgba(0,0,0,0.9)", "#000"]}
          style={styles.overlay}
        />

        {/* Elementos decorativos - círculos flotantes */}
        <View style={styles.decorativeElements}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Logo y contenido principal */}
        <View style={styles.contentWrapper}>
          {/* Logo animado */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={["#E91E63", "#9C27B0"]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="play" size={36} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.logoText}>MovieApp</Text>
          </Animated.View>

          {/* Contenido principal animado */}
          <Animated.View
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Movies & Series</Text>
            <Text style={styles.subtitle}>
              Stream and download the latest blockbusters, classics, and exclusive originals. Your perfect entertainment
              companion.
            </Text>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#E91E63", "#9C27B0"]}
                  style={styles.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.mainButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.8}
              >
                <BlurView intensity={30} tint="dark" style={styles.blurView}>
                  <Text style={styles.secondaryButtonText}>Sign In</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Texto legal */}
            <Text style={styles.legalText}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  decorativeElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  circle: {
    position: "absolute",
    borderRadius: 150,
    opacity: 0.07, // Círculos más transparentes
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: "#E91E63",
    top: -50,
    right: -50,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: "#9C27B0",
    bottom: height * 0.5,
    left: -100,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: "#E91E63",
    bottom: -30,
    right: 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    zIndex: 2,
  },
  logoContainer: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 12,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  mainContent: {
    marginBottom: 50,
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 50,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  mainButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 12,
    elevation: 5,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  mainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    width: 120,
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  legalText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    textAlign: "center",
  },
})

export default WelcomeScreen

