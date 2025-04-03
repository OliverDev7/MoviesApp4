"use client"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { useTheme } from "../../context/ThemeContext"

export default function CategoryButton({ category, isActive, onPress }) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive ? "#E91E63" : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: isActive ? "#FFFFFF" : colors.text }]}>{category.name}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
})


