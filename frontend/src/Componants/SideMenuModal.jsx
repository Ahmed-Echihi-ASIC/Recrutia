import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { SERVER_URL } from "../Config/config";

const DEFAULT_AVATAR = require("../../assets/image.jpeg");

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function SideMenuModal({ visible, onClose }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, language, changeLanguage, t, isRTL, colors } = useTheme();

  const [langSelectorVisible, setLangSelectorVisible] = useState(false);

  const handleNavigate = (screenName) => {
    onClose();
    navigation.navigate(screenName);
  };

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
            onClose();
            if (logout) {
              await logout();
            }
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]
    );
  };

  const avatarSource = user?.photo
    ? { uri: `${SERVER_URL}/${user.photo}` }
    : DEFAULT_AVATAR;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.drawer,
            {
              backgroundColor: colors.modalBg,
              paddingTop: Math.max(insets.top + 10, 45),
              paddingBottom: Math.max(insets.bottom + 15, 30),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profil Utilisateur En-tête */}
            <View style={[styles.userHeader, { borderBottomColor: colors.border }]}>
              <Image source={avatarSource} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {user?.prenom && user?.nom
                    ? `${user.prenom} ${user.nom}`
                    : t("myProfile")}
                </Text>
                <Text style={[styles.userEmail, { color: colors.subText }]} numberOfLines={1}>
                  {user?.email || "candidat@email.com"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{t("candidate")}</Text>
                  </View>
                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor:
                          user?.statut_dossier === "accepte"
                            ? "#ECFDF5"
                            : user?.statut_dossier === "refuse"
                            ? "#FEF2F2"
                            : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        {
                          color:
                            user?.statut_dossier === "accepte"
                              ? "#059669"
                              : user?.statut_dossier === "refuse"
                              ? "#DC2626"
                              : "#D97706",
                        },
                      ]}
                    >
                      {user?.statut_dossier === "accepte"
                        ? t("statusAcceptedBadge")
                        : user?.statut_dossier === "refuse"
                        ? t("statusRejectedBadge")
                        : t("statusPendingBadge")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.section}>
              <MenuItem
                icon="person-outline"
                label={t("myProfile")}
                colors={colors}
                onPress={() => handleNavigate("Profile")}
              />
              <MenuItem
                icon="create-outline"
                label={t("editProfile")}
                colors={colors}
                onPress={() => handleNavigate("EditProfile")}
              />
              <MenuItem
                icon="briefcase-outline"
                label={t("myApplications")}
                colors={colors}
                onPress={() => handleNavigate("Favorite")}
              />
              <MenuItem
                icon="key-outline"
                label={t("changePassword")}
                colors={colors}
                onPress={() => handleNavigate("ChangePassword")}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Thème & Langue */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.subText }]}>
                {t("preferences")}
              </Text>

              {/* Toggle Mode Sombre */}
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={isDarkMode ? "moon" : "sunny"}
                    size={20}
                    color={isDarkMode ? "#FBBF24" : "darkorange"}
                  />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {isDarkMode ? t("darkMode") : t("lightMode")}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#D1D5DB", true: "darkorange" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Sélection de Langue */}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setLangSelectorVisible(!langSelectorVisible)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {t("language")} ({LANGUAGES.find((l) => l.code === language)?.flag})
                  </Text>
                </View>
                <Ionicons
                  name={langSelectorVisible ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.subText}
                />
              </TouchableOpacity>

              {/* Options de langue */}
              {langSelectorVisible && (
                <View style={[styles.langOptions, { backgroundColor: colors.background }]}>
                  {LANGUAGES.map((lang) => {
                    const selected = language === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.langItem,
                          selected && { backgroundColor: "rgba(255, 140, 0, 0.15)" },
                        ]}
                        onPress={() => {
                          changeLanguage(lang.code);
                          setLangSelectorVisible(false);
                        }}
                      >
                        <Text style={styles.langFlag}>{lang.flag}</Text>
                        <Text
                          style={[
                            styles.langText,
                            { color: selected ? "darkorange" : colors.text },
                            selected && { fontWeight: "bold" },
                          ]}
                        >
                          {lang.label}
                        </Text>
                        {selected && (
                          <Ionicons name="checkmark" size={16} color="darkorange" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Bouton Déconnexion */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              <Text style={styles.logoutText}>{t("logout")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function MenuItem({ icon, label, colors, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconWrapper}>
        <Ionicons name={icon} size={20} color="darkorange" />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  drawer: {
    width: "80%",
    height: "100%",
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "#FFF1E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  roleBadgeText: {
    color: "darkorange",
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFF1E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  langOptions: {
    borderRadius: 12,
    padding: 6,
    marginTop: 6,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  langFlag: {
    fontSize: 16,
    marginRight: 10,
  },
  langText: {
    flex: 1,
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 10,
  },
});
