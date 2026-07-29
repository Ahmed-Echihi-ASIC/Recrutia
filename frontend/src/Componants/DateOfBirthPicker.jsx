import { useRef, useState, useEffect } from "react";
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

export default function DateOfBirthPicker({
  label,
  value,
  onChange,
}) {
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

  const handleChange = (event, selectedDate) => {
    setShowPicker(false);
    setIsFocused(false);

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("fr-FR");
  };

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

  if (Platform.OS === "web") {
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
          name="calendar-outline"
          size={22}
          color={isFocused ? "darkorange" : "#777"}
        />

        <input
          type="date"
          value={
            value
              ? value.toISOString().split("T")[0]
              : ""
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) =>
            onChange(new Date(e.target.value))
          }
          style={styles.webInput}
        />
      </View>
    );
  }

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
        name="calendar-outline"
        size={22}
        color={isFocused ? "darkorange" : "#777"}
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
            !value && { color: "#999" },
          ]}
        >
          {value
            ? formatDate(value)
            : "Sélectionner une date"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date(2000, 0, 1)}
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

  dateButton: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },

  dateText: {
    fontSize: 15,
    color: "#000",
  },

  webInput: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 0,
    outlineStyle: "none",
    fontSize: 15,
    backgroundColor: "transparent",
  },
});