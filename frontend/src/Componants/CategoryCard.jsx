import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function CategoryCard({ data = [], selectedId, onSelect }) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Puce "Tous" */}
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: selectedId === null
              ? "darkorange"
              : colors.card,
            borderColor: selectedId === null
              ? "darkorange"
              : colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => onSelect(null)}
      >
        <Ionicons
          name="apps-outline"
          size={15}
          color={selectedId === null ? "#FFFFFF" : colors.subText}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.chipText,
            { color: selectedId === null ? "#FFFFFF" : colors.text },
          ]}
        >
          Tous
        </Text>
      </TouchableOpacity>

      {data.map((cat) => {
        const isSelected = selectedId === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? "darkorange"
                  : colors.card,
                borderColor: isSelected
                  ? "darkorange"
                  : colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => onSelect(isSelected ? null : cat.id)}
          >
            {cat.icone && (
              <Ionicons
                name={cat.icone}
                size={15}
                color={isSelected ? "#FFFFFF" : "darkorange"}
                style={{ marginRight: 6 }}
              />
            )}

            <Text
              style={[
                styles.chipText,
                { color: isSelected ? "#FFFFFF" : colors.text },
              ]}
            >
              {cat.nom}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});