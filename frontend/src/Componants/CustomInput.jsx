import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function CustomInput({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  secureTextEntry = false,
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute",
    left: 44,
    backgroundColor: colors.inputBg || colors.card || "#FFFFFF",
    paddingHorizontal: 4,
    borderRadius: 4,
    zIndex: 10,

    top: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),

    fontSize: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 11],
    }),

    color: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.subText || "#999", colors.primary || "darkorange"],
    }),
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBg || colors.card || "#FFFFFF",
          borderColor: isFocused
            ? colors.primary || "darkorange"
            : colors.inputBorder || colors.border || "#E5E7EB",
          borderWidth: isFocused ? 2 : 1.5,
        },
      ]}
    >
      <Animated.Text style={labelStyle}>{label}</Animated.Text>

      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? colors.primary || "darkorange" : colors.subText || "#777"}
        />
      )}

      <TextInput
        style={[styles.input, { color: colors.inputText || colors.text || "#111827" }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={hidePassword}
        placeholderTextColor={colors.placeholder || "#9CA3AF"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setHidePassword(!hidePassword)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={hidePassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.subText || "#777"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    paddingVertical: 0,
  },
});