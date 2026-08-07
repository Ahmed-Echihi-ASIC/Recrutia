import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../Componants/CustomInput";
import CustomSelect from "../Componants/CustomSelect";
import FilePickerButton from "../Componants/FilePickerButton";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import HeaderMenu from "../Componants/HeaderMenu";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";

import SelectData from "../Data/SelectData";
import { useAuth } from "../Context/AuthContext";

const SERVER_URL = "http://192.168.100.34:8000";

const extensionFromMimeType = (mimeType) => {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
  };

  return extensions[mimeType] || "jpg";
};

const appendFile = (formData, fieldName, fileObj, defaultType) => {
  if (!fileObj) return;

  const mimeType = fileObj.mimeType || defaultType;
  const fallbackName = `${fieldName}.${extensionFromMimeType(mimeType)}`;
  const fileName = fileObj.name || fallbackName;

  if (Platform.OS === "web" && fileObj.file) {
    formData.append(fieldName, fileObj.file, fileName);
    return;
  }

  formData.append(fieldName, {
    uri: fileObj.uri,
    name: fileName,
    type: mimeType,
  });
};

const toFormValue = (value) =>
  value === null || value === undefined ? "" : String(value);

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    diplome: toFormValue(user?.diplome),
    nom: toFormValue(user?.nom),
    prenom: toFormValue(user?.prenom),

    nni: toFormValue(user?.numero_national),

    dateNaissance: toFormValue(user?.date_naissance),
    lieuNaissance: toFormValue(user?.lieu_naissance),

    region: toFormValue(user?.region),
    ville: toFormValue(user?.ville),
    arrondissement: toFormValue(user?.arrondissement),
    adresse: toFormValue(user?.adresse),

    telephone: toFormValue(user?.telephone),
    email: toFormValue(user?.email),

    situationFamiliale:
      toFormValue(user?.situation_familiale),

    nombreEnfant:
      toFormValue(user?.nombre_enfants),

    nombreDiplome:
      toFormValue(user?.nombre_diplomes),

    NiveauEtude:
      toFormValue(user?.niveau_etude),

    specialite:
      toFormValue(user?.specialite),

    ConditionPhysique:
      toFormValue(user?.condition_physique),

    NbrExperience:
      toFormValue(user?.nombre_experiences),

    DureeExperience:
      toFormValue(user?.duree_experience),

    typePiece:
      toFormValue(user?.type_piece_identite),

    numeroPiece:
      toFormValue(user?.numero_piece_identite),

    dateExpiration:
      toFormValue(user?.date_expiration_piece),

    // Nouveau fichier sélectionné
    cv: null,
    photo: null,
    pieceIdentite: null,
    certificatNNI: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert(
        "Session expirée",
        "Veuillez vous reconnecter avant de modifier votre profil."
      );
      return;
    }

    const validationErrors = {};

    if (!form.nom.trim()) {
      validationErrors.nom = "Le nom est obligatoire";
    }

    if (!form.prenom.trim()) {
      validationErrors.prenom =
        "Le prénom est obligatoire";
    }

    if (!form.email.trim()) {
      validationErrors.email =
        "L'email est obligatoire";
    }

    if (!form.telephone.trim()) {
      validationErrors.telephone =
        "Le téléphone est obligatoire";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("id", String(user.id));

      // ==========================
      // INFORMATIONS
      // ==========================

      formData.append("nom", form.nom);
      formData.append("prenom", form.prenom);
      formData.append("email", form.email);

      formData.append(
        "date_naissance",
        form.dateNaissance || ""
      );

      formData.append(
        "lieu_naissance",
        form.lieuNaissance || ""
      );

      formData.append(
        "region",
        form.region || ""
      );

      formData.append(
        "ville",
        form.ville || ""
      );

      formData.append(
        "arrondissement",
        form.arrondissement || ""
      );

      formData.append(
        "adresse",
        form.adresse || ""
      );

      formData.append(
        "telephone",
        form.telephone || ""
      );

      formData.append(
        "situation_familiale",
        form.situationFamiliale || ""
      );

      formData.append(
        "nombre_enfants",
        form.nombreEnfant || ""
      );

      // ==========================
      // PARCOURS
      // ==========================

      formData.append(
        "diplome",
        form.diplome || ""
      );

      formData.append(
        "nombre_diplomes",
        form.nombreDiplome || ""
      );

      formData.append(
        "niveau_etude",
        form.NiveauEtude || ""
      );

      formData.append(
        "specialite",
        form.specialite || ""
      );

      formData.append(
        "condition_physique",
        form.ConditionPhysique || ""
      );

      formData.append(
        "nombre_experiences",
        form.NbrExperience || ""
      );

      formData.append(
        "duree_experience",
        form.DureeExperience || ""
      );

      // ==========================
      // IDENTIFICATION
      // ==========================

      formData.append(
        "numero_national",
        form.nni || ""
      );

      formData.append(
        "type_piece_identite",
        form.typePiece || ""
      );

      formData.append(
        "numero_piece_identite",
        form.numeroPiece || ""
      );

      formData.append(
        "date_expiration_piece",
        form.dateExpiration || ""
      );

      // ==========================
      // FICHIERS
      // ==========================

      appendFile(formData, "cv", form.cv, "application/pdf");
      appendFile(formData, "photo", form.photo, "image/jpeg");
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

      console.log("=== MODIFICATION ===");
      console.log("ID :", user.id);
      console.log("CV :", form.cv);
      console.log("PHOTO :", form.photo);
      console.log(
        "PIECE :",
        form.pieceIdentite
      );
      console.log(
        "CERTIFICAT :",
        form.certificatNNI
      );

      const response = await fetch(
        `${SERVER_URL}/?action=update_profile`,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      console.log(
        "Réponse serveur :",
        text
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        Alert.alert(
          "Erreur",
          "Réponse invalide du serveur"
        );
        return;
      }

      if (data.success) {
        if (!data.user) {
          Alert.alert(
            "Erreur",
            "Le serveur n'a pas renvoyé le profil mis à jour."
          );
          return;
        }

        if (updateUser) {
          await updateUser(data.user);
        }

        Alert.alert(
          "Succès",
          "Profil modifié avec succès"
        );

        navigation.goBack();
      } else {
        Alert.alert(
          "Erreur",
          data.message ||
            "Erreur lors de la modification"
        );
      }
    } catch (error) {
      console.log(
        "Erreur modification :",
        error
      );

      Alert.alert(
        "Erreur",
        "Erreur de connexion au serveur"
      );
    } finally {
      setLoading(false);
    }
  };

  const regions = Object.keys(
    SelectData.villes
  ).map((region) => ({
    label: region,
    value: region,
  }));

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMenu
          onMenu={() =>
            console.log("Menu")
          }
        />

        <Text style={styles.title}>
          Modifier mon profil
        </Text>

        {/* ==========================
            INFORMATIONS PERSONNELLES
        ========================== */}

        <Text style={styles.sectionTitle}>
          Informations personnelles
        </Text>

        <CustomSelect
          label="Diplôme"
          value={form.diplome}
          onValueChange={(value) =>
            updateField(
              "diplome",
              value
            )
          }
          icon="school-outline"
          items={SelectData.diplomes}
        />

        <CustomInput
          label="Nom"
          value={form.nom}
          onChangeText={(value) =>
            updateField("nom", value)
          }
          icon="person-outline"
        />

        {errors.nom && (
          <Text style={styles.error}>
            {errors.nom}
          </Text>
        )}

        <CustomInput
          label="Prénom"
          value={form.prenom}
          onChangeText={(value) =>
            updateField(
              "prenom",
              value
            )
          }
          icon="person-outline"
        />

        <DateOfBirthPicker
          label="Date de naissance"
          value={form.dateNaissance}
          onChange={(date) =>
            updateField(
              "dateNaissance",
              date
            )
          }
        />

        <CustomInput
          label="Lieu de naissance"
          value={form.lieuNaissance}
          onChangeText={(value) =>
            updateField(
              "lieuNaissance",
              value
            )
          }
          icon="location-outline"
        />

        <CustomInput
          label="NNI"
          value={form.nni}
          onChangeText={(value) =>
            updateField("nni", value)
          }
          icon="card-outline"
        />

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

        <CustomSelect
          label="Ville"
          value={form.ville}
          onValueChange={(value) =>
            updateField(
              "ville",
              value
            )
          }
          icon="business-outline"
          items={(
            SelectData.villes[
              form.region
            ] || []
          ).map((ville) => ({
            label: ville,
            value: ville,
          }))}
        />

        <CustomInput
          label="Arrondissement"
          value={form.arrondissement}
          onChangeText={(value) =>
            updateField(
              "arrondissement",
              value
            )
          }
          icon="map-outline"
        />

        <CustomInput
          label="Adresse"
          value={form.adresse}
          onChangeText={(value) =>
            updateField(
              "adresse",
              value
            )
          }
          icon="home-outline"
        />

        <CustomInput
          label="Téléphone"
          value={form.telephone}
          onChangeText={(value) =>
            updateField(
              "telephone",
              value
            )
          }
          icon="call-outline"
          keyboardType="phone-pad"
        />

        <CustomInput
          label="Email"
          value={form.email}
          onChangeText={(value) =>
            updateField(
              "email",
              value
            )
          }
          icon="mail-outline"
          keyboardType="email-address"
        />

        <CustomSelect
          label="Situation familiale"
          value={
            form.situationFamiliale
          }
          onValueChange={(value) =>
            updateField(
              "situationFamiliale",
              value
            )
          }
          icon="heart-outline"
          items={
            SelectData.situation_familiale
          }
        />

        <CustomSelect
          label="Nombre d'enfants"
          value={form.nombreEnfant}
          onValueChange={(value) =>
            updateField(
              "nombreEnfant",
              value
            )
          }
          icon="people-outline"
          items={
            SelectData.nombre_enfant
          }
        />

        {/* ==========================
            PARCOURS
        ========================== */}

        <Text style={styles.sectionTitle}>
          Parcours professionnel
        </Text>

        <CustomSelect
          label="Nombre de diplôme"
          value={form.nombreDiplome}
          onValueChange={(value) =>
            updateField(
              "nombreDiplome",
              value
            )
          }
          icon="school-outline"
          items={
            SelectData.nombreDiplomes
          }
        />

        <CustomSelect
          label="Niveau d'étude"
          value={form.NiveauEtude}
          onValueChange={(value) =>
            updateField(
              "NiveauEtude",
              value
            )
          }
          items={
            SelectData.niveau_etudes
          }
        />

        <CustomSelect
          label="Spécialité"
          value={form.specialite}
          onValueChange={(value) =>
            updateField(
              "specialite",
              value
            )
          }
          icon="construct-outline"
          items={
            SelectData.specialite
          }
        />

        <CustomSelect
          label="Condition physique"
          value={
            form.ConditionPhysique
          }
          onValueChange={(value) =>
            updateField(
              "ConditionPhysique",
              value
            )
          }
          icon="fitness-outline"
          items={
            SelectData.condition_physique
          }
        />

        <CustomSelect
          label="Nombre d'expériences"
          value={form.NbrExperience}
          onValueChange={(value) =>
            updateField(
              "NbrExperience",
              value
            )
          }
          icon="briefcase-outline"
          items={
            SelectData.nombre_experience
          }
        />

        <CustomSelect
          label="Durée d'expérience"
          value={
            form.DureeExperience
          }
          onValueChange={(value) =>
            updateField(
              "DureeExperience",
              value
            )
          }
          icon="time-outline"
          items={
            SelectData.duree_experience
          }
        />

        {/* ==========================
            IDENTIFICATION
        ========================== */}

        <Text style={styles.sectionTitle}>
          Identification
        </Text>

        <CustomSelect
          label="Type de pièce"
          value={form.typePiece}
          onValueChange={(value) =>
            updateField(
              "typePiece",
              value
            )
          }
          icon="card-outline"
          items={
            SelectData.type_piece_identite
          }
        />

        <CustomInput
          label="Numéro de pièce"
          value={form.numeroPiece}
          onChangeText={(value) =>
            updateField(
              "numeroPiece",
              value
            )
          }
          icon="document-outline"
        />

        <DateOfBirthPicker
          label="Date d'expiration"
          value={form.dateExpiration}
          onChange={(date) =>
            updateField(
              "dateExpiration",
              date
            )
          }
        />

        {/* ==========================
            DOCUMENTS
        ========================== */}

        <Text style={styles.sectionTitle}>
          Documents
        </Text>

        <Text style={styles.label}>
          CV
        </Text>

        <FilePickerButton
          title="Choisir un CV"
          icon="cloud-upload-outline"
          value={form.cv}
          onChange={(file) =>
            updateField(
              "cv",
              file
            )
          }
        />

        <Text style={styles.label}>
          Photo
        </Text>

        <FilePickerButton
          title="Choisir une photo"
          icon="camera-outline"
          value={form.photo}
          type="image/*"
          onChange={(file) =>
            updateField(
              "photo",
              file
            )
          }
        />

        <Text style={styles.label}>
          Pièce d'identité
        </Text>

        <FilePickerButton
          title="Choisir un fichier"
          icon="document-outline"
          value={
            form.pieceIdentite
          }
          onChange={(file) =>
            updateField(
              "pieceIdentite",
              file
            )
          }
        />

        <Text style={styles.label}>
          Certificat NNI
        </Text>

        <FilePickerButton
          title="Choisir un fichier"
          icon="document-text-outline"
          value={
            form.certificatNNI
          }
          onChange={(file) =>
            updateField(
              "certificatNNI",
              file
            )
          }
        />

        <NextButton
          title={
            loading
              ? "Enregistrement..."
              : "Enregistrer"
          }
          onPress={handleSave}
          disabled={loading}
        />

        <BackButton
          onPress={() =>
            navigation.goBack()
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    color: "darkorange",
  },

  label: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  error: {
    color: "red",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 10,
  },
});
