"use client"
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Share,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  auth, 
  getWatchProgress,
  addToFavorites,
  removeFromFavorites,
  isInFavorites
} from '../../firebase/firebase';
import { useWatchlist } from '../../context/WatchListContext';

const { width, height } = Dimensions.get('window');

const SeriesDetailScreen = ({ route, navigation }) => {
  const { series } = route.params;
  const { colors } = useTheme();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [selectedSeason, setSelectedSeason] = useState(series.seasons[0]);
  const [episodeProgress, setEpisodeProgress] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      height: height * 0.4,
      position: 'relative',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '50%',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
    },
    contentContainer: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    actionButton: {
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      flex: 1,
    },
    watchlistButton: {
      marginRight: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    shareButton: {
      marginLeft: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 24,
    },
    seasonsContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    seasonButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    seasonButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    episodesContainer: {
      marginBottom: 80,
    },
    episodeItem: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center',
    },
    episodeContent: {
      flex: 1,
      flexDirection: 'row',
    },
    episodeThumbnailContainer: {
      width: 120,
      height: 80,
      position: 'relative',
    },
    episodeThumbnail: {
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
    playButtonOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    episodeDuration: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    durationText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '500',
    },
    episodeInfo: {
      flex: 1,
      padding: 12,
    },
    episodeNumber: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    episodeTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    episodeDescription: {
      fontSize: 12,
      color: 'white',
    },
    infoButton: {
      padding: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      borderRadius: 10,
      padding: 20,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    modalSeasonInfo: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    modalDescription: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
    },
    modalPlayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 5,
    },
    modalPlayButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        const progress = {};
        
        // Cargar progreso de episodios
        for (const season of series.seasons) {
          for (const episode of season.episodes) {
            const episodeId = `${series.id}_s${season.number}_e${episode.number}`;
            const watchProgress = await getWatchProgress(userId, episodeId);
            
            if (watchProgress) {
              progress[episodeId] = watchProgress;
            }
          }
        }
        
        setEpisodeProgress(progress);
        
        // Verificar favoritos
        const favorite = await isInFavorites(userId, series.id);
        setIsFavorite(favorite);

        // Seleccionar primer episodio por defecto
        if (series.seasons.length > 0 && series.seasons[0].episodes.length > 0) {
          setSelectedEpisode({
            ...series.seasons[0].episodes[0],
            seasonNumber: series.seasons[0].number
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [series.id]);

  const handlePlayEpisode = (episode) => {
    const episodeId = `${series.id}_s${selectedSeason.number}_e${episode.number}`;
    const savedProgress = episodeProgress[episodeId];
    
    navigation.navigate("VideoPlayer", {
      movie: {
        id: episodeId,
        title: `${series.title} - S${selectedSeason.number}:E${episode.number}`,
        description: episode.description,
        videoUrl: episode.videoUrl,
        poster: episode.thumbnail || series.banner,
      },
      continueFrom: savedProgress?.progress || 0,
    });
  };

  const handlePlayFirstEpisode = () => {
    if (selectedEpisode) {
      handlePlayEpisode(selectedEpisode);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this series: ${series.title}\n\n${series.description}`,
        title: series.title,
        url: series.banner
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderEpisodeItem = ({ item }) => {
    const episodeId = `${series.id}_s${selectedSeason.number}_e${item.number}`;
    const savedProgress = episodeProgress[episodeId];
    const progressPercentage = savedProgress ? savedProgress.percentage : 0;
    
    return (
      <View style={styles.episodeItem}>
        <TouchableOpacity 
          style={styles.episodeContent}
          onPress={() => handlePlayEpisode(item)}
        >
          <View style={styles.episodeThumbnailContainer}>
            <Image 
              source={{ uri: item.thumbnail || series.banner }} 
              style={styles.episodeThumbnail} 
            />
            
            {progressPercentage > 0 && progressPercentage < 95 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
            )}
            
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play" size={24} color="white" />
            </View>
            
            <View style={styles.episodeDuration}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
          
          <View style={styles.episodeInfo}>
            <Text style={[styles.episodeNumber, { color: colors.primary }]}>
              Episode {item.number}
            </Text>
            <Text style={[styles.episodeTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text 
              style={[styles.episodeDescription, { color: 'white' }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => {
            setSelectedEpisode({
              ...item,
              seasonNumber: selectedSeason.number
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con imagen */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: series.banner }} 
            style={styles.backgroundImage} 
            resizeMode="cover"
          />
          <LinearGradient 
            colors={['transparent', colors.background]} 
            style={styles.gradient}
          />
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton} 
            onPress={handlePlayFirstEpisode}
          >
            <Ionicons name="play" size={30} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Contenido principal */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{series.title}</Text>
          
          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.watchlistButton]}
              onPress={() => toggleWatchlist(series)}
            >
              <Ionicons 
                name={isInWatchlist(series.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isInWatchlist(series.id) ? "#E91E63" : colors.text} 
              />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Watchlist
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={24} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Descripción */}
          <Text style={[styles.description, { color: colors.text }]}>
            {series.description}
          </Text>
          
          {/* Temporadas */}
          <View style={styles.seasonsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Seasons</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {series.seasons.map(season => (
                <TouchableOpacity
                  key={season.number}
                  style={[
                    styles.seasonButton,
                    selectedSeason.number === season.number && { 
                      backgroundColor: colors.primary 
                    }
                  ]}
                  onPress={() => setSelectedSeason(season)}
                >
                  <Text style={[
                    styles.seasonButtonText,
                    selectedSeason.number === season.number && { 
                      color: 'white' 
                    }
                  ]}>
                    Season {season.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Episodios */}
          <View style={styles.episodesContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Episodes
            </Text>
            
            <FlatList
              data={selectedSeason.episodes}
              renderItem={renderEpisodeItem}
              keyExtractor={item => `episode-${item.number}`}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de información del episodio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={30} color={colors.text} />
            </TouchableOpacity>
            
            {selectedEpisode && (
              <>
                <Text style={[styles.modalSeasonInfo, { color: colors.primary }]}>
                  Season {selectedEpisode.seasonNumber} • Episode {selectedEpisode.number}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedEpisode.title}
                </Text>
                <Text style={[styles.modalDescription, { color: colors.text }]}>
                  {selectedEpisode.description}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.modalPlayButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setModalVisible(false);
                    handlePlayEpisode(selectedEpisode);
                  }}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.modalPlayButtonText}>Watch Now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SeriesDetailScreen;