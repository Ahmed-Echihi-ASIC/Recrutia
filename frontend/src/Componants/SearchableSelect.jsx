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

export default function SearchableSelect({
  label,
  data = [],
  value,
  onSelect,
  icon,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel =
    data.find((item) => item.value === value)?.label || "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.select}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name={icon || "chevron-down-outline"}
          size={22}
          color="#666"
        />

        <Text
          style={[
            styles.value,
            !selectedLabel && { color: "#999" },
          ]}
        >
          {selectedLabel || "Sélectionner"}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={22}
          color="#666"
        />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{label}</Text>

          <TextInput
            placeholder="Rechercher..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.value.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                  setSearch("");
                }}
              >
                <Text style={styles.itemText}>{item.label}</Text>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 18,
  },

  label: {
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  select: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: "#fff",
  },

  value: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    color: "#222",
  },

  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    fontSize: 16,
  },

  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemText: {
    fontSize: 16,
  },

  closeButton: {
    backgroundColor: "darkorange",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 15,
  },

  closeText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
});