import {TouchableOpacity, Text , StyleSheet} from "react-native";
export default function NextButton({title="Suivant" , onPress, disabled = false}){
    return (
        <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled}
        >
            <Text
              style={[
                styles.text,
                disabled && styles.disabledText,
              ]}
            >
              {title}
            </Text>
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

  disabledButton: {
    backgroundColor: "#C9C9C9",
  },

  disabledText: {
    color: "#666",
  },
});
