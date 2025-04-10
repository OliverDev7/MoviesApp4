"use client"

import { createContext, useContext } from "react"

const ThemeContext = createContext(undefined)

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      background: "#0A0A0A",
      text: "#FFFFFF",
      primary: "#E91E63",
      secondary: "#8E8E93",
      card: "#121212",
      border: "#2C2C2C",
      colortext: "#E91E63",
    },
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

