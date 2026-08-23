import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import FilePickerButton from "../Componants/FilePickerButton";
import HeaderMenu from "../Componants/HeaderMenu";
import StepProgressBar from "../Componants/StepProgressBar";
import RegisterStepParcoursValidation from "../Validation/RegisterStepParcoursValidation";
import CustomSelect from "../Componants/CustomSelect";
import SelectData from "../Data/SelectData";
import { useTheme } from "../Context/ThemeContext";

export default function RegisterStepParcours({
  form,
  setForm,
  onNext,
  onBack,
}) {
  const { colors } = useTheme();
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    const validationErrors = RegisterStepParcoursValidation(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

      <HeaderMenu
        showBack={true}
        onBack={onBack}
        title="Parcours Professionnel"
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
        <StepProgressBar currentStep={2} totalSteps={4} />

        <CustomSelect
          label="Nombre de diplômes"
          value={form.nombreDiplome}
          onValueChange={(value) => setForm({ ...form, nombreDiplome: value })}
          icon="school-outline"
          items={SelectData.nombreDiplomes}
        />
        {errors.nombreDiplome && (
          <Text style={styles.error}>{errors.nombreDiplome}</Text>
        )}

        <CustomSelect
          label="Niveau d'étude"
          value={form.NiveauEtude}
          onValueChange={(value) => setForm({ ...form, NiveauEtude: value })}
          icon="ribbon-outline"
          items={SelectData.niveau_etudes}
        />
        {errors.NiveauEtude && (
          <Text style={styles.error}>{errors.NiveauEtude}</Text>
        )}

        <CustomSelect
          label="Spécialité"
          value={form.specialite}
          onValueChange={(value) => setForm({ ...form, specialite: value })}
          items={SelectData.specialite}
          icon="construct-outline"
        />
        {errors.specialite && (
          <Text style={styles.error}>{errors.specialite}</Text>
        )}

        <CustomSelect
          label="Condition physique"
          value={form.ConditionPhysique}
          onValueChange={(value) => setForm({ ...form, ConditionPhysique: value })}
          icon="fitness-outline"
          items={SelectData.condition_physique}
        />
        {errors.ConditionPhysique && (
          <Text style={styles.error}>{errors.ConditionPhysique}</Text>
        )}

        <CustomSelect
          label="Nombre d'expériences professionnelles"
          value={form.NbrExperience}
          onValueChange={(value) => setForm({ ...form, NbrExperience: value })}
          icon="briefcase-outline"
          items={SelectData.nombre_experience}
        />
        {errors.NbrExperience && (
          <Text style={styles.error}>{errors.NbrExperience}</Text>
        )}

        <CustomSelect
          label="Durée d'expérience professionnelle"
          value={form.DureeExperience}
          onValueChange={(value) => setForm({ ...form, DureeExperience: value })}
          icon="time-outline"
          items={SelectData.duree_experience}
        />
        {errors.DureeExperience && (
          <Text style={styles.error}>{errors.DureeExperience}</Text>
        )}

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Documents à fournir</Text>

        <Text style={[styles.label, { color: colors.text }]}>Curriculum Vitae (CV)</Text>
        <FilePickerButton
          title="Importer votre CV (PDF)"
          icon="document-text-outline"
          value={form.cv}
          onChange={(file) => setForm({ ...form, cv: file })}
        />

        <Text style={[styles.label, { color: colors.text }]}>Photo de profil</Text>
        <FilePickerButton
          title="Importer votre photo (JPG/PNG)"
          icon="camera-outline"
          value={form.photo}
          onChange={(file) => setForm({ ...form, photo: file })}
        />

        <NextButton onPress={handleNext} />
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 12,
  },
  label: {
    marginHorizontal: 20,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
  },
});