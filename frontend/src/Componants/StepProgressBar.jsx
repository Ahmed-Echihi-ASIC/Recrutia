import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

const DEFAULT_TITLES = [
  "Informations",
  "Parcours",
  "Identification",
  "Confirmation",
];

export default function StepProgressBar({
  currentStep = 1,
  totalSteps = 4,
  stepTitles = DEFAULT_TITLES,
}) {
  const { colors } = useTheme();

  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStep / totalSteps) * 100)
  );

  const currentTitle = stepTitles[currentStep - 1] || "";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Meta Info */}
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            Étape {currentStep} sur {totalSteps}
          </Text>
        </View>

        <Text style={[styles.percentText, { color: colors.primary }]}>
          {Math.round(progressPercent)}%
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        {currentTitle}
      </Text>

      {/* Progress Bar Track */}
      <View
        style={[
          styles.track,
          { backgroundColor: colors.isDark ? "#2C2C2C" : "#E5E7EB" },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${progressPercent}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      {/* Dots Indicator Row */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <View
              key={stepNum}
              style={[
                styles.dotCircle,
                isCompleted
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : isActive
                  ? {
                      backgroundColor: colors.card,
                      borderColor: colors.primary,
                      borderWidth: 2,
                    }
                  : {
                      backgroundColor: colors.isDark ? "#2C2C2C" : "#E5E7EB",
                      borderColor: "transparent",
                    },
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.dotText,
                    isActive
                      ? { color: colors.primary, fontWeight: "bold" }
                      : { color: colors.subText },
                  ]}
                >
                  {stepNum}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 140, 0, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "darkorange",
    marginRight: 6,
  },
  badgeText: {
    color: "darkorange",
    fontSize: 12,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 6,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 12,
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  dotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: {
    fontSize: 11,
  },
});
