import {FlatList,TouchableOpacity,Text,StyleSheet} from "react-native";

export default function CategoryCard({data}){

    return(

        <FlatList

        horizontal

        showsHorizontalScrollIndicator={false}

        data={data}

        keyExtractor={(item)=>item.id.toString()}

        renderItem={({item})=>(

            <TouchableOpacity style={styles.card}>

                <Text style={styles.text}>
                    {item.title}
                </Text>

            </TouchableOpacity>

        )}

        />

    );

}

const styles=StyleSheet.create({

card:{
    backgroundColor:"#F5F5F5",
    paddingHorizontal:20,
    paddingVertical:12,
    borderRadius:30,
    marginHorizontal:8,
    marginBottom:20
},

text:{
    fontWeight:"600"
}

});