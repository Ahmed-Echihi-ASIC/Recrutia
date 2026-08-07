import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavigation from "../Componants/BottomNavigation";
import { useAuth } from "../Context/AuthContext";
import SelectData from "../Data/SelectData";

// ==========================
// Adresse de base du serveur (sans le "?action=...")
// À adapter si l'IP du backend change.
// ==========================
const SERVER_URL = "http://192.168.100.34:8000";

// Image par défaut si l'utilisateur n'a pas encore de photo
const DEFAULT_IMAGE = require("../../assets/image.jpeg");

const buildFileUrl = (path) => {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${SERVER_URL}/${path.replace(/^\/+/, "")}`;
};

const findLabel = (items, value) => {
  if (!value || !Array.isArray(items)) return value;

  return (
    items.find((item) => String(item.value) === String(value))?.label ||
    value
  );
};

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.replace("Login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Aucun utilisateur connecté
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================
  // Construction de la source de l'image :
  // - si user.photo existe (chemin renvoyé par le backend,
  //   ex: "uploads/photos/abc123.jpg"), on construit l'URL complète
  // - sinon on utilise l'image par défaut locale
  // ==========================
  const photoUrl = buildFileUrl(user.photo);

  const photoSource = photoUrl
    ? { uri: photoUrl }
    : DEFAULT_IMAGE;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.header}>
          <Image
            source={photoSource}
            style={styles.image}
          />

          <Text style={styles.name}>
            {user.prenom} {user.nom}
          </Text>

          <Text style={styles.email}>
            {user.email}
          </Text>
        </View>

        <View style={styles.card}>

          <Item
            icon="call-outline"
            title="Téléphone"
            value={user.telephone}
          />

          <Item
            icon="location-outline"
            title="Ville"
            value={user.ville}
          />

          <Item
            icon="home-outline"
            title="Adresse"
            value={user.adresse}
          />

          <Item
            icon="school-outline"
            title="Diplôme"
            value={user.diplome}
          />

          <Item
            icon="briefcase-outline"
            title="Spécialité"
            value={findLabel(SelectData.specialite, user.specialite)}
          />

          <Item
            icon="heart-outline"
            title="Situation familiale"
            value={findLabel(
              SelectData.situation_familiale,
              user.situation_familiale
            )}
          />

          <Item
            icon="calendar-outline"
            title="Date de naissance"
            value={user.date_naissance}
          />

        </View>

        <MenuButton
          icon="create-outline"
          title="Modifier mon profil"
          onPress={() => navigation.navigate("EditProfile")}
        />

        <MenuButton
          icon="lock-closed-outline"
          title="Changer le mot de passe"
          onPress={() => {}}
        />

        <MenuButton
          
          icon="log-out-outline"
          title="Déconnexion"
          onPress={handleLogout}
        />

      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

function Item({ icon, title, value }) {
  return (
    <View style={styles.item}>

      <Ionicons
        name={icon}
        size={24}
        color="darkorange"
      />

      <View style={{ marginLeft: 15 }}>
        <Text style={styles.itemTitle}>
          {title}
        </Text>

        <Text style={styles.itemValue}>
          {value || "-"}
        </Text>
      </View>

    </View>
  );
}

function MenuButton({
  icon,
  title,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={24}
        color="darkorange"
      />

      <Text style={styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  header: {
    backgroundColor: "darkorange",
    alignItems: "center",
    paddingVertical: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
  },

  email: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  itemTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  itemValue: {
    color: "#666",
    marginTop: 3,
  },

  button: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  buttonText: {
    fontSize: 17,
    marginLeft: 15,
  },
});
