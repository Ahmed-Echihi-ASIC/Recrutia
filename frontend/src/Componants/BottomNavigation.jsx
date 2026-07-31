import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BottomNavigation() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.container}>

     <TouchableOpacity onPress={() => navigation.navigate("Home")}>
  <Ionicons
    name={route.name === "Home" ? "home" : "home-outline"}
    size={28}
    color={route.name === "Home" ? "darkorange" : "#999"}
  />
</TouchableOpacity>


      <TouchableOpacity>
  <Ionicons
    name={route.name === "Search" ? "search" : "search-outline"}
    size={28}
    color={route.name === "Search" ? "darkorange" : "#999"}
  />
</TouchableOpacity>

      <TouchableOpacity>
  <Ionicons
    name={route.name === "Favorite" ? "bookmark" : "bookmark-outline"}
    size={28}
    color={route.name === "Favorite" ? "darkorange" : "#999"}
  />
</TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
  <Ionicons
    name={route.name === "Profile" ? "person" : "person-outline"}
    size={28}
    color={route.name === "Profile" ? "darkorange" : "#999"}
  />
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});