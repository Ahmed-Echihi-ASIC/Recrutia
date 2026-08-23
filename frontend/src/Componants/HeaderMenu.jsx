import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../Context/ThemeContext";

export default function HeaderMenu({
  onMenu,
  showBack = false,
  onBack,
  title,
  showLogo = true,
  onNotification,
  showNotification = true,
  unreadCount = 0,
  rightComponent,
  transparent = true,
  style,
}) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        transparent
          ? {
              backgroundColor: "transparent",
              borderBottomColor: "transparent",
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            }
          : {
              backgroundColor: colors.card || "#FFFFFF",
              borderBottomColor: colors.border || "#F3F4F6",
            },
        style,
      ]}
    >
      {/* Left Action (Back Arrow or Hamburger Menu) */}
      <View style={styles.leftGroup}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={colors.iconColor || "darkorange"}
            />
          </TouchableOpacity>
        ) : onMenu ? (
          <TouchableOpacity
            onPress={onMenu}
            style={styles.iconBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="darkorange"
            />
          </TouchableOpacity>
        ) : null}

        {/* Center Content: Title or Logo */}
        {title ? (
          <Text
            style={[styles.headerTitle, { color: colors.text || "#111827" }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : showLogo ? (
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : null}
      </View>

      {/* Right Action: Notifications or Custom Component */}
      <View style={styles.rightGroup}>
        {rightComponent ? (
          rightComponent
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.bellWrapper}
            onPress={onNotification ? onNotification : () => {}}
            activeOpacity={0.7}
            disabled={!onNotification}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color={colors.iconColor || "#374151"}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBtn: {
    padding: 4,
    marginRight: 8,
  },

  logo: {
    width: 100,
    height: 38,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 6,
  },

  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  bellWrapper: {
    position: "relative",
    padding: 6,
  },

  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#DC2626",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});