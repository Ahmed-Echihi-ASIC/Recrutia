import { View, StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import SelectData from "../Data/SelectData";


import CustomSelect from "../Componants/CustomSelect";
import CustomInput from "../Componants/CustomInput";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import HeaderMenu from "../Componants/HeaderMenu";
import { StatusBar } from "react-native";
import DateOfBirthPicker from "../Componants/DateOfBirthPicker";
import RegisterStepInfosValidation from "../Validation/RegisterStepInfosValidation";
export default function RegisterStepInfos({
  form,
  setForm,
  onNext,
  onBack,
}) {
    const [errors, setErrors] = useState({});
    const handleNext = () => {
    
    const validationErrors =RegisterStepInfosValidation(form);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
    <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
    >
    <StatusBar
        barStyle="dark-content"
        
            />
        <HeaderMenu
        onMenu={() => console.log("Menu")}
    />
        <Text style={styles.title}>Inscription</Text>

        <CustomSelect
  label="Diplôme"
  value={form.diplome}
  onValueChange={(value) =>
    setForm({ ...form, diplome: value })
  }
  icon="school-outline"
  items={SelectData.diplomes}
  
/>
        {errors.diplome && (
            <Text style={styles.error}>
            {errors.diplome}
            </Text>
                )}

        <View style={styles.row}>
          <View style={styles.half}>
            <CustomInput
              label="Nom"
              value={form.nom}
              onChangeText={(text) =>
                setForm({ ...form, nom: text })
              }
              icon="person-outline"
            />
            {errors.nom && (
            <Text style={styles.error}>
            {errors.nom}
            </Text>
                )}
          </View>

          <View style={styles.half}>
            <CustomInput
              label="Prénom"
              value={form.prenom}
              onChangeText={(text) =>
                setForm({ ...form, prenom: text })
              }
              icon="person-outline"
            />
            {errors.prenom && (
            <Text style={styles.error}>
            {errors.prenom}
            </Text>
                )}
          </View>
        </View>

        

<DateOfBirthPicker
    label="Date de naissance"
    value={form.dateNaissance}
    onChange={(date) =>
        setForm({
            ...form,
            dateNaissance: date,
        })
    }
/>

{errors.dateNaissance && (
    <Text style={styles.error}>
        {errors.dateNaissance}
    </Text>
)}

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
        {errors.region && (
            <Text style={styles.error}>
            {errors.region}
            </Text>
                )}


<CustomSelect
  label="Ville"
  value={form.ville}
  onValueChange={(value) =>
    setForm({
      ...form,
      ville: value,
    })
  }
  icon="business-outline"
  items={(SelectData.villes[form.region] || []).map((ville) => ({
    label: ville,
    value: ville,
  }))}
/>

{errors.ville && (
            <Text style={styles.error}>
            {errors.ville}
            </Text>
                )}

        <CustomInput
          label="Téléphone"
          value={form.telephone}
          onChangeText={(text) =>
            setForm({ ...form, telephone: text })
          }
          icon="call-outline"
          keyboardType="phone-pad"
        />
        {errors.telephone && (
            <Text style={styles.error}>
            {errors.telephone}
            </Text>
                )}

        <CustomInput
          label="Email"
          value={form.email}
          onChangeText={(text) =>
            setForm({ ...form, email: text })
          }
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
          value={form.password}
          onChangeText={(text) =>
            setForm({ ...form, password: text })
          }
          icon="lock-closed-outline"
          secureTextEntry
        />
        {errors.password && (
            <Text style={styles.error}>
            {errors.password}
            </Text>
                )}

        <CustomInput
          label="Confirmer le mot de passe"
          value={form.confirmPassword}
          onChangeText={(text) =>
            setForm({
              ...form,
              confirmPassword: text,
            })
          }
          icon="lock-closed-outline"
          secureTextEntry
        />
        {errors.confirmPassword && (
            <Text style={styles.error}>
            {errors.confirmPassword}
            </Text>
                )}

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

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 10,
},

  row: {
    flexDirection: "row",
  },

  half: {
    width: "50%",
  },
});