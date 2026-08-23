import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../Context/ThemeContext";
import { SERVER_URL } from "../Config/config";

export default function JobCard({ jobs, job }) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const renderCard = (item) => {
    const title = item.title || item.titre;
    const company = item.company || item.entreprise_nom;
    const city = item.city || item.lieu;
    const type = item.type || item.type_contrat;
    const salary = item.salaire;

    const logoUri = item.entreprise_logo
      ? `${SERVER_URL}/${item.entreprise_logo}`
      : null;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("OffreDetail", { id: item.id })}
      >
        {/* Logo Entreprise ou icône fallback */}
        <View
          style={[
            styles.iconWrapper,
            !logoUri && { backgroundColor: colors.isDark ? "#3A2A1A" : "#FFF5EA" },
          ]}
        >
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <Ionicons
              name="briefcase-outline"
              size={24}
              color="darkorange"
            />
          )}
        </View>

        {/* Détails de l'offre */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>

          <Text style={[styles.company, { color: colors.subText }]} numberOfLines={1}>
            {company}
          </Text>

          <View style={styles.metaRow}>
            {city && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={colors.subText}
                />
                <Text style={[styles.metaText, { color: colors.subText }]} numberOfLines={1}>
                  {city}
                </Text>
              </View>
            )}

            {salary && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="cash-outline"
                  size={13}
                  color="#059669"
                />
                <Text style={[styles.salaryText]} numberOfLines={1}>
                  {salary}
                </Text>
              </View>
            )}

            {type && (
              <View style={[styles.badge, { backgroundColor: colors.isDark ? "#3A2A1A" : "#FFF1E0" }]}>
                <Text style={styles.badgeText}>{type}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bouton fléché d'action */}
        <View style={[styles.arrowCircle, { backgroundColor: colors.isDark ? "#2D2D2D" : "#F3F4F6" }]}>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.subText}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (job) {
    return renderCard(job);
  }

  if (!jobs || !Array.isArray(jobs)) return null;

  return (
    <View style={styles.container}>
      {jobs.map((item) => renderCard(item))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },

  company: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaText: {
    fontSize: 12,
    marginLeft: 3,
  },

  salaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    marginLeft: 3,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "darkorange",
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});