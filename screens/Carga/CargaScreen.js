import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../firebase/firebase";
import * as Localization from 'expo-localization';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Verificar si hay un usuario autenticado después de un tiempo para mostrar el splash
    const checkAuth = async () => {
      try {
        // Esperar 2 segundos para mostrar el splash
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Si hay usuario autenticado, verificar si el email está verificado
          if (currentUser.emailVerified || currentUser.providerData[0].providerId !== "password") {
            // Si el email está verificado o el usuario se registró con un proveedor social, ir a la pantalla principal
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            // Si el email no está verificado, ir a la pantalla de login
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        } else {
          // Si no hay usuario autenticado, ir a la pantalla de bienvenida
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // En caso de error, ir a la pantalla de bienvenida
        navigation.reset({
          index: 0,
          routes: [{ name: "Welcome" }],
        });
      }
    };
    
    checkAuth();
  }, [navigation]);

  return (
    <LinearGradient colors={["#000", "#000"]} style={styles.container}>
      <View style={styles.content}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Cargando...</Text>
        <ActivityIndicator size="large" color="#E91E63" style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});