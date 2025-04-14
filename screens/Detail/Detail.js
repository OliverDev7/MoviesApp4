"use client"
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useWatchlist } from "../../context/WatchListContext"
import * as Localization from 'expo-localization';
import { auth, isInFavorites, addToFavorites, removeFromFavorites, getWatchProgress } from "../../firebase/firebase"

const { width, height } = Dimensions.get("window")

export default function MovieDetailScreen({ route, navigation }) {
  const { movie: movieFromParams } = route.params
  const { colors } = useTheme()
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  const [movie, setMovie] = useState({
    id: movieFromParams.id,
    title: movieFromParams.title,
    description: movieFromParams.description || "Descripción no disponible",
    year: movieFromParams.year || "N/A",
    category: movieFromParams.category || "Sin categoría",
    duration: movieFromParams.duration || "N/A",
    rating: movieFromParams.rating || 0,
    banner: movieFromParams.banner || "",
    poster: movieFromParams.poster || movieFromParams.image,
    director: movieFromParams.director || "Director desconocido",
    cast: movieFromParams.cast || [],
    videoUrl: movieFromParams.videoUrl || "",
    trailer: movieFromParams.trailer,
  })

  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [watchProgress, setWatchProgress] = useState(null)
  const [user, setUser] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        if (auth.currentUser) {
          const favorite = await isInFavorites(auth.currentUser.uid, movie.id)
          setIsFavorite(favorite)
          setUser(auth.currentUser)

          const progress = await getWatchProgress(auth.currentUser.uid, movie.id)
          setWatchProgress(progress)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [movie.id])

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } })

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            position: "absolute",
            bottom: 30,
            left: 30,
            right: 30,
            elevation: 0,
            backgroundColor: "rgba(18, 18, 18, 0.85)",
            borderRadius: 30,
            height: 60,
            paddingBottom: 8,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
          },
        })
      }
    }, [navigation]),
  )

  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = await toggleFavorite(movie.id, user.uid, isFavorite)
      setIsFavorite(newFavoriteStatus)
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar favoritos")
    }
  }

  const handlePlayMovie = () => {
    navigation.navigate("VideoPlayer", {
      movie,
      continueFrom: watchProgress?.progress || 0,
    })
  }

  const handlePlayTrailer = () => {
    navigation.navigate("VideoPlayer", {
      movie,
      isTrailer: true,
    })
  }

  const toggleFavorite = async () => {
    try {
      setLoadingFavorite(true)
      const userId = auth.currentUser?.uid

      if (!userId) {
        Alert.alert("Authentication Required", "Please sign in to add favorites")
        return
      }

      if (isFavorite) {
        await removeFromFavorites(userId, movie.id)
        setIsFavorite(false)
      } else {
        await addToFavorites(userId, movie.id, "movie", {
          title: movie.title,
          poster: movie.poster,
          category: movie.category,
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      Alert.alert("Error", "Failed to update favorites")
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleToggleWatchlist = () => {
    toggleWatchlist(movie)
  }

  const handleShare = async () => {
    try {
      const shareUrl = Platform.OS === "ios" ? `movieapp://movie/${movie.id}` : `https://movieapp.com/movie/${movie.id}`

      const message = `Check out "${movie.title}" on MovieApp: ${shareUrl}`

      await Share.share({
        message,
        url: shareUrl,
        title: `Share ${movie.title}`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const progressPercentage = watchProgress ? watchProgress.percentage : 0

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.headerContainer}>
          <Image source={{ uri: movie.banner }} style={styles.backgroundImage} resizeMode="cover" />
          <LinearGradient colors={["transparent", colors.background]} style={styles.gradient} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.movieInfoContainer}>
            <Text style={styles.title}>{movie.title}</Text>

            <View style={styles.detailsRow}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{movie.year}</Text>
              </View>
              <Text style={styles.categoryText}>{movie.category} •</Text>
              <Text style={styles.durationText}>{movie.duration}</Text>
            </View>

            <View style={styles.ratingsContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#E91E63" />
                <Text style={styles.ratingText}>{movie.rating?.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {watchProgress && progressPercentage > 0 && progressPercentage < 95 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>{progressPercentage}% watched</Text>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleWatchlist}>
              <Ionicons
                name={isInWatchlist(movie.id) ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isInWatchlist(movie.id) ? "#E91E63" : colors.text}
              />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Watchlist</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Descripción con funcionalidad Leer más/menos */}
          <Text 
            style={[styles.descriptionText, { color: colors.text }]} 
            numberOfLines={expanded ? undefined : 3}
          >
            {movie.description}
          </Text>
          {movie.description.length > 100 && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={[styles.readMoreText, { color: '#E91E63' }]}>
                {expanded ? 'Leer menos' : 'Leer más'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.crewInfoContainer}>
            <View style={styles.crewInfoItem}>
              <Text style={styles.crewInfoLabel}>Director</Text>
              <Text style={[styles.crewInfoValue, { color: colors.text }]}>{movie.director}</Text>
            </View>

            <View style={styles.crewInfoItem}>
              <Text style={styles.crewInfoLabel}>Cast</Text>
              <Text style={[styles.crewInfoValue, { color: colors.text }]}>{movie.cast.join(", ")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={[styles.watchButton, { backgroundColor: "#E91E63" }]} onPress={handlePlayMovie}>
          <Ionicons name="play" size={24} color="#FFF" />
          <Text style={styles.watchButtonText}>
            {watchProgress && progressPercentage > 0 && progressPercentage < 95 ? "Continue Watching" : "Watch Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: height * 0.6,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  movieInfoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: "white",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  yearBadge: {
    backgroundColor: "#E91E63",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  yearText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  categoryText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 10,
  },
  durationText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  ratingsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  ratingText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginLeft: 4,
  },
  contentContainer: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#E91E63",
    borderRadius: 2,
  },
  progressText: {
    color: "#E91E63",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 20,
    textAlign: 'right',
    color: '#BA68C8',
  },
  crewInfoContainer: {
    marginBottom: 80,
  },
  crewInfoItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  crewInfoLabel: {
    width: 80,
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#8E8E93",
  },
  crewInfoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  watchButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 30,
  },
  watchButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#FFF",
    marginLeft: 8,
  },
})