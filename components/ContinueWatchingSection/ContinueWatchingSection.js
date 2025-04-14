import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth, getContinueWatching, removeFromContinueWatching } from '../../firebase/firebase';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.32;

export default function ContinueWatchingSection() {
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadContinueWatching();
  }, []);

  const loadContinueWatching = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      const watchList = await getContinueWatching(userId);
      setContinueWatching(watchList);
    } catch (error) {
      console.error('Error loading continue watching:', error);
      setError('Failed to load continue watching');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (mediaId) => {
    try {
      const userId = auth.currentUser?.uid;
      await removeFromContinueWatching(userId, mediaId);
      
      // Actualizar la lista local
      setContinueWatching(prevList => 
        prevList.filter(item => item.mediaId !== mediaId)
      );
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleItemPress = (item) => {
    if (item.mediaType === 'movie') {
      navigation.navigate('Details', { movieId: item.mediaId });
    } else if (item.mediaType === 'series') {
      // Si es un episodio específico, navegar directamente al reproductor
      if (item.seasonNumber && item.episodeNumber) {
        navigation.navigate('VideoPlayer', {
          movie: {
            id: item.mediaId,
            title: `${item.title} - S${item.seasonNumber}:E${item.episodeNumber}`,
            videoUrl: item.videoUrl,
          },
          continueFrom: item.progress,
          isEpisode: true,
          seasonNumber: item.seasonNumber,
          episodeNumber: item.episodeNumber,
        });
      } else {
        // Si solo es la serie, navegar a la pantalla de detalles de la serie
        navigation.navigate('SeriesDetail', { seriesId: item.mediaId });
      }
    }
  };

  const renderItem = ({ item }) => {
    // Calcular el porcentaje de progreso para la barra
    const progressPercentage = item.percentage || 0;
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: item.poster }}
            style={styles.poster}
            resizeMode="cover"
          />
          
          {/* Barra de progreso */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          
          {/* Botón para eliminar */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.mediaId)}
          >
            <Ionicons name="close-circle" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.episodeTitle && (
          <Text style={styles.episodeTitle} numberOfLines={1}>
            S{item.seasonNumber}:E{item.episodeNumber}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#E91E63" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (continueWatching.length === 0) {
    return null; // No mostrar la sección si no hay elementos
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Continue Watching</Text>
        <TouchableOpacity onPress={loadContinueWatching}>
          <Ionicons name="refresh" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={continueWatching}
        renderItem={renderItem}
        keyExtractor={(item) => item.mediaId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginRight: 8,
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E91E63',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  episodeTitle: {
    fontSize: 10,
    color: '#E91E63',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
  },
});