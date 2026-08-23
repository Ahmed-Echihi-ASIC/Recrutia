import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BottomNavigation from "../Componants/BottomNavigation";
import HeaderMenu from "../Componants/HeaderMenu";
import SideMenuModal from "../Componants/SideMenuModal";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { getLabelFromValue } from "../Utils/SelectHelpers";
import { SERVER_URL } from "../Config/config";

const DEFAULT_IMAGE = require("../../assets/image.jpeg");

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, t } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t("logout"),
      t("confirmLogout"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
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

  const handleOpenCV = () => {
    if (!user?.cv) {
      Alert.alert("CV indisponible", "Aucun CV n'a été importé pour ce profil.");
      return;
    }

    const cvUrl = `${SERVER_URL}/${user.cv}`;
    Linking.openURL(cvUrl).catch(() => {
      Alert.alert(t("error"), "Impossible d'ouvrir le CV.");
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ textAlign: "center", marginTop: 40, color: colors.text }}>
          Aucun utilisateur connecté
        </Text>
      </SafeAreaView>
    );
  }

  const photoSource = user.photo
    ? { uri: `${SERVER_URL}/${user.photo}` }
    : DEFAULT_IMAGE;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <HeaderMenu
        onMenu={() => setIsMenuVisible(true)}
        title={t("myProfile")}
        showLogo={false}
        showNotification={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête profil carte d'identité */}
        <View style={[styles.headerCard, { backgroundColor: colors.isDark ? "#2A2318" : "#FFF7ED", borderColor: colors.border }]}>
          <View style={styles.imageRing}>
            <Image source={photoSource} style={styles.image} />
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {user.prenom} {user.nom}
          </Text>
          <Text style={[styles.email, { color: colors.subText }]}>{user.email}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="checkmark-seal" size={14} color="darkorange" />
            <Text style={styles.roleBadgeText}>Candidat Vérifié</Text>
          </View>

          {/* Badge de statut du dossier */}
          <View
            style={[
              styles.dossierBadge,
              user.statut_dossier === "accepte" && styles.dossierBadgeAccepted,
              user.statut_dossier === "refuse" && styles.dossierBadgeRejected,
            ]}
          >
            <Ionicons
              name={
                user.statut_dossier === "accepte"
                  ? "checkmark-circle"
                  : user.statut_dossier === "refuse"
                  ? "close-circle"
                  : "time"
              }
              size={14}
              color={
                user.statut_dossier === "accepte"
                  ? "#059669"
                  : user.statut_dossier === "refuse"
                  ? "#DC2626"
                  : "#D97706"
              }
            />
            <Text
              style={[
                styles.dossierBadgeText,
                user.statut_dossier === "accepte" && { color: "#059669" },
                user.statut_dossier === "refuse" && { color: "#DC2626" },
              ]}
            >
              {user.statut_dossier === "accepte"
                ? t("statusAcceptedBadge")
                : user.statut_dossier === "refuse"
                ? t("statusRejectedBadge")
                : t("statusPendingBadge")}
            </Text>
          </View>
        </View>

        {/* Section 1 : Parcours & Spécialité */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Parcours & Spécialité</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Item
            icon="school-outline"
            title="Diplôme"
            value={user.diplome}
            colors={colors}
          />

          <Item
            icon="ribbon-outline"
            title="Niveau d'étude"
            value={getLabelFromValue("niveau_etudes", user.niveau_etude)}
            colors={colors}
          />

          <Item
            icon="construct-outline"
            title="Spécialité"
            value={getLabelFromValue("specialite", user.specialite)}
            colors={colors}
          />

          <Item
            icon="fitness-outline"
            title="Condition physique"
            value={getLabelFromValue("condition_physique", user.condition_physique)}
            colors={colors}
          />

          <Item
            icon="briefcase-outline"
            title="Expérience"
            value={(() => {
              const nb = getLabelFromValue("nombre_experience", user.nombre_experiences);
              const duree = getLabelFromValue("duree_experience", user.duree_experience);
              if (nb && duree) return `${nb} (${duree})`;
              return nb || duree;
            })()}
            colors={colors}
            isLast
          />
        </View>

        {/* Section 2 : Curriculum Vitae (CV) */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Document professionnel</Text>

        <TouchableOpacity
          style={[styles.cvCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleOpenCV}
          activeOpacity={0.7}
        >
          <View style={styles.cvIconWrapper}>
            <Ionicons name="document-text" size={24} color="darkorange" />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.cvTitle, { color: colors.text }]}>Mon Curriculum Vitae (CV)</Text>
            <Text style={[styles.cvSubtitle, { color: user.cv ? "#059669" : colors.subText }]}>
              {user.cv ? "✓ Document importé (Appuyer pour voir)" : "Aucun CV importé"}
            </Text>
          </View>

          <Ionicons name="open-outline" size={20} color={colors.subText} />
        </TouchableOpacity>

        {/* Section 3 : Actions du Compte */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Paramètres du compte</Text>

        <MenuButton
          icon="create-outline"
          title={t("editProfile")}
          colors={colors}
          onPress={() => navigation.navigate("EditProfile")}
        />

        <MenuButton
          icon="lock-closed-outline"
          title={t("changePassword")}
          colors={colors}
          onPress={() => navigation.navigate("ChangePassword")}
        />

        <MenuButton
          icon="log-out-outline"
          title={t("logout")}
          colors={colors}
          onPress={handleLogout}
          danger
        />
      </ScrollView>

      <SideMenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      <BottomNavigation />
    </SafeAreaView>
  );
}

function Item({ icon, title, value, isLast, colors }) {
  return (
    <View style={[styles.item, isLast && { marginBottom: 0, borderBottomWidth: 0 }]}>
      <View style={styles.itemIconCircle}>
        <Ionicons name={icon} size={18} color="darkorange" />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.subText }]}>{title}</Text>
        <Text style={[styles.itemValue, { color: colors.text }]}>{value || "Non renseigné"}</Text>
      </View>
    </View>
  );
}

function MenuButton({ icon, title, onPress, danger, colors }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.buttonIconCircle,
          { backgroundColor: danger ? "#FEE2E2" : "rgba(255,140,0,0.12)" },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? "#DC2626" : "darkorange"}
        />
      </View>

      <Text style={[styles.buttonText, { color: danger ? "#DC2626" : colors.text }]}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? "#DC2626" : colors.subText}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerCard: {
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
  },
  imageRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: "darkorange",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,140,0,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "darkorange",
    marginLeft: 4,
  },
  dossierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  dossierBadgeAccepted: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  dossierBadgeRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  dossierBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
    marginLeft: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  cvCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cvIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cvTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cvSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  buttonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
});