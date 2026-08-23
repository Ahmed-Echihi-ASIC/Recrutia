import { useState } from "react";
import { StyleSheet, View, Text, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../Context/ThemeContext";
import { SERVER_URL } from "../Config/config";

import RegisterStepInfos from "../Register/RegisterStepInfos";
import RegisterStepParcours from "../Register/RegisterStepParcours";
import RegisterStepConfirm from "../Register/RegisterStepConfirm";
import RegisterStepIdentification from "../Register/RegisterStepIdentification";

// ==========================
// Helper : ajoute un fichier au FormData
// ==========================
const appendFile = (formData, fieldName, fileObj, defaultType) => {
  if (!fileObj) return;

  if (Platform.OS === "web" && fileObj.file) {
    formData.append(fieldName, fileObj.file, fileObj.name);
  } else {
    formData.append(fieldName, {
      uri: fileObj.uri,
      name: fileObj.name || "file",
      type: fileObj.mimeType || fileObj.type || defaultType,
    });
  }
};

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [form, setForm] = useState({
    diplome: "",
    nom: "",
    prenom: "",
    nni: "",
    dateNaissance: "",
    region: "",
    telephone: "",
    email: "",
    password: "",
    confirmPassword: "",

    nombreDiplome: "",
    NiveauEtude: "",
    specialite: "",
    ConditionPhysique: "",
    NbrExperience: "",
    DureeExperience: "",

    lieuNaissance: "",
    situationFamiliale: "",
    nombreEnfant: "",
    adresse: "",
    ville: "",
    arrondissement: "",

    typePiece: "",
    numeroPiece: "",
    dateExpiration: "",
    pieceIdentite: null,
    certificatNNI: null,
    cv: null,
    photo: null,
  });

  const handleRegister = async () => {
    try {
      const formData = new FormData();

      formData.append("nom", form.nom);
      formData.append("prenom", form.prenom);
      formData.append("email", form.email);
      formData.append("mot_de_passe", form.password);

      formData.append("date_naissance", form.dateNaissance);
      formData.append("lieu_naissance", form.lieuNaissance);

      formData.append("region", form.region);
      formData.append("ville", form.ville);
      formData.append("arrondissement", form.arrondissement);
      formData.append("adresse", form.adresse);

      formData.append("telephone", form.telephone);

      formData.append("situation_familiale", form.situationFamiliale);
      formData.append("nombre_enfants", form.nombreEnfant);

      formData.append("diplome", form.diplome);
      formData.append("niveau_etude", form.NiveauEtude);
      formData.append("specialite", form.specialite);

      formData.append("condition_physique", form.ConditionPhysique);

      formData.append("nombre_experiences", form.NbrExperience);
      formData.append("duree_experience", form.DureeExperience);

      formData.append("numero_national", form.nni);
      formData.append("type_piece_identite", form.typePiece);
      formData.append("numero_piece_identite", form.numeroPiece);
      formData.append("date_expiration_piece", form.dateExpiration);

      appendFile(formData, "photo", form.photo, "image/jpeg");
      appendFile(formData, "cv", form.cv, "application/pdf");
      appendFile(
        formData,
        "piece_identite",
        form.pieceIdentite,
        "application/pdf"
      );
      appendFile(
        formData,
        "certificat_nni",
        form.certificatNNI,
        "application/pdf"
      );

      const response = await fetch(
        `${SERVER_URL}/?action=register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Erreur", "Réponse invalide du serveur");
        return;
      }

      if (data.success) {
        Alert.alert("Succès", "Compte créé avec succès !");
        navigation.replace("Login");
      } else {
        Alert.alert("Erreur", data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Erreur de connexion au serveur");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {step === 1 && (
        <RegisterStepInfos
          form={form}
          setForm={setForm}
          onNext={() => setStep(2)}
          onBack={() => navigation.navigate("Login")}
        />
      )}

      {step === 2 && (
        <RegisterStepParcours
          form={form}
          setForm={setForm}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <RegisterStepIdentification
          form={form}
          setForm={setForm}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <RegisterStepConfirm
          form={form}
          setForm={setForm}
          onBack={() => setStep(3)}
          onRegister={handleRegister}
        />
      )}
    </View>
  );
}