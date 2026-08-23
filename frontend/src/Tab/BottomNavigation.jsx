import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../Context/ThemeContext";

/**
 * Composant de navigation inférieure (Bottom Navigation Bar)
 * Situé dans src/Tab/BottomNavigation.jsx pour assurer modularité et fiabilité.
 */
export default function BottomNavigation() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { colors, t } = useTheme();

  const tabs = [
    {
      name: "Home",
      label: t("home"),
      activeIcon: "home",
      inactiveIcon: "home-outline",
    },
    {
      name: "Favorite",
      label: t("favorites"),
      activeIcon: "bookmark",
      inactiveIcon: "bookmark-outline",
    },
    {
      name: "Profile",
      label: t("profile"),
      activeIcon: "person",
      inactiveIcon: "person-outline",
    },
  ];

  const paddingBottom = Math.max(insets.bottom, 6);
  const containerHeight = 58 + paddingBottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          height: containerHeight,
          paddingBottom: paddingBottom,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = route.name === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.name);
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.inactiveIcon}
              size={24}
              color={isActive ? "darkorange" : colors.subText}
            />
            <Text
              style={[
                styles.navText,
                { color: isActive ? "darkorange" : colors.subText },
                isActive && styles.activeNavText,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  navText: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
  },
  activeNavText: {
    fontWeight: "700",
  },
});
