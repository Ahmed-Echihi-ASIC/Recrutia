import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HeaderMenu({ onMenu }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenu}>
        <Ionicons
          name="menu-outline"
          size={28}
          color="darkorange"
        />
      </TouchableOpacity>

      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },

  logo: {
    width: 95,
    height: 40,
    marginLeft: 10,
  },
});