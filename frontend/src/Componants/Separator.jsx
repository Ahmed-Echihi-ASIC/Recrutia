import { View, Text, StyleSheet } from "react-native";

export default function Separator() {
    return (
        <View style={styles.container}>
            <View style={styles.line} />

            <Text style={styles.text}>OU</Text>

            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        marginHorizontal: 20,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#D9D9D9",
    },

    text: {
        marginHorizontal: 10,
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
    },
});