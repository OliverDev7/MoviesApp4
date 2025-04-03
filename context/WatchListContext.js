// context/WatchlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Cargar la watchlist del usuario al iniciar
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const storedWatchlist = await AsyncStorage.getItem(`watchlist_${user.uid}`);
          if (storedWatchlist) {
            setWatchlist(JSON.parse(storedWatchlist));
          }
        }
      } catch (error) {
        console.error('Error al cargar la watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();

    // Escuchar cambios en la autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadWatchlist();
      } else {
        setWatchlist([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Guardar la watchlist cuando cambie
  useEffect(() => {
    const saveWatchlist = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          await AsyncStorage.setItem(`watchlist_${user.uid}`, JSON.stringify(watchlist));
        }
      } catch (error) {
        console.error('Error al guardar la watchlist:', error);
      }
    };

    if (!loading) {
      saveWatchlist();
    }
  }, [watchlist, loading]);

  // Añadir o quitar película de la watchlist
  const toggleWatchlist = (movie) => {
    setWatchlist(prevWatchlist => {
      // Asegurarse de que el ID sea una cadena para comparaciones consistentes
      const movieId = String(movie.id);
      const isInWatchlist = prevWatchlist.some(item => String(item.id) === movieId);
      
      if (isInWatchlist) {
        return prevWatchlist.filter(item => String(item.id) !== movieId);
      } else {
        // Asegurarse de que el objeto movie tenga un ID como cadena
        const movieWithStringId = {
          ...movie,
          id: movieId
        };
        return [...prevWatchlist, movieWithStringId];
      }
    });
  };

 // Verificar si una película está en la watchlist
const isInWatchlist = (movieId) => {
  return watchlist.some(movie => String(movie.id) === String(movieId));
};

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist, loading }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);