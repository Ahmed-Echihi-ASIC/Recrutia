import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";

import HomeScreen from "../Screens/HomeScreen";
import FavoriteScreen from "../Screens/FavoriteScreen";
import ProfileScreen from "../Screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors, t } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ],
        tabBarActiveTintColor: "darkorange",
        tabBarInactiveTintColor: colors.subText,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("home"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          tabBarLabel: t("favorites"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("profile"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
