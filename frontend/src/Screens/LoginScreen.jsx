import { Image, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginScreenValidation from "../Validation/LoginScreenValidation";
import { useAuth } from "../Context/AuthContext";

import Separator from "../Componants/Separator";
import GoogleButton from "../Componants/GoogleButton";
import CustomInput from "../Componants/CustomInput";
import HeaderMenu from "../Componants/HeaderMenu";
import { ScrollView } from "react-native";

const SERVER_URL = "http://192.168.100.34:8000";

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
    const navigation = useNavigation();
    const { login } = useAuth();


    //fonction de validation LoginScreen
 const handleLogin = async () => {
  console.log("Bouton cliqué");
  console.log("Email :", email);
  console.log("Password :", password);

  const validationErrors = LoginScreenValidation(email, password);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    console.log("Avant fetch");

    const response = await fetch(
      `${SERVER_URL}/?action=login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    console.log("Après fetch");

    const data = await response.json();

    console.log("Réponse :", data);

   if (data.success) {

  // Sauvegarder l'utilisateur dans AuthContext
  await login(data.user);

  navigation.replace("Home");

} else {

  alert(data.message);

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
    const response = await fetch(
      `${SERVER_URL}/?action=forgot_password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setResetSent(true);
      setDevResetToken(data.dev_token || "");

      if (data.dev_token) {
        setResetToken(data.dev_token);
      }

      Alert.alert(
        "Demande prise en compte",
        data.message
      );
    } else {
      setResetSent(false);

      Alert.alert(
        "Erreur",
        data.message ||
          "Erreur lors de la demande de réinitialisation."
      );
    }
  } catch (error) {
    console.log("Erreur mot de passe oublié :", error);
    setResetSent(false);

    Alert.alert(
      "Erreur",
      "Erreur de connexion au serveur"
    );
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
    validationErrors.newPassword =
      "Le mot de passe doit contenir au moins 8 caractères";
  }

  if (!confirmNewPassword.trim()) {
    validationErrors.confirmNewPassword =
      "La confirmation est obligatoire";
  } else if (newPassword !== confirmNewPassword) {
    validationErrors.confirmNewPassword =
      "Les mots de passe ne correspondent pas";
  }

  if (Object.keys(validationErrors).length > 0) {
    setResetErrors(validationErrors);
    return;
  }

  setResetErrors({});
  setResetPasswordLoading(true);

  try {
    const response = await fetch(
      `${SERVER_URL}/?action=reset_password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          token: resetToken.trim(),
          password: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      Alert.alert(
        "Mot de passe modifié",
        data.message || "Vous pouvez maintenant vous connecter."
      );

      setEmail(resetEmail.trim());
      setPassword("");
      closeForgotPassword();
    } else {
      Alert.alert(
        "Erreur",
        data.message ||
          "Impossible de réinitialiser le mot de passe."
      );
    }
  } catch (error) {
    console.log("Erreur réinitialisation :", error);

    Alert.alert(
      "Erreur",
      "Erreur de connexion au serveur"
    );
  } finally {
    setResetPasswordLoading(false);
  }
};


return (
    
    <ScrollView>
    <SafeAreaView style={styles.container}>
        
    <StatusBar
    barStyle="dark-content"
    
        />
    <HeaderMenu
    onMenu={() => console.log("Menu")}
/>

    <Text style={styles.title}>Connexion</Text>

    <Image
        source={require("../../assets/connexion.png")}
        style={styles.logo}
        />

    {showForgotPassword ? (
      <View style={styles.forgotContainer}>
        <Text style={styles.forgotTitle}>
          Mot de passe oublié
        </Text>

        <Text style={styles.forgotDescription}>
          {resetSent
            ? "Saisissez le code reçu et choisissez un nouveau mot de passe."
            : "Entrez votre email pour recevoir les instructions de réinitialisation."}
        </Text>

        <CustomInput
          label="Email"
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
          <Text style={styles.error}>
            {resetErrors.resetEmail}
          </Text>
        )}

        {resetSent && (
          <>
            <Text style={styles.successText}>
              Code envoyé pour {resetEmail}
            </Text>

            {devResetToken ? (
              <View style={styles.devCodeBox}>
                <Text style={styles.devCodeLabel}>
                  Code de test
                </Text>
                <Text style={styles.devCodeValue}>
                  {devResetToken}
                </Text>
              </View>
            ) : null}

            <CustomInput
              label="Code reçu par email"
              value={resetToken}
              onChangeText={setResetToken}
              icon="key-outline"
            />

            {resetErrors.resetToken && (
              <Text style={styles.error}>
                {resetErrors.resetToken}
              </Text>
            )}

            <CustomInput
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            {resetErrors.newPassword && (
              <Text style={styles.error}>
                {resetErrors.newPassword}
              </Text>
            )}

            <CustomInput
              label="Confirmer le mot de passe"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            {resetErrors.confirmNewPassword && (
              <Text style={styles.error}>
                {resetErrors.confirmNewPassword}
              </Text>
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
            resetSent
              ? styles.resendButton
              : styles.button,
            resetLoading && styles.disabledButton,
          ]}
          disabled={resetLoading}
        >
          <Text
            style={
              resetSent
                ? styles.resendButtonText
                : styles.buttonText
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
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
    <>
    

    <CustomInput
    label="Email"
    value={email}
    onChangeText={setEmail}
    icon="mail-outline"
    keyboardType="email-address"
        />

    {errors.email && (
    <Text style={styles.error}>
        {errors.email}
    </Text>
    )}

<CustomInput
    label="Mot de passe"
    value={password}
    onChangeText={setPassword}
    icon="lock-closed-outline"
    secureTextEntry
/>

{errors.password && (
    <Text style={styles.error}>
        {errors.password}
    </Text>
)}

    <Text
        style={styles.Motpasslink}
        onPress={openForgotPassword}
    >
        Mot de passe oublié ?
    </Text>

    <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        >
            <Text style={styles.buttonText}>Se CONNECTER</Text>
        </TouchableOpacity>

    <Separator/>
    <GoogleButton
        onPress={() => {
        console.log("Connexion Google");
        }}
    />
    <Text style={styles.textlink}>
        pas encore de compte ?{" "}
    <Text
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
    >
        Créer un compte
    </Text>
    </Text>
    </>
    )}
    </SafeAreaView>
    </ScrollView>
);
}

const styles = StyleSheet.create({container: {
    flex: 1,
    backgroundColor: "#fff",
    
    
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
    marginBottom: 30,
},

input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    marginHorizontal:20
},

link: {
    color: "#3b54e3",
    textAlign: "center",
    marginTop: 20,
},
button: {
        backgroundColor: "darkorange",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        marginHorizontal:20
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
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal:20
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
    marginHorizontal:20
},

resendButtonText: {
    color: "#3b54e3",
    fontSize: 15,
    fontWeight: "bold",
},
logo: {
    width: "100%",
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
},
textlink:{
    textAlign:"left",
    marginLeft:20,
    marginTop:5,
    
},

Motpasslink: {
    textAlign: "right",
    marginRight: 20,
    fontWeight: "bold",
    color:"#3b54e3"
}
});
