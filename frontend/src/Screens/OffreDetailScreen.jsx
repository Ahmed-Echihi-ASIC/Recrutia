import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import HeaderMenu from "../Componants/HeaderMenu";
import { SERVER_URL } from "../Config/config";

const DEFAULT_LOGO = require("../../assets/image.jpeg");

export default function OffreDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors, t } = useTheme();

  const { id } = route.params || {};

  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [candidatureStatus, setCandidatureStatus] = useState("non_postule");
  const [candidatureDetails, setCandidatureDetails] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Aucune offre sélectionnée.");
      setLoading(false);
      return;
    }

    fetchOffre();
    checkCandidature();
  }, [id]);

  const fetchOffre = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${SERVER_URL}/?action=offre_detail&id=${id}`
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError("Réponse invalide du serveur.");
        setLoading(false);
        return;
      }

      if (data.success) {
        setOffre(data.offre);
      } else {
        setError(data.message || "Erreur lors du chargement de l'offre.");
      }
    } catch (err) {
      console.log(err);
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const checkCandidature = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${SERVER_URL}/?action=check_candidature&offre_id=${id}&candidat_id=${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        const rawStatus = data.status || "non_postule";
        const normalized =
          rawStatus === "accepte" ? "acceptee" : rawStatus === "refuse" ? "refusee" : rawStatus;
        setCandidatureStatus(normalized);
        if (data.candidature_id) {
          setCandidatureDetails({
            id: data.candidature_id,
            date: data.date_candidature,
          });
        }
      }
    } catch (err) {
      console.log("Erreur vérification candidature :", err);
    }
  };

  const handleAnnulerCandidature = () => {
    if (!candidatureDetails?.id || !user?.id) return;

    Alert.alert(
      "Annuler la candidature",
      "Êtes-vous sûr de vouloir retirer votre candidature pour cette offre ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(
                `${SERVER_URL}/?action=annuler_candidature`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    candidature_id: candidatureDetails.id,
                    candidat_id: user.id,
                  }),
                }
              );
              const data = await res.json();
              if (data.success) {
                setCandidatureStatus("non_postule");
                setCandidatureDetails(null);
                Alert.alert("Succès", "Votre candidature a été annulée.");
              } else {
                Alert.alert("Erreur", data.message || "Impossible d'annuler.");
              }
            } catch (e) {
              Alert.alert("Erreur", "Erreur réseau lors de l'annulation.");
            }
          },
        },
      ]
    );
  };

  const handlePostuler = async () => {
    if (!user?.id) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour postuler à cette offre."
      );
      return;
    }

    const statutDossier = user?.statut_dossier || "en_attente";
    if (statutDossier !== "accepte") {
      Alert.alert(
        "Dossier non validé",
        statutDossier === "refuse"
          ? "Votre dossier d'inscription a été refusé. Vous ne pouvez pas postuler aux offres d'emploi."
          : "Votre dossier d'inscription est en cours de vérification. Vous pourrez postuler dès sa validation par notre service."
      );
      return;
    }

    if (candidatureStatus !== "non_postule") {
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(`${SERVER_URL}/?action=postuler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offre_id: id,
          candidat_id: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCandidatureStatus("en_attente");
        Alert.alert(
          "Candidature envoyée !",
          "Votre candidature a bien été enregistrée."
        );
      } else {
        if (data.status) {
          setCandidatureStatus(data.status);
        }

        Alert.alert(
          "Erreur",
          data.message || "Impossible de postuler à cette offre."
        );
      }
    } catch (err) {
      console.log("Erreur postuler :", err);
      Alert.alert("Erreur", "Erreur de connexion au serveur.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="darkorange" />
      </SafeAreaView>
    );
  }

  if (error || !offre) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.errorIconWrapper}>
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
        </View>
        <Text style={[styles.errorText, { color: colors.subText }]}>
          {error || "Offre introuvable."}
        </Text>
        <TouchableOpacity
          style={styles.backButtonSimple}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const logoSource = offre.entreprise_logo
    ? { uri: `${SERVER_URL}/${offre.entreprise_logo}` }
    : DEFAULT_LOGO;

  const handleOpenSite = () => {
    if (!offre.entreprise_site_web) return;
    let url = offre.entreprise_site_web;
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const handleCallCompany = () => {
    if (!offre.entreprise_telephone) return;
    Linking.openURL(`tel:${offre.entreprise_telephone}`).catch(() => {});
  };

  const handleEmailCompany = () => {
    if (!offre.entreprise_email) return;
    Linking.openURL(`mailto:${offre.entreprise_email}`).catch(() => {});
  };

  // Traitement des compétences sous forme de badges
  const skillList = offre.competences
    ? offre.competences.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <HeaderMenu
        showBack={true}
        onBack={() => navigation.goBack()}
        title="Détail de l'offre"
        showNotification={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* En-tête : logo + titre + entreprise */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.heroLogoWrapper}>
            <Image source={logoSource} style={styles.heroLogo} resizeMode="contain" />
          </View>

          <Text style={[styles.titre, { color: colors.text }]}>{offre.titre}</Text>
          <Text style={[styles.heroEntreprise, { color: colors.subText }]}>{offre.entreprise_nom}</Text>

          {offre.type_contrat && (
            <View style={styles.badge}>
              <Ionicons name="ribbon-outline" size={13} color="darkorange" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{offre.type_contrat}</Text>
            </View>
          )}
        </View>

        {/* Chips horizontales */}
        <View style={styles.chipsRow}>
          {offre.lieu && (
            <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={14} color="darkorange" />
              <Text style={[styles.chipText, { color: colors.text }]}>{offre.lieu}</Text>
            </View>
          )}

          {offre.salaire && (
            <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="cash-outline" size={14} color="#059669" />
              <Text style={[styles.chipText, { color: "#059669", fontWeight: "700" }]}>{offre.salaire}</Text>
            </View>
          )}

          {offre.date_expiration && (
            <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={14} color={colors.subText} />
              <Text style={[styles.chipText, { color: colors.subText }]}>
                {t("expiresOn")} {offre.date_expiration}
              </Text>
            </View>
          )}
        </View>

        {/* Description de l'offre */}
        <SectionHeader icon="document-text-outline" title={t("jobDescription")} colors={colors} />
        <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {offre.description || "Aucune description fournie pour cette offre."}
          </Text>
        </View>

        {/* Profil recherché */}
        <SectionHeader icon="person-outline" title={t("profileSearched")} colors={colors} />
        <View style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {offre.niveau_etude_requis && (
            <DetailRow
              icon="school-outline"
              label={t("education")}
              value={offre.niveau_etude_requis}
              colors={colors}
            />
          )}

          {offre.specialite_requise && (
            <DetailRow
              icon="briefcase-outline"
              label={t("speciality")}
              value={offre.specialite_requise}
              colors={colors}
            />
          )}

          {offre.experience_requise && (
            <DetailRow
              icon="time-outline"
              label={t("experience")}
              value={offre.experience_requise}
              colors={colors}
              isLast={skillList.length === 0}
            />
          )}

          {skillList.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={[styles.subLabel, { color: colors.subText }]}>{t("skills")}</Text>
              <View style={styles.skillChipsContainer}>
                {skillList.map((skill, index) => (
                  <View
                    key={index}
                    style={[
                      styles.skillChip,
                      { backgroundColor: colors.isDark ? "#2D261A" : "#FFF1E0" },
                    ]}
                  >
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* À propos de l'entreprise */}
        <SectionHeader icon="business-outline" title={t("aboutCompany")} colors={colors} />

        <View style={[styles.entrepriseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.entrepriseHeader}>
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.entrepriseNom, { color: colors.text }]}>
                {offre.entreprise_nom}
              </Text>
              {offre.entreprise_secteur && (
                <Text style={[styles.entrepriseSecteur, { color: colors.subText }]}>
                  {offre.entreprise_secteur}
                </Text>
              )}
            </View>
          </View>

          {offre.entreprise_description && (
            <Text style={[styles.paragraph, { color: colors.subText }]}>
              {offre.entreprise_description}
            </Text>
          )}

          <View style={[styles.entrepriseDivider, { backgroundColor: colors.border }]} />

          {offre.entreprise_ville && (
            <DetailRow
              icon="location-outline"
              label="Ville"
              value={offre.entreprise_ville}
              colors={colors}
            />
          )}

          {offre.entreprise_adresse && (
            <DetailRow
              icon="home-outline"
              label="Adresse"
              value={offre.entreprise_adresse}
              colors={colors}
            />
          )}

          {offre.entreprise_telephone && (
            <TouchableOpacity onPress={handleCallCompany} activeOpacity={0.7}>
              <DetailRow
                icon="call-outline"
                label="Téléphone"
                value={offre.entreprise_telephone}
                linkStyle
                colors={colors}
              />
            </TouchableOpacity>
          )}

          {offre.entreprise_email && (
            <TouchableOpacity onPress={handleEmailCompany} activeOpacity={0.7}>
              <DetailRow
                icon="mail-outline"
                label="Email"
                value={offre.entreprise_email}
                linkStyle
                colors={colors}
              />
            </TouchableOpacity>
          )}

          {offre.entreprise_site_web && (
            <TouchableOpacity onPress={handleOpenSite} activeOpacity={0.7}>
              <DetailRow
                icon="globe-outline"
                label="Site web"
                value={offre.entreprise_site_web}
                linkStyle
                isLast
                colors={colors}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Statut de candidature ou Bouton Postuler */}
        {candidatureStatus !== "non_postule" ? (
          <View
            style={[
              styles.statusCard,
              candidatureStatus === "en_attente" && styles.statusCardPending,
              candidatureStatus === "acceptee" && styles.statusCardAccepted,
              candidatureStatus === "refusee" && styles.statusCardRejected,
            ]}
          >
            <View style={styles.statusCardHeader}>
              <Ionicons
                name={
                  candidatureStatus === "en_attente"
                    ? "time"
                    : candidatureStatus === "acceptee"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={24}
                color={
                  candidatureStatus === "en_attente"
                    ? "#D97706"
                    : candidatureStatus === "acceptee"
                    ? "#059669"
                    : "#DC2626"
                }
              />
              <Text
                style={[
                  styles.statusCardTitle,
                  candidatureStatus === "en_attente" && { color: "#D97706" },
                  candidatureStatus === "acceptee" && { color: "#059669" },
                  candidatureStatus === "refusee" && { color: "#DC2626" },
                ]}
              >
                {candidatureStatus === "en_attente"
                  ? "Candidature en cours d'examen"
                  : candidatureStatus === "acceptee"
                  ? "Candidature Acceptée !"
                  : "Candidature non retenue"}
              </Text>
            </View>

            <Text style={styles.statusCardDesc}>
              {candidatureStatus === "en_attente"
                ? "Votre dossier de candidature a été transmis à l'employeur. Vous serez notifié dès qu'une réponse sera apportée."
                : candidatureStatus === "acceptee"
                ? "Félicitations ! L'entreprise a retenu votre profil. Elle prendra directement contact avec vous."
                : "Votre profil n'a malheureusement pas été retenu pour cette offre."}
            </Text>

            {candidatureStatus === "en_attente" && (
              <TouchableOpacity
                style={styles.cancelOfferBtn}
                onPress={handleAnnulerCandidature}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color="#DC2626" />
                <Text style={styles.cancelOfferBtnText}>
                  Retirer ma candidature
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: "darkorange" }]}
            activeOpacity={0.85}
            onPress={handlePostuler}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.applyButtonText}>Postuler à cette offre</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ icon, title, colors }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}>
        <Ionicons name={icon} size={16} color="darkorange" />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value, linkStyle, isLast, colors }) {
  return (
    <View style={[styles.detailRow, isLast && { marginBottom: 0 }]}>
      <View style={styles.detailIconWrapper}>
        <Ionicons name={icon} size={16} color="darkorange" />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}</Text>
        <Text
          style={[
            styles.detailValue,
            { color: colors.text },
            linkStyle && styles.linkValue,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },

  backButtonSimple: {
    backgroundColor: "darkorange",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },

  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  heroCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  heroLogoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FFF5EA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,140,0,0.15)",
  },

  heroLogo: {
    width: "100%",
    height: "100%",
  },

  titre: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  heroEntreprise: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
    fontWeight: "500",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,140,0,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "darkorange",
    fontWeight: "700",
    fontSize: 12,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },

  chipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "500",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },

  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  contentCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },

  subLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },

  skillsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  skillChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  skillChipText: {
    color: "darkorange",
    fontSize: 12,
    fontWeight: "600",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  detailIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  detailLabel: {
    fontSize: 12,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  linkValue: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },

  entrepriseCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },

  entrepriseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  entrepriseDivider: {
    height: 1,
    marginVertical: 14,
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },

  entrepriseNom: {
    fontSize: 16,
    fontWeight: "bold",
  },

  entrepriseSecteur: {
    fontSize: 13,
    marginTop: 2,
  },

  applyButton: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    elevation: 3,
    shadowColor: "darkorange",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  statusCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 24,
    borderWidth: 1,
  },
  statusCardPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
  },
  statusCardAccepted: {
    backgroundColor: "#D1FAE5",
    borderColor: "#6EE7B7",
  },
  statusCardRejected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  statusCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusCardDesc: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 19,
    marginBottom: 12,
  },
  cancelOfferBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginTop: 4,
  },
  cancelOfferBtnText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
    marginLeft: 6,
  },
});