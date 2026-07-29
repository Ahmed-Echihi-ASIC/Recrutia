import {View, TextInput, Button , StyleSheet,Text ,TouchableOpacity} from "react-native";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import {  StatusBar} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import CustomInput from "../Componants/CustomInput";
import HeaderMenu from "../Componants/HeaderMenu";
import { useState } from "react";
import RegisterStepConfirmValidation from "../Validation/RegisterStepConfirmValidation";
import SelectData from "../Data/SelectData";
import CustomSelect from "../Componants/CustomSelect";
export default function RegisterStepConfirm({

    form,
    setForm,
    onNext,
    onBack

}){
    const [errors, setErrors] = useState({});
    const handleSubmit = () => {
    const validationErrors =
        RegisterStepConfirmValidation(form);

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    onNext();
    };

    return(

        <SafeAreaView style={styles.container}>
            <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
                <StatusBar />

                <HeaderMenu
                        onMenu={() => console.log("Menu")}/>
            
            <Text style={styles.title}>Inscription</Text>



            <CustomInput
            label="Lieu de naissance"
            value={form.lieuNaissance}
            onChangeText={(text) =>
                setForm({ ...form, lieuNaissance: text })
            }
                    icon="location-outline"
            />
            {errors.lieuNaissance && (
            <Text style={styles.error}>
                {errors.lieuNaissance}
            </Text>
                )}

            <CustomSelect
            label="Situation familiale"
            value={form.situationFamiliale}
            onValueChange={(value) =>
            setForm({ ...form, situationFamiliale: value })
            }
            icon="people-outline"
            items={SelectData.situation_familiale}
            />

            {errors.situationFamiliale && (
            <Text style={styles.error}>
                {errors.situationFamiliale}
            </Text>
                )}

            <CustomSelect
  label="Nombre d'enfant"
  value={form.nombreEnfant}
  onValueChange={(value) =>
    setForm({ ...form, nombreEnfant: value })
  }
  icon="people-circle-outline"
  items={SelectData.nombre_enfant}
/>
{errors.nombreEnfant && (
<Text style={styles.error}>
{errors.nombreEnfant}
</Text>
)}



<CustomInput
  label="Adresse"
  value={form.adresse}
  onChangeText={(text) =>
    setForm({ ...form, adresse: text })
  }
  icon="home-outline"
/>
{errors.adresse && (
<Text style={styles.error}>
{errors.adresse}
</Text>
)}





<CustomSelect
  label="Arrondissement / Sous-préfecture"
  value={form.arrondissement}
  onValueChange={(value) =>
    setForm({ ...form, arrondissement: value })
  }
  icon="map-outline"
  items={SelectData.arrondissement_sous_prefecture}
/>
{errors.arrondissement && (
<Text style={styles.error}>
{errors.arrondissement}
</Text>
)}

            <NextButton
                onPress={handleSubmit}
            />
            <BackButton
            onPress={onBack}
            />

        </ScrollView>
        </SafeAreaView>

    );

}
const styles = StyleSheet.create({container: {
    flex: 1,
    justifyContent:"center",
    backgroundColor: "#fff",
    
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

input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
},
content: {
    paddingBottom: 30,
},

link: {
    color: "blue",
    textAlign: "center",
    marginTop: 20,
},
button: {
        backgroundColor: "darkorange",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },

buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
},
});