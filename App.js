import React, {useEffect, useRef} from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { View, Text, ActivityIndicator, Linking } from 'react-native';
import './firebase/firebase'
// Importa el componente de navegación
import Navigation from './navigation';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider } from './context/WatchListContext';
import { MoviesProvider } from './context/MovieContext';
import * as Localization from 'expo-localization';
// Asegúrate de que el archivo firebase esté correctamente configurado
import './firebase/firebase';

export default function App() {
  // Carga las fuentes usando expo-google-fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const navigationRef = useRef();
  
  // Manejar Deep Links
  useEffect(() => {
    // Manejar enlaces iniciales
    const getInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink({ url: initialURL });
      }
    };
    
    getInitialURL();
    
    // Escuchar enlaces entrantes
    const linkingListener = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      linkingListener.remove();
    };
  }, []);

  const handleDeepLink = ({ url }) => {
    if (!url) return;
    
    console.log('Deep Link recibido:', url);
    
    // Parsear la URL
    // Ejemplo: movieapp://content/movie/123 o https://movieapp.com/content/movie/123
    const parsedUrl = url.split('/');
    
    if (parsedUrl.includes('content')) {
      const contentTypeIndex = parsedUrl.indexOf('content') + 1;
      const contentIdIndex = contentTypeIndex + 1;
      
      if (parsedUrl.length > contentIdIndex) {
        const contentType = parsedUrl[contentTypeIndex]; // 'movie' o 'series'
        const contentId = parsedUrl[contentIdIndex]; // ID del contenido
        
        console.log(`Navegando a ${contentType} con ID ${contentId}`);
        
        // Navegar a la pantalla correspondiente
        if (navigationRef.current) {
          if (contentType === 'movie') {
            // Buscar la película por ID y navegar a ella
            navigationRef.current.navigate('Main', {
              screen: 'Home',
              params: {
                screen: 'MovieDetail',
                params: { movieId: contentId }
              }
            });
          } else if (contentType === 'series') {
            navigationRef.current.navigate('Main', {
              screen: 'Home',
              params: {
                screen: 'SeriesDetail',
                params: { seriesId: contentId }
              }
            });
          }
        }
      }
    }
  };

  // Muestra una pantalla de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#FFCC00" />
        <Text style={{ color: '#FFFFFF' }}>Cargando...</Text>
      </View>
    );
  }

  // Una vez que las fuentes están cargadas, muestra la aplicación
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MoviesProvider>
          <WatchlistProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="light" />
              <Navigation />
            </NavigationContainer>
          </WatchlistProvider>
        </MoviesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}