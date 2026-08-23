import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "./src/Context/AuthContext";
import { ThemeProvider } from "./src/Context/ThemeContext";

import SplashScreen from "./src/Screens/SplashScreen";
import LoginScreen from "./src/Screens/LoginScreen";
import RegisterScreen from "./src/Screens/RegisterScreen";
import HomeScreen from "./src/Screens/HomeScreen";
import ProfileScreen from "./src/Screens/ProfileScreen";
import EditProfileScreen from "./src/Screens/EditProfileScreen";
import ChangePasswordScreen from "./src/Screens/ChangePasswordScreen";
import OffreDetailScreen from "./src/Screens/OffreDetailScreen";
import FavoriteScreen from "./src/Screens/FavoriteScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="OffreDetail" component={OffreDetailScreen} />
              <Stack.Screen name="Favorite" component={FavoriteScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}