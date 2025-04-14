"use client"
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import { getSeries, getSeriesByCategory } from '../../firebase/firebase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.38;
const SPACING = 16;

const SeriesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredSeries, setFeaturedSeries] = useState([]);
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
      
      const allSeries = await getSeries();
      setSeries(allSeries);
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(allSeries.map(s => s.category))];
      setCategories([
        { id: 'all', name: 'All' },
        ...uniqueCategories.map((cat, index) => ({ id: index.toString(), name: cat })),
      ]);
      
      // Seleccionar series destacadas (las 5 primeras)
      setFeaturedSeries(allSeries.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading series:', error);
      setError('Failed to load series. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSeriesPress = (series) => {
    navigation.navigate('SeriesDetail', { 
      series: {
        id: series.id,
        title: series.title || "Title not available",
        description: series.description || "No description available",
        category: series.category || "No category",
        poster: series.poster || series.image,
        banner: series.banner || series.poster || series.image,
        seasons: series.seasons || [],
        rating: series.rating || 0,
        director: series.director || "Unknown director",
        cast: series.cast || [],
        videoUrl: series.videoUrl || ""
      }
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.name && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Text style={[
        styles.categoryText,
        { color: selectedCategory === item.name ? '#FFFFFF' : colors.text }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSeriesItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <MovieCard
        movie={{ 
          ...item, 
          duration: `${item.seasons?.length || 0} Seasons` 
        }}
        isSeries={true}
        onPress={() => handleSeriesPress(item)}
        grid={true}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading series...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E91E63']}
            tintColor="#E91E63"
          />
        }
      >
        {/* Categorías */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Series */}
        <View style={styles.seriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'All' ? 'All Series' : `${selectedCategory} Series`}
          </Text>
          
          {series.length > 0 ? (
            <FlatList
              data={selectedCategory === 'All' ? 
                series : 
                series.filter(s => s.category === selectedCategory)}
              renderItem={renderSeriesItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="tv-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No series found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  categoriesContainer: {
    paddingVertical: SPACING,
    paddingHorizontal: SPACING,
  },
  categoriesList: {
    paddingRight: SPACING,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  seriesContainer: {
    paddingHorizontal: SPACING,
    marginBottom: SPACING * 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING * 3,
  },
  emptyText: {
    fontSize: 16,
    marginTop: SPACING,
    opacity: 0.7,
  },
});

export default SeriesScreen;