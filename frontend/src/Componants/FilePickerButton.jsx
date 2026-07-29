import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FilePickerButton({
  title = "Choisir un fichier",
  icon = "cloud-upload-outline",
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color="darkorange"
      />

      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    height: 55,
    marginHorizontal: 20,
    marginBottom: 20,

    borderWidth: 1.5,
    borderColor: "darkorange",
    borderRadius: 10,

    backgroundColor: "#fff",
  },

  text: {
    marginLeft: 8,
    fontSize: 16,
    color: "darkorange",
    fontWeight: "600",
  },
});