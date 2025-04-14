"use client"
import { View, Text } from 'react-native'; // Componentes válidos
import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Ajusta la ruta según tu estructura

const MoviesContext = createContext();

export const MoviesProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [movies, setMovies] = useState([]); // Estado para almacenar películas desde Firebase
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  // 1. Obtener películas desde Firebase
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movies")); // Ajusta "movies" por tu nombre de colección
        const moviesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMovies(moviesData);
        setFilteredMovies(moviesData); // Inicialmente muestra todas
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // 2. Extraer categorías únicas
  const getUniqueCategories = () => {
    if (!movies.length) return [{ id: "0", name: "All" }]; // Evita errores si no hay datos
    const categories = new Set();
    movies.forEach((movie) => categories.add(movie.category));
    return ["All", ...Array.from(categories)].map((name, id) => ({ 
      id: id.toString(), 
      name 
    }));
  };

  // 3. Filtrar por categoría
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(movies.filter((movie) => movie.category === selectedCategory));
    }
  }, [selectedCategory, movies]);

  // 4. Simular películas en progreso (opcional)
  const moviesBeingWatched = movies.slice(0, 4).map((movie) => ({
    ...movie,
    progress: Math.random() * 0.8 + 0.1,
  }));

  // 5. Renderizar
  if (loading) {
    return <Text>Loading movies...</Text>; // O un spinner
  }

  return (
    <MoviesContext.Provider
      value={{
        movies,
        categories: getUniqueCategories(),
        selectedCategory,
        setSelectedCategory,
        filteredMovies,
        moviesBeingWatched,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MoviesContext);
  if (context === undefined) {
    throw new Error("useMovies must be used within a MoviesProvider");
  }
  return context;
};