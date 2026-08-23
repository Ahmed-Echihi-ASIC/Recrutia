import { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import BottomNavigation from "../Componants/BottomNavigation";
import HeaderMenu from "../Componants/HeaderMenu";
import SideMenuModal from "../Componants/SideMenuModal";
import { SERVER_URL } from "../Config/config";

const DEFAULT_LOGO = require("../../assets/image.jpeg");

export default function FavoriteScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, t } = useTheme();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("tous");

  const STATUS_CONFIG = useMemo(
    () => ({
      en_attente: {
        label: t("pending"),
        color: "#D97706",
        bg: colors.isDark ? "rgba(217, 119, 6, 0.2)" : "#FEF3C7",
        borderColor: "#FCD34D",
        icon: "time-outline",
      },
      acceptee: {
        label: t("accepted"),
        color: "#059669",
        bg: colors.isDark ? "rgba(5, 150, 105, 0.2)" : "#D1FAE5",
        borderColor: "#6EE7B7",
        icon: "checkmark-circle-outline",
      },
      refusee: {
        label: t("rejected"),
        color: "#DC2626",
        bg: colors.isDark ? "rgba(220, 38, 38, 0.2)" : "#FEE2E2",
        borderColor: "#FCA5A5",
        icon: "close-circle-outline",
      },
    }),
    [t, colors.isDark]
  );

  const fetchCandidatures = async () => {
    if (!user?.id) {
      setError("Vous devez être connecté pour voir vos candidatures.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/?action=mes_candidatures&candidat_id=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setCandidatures(data.candidatures || []);
      } else {
        setError(data.message || "Erreur lors du chargement des candidatures.");
      }
    } catch (err) {
      console.log("Erreur mes_candidatures :", err);
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCandidatures();
    }, [user?.id])
  );

  const handleAnnulerCandidature = (item) => {
    Alert.alert(
      t("cancelApplication"),
      t("confirmCancelApp"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("cancelApplication"),
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${SERVER_URL}/?action=annuler_candidature`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    candidature_id: item.id,
                    candidat_id: user.id,
                  }),
                }
              );
              const data = await res.json();
              if (data.success) {
                Alert.alert(t("success"), "Votre candidature a été annulée.");
                fetchCandidatures();
              } else {
                Alert.alert(t("error"), data.message || "Impossible d'annuler.");
              }
            } catch (e) {
              Alert.alert(t("error"), "Erreur réseau lors de l'annulation.");
            }
          },
        },
      ]
    );
  };

  const getNormalizedStatus = (s) => {
    if (s === "accepte" || s === "acceptee") return "acceptee";
    if (s === "refuse" || s === "refusee") return "refusee";
    return s || "en_attente";
  };

  const stats = useMemo(() => {
    const total = candidatures.length;
    const enAttente = candidatures.filter(
      (c) => getNormalizedStatus(c.statut) === "en_attente"
    ).length;
    const acceptees = candidatures.filter(
      (c) => getNormalizedStatus(c.statut) === "acceptee"
    ).length;
    const refusees = candidatures.filter(
      (c) => getNormalizedStatus(c.statut) === "refusee"
    ).length;
    return { total, enAttente, acceptees, refusees };
  }, [candidatures]);

  const filteredCandidatures = useMemo(() => {
    if (selectedFilter === "tous") return candidatures;
    return candidatures.filter(
      (c) => getNormalizedStatus(c.statut) === selectedFilter
    );
  }, [candidatures, selectedFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderItem = ({ item }) => {
    const normStat = getNormalizedStatus(item.statut);
    const status = STATUS_CONFIG[normStat] || STATUS_CONFIG.en_attente;
    const logoSource = item.entreprise_logo
      ? { uri: `${SERVER_URL}/${item.entreprise_logo}` }
      : DEFAULT_LOGO;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("OffreDetail", { id: item.offre_id })}
        >
          <View style={styles.cardHeader}>
            <Image source={logoSource} style={styles.logo} />

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.titre, { color: colors.text }]} numberOfLines={1}>
                {item.titre}
              </Text>
              <Text style={[styles.entreprise, { color: colors.subText }]} numberOfLines={1}>
                {item.entreprise_nom}
              </Text>

              {item.lieu && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={colors.subText} />
                  <Text style={[styles.locationText, { color: colors.subText }]}>{item.lieu}</Text>
                </View>
              )}
            </View>

            {/* Badge de statut */}
            <View
              style={[
                styles.badge,
                { backgroundColor: status.bg, borderColor: status.borderColor },
              ]}
            >
              <Ionicons name={status.icon} size={14} color={status.color} />
              <Text style={[styles.badgeText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Footer de carte */}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={13} color={colors.subText} />
              <Text style={[styles.dateText, { color: colors.subText }]}>
                {t("appliedOn")} {formatDate(item.date_candidature)}
              </Text>
            </View>

            {item.statut === "en_attente" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleAnnulerCandidature(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
                <Text style={styles.cancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <HeaderMenu
        onMenu={() => setIsMenuVisible(true)}
        title={t("myApplications")}
        showLogo={false}
        showNotification={false}
      />

      <View style={styles.topHeader}>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          {t("followApplications")}
        </Text>
      </View>

      {/* Cartes de statistiques synthétiques */}
      {!loading && !error && (
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: colors.isDark ? "#2A1F13" : "#FFF1E0" }]}>
            <Text style={[styles.statNumber, { color: "darkorange" }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>{t("total")}</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.isDark ? "#2D261A" : "#FEF3C7" }]}>
            <Text style={[styles.statNumber, { color: "#D97706" }]}>
              {stats.enAttente}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>{t("pending")}</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.isDark ? "#172E24" : "#D1FAE5" }]}>
            <Text style={[styles.statNumber, { color: "#059669" }]}>
              {stats.acceptees}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>{t("accepted")}</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.isDark ? "#2E1A1A" : "#FEE2E2" }]}>
            <Text style={[styles.statNumber, { color: "#DC2626" }]}>
              {stats.refusees}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>{t("rejected")}</Text>
          </View>
        </View>
      )}

      {/* Filtres par onglet horizontal */}
      {!loading && !error && candidatures.length > 0 && (
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {[
              { id: "tous", label: t("all"), count: stats.total },
              { id: "en_attente", label: t("pending"), count: stats.enAttente },
              { id: "acceptee", label: t("accepted"), count: stats.acceptees },
              { id: "refusee", label: t("rejected"), count: stats.refusees },
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.filterTab,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    active && styles.filterTabActive,
                  ]}
                  onPress={() => setSelectedFilter(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabLabel,
                      { color: colors.text },
                      active && styles.filterTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  <View
                    style={[
                      styles.badgeCount,
                      { backgroundColor: colors.border },
                      active && styles.badgeCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeCountText,
                        { color: colors.subText },
                        active && styles.badgeCountTextActive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Liste des candidatures */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="darkorange" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={42} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCandidatures}>
            <Text style={styles.retryBtnText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCandidatures.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
            <Ionicons name="document-text-outline" size={40} color={colors.subText} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("noApplications")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCandidatures}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SideMenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
    fontWeight: "500",
  },

  // Filters
  filtersWrapper: {
    marginBottom: 12,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "darkorange",
    borderColor: "darkorange",
  },
  filterTabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterTabLabelActive: {
    color: "#FFFFFF",
  },
  badgeCount: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeCountActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  badgeCountTextActive: {
    color: "#FFFFFF",
  },

  // Card
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  titre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  entreprise: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 5,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
    marginLeft: 4,
  },

  // States
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "darkorange",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#374151",
  },
});