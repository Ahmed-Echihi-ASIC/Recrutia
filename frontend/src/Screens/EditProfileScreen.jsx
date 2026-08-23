import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import CustomInput from "../Componants/CustomInput";
import CustomSelect from "../Componants/CustomSelect";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import FilePickerButton from "../Componants/FilePickerButton";
import HeaderMenu from "../Componants/HeaderMenu";
import SideMenuModal from "../Componants/SideMenuModal";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import SelectData from "../Data/SelectData";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { SERVER_URL } from "../Config/config";

// ==========================
// Helper pour l'envoi de fichiers
// ==========================
const appendFile = (formData, fieldName, fileObj, defaultType) => {
  if (!fileObj) return;

  if (Platform.OS === "web" && fileObj.file) {
    formData.append(fieldName, fileObj.file, fileObj.name);
  } else if (fileObj.uri) {
    formData.append(fieldName, {
      uri: fileObj.uri,
      name: fileObj.name,
      type: fileObj.mimeType || defaultType,
    });
  }
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { colors, t } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [form, setForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",

    date_naissance: user?.date_naissance || "",
    lieu_naissance: user?.lieu_naissance || "",
    region: user?.region || "",
    ville: user?.ville || "",
    arrondissement: user?.arrondissement || "",
    adresse: user?.adresse || "",

    situation_familiale: user?.situation_familiale || "",
    nombre_enfants: user?.nombre_enfants || "",

    diplome: user?.diplome || "",
    niveau_etude: user?.niveau_etude || "",
    specialite: user?.specialite || "",
    condition_physique: user?.condition_physique || "",
    nombre_experiences: user?.nombre_experiences || "",
    duree_experience: user?.duree_experience || "",

    numero_national: user?.numero_national || "",
    type_piece_identite: user?.type_piece_identite || "",
    numero_piece_identite: user?.numero_piece_identite || "",
    date_expiration_piece: user?.date_expiration_piece || "",

    cv: null,
    photo: null,
    piece_identite: null,
    certificat_nni: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const validationErrors = {};
    if (!form.nom) validationErrors.nom = "Le nom est obligatoire";
    if (!form.prenom) validationErrors.prenom = "Le prénom est obligatoire";
    if (!form.email) validationErrors.email = "L'email est obligatoire";
    if (!form.telephone)
      validationErrors.telephone = "Le téléphone est obligatoire";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("id", user.id);
      formData.append("nom", form.nom);
      formData.append("prenom", form.prenom);
      formData.append("email", form.email);
      formData.append("telephone", form.telephone);

      formData.append("date_naissance", form.date_naissance);
      formData.append("lieu_naissance", form.lieu_naissance);
      formData.append("region", form.region);
      formData.append("ville", form.ville);
      formData.append("arrondissement", form.arrondissement);
      formData.append("adresse", form.adresse);

      formData.append("situation_familiale", form.situation_familiale);
      formData.append("nombre_enfants", form.nombre_enfants);

      formData.append("diplome", form.diplome);
      formData.append("niveau_etude", form.niveau_etude);
      formData.append("specialite", form.specialite);
      formData.append("condition_physique", form.condition_physique);
      formData.append("nombre_experiences", form.nombre_experiences);
      formData.append("duree_experience", form.duree_experience);

      formData.append("numero_national", form.numero_national);
      formData.append("type_piece_identite", form.type_piece_identite);
      formData.append(
        "numero_piece_identite",
        form.numero_piece_identite
      );
      formData.append(
        "date_expiration_piece",
        form.date_expiration_piece
      );

      appendFile(formData, "photo", form.photo, "image/jpeg");
      appendFile(formData, "cv", form.cv, "application/pdf");
      appendFile(
        formData,
        "piece_identite",
        form.piece_identite,
        "application/pdf"
      );
      appendFile(
        formData,
        "certificat_nni",
        form.certificat_nni,
        "application/pdf"
      );

      const response = await fetch(
        `${SERVER_URL}/?action=update_profile`,
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
        setLoading(false);
        return;
      }

      if (data.success) {
        const updatedFields = {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          date_naissance: form.date_naissance,
          lieu_naissance: form.lieu_naissance,
          region: form.region,
          ville: form.ville,
          arrondissement: form.arrondissement,
          adresse: form.adresse,
          situation_familiale: form.situation_familiale,
          nombre_enfants: form.nombre_enfants,
          diplome: form.diplome,
          niveau_etude: form.niveau_etude,
          specialite: form.specialite,
          condition_physique: form.condition_physique,
          nombre_experiences: form.nombre_experiences,
          duree_experience: form.duree_experience,
          numero_national: form.numero_national,
          type_piece_identite: form.type_piece_identite,
          numero_piece_identite: form.numero_piece_identite,
          date_expiration_piece: form.date_expiration_piece,
        };

        if (data.user) {
          updatedFields.photo = data.user.photo;
          updatedFields.cv = data.user.cv;
          updatedFields.fichier_piece_identite =
            data.user.fichier_piece_identite;
          updatedFields.certificat_nni = data.user.certificat_nni;
        }

        if (updateUser) {
          await updateUser(updatedFields);
        }

        Alert.alert("Succès", "Profil mis à jour avec succès");
        navigation.goBack();
      } else {
        Alert.alert("Erreur", data.message || "Erreur lors de la mise à jour");
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
        title={t("editProfile") || "Modifier mon profil"}
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
        {/* Section 1: Informations personnelles */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="person-outline" title="Informations personnelles" colors={colors} />

          <CustomInput
            label="Nom"
            value={form.nom}
            onChangeText={(text) => setForm({ ...form, nom: text })}
            icon="person-outline"
          />
          {errors.nom && <Text style={styles.error}>{errors.nom}</Text>}

          <CustomInput
            label="Prénom"
            value={form.prenom}
            onChangeText={(text) => setForm({ ...form, prenom: text })}
            icon="person-outline"
          />
          {errors.prenom && <Text style={styles.error}>{errors.prenom}</Text>}

          <CustomInput
            label="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            icon="mail-outline"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <CustomInput
            label="Téléphone"
            value={form.telephone}
            onChangeText={(text) => setForm({ ...form, telephone: text })}
            icon="call-outline"
            keyboardType="phone-pad"
          />
          {errors.telephone && <Text style={styles.error}>{errors.telephone}</Text>}

          <DateOfBirthPicker
            label="Date de naissance"
            value={form.date_naissance}
            onChange={(date) => setForm({ ...form, date_naissance: date })}
          />

          <CustomInput
            label="Lieu de naissance"
            value={form.lieu_naissance}
            onChangeText={(text) => setForm({ ...form, lieu_naissance: text })}
            icon="location-outline"
          />

          <CustomInput
            label="Région"
            value={form.region}
            onChangeText={(text) => setForm({ ...form, region: text })}
            icon="map-outline"
          />

          <CustomInput
            label="Ville"
            value={form.ville}
            onChangeText={(text) => setForm({ ...form, ville: text })}
            icon="business-outline"
          />

          <CustomInput
            label="Arrondissement"
            value={form.arrondissement}
            onChangeText={(text) => setForm({ ...form, arrondissement: text })}
            icon="location-outline"
          />

          <CustomInput
            label="Adresse"
            value={form.adresse}
            onChangeText={(text) => setForm({ ...form, adresse: text })}
            icon="home-outline"
          />

          <CustomSelect
            label="Situation familiale"
            value={form.situation_familiale}
            onValueChange={(value) => setForm({ ...form, situation_familiale: value })}
            icon="heart-outline"
            items={SelectData.situation_familiale}
          />

          <CustomInput
            label="Nombre d'enfants"
            value={String(form.nombre_enfants)}
            onChangeText={(text) => setForm({ ...form, nombre_enfants: text })}
            icon="people-outline"
            keyboardType="numeric"
          />
        </View>

        {/* Section 2: Parcours & Spécialité */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="school-outline" title="Parcours & Spécialité" colors={colors} />

          <CustomInput
            label="Diplôme"
            value={form.diplome}
            onChangeText={(text) => setForm({ ...form, diplome: text })}
            icon="school-outline"
          />

          <CustomSelect
            label="Niveau d'étude"
            value={form.niveau_etude}
            onValueChange={(value) => setForm({ ...form, niveau_etude: value })}
            items={SelectData.niveau_etudes}
          />

          <CustomSelect
            label="Spécialité"
            value={form.specialite}
            onValueChange={(value) => setForm({ ...form, specialite: value })}
            items={SelectData.specialite}
            icon="construct-outline"
          />

          <CustomSelect
            label="Condition physique"
            value={form.condition_physique}
            onValueChange={(value) => setForm({ ...form, condition_physique: value })}
            icon="fitness-outline"
            items={SelectData.condition_physique}
          />

          <CustomSelect
            label="Nombre d'expériences professionnelles"
            value={form.nombre_experiences}
            onValueChange={(value) => setForm({ ...form, nombre_experiences: value })}
            icon="briefcase-outline"
            items={SelectData.nombre_experience}
          />

          <CustomSelect
            label="Durée d'expérience professionnelle"
            value={form.duree_experience}
            onValueChange={(value) => setForm({ ...form, duree_experience: value })}
            icon="time-outline"
            items={SelectData.duree_experience}
          />
        </View>

        {/* Section 3: Documents professionnels */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="document-text-outline" title="Documents professionnels" colors={colors} />

          <Text style={[styles.fileLabel, { color: colors.text }]}>Importer CV (PDF)</Text>
          <FilePickerButton
            title="Choisir un fichier"
            icon="cloud-upload-outline"
            value={form.cv}
            onChange={(file) => setForm({ ...form, cv: file })}
          />

          <Text style={[styles.fileLabel, { color: colors.text }]}>Importer Photo de profil</Text>
          <FilePickerButton
            title="Choisir une image"
            icon="camera-outline"
            value={form.photo}
            onChange={(file) => setForm({ ...form, photo: file })}
          />
        </View>

        {/* Section 4: Identification & Pièces */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SectionHeader icon="card-outline" title="Identification & Pièces" colors={colors} />

          <CustomInput
            label="Numéro national d'identification (NNI)"
            value={form.numero_national}
            onChangeText={(text) => setForm({ ...form, numero_national: text })}
            icon="card-outline"
            keyboardType="numeric"
          />

          <CustomSelect
            label="Type de pièce d'identité"
            value={form.type_piece_identite}
            onValueChange={(value) => setForm({ ...form, type_piece_identite: value })}
            icon="card-outline"
            items={SelectData.type_piece_identite}
          />

          <CustomInput
            label="Numéro pièce d'identité"
            value={form.numero_piece_identite}
            onChangeText={(text) => setForm({ ...form, numero_piece_identite: text })}
            icon="document-text-outline"
            keyboardType="numeric"
          />

          <DateOfBirthPicker
            label="Date d'expiration"
            value={form.date_expiration_piece}
            onChange={(date) => setForm({ ...form, date_expiration_piece: date })}
          />

          <Text style={[styles.fileLabel, { color: colors.text }]}>Importer Pièce d'identité</Text>
          <FilePickerButton
            title="Choisir un fichier"
            icon="cloud-upload-outline"
            value={form.piece_identite}
            onChange={(file) => setForm({ ...form, piece_identite: file })}
          />

          <Text style={[styles.fileLabel, { color: colors.text }]}>Importer Certificat NNI</Text>
          <FilePickerButton
            title="Choisir un fichier"
            icon="cloud-upload-outline"
            value={form.certificat_nni}
            onChange={(file) => setForm({ ...form, certificat_nni: file })}
          />
        </View>

        <NextButton
          title={loading ? "Enregistrement..." : "Enregistrer les modifications"}
          onPress={handleSave}
          disabled={loading}
        />

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

function SectionHeader({ icon, title, colors }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionHeaderBadge}>
        <Ionicons name={icon} size={18} color="darkorange" />
      </View>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
        {title}
      </Text>
    </View>
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

  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 18,
    paddingBottom: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },

  sectionHeaderBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,140,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  fileLabel: {
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },

  error: {
    color: "#DC2626",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 10,
  },
});