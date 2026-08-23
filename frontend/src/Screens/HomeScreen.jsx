import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";

import HeaderMenu from "../Componants/HeaderMenu";
import SearchBar from "../Componants/SearchBar";
import CategoryCard from "../Componants/CategoryCard";
import JobCard from "../Componants/JobCard";
import BottomNavigation from "../Componants/BottomNavigation";
import SideMenuModal from "../Componants/SideMenuModal";
import { SERVER_URL } from "../Config/config";

const DEFAULT_LOGO = require("../../assets/image.jpeg");

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, refreshUserStatus } = useAuth();
  const { colors, t } = useTheme();

  const [offres, setOffres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // States pour la pagination infinie (10 par 10)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Statut du dossier candidat (tolérance pour accepte, accepter, accepté, etc.)
  const rawStatut = String(user?.statut_dossier || "en_attente").toLowerCase().trim();
  const isDossierAccepte = ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"].includes(rawStatut);
  const isDossierRefuse = ["refuse", "refusee", "refuser", "refusé", "refusée", "rejected"].includes(rawStatut);
  const statutDossier = isDossierAccepte ? "accepte" : isDossierRefuse ? "refuse" : "en_attente";

  // ==========================
  // Chargement des IDs de notifications lues depuis le stockage local
  // ==========================
  const loadReadNotifIds = useCallback(async () => {
    if (!user?.id) return;
    try {
      const saved = await AsyncStorage.getItem(`@read_notifications_${user.id}`);
      if (saved !== null) {
        setReadNotifIds(JSON.parse(saved));
      }
    } catch (err) {
      console.log("Erreur chargement notifications lues :", err);
    }
  }, [user?.id]);

  // ==========================
  // Marquer une notification comme lue
  // ==========================
  const markNotificationAsRead = async (candidatureId) => {
    if (!user?.id) return;
    const idStr = String(candidatureId);
    if (!readNotifIds.includes(idStr)) {
      const updated = [...readNotifIds, idStr];
      setReadNotifIds(updated);
      try {
        await AsyncStorage.setItem(
          `@read_notifications_${user.id}`,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.log("Erreur sauvegarde notification lue :", err);
      }
    }
  };

  // ==========================
  // Tout marquer comme lu
  // ==========================
  const markAllNotificationsAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    const allIds = notifications.map((n) => String(n.candidature_id));
    const merged = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(merged);
    try {
      await AsyncStorage.setItem(
        `@read_notifications_${user.id}`,
        JSON.stringify(merged)
      );
    } catch (err) {
      console.log("Erreur tout marquer comme lu :", err);
    }
  };

  // Notifications non lues uniquement
  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (n) => !readNotifIds.includes(String(n.candidature_id))
    );
  }, [notifications, readNotifIds]);

  // Calcul dynamique du nombre de notifications non lues
  const unreadCount = unreadNotifications.length;

  // ==========================
  // Chargement des offres (Pagination 10 par 10)
  // ==========================
  const fetchOffres = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = user?.id
        ? `${SERVER_URL}/?action=offres&candidat_id=${user.id}&page=${pageNum}&limit=10`
        : `${SERVER_URL}/?action=offres&page=${pageNum}&limit=10`;
      const response = await fetch(url);
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError("Réponse invalide du serveur.");
        return;
      }

      if (data.success) {
        const newOffres = data.offres || [];
        if (pageNum === 1) {
          setOffres(newOffres);
        } else {
          setOffres((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const uniqueNew = newOffres.filter((o) => !existingIds.has(o.id));
            return [...prev, ...uniqueNew];
          });
        }
        setPage(pageNum);
        setHasMore(data.has_more !== undefined ? data.has_more : newOffres.length === 10);
      } else {
        setError(data.message || "Erreur lors du chargement des offres.");
      }
    } catch (err) {
      console.log(err);
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // ==========================
  // Charger la page suivante (Infinite Scroll)
  // ==========================
  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore || search.trim().length > 0 || selectedCategoryId) {
      return;
    }
    fetchOffres(page + 1);
  };

  // ==========================
  // Chargement des catégories
  // ==========================
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/?action=categories`);
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return;
      }

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // ==========================
  // Chargement des notifications de statut (candidatures + dossier)
  // ==========================
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      // 1. Récupérer les notifications de candidature depuis le serveur
      const response = await fetch(
        `${SERVER_URL}/?action=notifications&candidat_id=${user.id}`
      );
      const data = await response.json();
      const serverNotifs = data.success ? data.notifications || [] : [];

      // 2. Récupérer les notifications de changement de statut de dossier depuis AsyncStorage
      let dossierNotifs = [];
      try {
        const storedDossierStr = await AsyncStorage.getItem(`@dossier_notifications_${user.id}`);
        if (storedDossierStr) {
          dossierNotifs = JSON.parse(storedDossierStr);
        }
      } catch (e) {
        console.log("Erreur chargement notifications dossier :", e);
      }

      // Fusionner et trier par date décroissante
      const combined = [...dossierNotifs, ...serverNotifs];
      combined.sort((a, b) => new Date(b.date_candidature) - new Date(a.date_candidature));

      setNotifications(combined);
    } catch (err) {
      console.log("Erreur chargement notifications :", err);
    }
  }, [user?.id]);

  // ==========================
  // Vérification du changement de statut de dossier (Affiche une alerte si le statut a changé)
  // ==========================
  const checkUserStatusChange = useCallback(async () => {
    if (!refreshUserStatus) return;
    const res = await refreshUserStatus();

    if (res && res.statusChanged) {
      const { status, motif_refus } = res;

      if (status === "accepte") {
        Alert.alert(
          "🎉 Dossier Validé !",
          "Félicitations ! Votre dossier d'inscription a été accepté avec succès par l'administration. Vous pouvez désormais consulter et postuler à toutes nos offres d'emploi !",
          [{ text: "Super", style: "default" }]
        );
      } else if (status === "refuse") {
        Alert.alert(
          "⚠️ Dossier Refusé",
          `Votre dossier d'inscription a été refusé par l'administration.${motif_refus ? `\n\nMotif : ${motif_refus}` : ""}`,
          [
            { text: "Voir mon profil", onPress: () => navigation.navigate("Profile") },
            { text: "Fermer", style: "cancel" },
          ]
        );
      } else if (status === "en_attente") {
        Alert.alert(
          "ℹ️ Statut du dossier",
          "Votre dossier d'inscription est de nouveau en cours de vérification par l'administration.",
          [{ text: "OK" }]
        );
      }

      await fetchNotifications();
    }
  }, [refreshUserStatus, navigation, fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadAllData = async () => {
        setLoading(true);
        setError(null);
        await checkUserStatusChange();
        if (isMounted) {
          await Promise.all([
            fetchOffres(1),
            fetchCategories(),
            fetchNotifications(),
            loadReadNotifIds(),
          ]);
          setLoading(false);
        }
      };

      loadAllData();

      // Vérification périodique du statut de dossier (toutes les 20 secondes)
      const interval = setInterval(() => {
        checkUserStatusChange();
      }, 20000);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, [fetchOffres, fetchCategories, fetchNotifications, loadReadNotifIds, checkUserStatusChange])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await checkUserStatusChange();
    await Promise.all([
      fetchOffres(1, true),
      fetchCategories(),
      fetchNotifications(),
      loadReadNotifIds(),
    ]);
    setRefreshing(false);
  };

  // ==========================
  // Filtrage côté client
  // ==========================
  const filteredOffres = useMemo(() => {
    let result = offres;

    if (selectedCategoryId) {
      result = result.filter(
        (o) => o.categorie_id === selectedCategoryId
      );
    }

    if (search.trim().length > 0) {
      const term = search.trim().toLowerCase();

      result = result.filter((o) => {
        const titre = (o.titre || "").toLowerCase();
        const entreprise = (o.entreprise_nom || "").toLowerCase();
        const lieu = (o.lieu || "").toLowerCase();

        return (
          titre.includes(term) ||
          entreprise.includes(term) ||
          lieu.includes(term)
        );
      });
    }

    return result;
  }, [offres, search, selectedCategoryId]);

  const renderNotificationItem = ({ item }) => {
    if (item.isDossierNotif) {
      const isAccepted = item.statut === "accepte";
      return (
        <TouchableOpacity
          style={[
            styles.notifItem,
            isAccepted ? styles.notifItemAccepted : styles.notifItemRejected,
          ]}
          activeOpacity={0.8}
          onPress={async () => {
            await markNotificationAsRead(item.candidature_id);
            setModalVisible(false);
            navigation.navigate("Profile");
          }}
        >
          <View style={styles.notifHeader}>
            <View
              style={[
                styles.dossierIconCircle,
                { backgroundColor: isAccepted ? "rgba(5,150,105,0.15)" : "rgba(220,38,38,0.15)" },
              ]}
            >
              <Ionicons
                name={isAccepted ? "folder-checkmark" : "folder-open"}
                size={22}
                color={isAccepted ? "#059669" : "#DC2626"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.notifCompany, { color: colors.subText }]}>{item.entreprise_nom}</Text>
              <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                {item.offre_titre}
              </Text>
            </View>
            <Ionicons
              name={isAccepted ? "checkmark-circle" : "close-circle"}
              size={22}
              color={isAccepted ? "#059669" : "#DC2626"}
            />
          </View>

          <Text style={[styles.notifMessage, { color: colors.text }]}>
            {isAccepted
              ? "Votre dossier d'inscription a été validé par l'administration !"
              : `Votre dossier a été refusé.${item.motif_refus ? ` Motif : ${item.motif_refus}` : ""}`}
          </Text>
        </TouchableOpacity>
      );
    }

    const isAccepted = item.statut === "acceptee" || item.statut === "accepte";
    const logoSource = item.entreprise_logo
      ? { uri: `${SERVER_URL}/${item.entreprise_logo}` }
      : DEFAULT_LOGO;

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          isAccepted ? styles.notifItemAccepted : styles.notifItemRejected,
        ]}
        activeOpacity={0.8}
        onPress={async () => {
          await markNotificationAsRead(item.candidature_id);
          setModalVisible(false);
          navigation.navigate("OffreDetail", { id: item.offre_id });
        }}
      >
        <View style={styles.notifHeader}>
          <Image source={logoSource} style={styles.notifLogo} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.notifCompany, { color: colors.subText }]}>{item.entreprise_nom}</Text>
            <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
              {item.offre_titre}
            </Text>
          </View>
          <Ionicons
            name={isAccepted ? "checkmark-circle" : "close-circle"}
            size={22}
            color={isAccepted ? "#059669" : "#DC2626"}
          />
        </View>

        <Text style={[styles.notifMessage, { color: colors.text }]}>
          {isAccepted
            ? "Votre candidature a été retenue par l'entreprise !"
            : "Votre candidature n'a pas été retenue."}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <View>
      {/* Bannière de bienvenue personnalisée */}
      <View style={[styles.welcomeBanner, { backgroundColor: colors.isDark ? "#2A2318" : "#FFF7ED", borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeGreeting, { color: colors.text }]}>
            Bonjour, {user?.prenom || "Candidat"} 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.subText }]}>
            {isDossierAccepte
              ? "Trouvez l'emploi idéal parmi nos offres vérifiées"
              : "Suivi de la validation de votre dossier"}
          </Text>
        </View>
        <View style={styles.welcomeBadgeIcon}>
          <Ionicons
            name={isDossierAccepte ? "briefcase" : statutDossier === "refuse" ? "close-circle" : "time"}
            size={22}
            color={isDossierAccepte ? "darkorange" : statutDossier === "refuse" ? "#DC2626" : "#D97706"}
          />
        </View>
      </View>

      {/* SI DOSSIER NON ACCEPTÉ (EN ATTENTE OU REFUSÉ) */}
      {!isDossierAccepte ? (
        <View
          style={[
            styles.dossierStatusBox,
            {
              backgroundColor: statutDossier === "refuse"
                ? (colors.isDark ? "#3B1D1D" : "#FEF2F2")
                : (colors.isDark ? "#2A2415" : "#FFFBEB"),
              borderColor: statutDossier === "refuse" ? "#FECACA" : "#FDE68A",
            },
          ]}
        >
          <View style={styles.dossierStatusHeader}>
            <Ionicons
              name={statutDossier === "refuse" ? "alert-circle" : "time-outline"}
              size={48}
              color={statutDossier === "refuse" ? "#DC2626" : "#D97706"}
            />
            <Text
              style={[
                styles.dossierStatusTitle,
                { color: statutDossier === "refuse" ? "#DC2626" : "#D97706" },
              ]}
            >
              {statutDossier === "refuse"
                ? t("dossierRejectedTitle")
                : t("dossierPendingTitle")}
            </Text>
            <Text
              style={[
                styles.dossierStatusSubtitle,
                { color: colors.text },
              ]}
            >
              {statutDossier === "refuse"
                ? t("dossierRejectedMsg")
                : t("dossierPendingMsg")}
            </Text>
          </View>

          {/* Motif du refus s'il est disponible */}
          {statutDossier === "refuse" && (
            <View
              style={[
                styles.reasonBox,
                {
                  backgroundColor: colors.isDark ? "#2A1515" : "#FFFFFF",
                  borderColor: "#FCA5A5",
                },
              ]}
            >
              <Text style={[styles.reasonLabel, { color: "#DC2626" }]}>
                {t("reasonForRejection")} :
              </Text>
              <Text style={[styles.reasonText, { color: colors.text }]}>
                {user?.motif_refus || t("noReasonSpecified")}
              </Text>
            </View>
          )}

          {/* Bouton pour rafraîchir manuellement le statut */}
          <TouchableOpacity
            style={[
              styles.refreshBtn,
              statutDossier === "refuse" && { backgroundColor: "#DC2626" },
            ]}
            onPress={async () => {
              setLoading(true);
              if (refreshUserStatus) {
                await refreshUserStatus();
              }
              await fetchOffres(1);
              setLoading(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
            <Text style={styles.refreshBtnText}>{t("refreshStatus")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Filtres par catégories */}
          {categories.length > 0 && (
            <CategoryCard
              data={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          )}

          {/* En-tête de section des offres */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              Offres d'emploi
            </Text>
            {!loading && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredOffres.length}</Text>
              </View>
            )}
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="darkorange"
              style={styles.loader}
            />
          )}

          {error && !loading && (
            <TouchableOpacity
              style={[styles.errorBox, { backgroundColor: colors.isDark ? "#3B1D1D" : "#FFF3F3" }]}
              onPress={() => fetchOffres(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>{t("retry")}</Text>
            </TouchableOpacity>
          )}

          {!loading && !error && filteredOffres.length === 0 && (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={44} color={colors.subText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucune offre trouvée
              </Text>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                {offres.length === 0
                  ? "Aucune offre n'est publiée pour le moment."
                  : "Essayez de modifier votre recherche ou vos filtres."}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderListFooter = () => {
    if (!isDossierAccepte) return null;
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color="darkorange" />
          <Text style={{ fontSize: 12, color: colors.subText, marginTop: 6, fontWeight: "500" }}>
            Chargement des 10 offres suivantes...
          </Text>
        </View>
      );
    }
    return <View style={{ height: 40 }} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        animated={true}
      />
      <HeaderMenu
        onMenu={() => setIsMenuVisible(true)}
        onNotification={() => setModalVisible(true)}
        unreadCount={unreadCount}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder={t("searchPlaceholder")} />

      <FlatList
        data={isDossierAccepte && !loading && !error ? filteredOffres : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <JobCard job={item} />}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["darkorange"]}
            tintColor="darkorange"
          />
        }
      />

      {/* Menu Tiroir Latéral */}
      <SideMenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      {/* Modale des Notifications */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="notifications" size={22} color="darkorange" />
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  {t("notifications")}
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.modalUnreadBadge}>
                    <Text style={styles.modalUnreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllNotificationsAsRead}
                    style={styles.markAllBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-done-outline" size={16} color="darkorange" />
                    <Text style={styles.markAllText}>Tout lire</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close-outline" size={24} color={colors.subText} />
                </TouchableOpacity>
              </View>
            </View>

            {unreadNotifications.length === 0 ? (
              <View style={styles.emptyNotifBox}>
                <Ionicons name="notifications-off-outline" size={40} color={colors.subText} />
                <Text style={[styles.emptyNotifText, { color: colors.subText }]}>
                  {t("noNotifications")}
                </Text>
              </View>
            ) : (
              <FlatList
                data={unreadNotifications}
                keyExtractor={(item) => String(item.candidature_id)}
                renderItem={renderNotificationItem}
                contentContainerStyle={{ padding: 15 }}
              />
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  welcomeBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  welcomeBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  countBadge: {
    backgroundColor: "darkorange",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 40,
  },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  retryText: {
    color: "darkorange",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    minHeight: "40%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  emptyNotifBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyNotifText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  notifItem: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  notifItemAccepted: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  notifItemRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  dossierIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifCompany: {
    fontSize: 12,
    color: "#6B7280",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  notifMessage: {
    fontSize: 13,
    color: "#374151",
    marginTop: 8,
  },
  newBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalUnreadBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  modalUnreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,140,0,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  markAllText: {
    color: "darkorange",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  dossierStatusBox: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  dossierStatusHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  dossierStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  dossierStatusSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  reasonBox: {
    width: "100%",
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "darkorange",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
});