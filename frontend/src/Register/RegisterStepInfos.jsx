import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectData from "../Data/SelectData";

import CustomSelect from "../Componants/CustomSelect";
import CustomInput from "../Componants/CustomInput";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import HeaderMenu from "../Componants/HeaderMenu";
import StepProgressBar from "../Componants/StepProgressBar";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import RegisterStepInfosValidation from "../Validation/RegisterStepInfosValidation";
import { useTheme } from "../Context/ThemeContext";

export default function RegisterStepInfos({
  form,
  setForm,
  onNext,
  onBack,
}) {
  const { colors } = useTheme();
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    const validationErrors = RegisterStepInfosValidation(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onNext();
  };

  const regions = Object.keys(SelectData.villes).map((region) => ({
    label: region,
    value: region,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

      <HeaderMenu
        showBack={true}
        onBack={onBack}
        title="Création de compte"
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
        <StepProgressBar currentStep={1} totalSteps={4} />

        <CustomSelect
          label="Diplôme le plus élevé"
          value={form.diplome}
          onValueChange={(value) => setForm({ ...form, diplome: value })}
          icon="school-outline"
          items={SelectData.diplomes}
        />
        {errors.diplome && <Text style={styles.error}>{errors.diplome}</Text>}

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Nom"
              value={form.nom}
              onChangeText={(text) => setForm({ ...form, nom: text })}
              icon="person-outline"
            />
            {errors.nom && <Text style={styles.error}>{errors.nom}</Text>}
          </View>

          <View style={styles.half}>
            <CustomInput
              label="Prénom"
              value={form.prenom}
              onChangeText={(text) => setForm({ ...form, prenom: text })}
              icon="person-outline"
            />
            {errors.prenom && <Text style={styles.error}>{errors.prenom}</Text>}
          </View>
        </View>

        <DateOfBirthPicker
          label="Date de naissance"
          value={form.dateNaissance}
          onChange={(date) => setForm({ ...form, dateNaissance: date })}
        />
        {errors.dateNaissance && <Text style={styles.error}>{errors.dateNaissance}</Text>}

        <CustomSelect
          label="Région"
          value={form.region}
          onValueChange={(value) =>
            setForm({
              ...form,
              region: value,
              ville: "",
            })
          }
          icon="location-outline"
          items={regions}
        />
        {errors.region && <Text style={styles.error}>{errors.region}</Text>}

        <CustomSelect
          label="Ville"
          value={form.ville}
          onValueChange={(value) => setForm({ ...form, ville: value })}
          icon="business-outline"
          items={(SelectData.villes[form.region] || []).map((ville) => ({
            label: ville,
            value: ville,
          }))}
        />
        {errors.ville && <Text style={styles.error}>{errors.ville}</Text>}

        <CustomInput
          label="Téléphone"
          value={form.telephone}
          onChangeText={(text) => setForm({ ...form, telephone: text })}
          icon="call-outline"
          keyboardType="phone-pad"
        />
        {errors.telephone && <Text style={styles.error}>{errors.telephone}</Text>}

        <CustomInput
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          icon="mail-outline"
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <CustomInput
          label="Mot de passe"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          icon="lock-closed-outline"
          secureTextEntry
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <CustomInput
          label="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          icon="lock-closed-outline"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

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

  error: {
    color: "#DC2626",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
  },

  half: {
    width: "50%",
  },
});