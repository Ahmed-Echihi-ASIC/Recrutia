import {TouchableOpacity, Text , StyleSheet} from "react-native";
export default function NextButton({title="Suivant" , onPress}){
    return (
        <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: "darkorange",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal:20
  },

  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});