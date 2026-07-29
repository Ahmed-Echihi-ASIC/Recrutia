import { useState } from "react";
import { StyleSheet, View , Text } from "react-native";

import RegisterStepInfos from "../Register/RegisterStepInfos";
import RegisterStepParcours from "../Register/RegisterStepParcours";
import RegisterStepConfirm from "../Register/RegisterStepConfirm";
import RegisterStepIdentification from "../Register/RegisterStepIdentification";
import { useNavigation } from "@react-navigation/native";
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
});
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
        <RegisterStepConfirm
        form={form}
        setForm={setForm}
        onBack={() => setStep(2)}
        onNext={() =>setStep(4)}
        
        />
    )}

    {step === 4 && (
        <RegisterStepIdentification
        form={form}
        setForm={setForm}
        onBack={() => setStep(3)
        }
        
        />


    )

    }
    

    </View>
);
}

