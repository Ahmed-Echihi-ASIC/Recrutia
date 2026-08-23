import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../Componants/CustomInput";
import HeaderMenu from "../Componants/HeaderMenu";
import SideMenuModal from "../Componants/SideMenuModal";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { SERVER_URL } from "../Config/config";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, t } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est obligatoire";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est obligatoire";
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit contenir au moins 6 caractères";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer le nouveau mot de passe";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit être différent de l'ancien";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(
        `${SERVER_URL}/?action=change_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            current_password: form.currentPassword,
            new_password: form.newPassword,
          }),
        }
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Erreur", "Réponse invalide du serveur");
        setLoading(false);
        return;
      }

      if (data.success) {
        Alert.alert("Succès", "Mot de passe modifié avec succès");
        navigation.goBack();
      } else {
        if (data.field === "currentPassword") {
          setErrors({ currentPassword: data.message });
        } else {
          Alert.alert("Erreur", data.message || "Erreur lors du changement de mot de passe");
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar
        barStyle={colors.isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Unique Header Title */}
      <HeaderMenu
        showBack={true}
        onBack={() => navigation.goBack()}
        onMenu={() => setIsMenuVisible(true)}
        title={t("changePassword") || "Changer le mot de passe"}
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
          {/* Banner informatif de sécurité */}
          <View style={[styles.infoBanner, { backgroundColor: colors.isDark ? "#2A2318" : "#FFF7ED", borderColor: colors.border }]}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="shield-checkmark" size={24} color="darkorange" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Sécurisez votre compte</Text>
              <Text style={[styles.infoSubtitle, { color: colors.subText }]}>
                Choisissez un mot de passe d'au moins 6 caractères combinant des lettres et des chiffres.
              </Text>
            </View>
          </View>

          {/* Carte Formulaire */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CustomInput
              label="Mot de passe actuel"
              value={form.currentPassword}
              onChangeText={(text) =>
                setForm({ ...form, currentPassword: text })
              }
              icon="lock-closed-outline"
              secureTextEntry
            />
            {errors.currentPassword && (
              <Text style={styles.error}>{errors.currentPassword}</Text>
            )}

            <CustomInput
              label="Nouveau mot de passe"
              value={form.newPassword}
              onChangeText={(text) =>
                setForm({ ...form, newPassword: text })
              }
              icon="key-outline"
              secureTextEntry
            />
            {errors.newPassword && (
              <Text style={styles.error}>{errors.newPassword}</Text>
            )}

            <CustomInput
              label="Confirmer le nouveau mot de passe"
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
              icon="checkmark-circle-outline"
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

            <View style={{ marginTop: 8 }}>
              <NextButton
                title={loading ? "Enregistrement..." : "Enregistrer"}
                onPress={handleSave}
                disabled={loading}
              />
            </View>
          </View>

          <BackButton onPress={() => navigation.goBack()} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SideMenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },

  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },

  infoSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },

  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  error: {
    color: "#DC2626",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 12,
  },
});
