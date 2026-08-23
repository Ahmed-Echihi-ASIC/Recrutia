import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { colors, t } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={20} color={colors.subText} />

      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder || t("searchPlaceholder")}
        placeholderTextColor={colors.subText}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />

      {value?.length > 0 && (
        <Ionicons
          name="close-circle"
          size={18}
          color={colors.subText}
          onPress={() => onChangeText("")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
});