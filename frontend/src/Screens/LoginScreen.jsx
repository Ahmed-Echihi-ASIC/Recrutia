import { Image, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginScreenValidation from "../Validation/LoginScreenValidation";

import Separator from "../Componants/Separator";
import GoogleButton from "../Componants/GoogleButton";
import CustomInput from "../Componants/CustomInput";
import HeaderMenu from "../Componants/HeaderMenu";
import { ScrollView } from "react-native";
export default function LoginScreen() {
    const [errors, setErrors] = useState({});
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();
    //fonction de validation LoginScreen
    const handleLogin = () => {
    const validationErrors = LoginScreenValidation(email, password);

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
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
        onPress={()=>{}}
    >
        Mot de passe oublie ?
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