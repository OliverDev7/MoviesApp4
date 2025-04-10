"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { View, StyleSheet, Dimensions, ActivityIndicator, Platform } from "react-native"
import { Ionicons, FontAwesome } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { auth, onAuthStateChanged } from "../firebase/firebase"

import HomeScreen from "../screens/Home/HomeScreen"
import SearchScreen from "../screens/Buscar/SearchScreen"
import WatchlistScreen from "../screens/WatchListScreen/WatchListScreen"
import ProfileScreen from "../screens/Profile/ProfileScreen"
import MovieDetailScreen from "../screens/Detail/Detail"
import SeriesDetailScreen from "../screens/seriesDetail/SeriesDetailScreen"
import VideoPlayerScreen from "../screens/VideoPlayer/VideoPlayer"
import SeriesScreen from "../screens/Series/SeriesScreen"
import SplashScreen from "../screens/Carga/CargaScreen"
import WelcomeScreen from "../screens/Inicio/InicioScreen"
import LoginScreen from "../screens/Ingreso/LoginScreen"
import RegisterScreen from "../screens/Registro/RegistroScreen"
import { useTheme } from "../context/ThemeContext"
import AllMovies from "../screens/AllMovies/AllMovies"
import EmailVerificationScreen from "../screens/EmailVerification/EmailVerificationScreen"

const BottomTab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()
const { width } = Dimensions.get("window")

// Stack de autenticación
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="EmailVerificationScreen" component={EmailVerificationScreen} />
    </AuthStack.Navigator>
  )
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SeriesScreen" component={SeriesScreen} />
      <Stack.Screen name="AllMovies" component={AllMovies} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  )
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  )
}

function WatchlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WatchlistScreen" component={WatchlistScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  )
}



function BottomTabNavigator() {
  const { colors } = useTheme()
  const positionValue = Platform.OS === 'ios' ? 'absolute' : 'fixed'
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        return {
          tabBarActiveTintColor: "#E91E63",
          tabBarInactiveTintColor: colors.secondary,
          headerShown: false,
          tabBarStyle: {
            position: positionValue,
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: "rgba(18, 18, 18, 0.95)",
            height: 65,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          },
          tabBarShowLabel: false, // Eliminar textos de los ítems
        }
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={28} color={color} />
              {focused && <View style={[styles.indicator, { backgroundColor: "#E91E63" }]} />}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Si estamos en VideoPlayer, prevenir la navegación por tab
            if (
              navigation.getState().routes.some((route) => route.state?.routes?.some((r) => r.name === "VideoPlayer"))
            ) {
              e.preventDefault()
            }
          },
        })}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="search" size={28} color={color} />
              {focused && <View style={[styles.indicator, { backgroundColor: "#E91E63" }]} />}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Si estamos en VideoPlayer, prevenir la navegación por tab
            if (
              navigation.getState().routes.some((route) => route.state?.routes?.some((r) => r.name === "VideoPlayer"))
            ) {
              e.preventDefault()
            }
          },
        })}
      />
      <BottomTab.Screen
        name="Watchlist"
        component={WatchlistStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={28} color={color} />
              {focused && <View style={[styles.indicator, { backgroundColor: "#E91E63" }]} />}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Si estamos en VideoPlayer, prevenir la navegación por tab
            if (
              navigation.getState().routes.some((route) => route.state?.routes?.some((r) => r.name === "VideoPlayer"))
            ) {
              e.preventDefault()
            }
          },
        })}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="user" size={28} color={color} />
              {focused && <View style={[styles.indicator, { backgroundColor: "#E91E63" }]} />}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Si estamos en VideoPlayer, prevenir la navegación por tab
            if (
              navigation.getState().routes.some((route) => route.state?.routes?.some((r) => r.name === "VideoPlayer"))
            ) {
              e.preventDefault()
            }
          },
        })}
      />
    </BottomTab.Navigator>
  )
}

export default function Navigation() {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState(null)

  // Manejar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Solo permitir usuarios con email verificado
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
      
      if (initializing) setInitializing(false)
    })
  
    return unsubscribe
  }, [])

  // Mostrar un indicador de carga mientras se inicializa
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 40,
  },
  indicator: {
    position: "absolute",
    bottom: -8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
})

