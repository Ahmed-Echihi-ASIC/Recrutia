import * as DocumentPicker from "expo-document-picker";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FilePickerButton({
  title,
  icon,
  value,
  onChange,
  type = "*/*",
}) {
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      console.log("Fichier sélectionné :", result.assets[0]);

      onChange(result.assets[0]);
    } catch (error) {
      console.log("Erreur :", error);
    }
  };

return (
  <>
    <TouchableOpacity
      style={styles.button}
      onPress={pickFile}
    >
      <Ionicons
        name={icon}
        size={22}
        color="darkorange"
      />

      <Text style={styles.buttonText}>
        {value ? value.name : title}
      </Text>
    </TouchableOpacity>

    {value && (
      <Text style={styles.fileName}>
        ✓ {value.name}
      </Text>
    )}
  </>
);
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  buttonText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
    flex: 1,
  },

  fileName: {
    marginHorizontal: 20,
    marginBottom: 15,
    color: "green",
    fontSize: 13,
  },
});
