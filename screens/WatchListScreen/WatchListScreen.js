"use client"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { useWatchlist } from "../../context/WatchListContext"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 3 // 3 columnas con padding
const CARD_HEIGHT = CARD_WIDTH * 1.5 // Proporción de aspecto para las tarjetas

export default function WatchlistScreen({ navigation }) {
  const { colors, isDark } = useTheme()
  const { watchlist, loading } = useWatchlist()

  // Componente MovieCard específico para WatchlistScreen
  const WatchlistMovieCard = ({ movie, onPress }) => {
    return (
      <TouchableOpacity style={styles.movieCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: movie.poster || "https://via.placeholder.com/300x450?text=No+Image",
            }}
            style={styles.movieImage}
            resizeMode="cover"
          />
          {movie.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{movie.rating}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={1}>
          {movie.title || "Sin título"}
        </Text>
        <Text style={[styles.movieCategory, { color: colors.secondary }]} numberOfLines={1}>
          {movie.category || ""}
        </Text>
      </TouchableOpacity>
    )
  }

  const handleMoviePress = (movie) => {
    // Asegúrate de pasar todos los campos requeridos
    navigation.navigate("MovieDetail", {
      movie: {
        id: movie.id,
        title: movie.title,
        description: movie.description || "Descripción no disponible",
        year: movie.year || "N/A",
        category: movie.category || "Sin categoría",
        duration: movie.duration || "N/A",
        rating: movie.rating || 0,
        banner: movie.banner || movie.poster,
        poster: movie.poster,
        director: movie.director || "Director desconocido",
        cast: movie.cast || [],
        videoUrl: movie.videoUrl || "",
      },
    })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Watchlist</Text>

        {watchlist.length > 0 && (
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} in your watchlist
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : watchlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#E91E63" />
          <Text style={[styles.emptyText, { color: colors.text }]}>Your watchlist is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
            Add movies to your watchlist to watch them later
          </Text>
        </View>
      ) : (
        <FlatList
          data={watchlist}
          renderItem={({ item }) => <WatchlistMovieCard movie={item} onPress={() => handleMoviePress(item)} />}
          keyExtractor={(item) => `watchlist-${item.id}`}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    opacity: 0.8,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Espacio extra para la barra de navegación
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 22,
  },
  // Estilos para el nuevo WatchlistMovieCard
  movieCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 6,
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  movieImage: {
    width: "100%",
    height: "100%",
  },
  ratingContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Inter-Medium",
    marginLeft: 2,
  },
  movieTitle: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  movieCategory: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    opacity: 0.7,
  },
})

