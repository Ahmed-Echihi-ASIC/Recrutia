import { useState } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";

import RegisterStepInfos from "../Register/RegisterStepInfos";
import RegisterStepParcours from "../Register/RegisterStepParcours";
import RegisterStepConfirm from "../Register/RegisterStepConfirm";
import RegisterStepIdentification from "../Register/RegisterStepIdentification";
import { useNavigation } from "@react-navigation/native";

// ==========================
// Helper : ajoute un fichier au FormData
// - Sur le web (Platform.OS === "web"), les fichiers sélectionnés
//   contiennent un vrai objet File du navigateur (fileObj.file),
//   il faut l'envoyer directement.
// - Sur mobile (iOS/Android), React Native attend un objet
//   { uri, name, type } qu'il convertit lui-même en fichier.
// ==========================
const appendFile = (formData, fieldName, fileObj, defaultType) => {
  if (!fileObj) return;

  if (Platform.OS === "web" && fileObj.file) {
    formData.append(fieldName, fileObj.file, fileObj.name);
  } else {
    formData.append(fieldName, {
      uri: fileObj.uri,
      name: fileObj.name,
      type: fileObj.mimeType || defaultType,
    });
  }
};

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
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

    // Champs utilisés par RegisterStepIdentification — manquants
    // jusqu'ici, ce qui rendait les inputs "non contrôlés" au départ.
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

      // ==========================
      // Informations personnelles
      // ==========================
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

      // ==========================
      // Parcours
      // ==========================
      formData.append("diplome", form.diplome);
      formData.append("niveau_etude", form.NiveauEtude);
      formData.append("specialite", form.specialite);

      formData.append("condition_physique", form.ConditionPhysique);

      formData.append("nombre_experiences", form.NbrExperience);
      formData.append("duree_experience", form.DureeExperience);

      // ==========================
      // Identification
      // ==========================
      formData.append("numero_national", form.nni);
      formData.append("type_piece_identite", form.typePiece);
      formData.append("numero_piece_identite", form.numeroPiece);
      formData.append("date_expiration_piece", form.dateExpiration);

      // ==========================
      // Fichiers (photo, CV, pièce identité, certificat NNI)
      // ==========================
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

      console.log("Envoi des données...");
      console.log("PHOTO :", form.photo);
      console.log("CV :", form.cv);
      console.log("PIECE :", form.pieceIdentite);
      console.log("NNI :", form.certificatNNI);

      const response = await fetch(
        "http://192.168.100.34:8000/?action=register",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      console.log(text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        alert("Réponse invalide du serveur");
        return;
      }

      if (data.success) {
        alert("Compte créé avec succès");
        navigation.replace("Login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Erreur de connexion");
    }
  };

  return (
    <View style={{ flex: 1 }}>
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