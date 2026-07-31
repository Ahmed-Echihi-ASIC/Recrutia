import {View,TextInput,StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default function SearchBar(){

    return(

        <View style={styles.container}>

            <Ionicons
            name="search-outline"
            size={22}
            color="gray"
            />

            <TextInput
            placeholder="Rechercher un emploi..."
            style={styles.input}
            />

        </View>

    );

}

const styles=StyleSheet.create({

container:{
    flexDirection:"row",
    alignItems:"center",
    marginHorizontal:20,
    borderWidth:1,
    borderColor:"#ddd",
    borderRadius:12,
    paddingHorizontal:15,
    height:55,
    marginBottom:20
},

input:{
    flex:1,
    marginLeft:10,
    fontSize:16
}

});