// components/TopTabNavigator.js - Solución para el error de Series
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

// Cambiado "TV Shows" por "Series"
const tabs = ["Movies", "Series", "Watchlist"];

export default function TopTabNavigator() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("Movies");
  const navigation = useNavigation();
  const route = useRoute();

  // Actualizar la pestaña activa basada en la ruta actual
  useEffect(() => {
    const routeName = route.name;
    if (routeName === "SeriesScreen") {
      setActiveTab("Series");
    } else if (routeName === "HomeScreen") {
      setActiveTab("Movies");
    } else if (routeName === "WatchlistScreen") {
      setActiveTab("Watchlist");
    }
  }, [route]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);

    // Navegar a la pantalla correspondiente cuando se selecciona una pestaña
    try {
      if (tab === "Series") {
        // Verificar si estamos en un stack de navegación
        const parent = navigation.getParent();
        if (parent) {
          // Estamos en un stack, navegar al stack principal primero
          navigation.navigate("Home", { screen: "SeriesScreen" });
        } else {
          // Intentar navegar directamente
          navigation.navigate("SeriesScreen");
        }
      } else if (tab === "Movies") {
        const parent = navigation.getParent();
        if (parent) {
          navigation.navigate("Home", { screen: "HomeScreen" });
        } else {
          navigation.navigate("HomeScreen");
        }
      } else if (tab === "Watchlist") {
        navigation.navigate("Watchlist");
      }
    } catch (error) {
      console.error(`Error al navegar a ${tab}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} style={styles.tab} onPress={() => handleTabPress(tab)}>
          <Text style={[styles.tabText, { color: activeTab === tab ? "#E91E63" : colors.secondary }]}>{tab}</Text>
          {activeTab === tab && <View style={[styles.indicator, { backgroundColor: "#E91E63" }]} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Mantener los estilos existentes...

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  tab: {
    marginRight: 24,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  indicator: {
    height: 3,
    width: "100%",
    borderRadius: 1.5,
    marginTop: 4,
  },
});