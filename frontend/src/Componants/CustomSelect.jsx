import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function CustomSelect({
  label,
  value,
  onValueChange,
  items = [],
  icon,
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg || colors.card || "#FFFFFF",
            borderColor: colors.inputBorder || colors.border || "#E5E7EB",
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.subText || "#777"}
            style={styles.icon}
          />
        )}

        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          dropdownIconColor={colors.subText || "#777"}
          style={[styles.picker, { color: colors.inputText || colors.text || "#1F2937" }]}
          itemStyle={{ height: 52, fontSize: 15, color: colors.inputText || colors.text || "#1F2937" }}
        >
          <Picker.Item
            label="Sélectionner..."
            value=""
            color={colors.placeholder || "#9CA3AF"}
          />

          {Array.isArray(items) &&
            items.map((item) => (
              <Picker.Item
                key={String(item.value)}
                label={item.label}
                value={item.value}
                color={colors.isDark ? "#F9FAFB" : "#1F2937"}
              />
            ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "600",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: "hidden",
    height: 52,
  },

  icon: {
    marginLeft: 12,
  },

  picker: {
    flex: 1,
    height: 52,
    backgroundColor: "transparent",
  },
});
