import { Text, StyleSheet, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import HeaderMenu from "../Componants/HeaderMenu";
import CustomInput from "../Componants/CustomInput";
import FilePickerButton from "../Componants/FilePickerButton";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import { useState } from "react";
import RegisterStepIdentificationValidation from "../Validation/RegisterStepIdentificationValidation";
import CustomSelect from "../Componants/CustomSelect";
import SelectData from "../Data/SelectData";

export default function RegisterStepIdentification({
  form,
  setForm,
  onNext,
  onBack,
}) {

const [errors, setErrors] = useState({});
const handleNext = () => {
    const validationErrors =
        RegisterStepIdentificationValidation(form);

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    onNext();
};

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeaderMenu onMenu={() => console.log("Menu")} />

        <Text style={styles.title}>Inscription</Text>
                <CustomInput
                  label="Numéro national d'identification"
                  value={form.nni}
                  onChangeText={(text) =>
                    setForm({ ...form, nni: text })
                  }
                  icon="card-outline"
                  keyboardType="numeric"
                />
                {errors.nni && (
                    <Text style={styles.error}>
                    {errors.nni}
                    </Text>
                        )}

        <CustomSelect
          label="Type de pièce d'identité"
          value={form.typePiece}
          onValueChange={(value) =>
            setForm({ ...form, typePiece: value })
          }
          icon="card-outline"
            items={SelectData.type_piece_identite}

        />
        {errors.typePiece && (
        <Text style={styles.error}>
        {errors.typePiece}
        </Text>
        )}

        <CustomInput
          label="Numéro pièce d'identité"
          value={form.numeroPiece}
          onChangeText={(text) =>
            setForm({ ...form, numeroPiece: text })
          }
          icon="document-text-outline"
          keyboardType="numeric"
        />
        {errors.numeroPiece && (
        <Text style={styles.error}>
        {errors.numeroPiece}
        </Text>
        )}


        <DateOfBirthPicker
  label="Date d'expiration"
  value={form.dateExpiration}
  onChange={(date) =>
    setForm({
      ...form,
      dateExpiration: date,
    })
  }
/>

{errors.dateExpiration && (
  <Text style={styles.error}>
    {errors.dateExpiration}
  </Text>
)}
        <Text style={styles.label}>
          Importer Pièce d'identité
        </Text>

        <FilePickerButton
    title="Choisir un fichier"
    icon="cloud-upload-outline"
    value={form.pieceIdentite}
    onChange={(file) =>
        setForm({
            ...form,
            pieceIdentite: file,
        })
    }
/>

        <Text style={styles.label}>
          Importer Certificat NNI
        </Text>

        <FilePickerButton
    title="Choisir un fichier"
    icon="cloud-upload-outline"
    value={form.certificatNNI}
    onChange={(file) =>
        setForm({
            ...form,
            certificatNNI: file,
        })
    }
/>

        <NextButton onPress={handleNext} />
        <BackButton onPress={onBack} />
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
    paddingBottom: 25,
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

  label: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
});