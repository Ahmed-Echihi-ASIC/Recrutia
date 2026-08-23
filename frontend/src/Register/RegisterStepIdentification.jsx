import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import HeaderMenu from "../Componants/HeaderMenu";
import CustomInput from "../Componants/CustomInput";
import FilePickerButton from "../Componants/FilePickerButton";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import StepProgressBar from "../Componants/StepProgressBar";
import RegisterStepIdentificationValidation from "../Validation/RegisterStepIdentificationValidation";
import CustomSelect from "../Componants/CustomSelect";
import SelectData from "../Data/SelectData";
import { useTheme } from "../Context/ThemeContext";

export default function RegisterStepIdentification({
  form,
  setForm,
  onNext,
  onBack,
}) {
  const { colors } = useTheme();
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    const validationErrors = RegisterStepIdentificationValidation(form);
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
        title="Identification & Pièces"
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
        <StepProgressBar currentStep={3} totalSteps={4} />

        <CustomInput
          label="Numéro national d'identification (NNI)"
          value={form.nni}
          onChangeText={(text) => setForm({ ...form, nni: text })}
          icon="card-outline"
          keyboardType="numeric"
        />
        {errors.nni && <Text style={styles.error}>{errors.nni}</Text>}

        <CustomSelect
          label="Type de pièce d'identité"
          value={form.typePiece}
          onValueChange={(value) => setForm({ ...form, typePiece: value })}
          icon="card-outline"
          items={SelectData.type_piece_identite}
        />
        {errors.typePiece && <Text style={styles.error}>{errors.typePiece}</Text>}

        <CustomInput
          label="Numéro de pièce d'identité"
          value={form.numeroPiece}
          onChangeText={(text) => setForm({ ...form, numeroPiece: text })}
          icon="document-text-outline"
          keyboardType="numeric"
        />
        {errors.numeroPiece && <Text style={styles.error}>{errors.numeroPiece}</Text>}

        <DateOfBirthPicker
          label="Date d'expiration de la pièce"
          value={form.dateExpiration}
          onChange={(date) => setForm({ ...form, dateExpiration: date })}
        />
        {errors.dateExpiration && <Text style={styles.error}>{errors.dateExpiration}</Text>}

        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Justificatifs d'identité</Text>

        <Text style={[styles.label, { color: colors.text }]}>Scanner de la Pièce d'identité</Text>
        <FilePickerButton
          title="Importer la pièce d'identité (PDF/JPG)"
          icon="cloud-upload-outline"
          value={form.pieceIdentite}
          onChange={(file) => setForm({ ...form, pieceIdentite: file })}
        />

        <Text style={[styles.label, { color: colors.text }]}>Certificat NNI</Text>
        <FilePickerButton
          title="Importer le certificat NNI (PDF)"
          icon="cloud-upload-outline"
          value={form.certificatNNI}
          onChange={(file) => setForm({ ...form, certificatNNI: file })}
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