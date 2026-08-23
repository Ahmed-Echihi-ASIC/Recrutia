import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import HeaderMenu from "../Componants/HeaderMenu";
import CustomInput from "../Componants/CustomInput";
import CustomSelect from "../Componants/CustomSelect";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import StepProgressBar from "../Componants/StepProgressBar";
import SelectData from "../Data/SelectData";
import RegisterStepConfirmValidation from "../Validation/RegisterStepConfirmValidation";
import { useTheme } from "../Context/ThemeContext";

export default function RegisterStepConfirm({
  form,
  setForm,
  onRegister,
  onBack,
}) {
  const { colors } = useTheme();
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const validationErrors = RegisterStepConfirmValidation(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onRegister();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

      <HeaderMenu
        showBack={true}
        onBack={onBack}
        title="Validation finale"
        showLogo={false}
        showNotification={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <StepProgressBar currentStep={4} totalSteps={4} />

        <CustomInput
          label="Lieu de naissance"
          value={form.lieuNaissance}
          onChangeText={(text) => setForm({ ...form, lieuNaissance: text })}
          icon="location-outline"
        />
        {errors.lieuNaissance && (
          <Text style={styles.error}>{errors.lieuNaissance}</Text>
        )}

        <CustomSelect
          label="Situation familiale"
          value={form.situationFamiliale}
          onValueChange={(value) => setForm({ ...form, situationFamiliale: value })}
          icon="heart-outline"
          items={SelectData.situation_familiale}
        />
        {errors.situationFamiliale && (
          <Text style={styles.error}>{errors.situationFamiliale}</Text>
        )}

        <CustomSelect
          label="Nombre d'enfants"
          value={form.nombreEnfant}
          onValueChange={(value) => setForm({ ...form, nombreEnfant: value })}
          icon="people-outline"
          items={SelectData.nombre_enfant}
        />
        {errors.nombreEnfant && (
          <Text style={styles.error}>{errors.nombreEnfant}</Text>
        )}

        <CustomInput
          label="Adresse de résidence"
          value={form.adresse}
          onChangeText={(text) => setForm({ ...form, adresse: text })}
          icon="home-outline"
        />
        {errors.adresse && <Text style={styles.error}>{errors.adresse}</Text>}

        <CustomSelect
          label="Arrondissement / Sous-préfecture"
          value={form.arrondissement}
          onValueChange={(value) => setForm({ ...form, arrondissement: value })}
          icon="map-outline"
          items={SelectData.arrondissement_sous_prefecture}
        />
        {errors.arrondissement && (
          <Text style={styles.error}>{errors.arrondissement}</Text>
        )}

        {/* Card récapitulative des informations */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="checkmark-done-circle-outline" size={24} color="darkorange" />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Récapitulatif de votre inscription
            </Text>
          </View>

          <Text style={[styles.summaryRowText, { color: colors.subText }]}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>Nom & Prénom : </Text>
            {form.prenom} {form.nom}
          </Text>

          <Text style={[styles.summaryRowText, { color: colors.subText }]}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>Email : </Text>
            {form.email}
          </Text>

          <Text style={[styles.summaryRowText, { color: colors.subText }]}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>Téléphone : </Text>
            {form.telephone}
          </Text>

          <Text style={[styles.summaryRowText, { color: colors.subText }]}>
            <Text style={{ fontWeight: "bold", color: colors.text }}>Diplôme : </Text>
            {form.diplome || "Non renseigné"}
          </Text>
        </View>

        <NextButton title="Créer mon compte" onPress={handleSubmit} />
        <BackButton onPress={onBack} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 12,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
  summaryRowText: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
});