import { View, TextInput, Button ,TouchableOpacity ,StyleSheet, Text} from "react-native";
import NextButton from "../Componants/NextButton";
import BackButton from "../Componants/BackButton";
import { ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../Componants/CustomInput";
import FilePickerButton from "../Componants/FilePickerButton";
import HeaderMenu from "../Componants/HeaderMenu";
import { useState } from "react";
import RegisterStepParcoursValidation from "../Validation/RegisterStepParcoursValidation";
import CustomSelect from "../Componants/CustomSelect";
import SearchableSelect from "../Componants/SearchableSelect";

import SelectData from "../Data/SelectData";


export default function RegisterStepParcours({

    form,
    setForm,
    onNext,
    onBack

}){
    const [errors, setErrors] = useState({});

    const handleNext = () => {
    const validationErrors =
        RegisterStepParcoursValidation(form);

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    onNext();
    };

    return(

        <SafeAreaView
        style={styles.container}  edges={["top"]}>
            <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>
        

        <StatusBar
        barStyle="dark-content"
        
    />

        <HeaderMenu
        onMenu={() => console.log("Menu")}
            />
        
            <Text style={styles.title}>Inscription</Text>

            <CustomSelect
            label="Nombre de diplôme"
            value={form.nombreDiplome}
            onValueChange={(value)=>
                setForm({...form,nombreDiplome:value})
            }
            icon="school-outline"
                items={SelectData.nombreDiplomes}
            />
            {errors.nombreDiplome && (
            <Text style={styles.error}>
            {errors.SelectData.nombreDiplomes}
            </Text>
            )}

            <CustomSelect
            label="Niveau d'étude"
            value={form.NiveauEtude}
            onValueChange={(value) =>
                setForm({ ...form, NiveauEtude: value })
            }
            items={SelectData.niveau_etudes}
            />
            
            {errors.NiveauEtude && (
            <Text style={styles.error}>
            {errors.NiveauEtude}
            </Text>
            )}

            <SearchableSelect
    label="Spécialité"
    data={SelectData.specialite}
    value={form.specialite}
    icon="construct-outline"
    onSelect={(value) =>
        setForm({ ...form, specialite: value })
    }
/>
            {errors.specialite && (
            <Text style={styles.error}>
            {errors.specialite}
            </Text>
            )}

            <CustomSelect
            label="Condition physique"
            value={form.ConditionPhysique}
            onValueChange={(value) =>
            setForm({ ...form, ConditionPhysique: value })
            }
            icon="fitness-outline"
            items={SelectData.condition_physique}
            
            />
            {errors.ConditionPhysique && (
            <Text style={styles.error}>
            {errors.ConditionPhysique}
            </Text>
            )}

            <CustomSelect
  label="Nombre d'expériences professionnelles"
  value={form.NbrExperience}
  onValueChange={(value) =>
    setForm({ ...form, NbrExperience: value })
  }
  icon="briefcase-outline"
  items={SelectData.nombre_experience}
/>
            {errors.NbrExperience && (
            <Text style={styles.error}>
            {errors.NbrExperience}
            </Text>
            )}

            <CustomSelect
  label="Durée d'expérience professionnelle"
  value={form.DureeExperience}
  onValueChange={(value) =>
    setForm({ ...form, DureeExperience: value })
  }
  icon="time-outline"
  items={SelectData.duree_experience}
/>
            {errors.DureeExperience && (
            <Text style={styles.error}>
            {errors.DureeExperience}
            </Text>
            )}

            <Text style={styles.label}>Importer CV</Text>

                <FilePickerButton
                title="Choisir un fichier"
                icon="cloud-upload-outline"
                onPress={() => {}}
                />

            <Text style={styles.label}>Importer photo</Text>

                <FilePickerButton
                title="Choisir un fichier"
                icon="camera-outline"
                onPress={() => {}}
                />


            
            

            
            <NextButton
            onPress={handleNext}
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
},
content: {
    paddingBottom: 25,
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

label: {
  marginHorizontal: 20,
  marginBottom: 8,
  fontSize: 15,
  fontWeight: "600",
  color: "#555",
},
});