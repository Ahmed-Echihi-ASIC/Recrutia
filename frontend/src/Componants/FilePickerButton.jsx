import React from "react";
import * as DocumentPicker from "expo-document-picker";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function FilePickerButton({
  title,
  icon = "cloud-upload-outline",
  value,
  onChange,
  type = "*/*",
}) {
  const { colors } = useTheme();

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      onChange(result.assets[0]);
    } catch (error) {
      console.log("Erreur :", error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.inputBg || colors.card || "#FFFFFF",
            borderColor: value
              ? "darkorange"
              : colors.inputBorder || colors.border || "#E5E7EB",
          },
        ]}
        onPress={pickFile}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={icon}
            size={20}
            color="darkorange"
          />
        </View>

        <Text
          style={[
            styles.buttonText,
            { color: value ? colors.inputText || colors.text : colors.placeholder || "#9CA3AF" },
          ]}
          numberOfLines={1}
        >
          {value ? value.name : title}
        </Text>

        <Ionicons
          name={value ? "checkmark-circle" : "attach-outline"}
          size={20}
          color={value ? "#059669" : colors.subText}
        />
      </TouchableOpacity>

      {value && (
        <Text style={styles.fileName} numberOfLines={1}>
          ✓ Fichier sélectionné : {value.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  fileName: {
    marginTop: 4,
    marginLeft: 4,
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },
});
