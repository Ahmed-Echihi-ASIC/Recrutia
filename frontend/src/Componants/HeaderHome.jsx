import {View,Text,StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default function HeaderHome(){

    return(

        <View style={styles.container}>

            <View>

                <Text style={styles.hello}>
                    Bonjour
                </Text>

                <Text style={styles.name}>
                    Bienvenue sur Recrutia
                </Text>

            </View>

            <Ionicons
            name="notifications-outline"
            size={28}
            />

        </View>

    );

}

const styles=StyleSheet.create({

container:{
    padding:20,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
},

hello:{
    fontSize:16,
    color:"#666"
},

name:{
    fontSize:23,
    fontWeight:"bold"
}

});