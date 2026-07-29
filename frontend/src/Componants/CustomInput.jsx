import { useRef, useState, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomInput({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  secureTextEntry = false,
}) {
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
    left: 46,
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    zIndex: 10,

    top: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -8],
    }),

    fontSize: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 11],
    }),

    color: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "darkorange"],
    }),
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.focusedContainer,
      ]}
    >
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>

      <Ionicons
        name={icon}
        size={22}
        color={isFocused ? "darkorange" : "#777"}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={hidePassword}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setHidePassword(!hidePassword)}
        >
          <Ionicons
            name={
              hidePassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#777"
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

    height: 50,

    marginHorizontal: 20,
    marginBottom: 18,

    paddingHorizontal: 12,

    borderWidth: 1.5,
    borderColor: "#CFCFCF",
    borderRadius: 10,

    backgroundColor: "#FFFFFF",
  },

  focusedContainer: {
    borderColor: "darkorange",
    borderWidth: 2,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#000",
    paddingVertical: 0,
  },
});