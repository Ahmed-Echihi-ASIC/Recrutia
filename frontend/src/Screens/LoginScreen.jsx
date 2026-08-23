import { Image, View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Platform, KeyboardAvoidingView, ScrollView, StatusBar } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginScreenValidation from "../Validation/LoginScreenValidation";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";

import Separator from "../Componants/Separator";
import GoogleButton from "../Componants/GoogleButton";
import CustomInput from "../Componants/CustomInput";
import { Ionicons } from "@expo/vector-icons";
import { SERVER_URL } from "../Config/config";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function LoginScreen() {
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetErrors, setResetErrors] = useState({});
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [devResetToken, setDevResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const [langModalVisible, setLangModalVisible] = useState(false);

  const navigation = useNavigation();
  const { login } = useAuth();
  const { language, changeLanguage, t, colors } = useTheme();

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleLogin = async () => {
    const validationErrors = LoginScreenValidation(email, password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.user);
        navigation.replace("Home");
      } else {
        Alert.alert(t("error"), data.message || "Erreur lors de la connexion.");
      }
    } catch (error) {
      console.log("Erreur :", error);
    }
  };

  const openForgotPassword = () => {
    setResetEmail(email);
    setResetErrors({});
    setResetSent(false);
    setResetToken("");
    setDevResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setResetErrors({});
    setResetSent(false);
    setResetToken("");
    setDevResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowForgotPassword(false);
  };

  const handleForgotPassword = async () => {
    const validationErrors = {};

    if (!resetEmail.trim()) {
      validationErrors.resetEmail = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      validationErrors.resetEmail = "Adresse email invalide";
    }

    if (Object.keys(validationErrors).length > 0) {
      setResetErrors(validationErrors);
      setResetSent(false);
      return;
    }

    setResetErrors({});
    setResetLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/?action=forgot_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResetSent(true);
        setDevResetToken(data.dev_token || "");

        if (data.dev_token) {
          setResetToken(data.dev_token);
        }

        Alert.alert(t("success"), data.message);
      } else {
        setResetSent(false);
        Alert.alert(t("error"), data.message || "Erreur lors de la demande.");
      }
    } catch (error) {
      console.log("Erreur mot de passe oublié :", error);
      setResetSent(false);
      Alert.alert(t("error"), "Erreur de connexion au serveur");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const validationErrors = {};

    if (!resetEmail.trim()) {
      validationErrors.resetEmail = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      validationErrors.resetEmail = "Adresse email invalide";
    }

    if (!resetToken.trim()) {
      validationErrors.resetToken = "Le code est obligatoire";
    }

    if (!newPassword.trim()) {
      validationErrors.newPassword = "Le nouveau mot de passe est obligatoire";
    } else if (newPassword.length < 8) {
      validationErrors.newPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (!confirmNewPassword.trim()) {
      validationErrors.confirmNewPassword = "La confirmation est obligatoire";
    } else if (newPassword !== confirmNewPassword) {
      validationErrors.confirmNewPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(validationErrors).length > 0) {
      setResetErrors(validationErrors);
      return;
    }

    setResetErrors({});
    setResetPasswordLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/?action=reset_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          token: resetToken.trim(),
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(t("success"), data.message || "Mot de passe modifié.");
        setEmail(resetEmail.trim());
        setPassword("");
        closeForgotPassword();
      } else {
        Alert.alert(t("error"), data.message || "Impossible de réinitialiser.");
      }
    } catch (error) {
      console.log("Erreur réinitialisation :", error);
      Alert.alert(t("error"), "Erreur de connexion au serveur");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

        {/* En-tête de Login : Logo + Sélecteur de Langue */}
        <View style={styles.headerRow}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoHeader}
            resizeMode="contain"
          />

          {/* Bouton Sélecteur de Langue */}
          <TouchableOpacity
            style={[styles.langBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>{currentLangObj.flag}</Text>
            <Text style={[styles.langCode, { color: colors.text }]}>
              {currentLangObj.code.toUpperCase()}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t("loginTitle")}</Text>

        <Image
          source={require("../../assets/connexion.png")}
          style={styles.logo}
        />

        {showForgotPassword ? (
          <View style={styles.forgotContainer}>
            <Text style={[styles.forgotTitle, { color: colors.text }]}>
              {t("forgotPasswordTitle")}
            </Text>

            <Text style={[styles.forgotDescription, { color: colors.subText }]}>
              {resetSent
                ? "Saisissez le code reçu et choisissez un nouveau mot de passe."
                : "Entrez votre email pour recevoir les instructions de réinitialisation."}
            </Text>

            <CustomInput
              label={t("email")}
              value={resetEmail}
              onChangeText={(value) => {
                setResetEmail(value);
                setResetSent(false);
                setResetToken("");
                setNewPassword("");
                setConfirmNewPassword("");
              }}
              icon="mail-outline"
              keyboardType="email-address"
            />

            {resetErrors.resetEmail && (
              <Text style={styles.error}>{resetErrors.resetEmail}</Text>
            )}

            {resetSent && (
              <>
                <Text style={styles.successText}>
                  Code envoyé pour {resetEmail}
                </Text>

                {devResetToken ? (
                  <View style={styles.devCodeBox}>
                    <Text style={styles.devCodeLabel}>Code de test</Text>
                    <Text style={styles.devCodeValue}>{devResetToken}</Text>
                  </View>
                ) : null}

                <CustomInput
                  label="Code reçu par email"
                  value={resetToken}
                  onChangeText={setResetToken}
                  icon="key-outline"
                />

                {resetErrors.resetToken && (
                  <Text style={styles.error}>{resetErrors.resetToken}</Text>
                )}

                <CustomInput
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                />

                {resetErrors.newPassword && (
                  <Text style={styles.error}>{resetErrors.newPassword}</Text>
                )}

                <CustomInput
                  label="Confirmer le mot de passe"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  icon="lock-closed-outline"
                  secureTextEntry
                />

                {resetErrors.confirmNewPassword && (
                  <Text style={styles.error}>{resetErrors.confirmNewPassword}</Text>
                )}

                <TouchableOpacity
                  onPress={handleResetPassword}
                  style={[
                    styles.button,
                    resetPasswordLoading && styles.disabledButton,
                  ]}
                  disabled={resetPasswordLoading}
                >
                  <Text style={styles.buttonText}>
                    {resetPasswordLoading
                      ? "Modification..."
                      : "Modifier le mot de passe"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={[
                resetSent ? styles.resendButton : styles.button,
                resetLoading && styles.disabledButton,
              ]}
              disabled={resetLoading}
            >
              <Text
                style={
                  resetSent ? styles.resendButtonText : styles.buttonText
                }
              >
                {resetLoading
                  ? "Envoi..."
                  : resetSent
                  ? "Renvoyer le code"
                  : "Envoyer"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={closeForgotPassword}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {t("backToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CustomInput
              label={t("email")}
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
            />

            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <CustomInput
              label={t("password")}
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            <Text style={styles.Motpasslink} onPress={openForgotPassword}>
              {t("forgotPassword")}
            </Text>

            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>{t("loginBtn")}</Text>
            </TouchableOpacity>

            <Separator />
            <GoogleButton
              onPress={() => {
                console.log("Connexion Google");
              }}
            />
            <Text style={[styles.textlink, { color: colors.text }]}>
              {t("noAccount")}{" "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("Register")}
              >
                {t("createAccount")}
              </Text>
            </Text>
          </>
        )}

        <Modal
          visible={langModalVisible}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setLangModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          >
            <View style={[styles.langModalCard, { backgroundColor: colors.modalBg }]}>
              <Text style={[styles.langModalTitle, { color: colors.text }]}>
                {t("language")}
              </Text>

              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOptionItem,
                      isSelected && { backgroundColor: "rgba(255,140,0,0.12)" },
                    ]}
                    onPress={() => {
                      changeLanguage(lang.code);
                      setLangModalVisible(false);
                    }}
                  >
                    <Text style={styles.langOptionFlag}>{lang.flag}</Text>
                    <Text
                      style={[
                        styles.langOptionText,
                        { color: isSelected ? "darkorange" : colors.text },
                        isSelected && { fontWeight: "bold" },
                      ]}
                    >
                      {lang.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="darkorange" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoHeader: {
    width: 95,
    height: 40,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  langFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  langCode: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    color: "#3b54e3",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "darkorange",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotContainer: {
    marginTop: 5,
  },
  forgotTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  forgotDescription: {
    fontSize: 15,
    color: "#666",
    marginHorizontal: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  successText: {
    color: "green",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 10,
  },
  devCodeBox: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F2A23A",
    borderRadius: 10,
    backgroundColor: "#FFF8EE",
  },
  devCodeLabel: {
    color: "#8A4B00",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  devCodeValue: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "darkorange",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 20,
  },
  secondaryButtonText: {
    color: "darkorange",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#C9C9C9",
  },
  resendButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 20,
  },
  resendButtonText: {
    color: "#3b54e3",
    fontSize: 15,
    fontWeight: "bold",
  },
  logo: {
    width: "100%",
    height: 180,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  textlink: {
    textAlign: "left",
    marginLeft: 20,
    marginTop: 15,
  },
  Motpasslink: {
    textAlign: "right",
    marginRight: 20,
    fontWeight: "bold",
    color: "#3b54e3",
  },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  langModalCard: {
    width: "85%",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  langOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  langOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  langOptionText: {
    flex: 1,
    fontSize: 15,
  },
});
