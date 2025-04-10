import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = width * 0.34;

export default function MovieCard({ movie, onPress, grid = false, isSeries = false }) {
  const hasProgress = movie.progress && movie.duration;
  const progressPercentage = hasProgress ? (movie.progress / movie.duration) * 100 : 0;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        grid && styles.gridContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, grid && styles.gridImageContainer]}>
        <Image
          source={{ uri: movie.poster }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {hasProgress && progressPercentage > 0 && progressPercentage < 95 && (
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        )}
        
        {isSeries && (
          <View style={styles.seriesBadge}>
            <Text style={styles.seriesText}>SERIES</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.title, grid && styles.gridTitle]} numberOfLines={2}>
        {movie.title}
      </Text>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.info, grid && styles.gridInfo]}>{movie.duration}</Text>
        {movie.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={grid ? 14 : 12} color="#E91E63" />
            <Text style={[styles.rating, grid && styles.gridInfo]}>{movie.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: GRID_CARD_WIDTH,
    marginRight: 16,
  },
  gridContainer: {
    width: GRID_CARD_WIDTH,
  },
  imageContainer: {
    width: '100%',
    height: GRID_CARD_WIDTH * 1.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridImageContainer: {
    height: GRID_CARD_WIDTH * 1.5,
  },
  image: {
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
  seriesBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  seriesText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  gridInfo: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 2,
  },
});