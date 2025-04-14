import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  TwitterAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth"
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  persistentLocalCache,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"
//import { moviesData } from "../data/data";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCU9b1QuuUqyF182KXjlQkdXcjY9hqzk1c",
  authDomain: "proyectoig.firebaseapp.com",
  databaseURL: "https://proyectoig-default-rtdb.firebaseio.com",
  projectId: "proyectoig",
  storageBucket: "proyectoig.firebasestorage.app",
  messagingSenderId: "728569311742",
  appId: "1:728569311742:web:9fb6e3881efdba776310af",
  measurementId: "G-4HXSTHKENY",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
//const auth = getAuth(app)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app)
const storage = getStorage(app)

// Proveedores de autenticación
const googleProvider = new GoogleAuthProvider()
const twitterProvider = new TwitterAuthProvider()


{/*const uploadMovies = async () => {
  try {
    const moviesCollection = collection(db, "movies"); // Colección en Firestore

    for (const movie of moviesData) {
      const movieRef = doc(moviesCollection, movie.id); // Usa el `id` como clave única
      await setDoc(movieRef, movie);
      console.log(`✅ Película "${movie.title}" subida correctamente.`);
    }
    console.log("🚀 Todas las películas se han subido correctamente.");
  } catch (error) {
    console.error("❌ Error subiendo películas:", error);
  }
};

// Ejecutar la subida
uploadMovies();*/}

// Función para iniciar sesión con email y contraseña
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verificar si el email está verificado
    if (!user.emailVerified) {
      throw { code: "auth/email-not-verified", message: "Email no verificado" };
    }
    
    // Actualizar lastLogin en Firestore
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp(),
      emailVerified: true, // Actualizar estado de verificación
    });
    
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Función para iniciar sesión con proveedores sociales
export const loginWithSocialProvider = async (credential) => {
  const userCredential = await signInWithCredential(auth, credential)
  const user = userCredential.user

  // Verificar si el usuario ya existe en Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid))

  if (!userDoc.exists()) {
    // Si es un usuario nuevo, crear su documento en Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } else {
    // Si el usuario ya existe, actualizar su información
    await updateDoc(doc(db, "users", user.uid), {
      updatedAt: new Date(),
      lastLogin: serverTimestamp(),
      // Actualizar photoURL solo si existe
      ...(user.photoURL && { photoURL: user.photoURL }),
      // Actualizar displayName solo si existe
      ...(user.displayName && { displayName: user.displayName }),
    })
  }

  return user
}

export const registerWithEmailAndPassword = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Actualizar el perfil del usuario
  await updateProfile(user, { displayName })

  // Enviar email de verificación
  await sendEmailVerification(user)

  // Crear documento de usuario en Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    photoURL: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false, // Añadir campo para seguimiento de verificación
  })

  // Cerrar sesión para forzar al usuario a verificar su correo
  await signOut(auth)

  return user
}

export const getSeries = async () => {
  try {
    const seriesCollection = collection(db, "series")
    const seriesSnapshot = await getDocs(seriesCollection)

    const seriesList = seriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return seriesList
  } catch (error) {
    console.error("Error fetching series:", error)
    throw error
  }
}

const toggleFavorite = async (movieId, userId, isCurrentlyFavorite) => {
  try {
    const userRef = doc(db, "users", userId)

    if (isCurrentlyFavorite) {
      // Remover de favoritos
      await updateDoc(userRef, {
        favorites: arrayRemove(movieId),
      })
    } else {
      // Agregar a favoritos
      await updateDoc(userRef, {
        favorites: arrayUnion(movieId),
      })
    }

    return !isCurrentlyFavorite // Retorna el nuevo estado
  } catch (error) {
    console.error("Error toggling favorite:", error)
    throw error // Puedes manejar este error en tu componente
  }
}

export const isInFavorites = async (userId, movieId) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const favorites = userSnap.data().favorites || []
      return favorites.some((fav) => fav.id === movieId)
    }
    return false
  } catch (error) {
    console.error("Error checking favorites:", error)
    return false
  }
}

export const getPopularMovies = async () => {
  try {
    const moviesCollection = collection(db, "movies")
    const moviesQuery = query(moviesCollection, orderBy("popularity", "desc"))
    const moviesSnapshot = await getDocs(moviesQuery)

    return moviesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((movie) => movie.id) // Filtra películas sin ID
  } catch (error) {
    console.error("Error getting popular movies:", error)
    return [] // Retorna array vacío en caso de error
  }
}

export const addToFavorites = async (userId, movieId, type, data) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      favorites: arrayUnion({
        id: movieId,
        type,
        ...data,
        addedAt: new Date(),
      }),
    })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    throw error
  }
}

export const removeFromFavorites = async (userId, movieId) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const favorites = userSnap.data().favorites || []
      const updatedFavorites = favorites.filter((fav) => fav.id !== movieId)
      await updateDoc(userRef, { favorites: updatedFavorites })
    }
  } catch (error) {
    console.error("Error removing from favorites:", error)
    throw error
  }
}

export const getMovies = async () => {
  try {
    const moviesCollection = collection(db, "movies") // Asegúrate de que la colección exista en Firestore
    const moviesSnapshot = await getDocs(moviesCollection)
    return moviesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting movies:", error)
    throw error
  }
}
export const getMovieById = async (movieId) => {
  try {
    const movieRef = doc(db, "movies", movieId) // Asume que las películas están en una colección "movies"
    const movieSnap = await getDoc(movieRef)

    if (movieSnap.exists()) {
      return { id: movieSnap.id, ...movieSnap.data() }
    } else {
      throw new Error("Movie not found")
    }
  } catch (error) {
    console.error("Error fetching movie details:", error)
    throw error
  }
}

export const getMoviesByCategory = async (category) => {
  try {
    const moviesCollection = collection(db, "movies") // Asegúrate de que la colección "movies" exista en Firestore
    const moviesQuery = query(moviesCollection, where("category", "==", category))
    const moviesSnapshot = await getDocs(moviesQuery)

    return moviesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting movies by category:", error)
    throw error
  }
}

// Función para crear un perfil de usuario en Firestore
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return

  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user
    const createdAt = serverTimestamp()

    try {
      // Crear el documento principal del usuario
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || "",
        email,
        photoURL: photoURL || "",
        createdAt,
        lastLogin: createdAt,
        ...additionalData,
      })

      console.log("Perfil de usuario creado con éxito")

      // No es necesario crear documentos vacíos en las subcolecciones
      // Las subcolecciones se crearán automáticamente cuando se añadan documentos a ellas
    } catch (error) {
      console.error("Error creating user profile", error)
      throw error
    }
  } else {
    // Si el usuario ya existe, actualizar lastLogin
    try {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating lastLogin", error)
    }
  }

  return userRef
}

// Función para guardar el progreso de visualización
export const saveWatchProgress = async (userId, mediaId, progress, duration, mediaType, mediaData) => {
  try {
    // Referencia al documento de progreso en la subcolección watchProgress
    const progressRef = doc(db, "users", userId, "watchProgress", mediaId)

    // Datos a guardar
    const progressData = {
      mediaId,
      mediaType, // 'movie' o 'series'
      title: mediaData.title,
      poster: mediaData.poster,
      progress, // posición en milisegundos
      duration, // duración total en milisegundos
      percentage: Math.floor((progress / duration) * 100), // porcentaje completado
      lastWatched: serverTimestamp(),
    }

    // Si es una serie, guardar información adicional
    if (mediaType === "series" && mediaData.seasonNumber && mediaData.episodeNumber) {
      progressData.seasonNumber = mediaData.seasonNumber
      progressData.episodeNumber = mediaData.episodeNumber
      progressData.episodeTitle = mediaData.episodeTitle || `Episodio ${mediaData.episodeNumber}`
    }

    // Guardar o actualizar el progreso
    await setDoc(progressRef, progressData, { merge: true })

    return progressData
  } catch (error) {
    console.error("Error saving watch progress:", error)
    throw error
  }
}

// Función para obtener el progreso de visualización de un medio específico
export const getWatchProgress = async (userId, mediaId) => {
  try {
    const progressRef = doc(db, "users", userId, "watchProgress", mediaId)
    const progressSnap = await getDoc(progressRef)

    if (progressSnap.exists()) {
      return progressSnap.data()
    } else {
      return null // No hay progreso guardado
    }
  } catch (error) {
    console.error("Error getting watch progress:", error)
    throw error
  }
}

// Función para obtener la lista "Continue Watching" del usuario
export const getContinueWatching = async (userId, limitCount = 10) => {
  try {
    const progressCollection = collection(db, "users", userId, "watchProgress")
    const q = query(progressCollection, orderBy("lastWatched", "desc"), limit(limitCount))

    const progressSnapshot = await getDocs(q)
    const continueWatchingList = progressSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return continueWatchingList
  } catch (error) {
    console.error("Error getting continue watching list:", error)
    throw error
  }
}

// Función para eliminar un elemento de la lista "Continue Watching"
export const removeFromContinueWatching = async (userId, mediaId) => {
  try {
    const progressRef = doc(db, "users", userId, "watchProgress", mediaId)
    await deleteDoc(progressRef)
  } catch (error) {
    console.error("Error removing from continue watching:", error)
    throw error
  }
}

// Función para obtener la lista de favoritos
export 
const getFavorites = async (userId) => {
  try {
    const favoritesCollection = collection(db, "users", userId, "favorites")
    const favoritesSnapshot = await getDocs(favoritesCollection)
    const favoritesList = favoritesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return favoritesList
  } catch (error) {
    console.error("Error getting favorites:", error)
    throw error
  }
}

// Función para agregar a watchlist
export const addToWatchlist = async (userId, mediaId, mediaType, mediaData) => {
  try {
    const watchlistRef = doc(db, "users", userId, "watchlist", mediaId)

    await setDoc(watchlistRef, {
      mediaId,
      mediaType,
      title: mediaData.title,
      poster: mediaData.poster,
      category: mediaData.category,
      addedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    throw error
  }
}

// Función para eliminar de watchlist
export const removeFromWatchlist = async (userId, mediaId) => {
  try {
    const watchlistRef = doc(db, "users", userId, "watchlist", mediaId)
    await deleteDoc(watchlistRef)
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    throw error
  }
}

// Función para verificar si un medio está en watchlist
export const isInWatchlist = async (userId, mediaId) => {
  try {
    const watchlistRef = doc(db, "users", userId, "watchlist", mediaId)
    const watchlistSnap = await getDoc(watchlistRef)
    return watchlistSnap.exists()
  } catch (error) {
    console.error("Error checking watchlist:", error)
    throw error
  }
}

// Función para obtener la watchlist
export const getWatchlist = async (userId) => {
  try {
    const watchlistCollection = collection(db, "users", userId, "watchlist")
    const watchlistSnapshot = await getDocs(watchlistCollection)
    const watchlistItems = watchlistSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return watchlistItems
  } catch (error) {
    console.error("Error getting watchlist:", error)
    throw error
  }
}

// Exportar todo lo necesario
export {
  auth,
  db,
  storage,
  googleProvider,
  twitterProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  toggleFavorite,
}

