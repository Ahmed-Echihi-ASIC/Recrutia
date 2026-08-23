import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function GoogleButton({ onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AntDesign
        name="google"
        size={20}
        color="darkorange"
      />

      <Text style={[styles.text, { color: colors.text }]}>
        Continuer avec Google
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  text: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
  },
});