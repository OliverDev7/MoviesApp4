"use client"
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import { auth } from '../../firebase/firebase';
import { getMoviesByCategory } from '../../firebase/firebase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.38;
const CARD_HEIGHT = CARD_WIDTH * 1.5;
const SPACING = 16;

const genreConfigs = [
  { title: "Películas de Terror", category: "Horror", icon: "skull-outline" },
  { title: "Películas de Acción", category: "Action", icon: "flash-outline" },
  { title: "Películas Animadas", category: "Animated", icon: "happy-outline" },
  { title: "Películas de Comedia", category: "Comedy", icon: "happy-outline" },
  { title: "Películas de Drama", category: "Drama", icon: "film-outline" },
  { title: "Películas de Suspense", category: "Suspense", icon: "film" }
];

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [moviesData, setMoviesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const genrePromises = genreConfigs.map(async (genre) => {
        const movies = await getMoviesByCategory(genre.category);
        return { [genre.category]: movies };
      });

      const results = await Promise.all(genrePromises);
      const combinedData = Object.assign({}, ...results);
      
      setMoviesData(combinedData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar las películas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMoviePress = (movie) => {
    navigation.navigate("MovieDetail", { 
      movie: {
        id: movie.id,
        title: movie.title || "Título no disponible",
        description: movie.description || "Descripción no disponible",
        year: movie.year || "N/A",
        category: movie.category || "Sin categoría",
        duration: movie.duration || "N/A",
        rating: movie.rating || 0,
        banner: movie.banner || "",
        poster: movie.poster || movie.image,
        director: movie.director || "Director desconocido",
        cast: movie.cast || [],
        videoUrl: movie.videoUrl || ""
      }
    });
  };

  const renderGenreSection = ({ item }) => {
    const movies = moviesData[item.category] || [];
    
    return (
      <View key={item.key} style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={colors.primary} 
              style={styles.genreIcon} 
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {item.title}
            </Text>
          </View>
          
          {movies.length > 0 && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('AllMovies')}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todo</Text>

            </TouchableOpacity>
          )}
        </View>
        
        {movies.length > 0 ? (
          <FlatList
            data={movies.slice(0, 7)}
            keyExtractor={(item) => `${item.category}-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <MovieCard
                  movie={item}
                  onPress={() => handleMoviePress(item)}
                  grid={true}
                />
              </View>
            )}
          />
        ) : (
          <View style={styles.emptySection}>
            <Ionicons 
              name="sad-outline" 
              size={40} 
              color={colors.textSecondary} 
              style={styles.emptyIcon} 
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay películas en esta categoría
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando películas...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E91E63']}
            tintColor="#E91E63"
          />
        }
      >
        {/* Espacio superior aumentado */}
        <View style={styles.topSpacer} />
        
        {/* Nueva sección de Series y Originals */}
        <View style={styles.topSectionContainer}>
          <TouchableOpacity 
            style={[styles.topSectionButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Próximamente', 'Sección Series en desarrollo')}
          >
            <Ionicons name="tv-outline" size={24} color="#FFFFFF" />
            <Text style={styles.topSectionButtonText}>Series</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.topSectionButton, { backgroundColor: colors.card }]}
            onPress={() => Alert.alert('Próximamente', 'Sección Originals en desarrollo')}
          >
            <Ionicons name="star-outline" size={24} color={colors.text} />
            <Text style={[styles.topSectionButtonText, { color: colors.text }]}>Originals</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons 
              name="warning-outline" 
              size={40} 
              color={colors.error} 
              style={styles.errorIcon} 
            />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]} 
              onPress={loadData}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={genreConfigs}
            renderItem={renderGenreSection}
            keyExtractor={(item) => item.category}
            scrollEnabled={false}
            ListFooterComponent={<View style={styles.footer} />}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: SPACING * 2,
  },
  // Espacio superior aumentado
  topSpacer: {
    height: SPACING * 2, // Aumenté el espacio superior
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  // Nueva sección de estilos para los botones superiores
  topSectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING,
    marginBottom: SPACING * 1.5,
    marginTop: SPACING, // Espacio adicional arriba de los botones
  },
  topSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '45%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  topSectionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Resto de los estilos (se mantienen igual)
  headerSpacer: {
    height: SPACING / 2,
  },
  sectionContainer: {
    marginBottom: SPACING * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genreIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: SPACING,
    paddingRight: SPACING / 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING,
  },
  emptySection: {
    paddingHorizontal: SPACING,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    padding: SPACING,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING * 2,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    height: SPACING,
  },
});