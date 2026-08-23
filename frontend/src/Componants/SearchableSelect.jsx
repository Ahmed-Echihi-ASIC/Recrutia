import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchableSelect({
  label,
  data = [],
  value,
  onSelect,
  icon,
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    (item.label || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel =
    data.find((item) => item.value === value)?.label || "";

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.select,
          {
            backgroundColor: colors.inputBg || colors.card || "#FFFFFF",
            borderColor: colors.inputBorder || colors.border || "#E5E7EB",
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon || "search-outline"}
          size={20}
          color={colors.subText || "#777"}
        />

        <Text
          style={[
            styles.value,
            { color: selectedLabel ? colors.inputText || colors.text : colors.placeholder || "#9CA3AF" },
          ]}
        >
          {selectedLabel || "Sélectionner..."}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={colors.subText || "#777"}
        />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" statusBarTranslucent={true} onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.modalBg || colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{label || "Sélectionner"}</Text>

          <TextInput
            placeholder="Rechercher..."
            placeholderTextColor={colors.placeholder}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.inputBg || colors.card,
                color: colors.inputText || colors.text,
                borderColor: colors.inputBorder || colors.border,
              },
            ]}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.value.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                  setSearch("");
                }}
              >
                <Text style={[styles.itemText, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setVisible(false);
              setSearch("");
            }}
          >
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  select: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },

  value: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
  },

  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 45,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  searchInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    fontSize: 15,
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  itemText: {
    fontSize: 15,
  },

  closeButton: {
    backgroundColor: "darkorange",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 15,
  },

  closeText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});