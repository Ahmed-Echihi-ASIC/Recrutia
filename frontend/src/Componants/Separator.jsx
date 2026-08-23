import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../Context/ThemeContext";

export default function Separator() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.text, { color: colors.subText }]}>OU</Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
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
  },

  text: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: "700",
  },
});