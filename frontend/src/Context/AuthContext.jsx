import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../Config/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem("user");

      if (data !== null) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.log("Erreur chargement utilisateur :", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      if (userData?.id && userData?.statut_dossier) {
        const raw = String(userData.statut_dossier).toLowerCase().trim();
        const normStatut = ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"].includes(raw)
          ? "accepte"
          : ["refuse", "refusee", "refuser", "refusé", "refusée", "rejected"].includes(raw)
          ? "refuse"
          : "en_attente";
        await AsyncStorage.setItem(`@last_dossier_status_${userData.id}`, normStatut);
      }

      setUser(userData);
    } catch (error) {
      console.log("Erreur login :", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.log("Erreur logout :", error);
    }
  };

  const updateUser = useCallback(async (newData) => {
    try {
      setUser((prevUser) => {
        const updatedUser = {
          ...prevUser,
          ...newData,
        };

        AsyncStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        ).catch((err) => console.log("Erreur AsyncStorage update :", err));

        return updatedUser;
      });
    } catch (error) {
      console.log("Erreur update :", error);
    }
  }, []);

  const refreshUserStatus = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const response = await fetch(
        `${SERVER_URL}/?action=user_status&id=${user.id}`
      );
      const data = await response.json();

      if (data.success && data.statut_dossier) {
        const raw = String(data.statut_dossier).toLowerCase().trim();
        const normStatut = ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"].includes(raw)
          ? "accepte"
          : ["refuse", "refusee", "refuser", "refusé", "refusée", "rejected"].includes(raw)
          ? "refuse"
          : "en_attente";

        const storageKey = `@last_dossier_status_${user.id}`;
        const lastStatus = await AsyncStorage.getItem(storageKey);

        let statusChanged = false;
        let oldStatus = lastStatus;

        if (lastStatus !== null && lastStatus !== normStatut) {
          statusChanged = true;

          const notifId = `dossier_${user.id}_${Date.now()}`;
          const dossierNotif = {
            candidature_id: notifId,
            isDossierNotif: true,
            statut: normStatut,
            date_candidature: new Date().toISOString().replace("T", " ").substring(0, 19),
            offre_titre: normStatut === "accepte"
              ? "Dossier d'inscription ACCEPTÉ"
              : normStatut === "refuse"
              ? "Dossier d'inscription REFUSÉ"
              : "Mise à jour du statut dossier",
            entreprise_nom: "Administration Recrutia",
            motif_refus: data.motif_refus || null,
          };

          try {
            const notifKey = `@dossier_notifications_${user.id}`;
            const oldStr = await AsyncStorage.getItem(notifKey);
            const oldList = oldStr ? JSON.parse(oldStr) : [];
            await AsyncStorage.setItem(notifKey, JSON.stringify([dossierNotif, ...oldList]));
          } catch (e) {
            console.log("Erreur stockage notif dossier :", e);
          }
        }

        await AsyncStorage.setItem(storageKey, normStatut);

        await updateUser({
          statut_dossier: normStatut,
          motif_refus: data.motif_refus,
        });

        return {
          status: normStatut,
          statusChanged,
          oldStatus,
          motif_refus: data.motif_refus,
        };
      }
    } catch (error) {
      console.log("Erreur rafraîchissement statut :", error);
    }
    return null;
  }, [user?.id, updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        refreshUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}