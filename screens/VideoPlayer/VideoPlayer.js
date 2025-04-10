"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native"
import { Video } from "expo-av"
import { Ionicons, MaterialIcons, Feather, Entypo, MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import * as ScreenOrientation from "expo-screen-orientation"
import Slider from "@react-native-community/slider"
import { SafeAreaView } from "react-native-safe-area-context"

const { width, height } = Dimensions.get("window")

export default function VideoPlayerScreen({ route, navigation }) {
  // Extraer todos los parámetros posibles de la ruta
  const { movie, isEpisode = false, episode, season, seasonNumber, episodeNumber } = route.params || {}

  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showControls, setShowControls] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLandscape, setIsLandscape] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [audioLanguage, setAudioLanguage] = useState("es")
  const [subtitleLanguage, setSubtitleLanguage] = useState("es")
  const [fullScreen, setFullScreen] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [orientationChangeInProgress, setOrientationChangeInProgress] = useState(false)

  const videoRef = useRef(null)
  const controlsTimeout = useRef(null)
  const isFocused = useIsFocused()
  const isExiting = useRef(false)

  // Ocultar la barra de estado y la barra de navegación en Android
  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setHidden(true)

      // Intentar ocultar la barra de navegación en Android
      if (Platform.Version >= 19) {
        const hideNav = async () => {
          try {
            // Usar la API de navegación para ocultar la barra de navegación
            if (navigation && navigation.setOptions) {
              navigation.setOptions({
                headerShown: false,
                statusBarHidden: true,
                navigationBarHidden: true,
                navigationBarColor: "transparent",
              })
            }
          } catch (error) {
            console.error("Error ocultando barra de navegación:", error)
          }
        }

        hideNav()
      }
    }

    return () => {
      if (Platform.OS === "android") {
        StatusBar.setHidden(false)
      }
    }
  }, [])

  // Determinar la URL del video correcta
  useEffect(() => {
    let url = ""

    // Verificar si es un episodio de serie
    if (isEpisode && episode && episode.videoUrl) {
      url = episode.videoUrl
      console.log("Reproduciendo episodio de serie:", url)
    }
    // Si no es episodio pero tenemos datos de episodio/temporada
    else if (
      (seasonNumber !== undefined || season !== undefined) &&
      (episodeNumber !== undefined || episode !== undefined)
    ) {
      // Intentar obtener la URL del episodio
      const currentEpisode = episode || movie?.seasons?.[seasonNumber || 0]?.episodes?.[episodeNumber || 0]
      if (currentEpisode && currentEpisode.videoUrl) {
        url = currentEpisode.videoUrl
        console.log("Reproduciendo episodio por número:", url)
      }
    }
    // Si es una película
    else if (movie && movie.videoUrl) {
      url = movie.videoUrl
      console.log("Reproduciendo película:", url)
    }

    // Si no se encontró URL, establecer error
    if (!url) {
      setError("No se encontró la URL del video")
      console.error("Error: No se encontró URL de video válida", route.params)
    } else {
      setVideoUrl(url)
    }
  }, [route.params])

  // Función para cambiar la orientación de manera segura
  const setOrientation = async (orientation) => {
    if (orientationChangeInProgress) return

    try {
      setOrientationChangeInProgress(true)
      console.log(`Cambiando orientación a: ${orientation}`)

      await ScreenOrientation.unlockAsync()

      if (orientation === "PORTRAIT") {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        setIsLandscape(false)
      } else {
        const landscapeMode =
          Platform.OS === "ios"
            ? ScreenOrientation.OrientationLock.LANDSCAPE
            : ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        await ScreenOrientation.lockAsync(landscapeMode)
        setIsLandscape(true)
      }

      console.log(`Orientación cambiada exitosamente a: ${orientation}`)
    } catch (error) {
      console.error(`Error al cambiar orientación a ${orientation}:`, error)
    } finally {
      setOrientationChangeInProgress(false)
    }
  }

  // Función mejorada para retroceder
  const handleBack = async () => {
    if (isExiting.current) return
    isExiting.current = true

    console.log("Iniciando proceso de salida del reproductor...")

    try {
      // Pausar el video si está reproduciéndose
      if (videoRef.current && isPlaying) {
        console.log("Pausando video...")
        await videoRef.current.pauseAsync()
        setIsPlaying(false)
      }

      // Cambiar a orientación vertical antes de navegar
      console.log("Cambiando a orientación vertical...")
      await setOrientation("PORTRAIT")

      // Restaurar la barra de estado y navegación en Android
      if (Platform.OS === "android") {
        StatusBar.setHidden(false)
      }

      // Esperar un momento para asegurar que la orientación cambie
      console.log("Esperando a que se complete el cambio de orientación...")
      setTimeout(() => {
        console.log("Navegando hacia atrás...")
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.navigate("Home")
        }
        isExiting.current = false
      }, 300)
    } catch (error) {
      console.error("Error durante el proceso de salida:", error)
      // Si hay error, intentamos navegar de todos modos
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate("Home")
      }
      isExiting.current = false
    }
  }

  // Temporizador optimizado para ocultar controles
  const resetControlsTimer = () => {
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !showSettings) {
        setShowControls(false)
      }
    }, 3000) // Aumentado a 3 segundos para mejor experiencia
  }

  // Formato de tiempo profesional (HH:MM:SS)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Efecto para manejar la orientación al entrar y salir
  useFocusEffect(
    React.useCallback(() => {
      console.log("VideoPlayer enfocado, configurando orientación horizontal...")
      isExiting.current = false

      // Rotación automática al entrar
      setOrientation("LANDSCAPE")

      // Configurar botón físico de retroceso
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack()
        return true
      })

      // Función de limpieza al salir
      return () => {
        console.log("VideoPlayer perdiendo foco, limpiando...")

        // Si estamos saliendo intencionalmente, la orientación ya se habrá cambiado
        if (!isExiting.current) {
          console.log("Restableciendo orientación vertical desde efecto de limpieza...")
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((err) =>
            console.error("Error al restablecer orientación:", err),
          )
        }

        backHandler.remove()
        clearTimeout(controlsTimeout.current)
      }
    }, []),
  )

  // Efecto adicional para asegurar que la orientación se mantenga mientras el componente está enfocado
  useEffect(() => {
    if (isFocused && !isExiting.current) {
      const checkOrientation = async () => {
        try {
          const currentOrientation = await ScreenOrientation.getOrientationAsync()
          const isCurrentlyPortrait =
            currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
            currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

          if (isCurrentlyPortrait && !isExiting.current) {
            console.log("Detectada orientación vertical mientras debería ser horizontal, corrigiendo...")
            setOrientation("LANDSCAPE")
          }
        } catch (error) {
          console.error("Error al verificar orientación:", error)
        }
      }

      checkOrientation()
    }
  }, [isFocused])

  // Efecto para controles
  useEffect(() => {
    if (!loading && showControls) {
      resetControlsTimer()
    }
    return () => clearTimeout(controlsTimeout.current)
  }, [showControls, loading])

  // Verificar si hay un error al cargar el video
  useEffect(() => {
    if (error) {
      Alert.alert("Error de reproducción", `No se pudo reproducir el video: ${error}`, [
        { text: "OK", onPress: handleBack },
      ])
    }
  }, [error])

  // Estilo dinámico para pantalla completa
  const videoStyle = fullScreen ? { ...styles.video, width: "100%", height: "100%" } : styles.video

  // Mostrar mensaje de error si no hay URL
  if (!videoUrl && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el video</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
          <Text style={styles.errorButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar hidden={true} />
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => {
          if (!loading) {
            setShowControls(!showControls)
            if (showControls) resetControlsTimer()
          }
        }}
      >
        {videoUrl && (
          <Video
            ref={videoRef}
            style={videoStyle}
            source={{ uri: videoUrl }}
            useNativeControls={false}
            resizeMode={fullScreen ? "cover" : "contain"}
            shouldPlay={isPlaying}
            rate={playbackRate}
            onLoad={() => {
              setLoading(false)
              setShowControls(true)
              resetControlsTimer()
            }}
            onError={(error) => {
              console.error("Error de video:", error)
              setError("No se pudo cargar el video")
              setLoading(false)
            }}
            onPlaybackStatusUpdate={(status) => {
              setStatus(status)
              if (status.isLoaded) {
                setCurrentTime(status.positionMillis)
                setDuration(status.durationMillis || 0)
              }
            }}
          />
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Cargando video...</Text>
        </View>
      )}

      {showControls && !loading && (
        <View style={styles.controlsContainer}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOrientation(isLandscape ? "PORTRAIT" : "LANDSCAPE")}
              style={styles.rotateButton}
            >
              <MaterialCommunityIcons
                name={isLandscape ? "phone-rotate-portrait" : "phone-rotate-landscape"}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            {/* Botón de pantalla completa */}
            <TouchableOpacity onPress={() => setFullScreen(!fullScreen)} style={styles.fullscreenButton}>
              <MaterialIcons name={fullScreen ? "fullscreen-exit" : "fullscreen"} size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowSettings(true)
                resetControlsTimer()
              }}
              style={styles.settingsButton}
            >
              <Feather name="settings" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerControls}>
            <TouchableOpacity
              onPress={async () => {
                await videoRef.current.setPositionAsync(Math.max(0, currentTime - 10000))
                resetControlsTimer()
              }}
              style={styles.navButton}
            >
              <Entypo name="controller-jump-to-start" size={24} color="white" />
              <Text style={styles.navText}>10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                if (isPlaying) {
                  await videoRef.current.pauseAsync()
                } else {
                  await videoRef.current.playAsync()
                }
                setIsPlaying(!isPlaying)
                resetControlsTimer()
              }}
              style={styles.playButton}
            >
              {isPlaying ? (
                <MaterialIcons name="pause" size={36} color="white" />
              ) : (
                <MaterialIcons name="play-arrow" size={36} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await videoRef.current.setPositionAsync(Math.min(duration, currentTime + 10000))
                resetControlsTimer()
              }}
              style={styles.navButton}
            >
              <Entypo name="controller-next" size={24} color="white" />
              <Text style={styles.navText}>10s</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

            <Slider
              style={styles.progressBar}
              value={duration > 0 ? currentTime / duration : 0}
              onSlidingComplete={async (value) => {
                await videoRef.current.setPositionAsync(value * duration)
                resetControlsTimer()
              }}
              minimumTrackTintColor="#E50914"
              maximumTrackTintColor="rgba(255,255,255,0.5)"
              thumbTintColor="#E50914"
            />

            <Text style={styles.timeText}>-{formatTime(duration - currentTime)}</Text>
          </View>
        </View>
      )}

      {/* Modal de configuración */}
      <SettingsModal
        visible={showSettings}
        onClose={() => {
          setShowSettings(false)
          resetControlsTimer()
        }}
        playbackRate={playbackRate}
        setPlaybackRate={(rate) => {
          setPlaybackRate(rate)
          videoRef.current.setRateAsync(rate, true)
        }}
        subtitlesEnabled={subtitlesEnabled}
        setSubtitlesEnabled={setSubtitlesEnabled}
        audioLanguage={audioLanguage}
        setAudioLanguage={setAudioLanguage}
        subtitleLanguage={subtitleLanguage}
        setSubtitleLanguage={setSubtitleLanguage}
      />

      {/* Subtítulos */}
      {subtitlesEnabled && (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            {subtitleLanguage === "es"
              ? "Ejemplo de subtítulo en español"
              : subtitleLanguage === "en"
                ? "Example English subtitle"
                : ""}
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

// Componente SettingsModal (sin cambios)
function SettingsModal({
  visible,
  onClose,
  playbackRate,
  setPlaybackRate,
  subtitlesEnabled,
  setSubtitlesEnabled,
  audioLanguage,
  setAudioLanguage,
  subtitleLanguage,
  setSubtitleLanguage,
}) {
  const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
  ]

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Configuración</Text>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Velocidad de reproducción</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {rates.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[styles.rateButton, playbackRate === rate && styles.selectedRate]}
                  onPress={() => {
                    setPlaybackRate(rate)
                    onClose()
                  }}
                >
                  <Text style={styles.rateText}>{rate}x</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Idioma de audio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={`audio-${lang.code}`}
                  style={[styles.langButton, audioLanguage === lang.code && styles.selectedLang]}
                  onPress={() => setAudioLanguage(lang.code)}
                >
                  <Text style={styles.langText}>{lang.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.toggleContainer}>
              <Text style={styles.sectionTitle}>Subtítulos</Text>
              <TouchableOpacity onPress={() => setSubtitlesEnabled(!subtitlesEnabled)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{subtitlesEnabled ? "ON" : "OFF"}</Text>
              </TouchableOpacity>
            </View>

            {subtitlesEnabled && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={`sub-${lang.code}`}
                    style={[styles.langButton, subtitleLanguage === lang.code && styles.selectedLang]}
                    onPress={() => setSubtitleLanguage(lang.code)}
                  >
                    <Text style={styles.langText}>{lang.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#E50914",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 10,
  },
  rotateButton: {
    padding: 10,
  },
  fullscreenButton: {
    padding: 10,
  },
  settingsButton: {
    padding: 10,
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    alignItems: "center",
    padding: 15,
    marginHorizontal: 10,
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  playButton: {
    backgroundColor: "rgba(229,9,20,0.7)",
    borderRadius: 30,
    padding: 15,
    marginHorizontal: 20,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 25,
    paddingHorizontal: 15,
  },
  timeText: {
    color: "white",
    fontSize: 14,
    width: 70,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  progressBar: {
    flex: 1,
    height: 20,
    marginHorizontal: 10,
  },
  subtitleContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  subtitleText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    paddingBottom: 30,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  rateButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#333",
  },
  selectedRate: {
    backgroundColor: "#E50914",
  },
  rateText: {
    color: "white",
    fontSize: 14,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#333",
  },
  selectedLang: {
    backgroundColor: "#E50914",
  },
  langText: {
    color: "white",
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
  },
})

