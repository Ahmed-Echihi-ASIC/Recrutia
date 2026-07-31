import {View,Text,StyleSheet} from "react-native";

export default function JobCard({jobs}){

    return(

        <View>

            {

                jobs.map(job=>(

                    <View
                    key={job.id}
                    style={styles.card}
                    >

                        <Text style={styles.title}>
                            {job.title}
                        </Text>

                        <Text>
                            {job.company}
                        </Text>

                        <Text>
                            {job.city}
                        </Text>

                        <Text style={styles.type}>
                            {job.type}
                        </Text>

                    </View>

                ))

            }

        </View>

    );

}

const styles=StyleSheet.create({

card:{
    backgroundColor:"#fff",
    marginHorizontal:20,
    marginBottom:15,
    borderRadius:15,
    padding:20,
    elevation:2
},

title:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:8
},

type:{
    color:"darkorange",
    marginTop:10,
    fontWeight:"bold"
}

});