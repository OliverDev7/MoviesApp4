"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { LinearGradient } from "expo-linear-gradient"
import * as Localization from 'expo-localization';

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 3 // 3 columnas con padding
const CARD_HEIGHT = CARD_WIDTH * 1.5 // Proporción de aspecto para las tarjetas

export default function AllMoviesScreen({ navigation }) {
  const { colors, isDark } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [allCategories, setAllCategories] = useState(["All"])

  // Componente MovieCard específico para AllMoviesScreen
  const CompactMovieCard = ({ movie, onPress }) => {
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
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.gradient} />
          {movie.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{movie.rating}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={1}>
          {movie.title || movie.name || "Sin título"}
        </Text>
        <Text style={[styles.movieCategory, { color: colors.secondary }]} numberOfLines={1}>
          {movie.category || ""}
        </Text>
      </TouchableOpacity>
    )
  }

  // Función para cargar categorías desde Firestore
  const loadCategories = useCallback(async () => {
    try {
      const moviesQuery = query(collection(db, "movies"))
      const querySnapshot = await getDocs(moviesQuery)

      // Extraer categorías únicas de las películas
      const categories = new Set(["All"]) // Comenzar con "All"

      querySnapshot.forEach((doc) => {
        const movie = doc.data()
        if (movie.category) {
          categories.add(movie.category)
        }
      })

      setAllCategories(Array.from(categories))
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }, [])

  // Función para cargar películas desde Firestore
  const loadMovies = useCallback(async (category = "All", refresh = false) => {
    if (refresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      let moviesQuery

      if (category === "All") {
        // Para "All", simplemente obtenemos todas las películas
        moviesQuery = query(
          collection(db, "movies"),
          limit(50), // Aumentamos el límite para mostrar más películas
        )
      } else {
        // Para categorías específicas, filtramos por el campo "category"
        moviesQuery = query(collection(db, "movies"), where("category", "==", category), limit(50))
      }

      const querySnapshot = await getDocs(moviesQuery)
      const moviesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Aseguramos que no haya duplicados usando un Set con los IDs
      const uniqueMovies = Array.from(new Map(moviesData.map((movie) => [movie.id, movie])).values())

      setMovies(uniqueMovies)
    } catch (error) {
      console.error("Error loading movies:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Cargar categorías al inicio
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Cargar películas al inicio y cuando cambia la categoría
  useEffect(() => {
    loadMovies(selectedCategory)
  }, [selectedCategory, loadMovies])

  // Función para manejar el refresh
  const handleRefresh = () => {
    loadMovies(selectedCategory, true)
  }

  // Función para navegar al detalle de la película
  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetail", { movie })
  }

  // Renderizar cada película
  const renderMovieItem = ({ item }) => {
    return <CompactMovieCard movie={item} onPress={() => handleMoviePress(item)} />
  }

  // Renderizar el separador entre categorías
  const CategorySeparator = () => <View style={styles.categorySeparator} />

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {selectedCategory === "All" ? "Todas las Películas" : `Películas: ${selectedCategory}`}
           {Localization.locale}
        </Text>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={allCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategoryButton,
                { borderColor: colors.border },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryText, { color: selectedCategory === item ? "#E91E63" : colors.text }]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={CategorySeparator}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Lista de películas */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moviesList}
          columnWrapperStyle={styles.moviesRow}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E91E63"
              colors={["#E91E63"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={60} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.secondary }]}>
                No se encontraron películas en esta categoría
              </Text>
            </View>
          }
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 4,
  },
  selectedCategoryButton: {
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    borderColor: "#E91E63",
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  categorySeparator: {
    width: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  moviesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  moviesRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  // Estilos para el nuevo CompactMovieCard
  movieCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
    position: "relative",
  },
  movieImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
})

