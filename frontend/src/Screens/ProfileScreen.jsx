import { SafeAreaView } from "react-native-safe-area-context";
import {
View,
Text,
StyleSheet,
Image,
TouchableOpacity,
ScrollView
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../Componants/BottomNavigation";

export default function ProfileScreen(){

return(

<SafeAreaView style={styles.container}>

<ScrollView
showsVerticalScrollIndicator={false}
>

<View style={styles.header}>

<Image
source={require("../../assets/image.jpeg")}
style={styles.image}
/>

<Text style={styles.name}>
Ahmed Echihi
</Text>

<Text style={styles.email}>
ahmed@gmail.com
</Text>

</View>

<View style={styles.card}>

<Item
icon="call-outline"
title="Téléphone"
value="+235 66 00 00 00"
/>

<Item
icon="school-outline"
title="Niveau d'étude"
value="Ingénieur"
/>

<Item
icon="briefcase-outline"
title="Expérience"
value="2 ans"
/>

<Item
icon="location-outline"
title="Ville"
value="N'Djamena"
/>

</View>

<MenuButton
icon="create-outline"
title="Modifier le profil"
/>

<MenuButton
icon="document-text-outline"
title="Mon CV"
/>

<MenuButton
icon="heart-outline"
title="Mes favoris"
/>

<MenuButton
icon="reader-outline"
title="Mes candidatures"
/>

<MenuButton
icon="settings-outline"
title="Paramètres"
/>

<MenuButton
icon="log-out-outline"
title="Déconnexion"
/>


</ScrollView>
<BottomNavigation/>


</SafeAreaView>

);

}

function Item({icon,title,value}){

return(

<View style={styles.item}>

<Ionicons
name={icon}
size={24}
color="darkorange"
/>

<View style={{marginLeft:15}}>

<Text style={styles.itemTitle}>
{title}
</Text>

<Text style={styles.itemValue}>
{value}
</Text>

</View>

</View>

);

}

function MenuButton({icon,title}){

return(

<TouchableOpacity style={styles.button}>

<Ionicons
name={icon}
size={24}
color="darkorange"
/>

<Text style={styles.buttonText}>
{title}
</Text>

</TouchableOpacity>


);

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F8F8F8"
},

header:{
backgroundColor:"darkorange",
alignItems:"center",
paddingVertical:35,
borderBottomLeftRadius:30,
borderBottomRightRadius:30
},

image:{
width:120,
height:120,
borderRadius:60,
backgroundColor:"#fff"
},

name:{
fontSize:24,
fontWeight:"bold",
color:"#fff",
marginTop:15
},

email:{
fontSize:16,
color:"#fff",
marginTop:5
},

card:{
backgroundColor:"#fff",
margin:20,
borderRadius:15,
padding:20,
elevation:3
},

item:{
flexDirection:"row",
alignItems:"center",
marginBottom:20
},

itemTitle:{
fontWeight:"bold",
fontSize:16
},

itemValue:{
color:"#666",
marginTop:3
},

button:{
backgroundColor:"#fff",
marginHorizontal:20,
marginBottom:15,
padding:18,
borderRadius:15,
flexDirection:"row",
alignItems:"center",
elevation:2
},

buttonText:{
fontSize:17,
marginLeft:15
}

});