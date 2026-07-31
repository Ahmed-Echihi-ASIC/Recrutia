import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";

import HeaderHome from "../Componants/HeaderHome";
import SearchBar from "../Componants/SearchBar";
import CategoryCard from "../Componants/CategoryCard";
import JobCard from "../Componants/JobCard";
import BottomNavigation from "../Componants/BottomNavigation";

import categories from "../Data/categories";
import jobs from "../Data/jobs";

export default function HomeScreen() {

    return (

        <SafeAreaView style={styles.container}>

            <HeaderHome/>

            <SearchBar/>

            <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            >

                <CategoryCard data={categories}/>

                <JobCard jobs={jobs}/>

            </ScrollView>

            <BottomNavigation/>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

container:{
    flex:1,
    backgroundColor:"#fff"
},

content:{
    paddingBottom:120
}

});