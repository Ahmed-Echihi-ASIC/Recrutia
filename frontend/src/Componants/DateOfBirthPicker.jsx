import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

export default function DateOfBirthPicker({
  label,
  value,
  onChange,
}) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const animation = useRef(
    new Animated.Value(value ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const getDateObject = (date) => {
    if (!date) return new Date(2000, 0, 1);
    if (date instanceof Date) return date;
    return new Date(date);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = getDateObject(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR");
  };

  const handleChange = (event, selectedDate) => {
    setShowPicker(false);
    setIsFocused(false);

    if (selectedDate) {
      const date = selectedDate.toISOString().split("T")[0];
      onChange(date);
    }
  };

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

  if (Platform.OS === "web") {
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

        <Ionicons
          name="calendar-outline"
          size={20}
          color={isFocused ? colors.primary || "darkorange" : colors.subText || "#777"}
        />

        <input
          type="date"
          value={
            value
              ? getDateObject(value).toISOString().split("T")[0]
              : ""
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            marginLeft: 10,
            borderWidth: 0,
            outlineStyle: "none",
            fontSize: 15,
            backgroundColor: "transparent",
            color: colors.inputText || colors.text || "#1F2937",
          }}
        />
      </View>
    );
  }

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

      <Ionicons
        name="calendar-outline"
        size={20}
        color={isFocused ? colors.primary || "darkorange" : colors.subText || "#777"}
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => {
          setIsFocused(true);
          setShowPicker(true);
        }}
      >
        <Text
          style={[
            styles.dateText,
            { color: value ? colors.inputText || colors.text : colors.placeholder || "#9CA3AF" },
          ]}
        >
          {value ? formatDate(value) : "Sélectionner une date"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={getDateObject(value)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleChange}
        />
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

  dateButton: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },

  dateText: {
    fontSize: 15,
  },
});