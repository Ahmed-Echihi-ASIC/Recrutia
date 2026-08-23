import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../Utils/translations";

const ThemeContext = createContext();

export const lightColors = {
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  primary: "darkorange",
  border: "#E5E7EB",
  modalBg: "#FFFFFF",
  iconColor: "#333333",
  inputBg: "#FFFFFF",
  inputBorder: "#D1D5DB",
  inputText: "#1F2937",
  placeholder: "#9CA3AF",
  surface: "#F3F4F6",
  shadow: "rgba(0, 0, 0, 0.05)",
  isDark: false,
};

export const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#F9FAFB",
  subText: "#9CA3AF",
  primary: "darkorange",
  border: "#2D2D2D",
  modalBg: "#1E1E1E",
  iconColor: "#FFFFFF",
  inputBg: "#242424",
  inputBorder: "#3D3D3D",
  inputText: "#F9FAFB",
  placeholder: "#6B7280",
  surface: "#1A1A1A",
  shadow: "rgba(0, 0, 0, 0.4)",
  isDark: true,
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("@theme_mode");
      const savedLang = await AsyncStorage.getItem("@app_language");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
      if (savedLang !== null) {
        setLanguage(savedLang);
      }
    } catch (e) {
      console.log("Erreur chargement préférences :", e);
    }
  };

  const toggleTheme = async () => {
    try {
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      await AsyncStorage.setItem("@theme_mode", nextMode ? "dark" : "light");
    } catch (e) {
      console.log("Erreur sauvegarde thème :", e);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem("@app_language", lang);
    } catch (e) {
      console.log("Erreur sauvegarde langue :", e);
    }
  };

  const t = (key) => {
    const langDict = translations[language] || translations.fr;
    return langDict[key] || translations.fr[key] || key;
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        language,
        changeLanguage,
        t,
        isRTL: language === "ar",
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
