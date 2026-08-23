import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";

const { width } = Dimensions.get("window");
const SPLASH_IMAGE = require("../../assets/splash.png");

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const { user, loading: authLoading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Bouncing dots animation values
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation (Logo scale & fade)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Spinner rotation animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 4. Staggered bouncing dots wave animation
    const createDotAnimation = (anim, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -8,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    createDotAnimation(dot1Anim, 0).start();
    createDotAnimation(dot2Anim, 160).start();
    createDotAnimation(dot3Anim, 320).start();
  }, []);

  useEffect(() => {
    // Navigate after a minimum display time of 2.2 seconds & auth state loaded
    const timer = setTimeout(() => {
      if (!authLoading) {
        // Smooth exit animation before navigation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace(user ? "Home" : "Login");
        });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [authLoading, user]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background || "#121212" },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Container with Rotating Loader Accent Ring */}
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[
              styles.spinRing,
              {
                borderColor: colors.primary || "darkorange",
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <Image
            source={SPLASH_IMAGE}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline / Subtitle */}
        <Text style={[styles.appName, { color: colors.text }]}>Recrutia</Text>
        <Text style={[styles.tagline, { color: colors.subText }]}>
          Trouvez votre prochaine opportunité
        </Text>

        {/* Bouncing Dots Wave Loading Indicator */}
        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary || "darkorange",
                transform: [{ translateY: dot1Anim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary || "darkorange",
                transform: [{ translateY: dot2Anim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary || "darkorange",
                transform: [{ translateY: dot3Anim }],
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Footer Branding */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={[styles.footerText, { color: colors.subText }]}>
          © Recrutia • Plateforme de Recrutement
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  logoWrapper: {
    position: "relative",
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  spinRing: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    borderStyle: "dashed",
    opacity: 0.6,
  },

  logo: {
    width: 135,
    height: 135,
    borderRadius: 24,
  },

  appName: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: "center",
  },

  tagline: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 36,
  },

  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 24,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.4,
    opacity: 0.8,
  },
});
