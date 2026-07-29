import { TouchableOpacity, Text , StyleSheet } from "react-native";
export default function BackButton({title="Retour",onPress}){
    return (
        <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        >
        <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles=StyleSheet.create({
    button:{
    borderWidth: 1.5,
    borderColor: "darkorange",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    },
    text: {
    color: "darkorange",
    fontSize: 16,
    fontWeight: "bold",
},
})