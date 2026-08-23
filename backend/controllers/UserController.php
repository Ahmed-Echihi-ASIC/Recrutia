<?php

require_once "../config/Database.php";
require_once "../models/User.php";

class UserController
{
    private $user;

    public function __construct()
    {
        $database = new Database();
        $db = $database->connect();
        $this->user = new User($db);
    }

    // ==========================
    // LOGIN
    // ==========================
    public function login()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode([
                "success" => false,
                "message" => "Aucune donnée reçue"
            ]);
            return;
        }

        $email = $data["email"] ?? "";
        $mot_de_passe = $data["mot_de_passe"] ?? $data["password"] ?? "";

        $result = $this->user->login($email, $mot_de_passe);

        if ($result) {
            echo json_encode([
                "success" => true,
                "user" => $result
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Email ou mot de passe incorrect"
            ]);
        }
    }

    // ==========================
    // INSCRIPTION
    // ==========================
    public function register()
    {
        header("Content-Type: application/json");

        $data = $_POST;

        // Debug : voir exactement ce qui arrive côté serveur
        error_log("=== REGISTER : POST reçu ===");
        error_log(print_r($data, true));
        error_log("=== REGISTER : FILES reçus ===");
        error_log(print_r($_FILES, true));

        if (empty($data)) {
            echo json_encode([
                "success" => false,
                "message" => "Aucune donnée reçue."
            ]);
            return;
        }

        // Vérification des champs obligatoires
        if (
            empty($data["nom"]) ||
            empty($data["prenom"]) ||
            empty($data["email"]) ||
            empty($data["mot_de_passe"])
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Les champs obligatoires sont manquants."
            ]);
            return;
        }

        // Vérifier si l'email existe déjà
        if ($this->user->emailExists($data["email"])) {
            echo json_encode([
                "success" => false,
                "message" => "Cet email existe déjà."
            ]);
            return;
        }

        // ==========================
        // Upload des fichiers
        // ==========================

        // IMPORTANT : chemins relatifs SANS "../" car le serveur PHP
        // (php -S ... depuis public/) sert uniquement le contenu de
        // public/. Si on écrit dans "../uploads" (= backend/uploads),
        // les fichiers existent bien sur le disque mais sont
        // inaccessibles via une URL http://IP:8000/uploads/...
        // On enregistre donc directement dans public/uploads/...
        $data["photo"] = $this->uploadFile(
            "photo",
            "uploads/photos"
        );

        $data["cv"] = $this->uploadFile(
            "cv",
            "uploads/cv"
        );

        $data["fichier_piece_identite"] = $this->uploadFile(
            "piece_identite",
            "uploads/piece_identite"
        );

        $data["certificat_nni"] = $this->uploadFile(
            "certificat_nni",
            "uploads/certificat_nni"
        );

        // Enregistrement
        if ($this->user->register($data)) {

            echo json_encode([
                "success" => true,
                "message" => "Compte créé avec succès."
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de l'inscription."
            ]);

        }
    }

    // ==========================
    // MODIFIER PROFIL
    // ==========================
    // Reçoit du multipart/form-data (comme register()) car des
    // fichiers peuvent être remplacés. Avant chaque remplacement,
    // l'ancien fichier physique est supprimé pour ne pas accumuler
    // de fichiers orphelins dans uploads/.
    // ==========================
    public function updateProfile()
    {
        header("Content-Type: application/json");

        $data = $_POST;

        error_log("=== UPDATE_PROFILE : POST reçu ===");
        error_log(print_r($data, true));
        error_log("=== UPDATE_PROFILE : FILES reçus ===");
        error_log(print_r($_FILES, true));

        if (empty($data) || empty($data["id"])) {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur non identifié."
            ]);
            return;
        }

        $id = $data["id"];

        // On récupère le user actuel pour connaître les anciens
        // chemins de fichiers (nécessaire pour la suppression et
        // pour garder l'ancien fichier si aucun nouveau n'est envoyé)
        $currentUser = $this->user->getById($id);

        if (!$currentUser) {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur introuvable."
            ]);
            return;
        }

        // Si l'email a changé, vérifier qu'il n'est pas déjà pris
        // par un AUTRE utilisateur
        if (
            isset($data["email"]) &&
            $data["email"] !== $currentUser["email"] &&
            $this->user->emailExistsForOtherUser($data["email"], $id)
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Cet email est déjà utilisé par un autre compte."
            ]);
            return;
        }

        // ==========================
        // Gestion des fichiers : remplace uniquement si un nouveau
        // fichier a été envoyé, et supprime l'ancien dans ce cas.
        // ==========================
        $data["photo"] = $this->replaceFile(
            "photo",
            "uploads/photos",
            $currentUser["photo"] ?? ""
        );

        $data["cv"] = $this->replaceFile(
            "cv",
            "uploads/cv",
            $currentUser["cv"] ?? ""
        );

        $data["fichier_piece_identite"] = $this->replaceFile(
            "piece_identite",
            "uploads/piece_identite",
            $currentUser["fichier_piece_identite"] ?? ""
        );

        $data["certificat_nni"] = $this->replaceFile(
            "certificat_nni",
            "uploads/certificat_nni",
            $currentUser["certificat_nni"] ?? ""
        );

        $result = $this->user->updateProfile($id, $data);

        if ($result) {
            // On renvoie le user à jour pour que le frontend
            // rafraîchisse son cache local (AuthContext) avec les
            // bons chemins de fichiers.
            $updatedUser = $this->user->getById($id);
            unset($updatedUser["mot_de_passe"]);

            echo json_encode([
                "success" => true,
                "message" => "Profil mis à jour avec succès.",
                "user" => $updatedUser
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la mise à jour du profil."
            ]);
        }
    }

    // ==========================
    // CHANGER LE MOT DE PASSE
    // ==========================
    public function changePassword()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !$data ||
            empty($data["id"]) ||
            empty($data["current_password"]) ||
            empty($data["new_password"])
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Champs manquants."
            ]);
            return;
        }

        $id = $data["id"];
        $currentPassword = $data["current_password"];
        $newPassword = $data["new_password"];

        $currentUser = $this->user->getById($id);

        if (!$currentUser) {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur introuvable."
            ]);
            return;
        }

        // Vérifier que le mot de passe actuel est correct
        if (!password_verify($currentPassword, $currentUser["mot_de_passe"])) {
            echo json_encode([
                "success" => false,
                "field" => "currentPassword",
                "message" => "Mot de passe actuel incorrect."
            ]);
            return;
        }

        $result = $this->user->changePassword($id, $newPassword);

        if ($result) {
            echo json_encode([
                "success" => true,
                "message" => "Mot de passe modifié avec succès."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors du changement de mot de passe."
            ]);
        }
    }

    // ==========================
    // Remplace un fichier : si un nouveau fichier est envoyé pour
    // ce champ, on supprime l'ancien du disque et on retourne le
    // nouveau chemin. Sinon, on retourne l'ancien chemin inchangé.
    // ==========================
    private function replaceFile($field, $folder, $oldPath)
    {
        // Aucun nouveau fichier envoyé -> on garde l'ancien
        if (
            !isset($_FILES[$field]) ||
            $_FILES[$field]["error"] !== UPLOAD_ERR_OK ||
            $_FILES[$field]["size"] === 0
        ) {
            return $oldPath;
        }

        // Un nouveau fichier est envoyé -> on upload le nouveau
        $newPath = $this->uploadFile($field, $folder);

        if ($newPath === "") {
            // L'upload a échoué, on garde l'ancien fichier
            return $oldPath;
        }

        // Upload réussi : on supprime l'ancien fichier physique
        // (si un chemin existait et que le fichier existe encore)
        if (!empty($oldPath) && file_exists($oldPath)) {
            if (!@unlink($oldPath)) {
                error_log(
                    "replaceFile: impossible de supprimer l'ancien fichier '$oldPath'"
                );
            } else {
                error_log("replaceFile: ancien fichier supprimé '$oldPath'");
            }
        }

        return $newPath;
    }

    // ==========================
    // Upload d'un fichier
    // ==========================
    private function uploadFile($field, $folder)
    {
        if (!isset($_FILES[$field])) {
            error_log("uploadFile: champ '$field' absent de \$_FILES");
            return "";
        }

        if ($_FILES[$field]["error"] !== UPLOAD_ERR_OK) {
            error_log(
                "uploadFile: erreur upload pour '$field' - code " .
                $_FILES[$field]["error"]
            );
            return "";
        }

        // Créer le dossier s'il n'existe pas
        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }

        $extension = pathinfo(
            $_FILES[$field]["name"],
            PATHINFO_EXTENSION
        );

        // Nom unique
        $filename = uniqid() . "_" . time() . "." . $extension;

        $destination = $folder . "/" . $filename;

        if (
            move_uploaded_file(
                $_FILES[$field]["tmp_name"],
                $destination
            )
        ) {
            // On enregistre le chemin relatif (ex: "uploads/photos/xxx.jpg")
            // tel quel, il sera directement utilisable comme URL publique :
            // http://IP:8000/uploads/photos/xxx.jpg
            return $destination;
        }

        error_log("uploadFile: move_uploaded_file a échoué pour '$field'");
        return "";
    }

    // ==========================
    // RÉCUPÉRER LE STATUT DU DOSSIER DE L'UTILISATEUR
    // Attend en GET : ?action=user_status&id=X
    // ==========================
    public function getUserStatus()
    {
        header("Content-Type: application/json");

        $id = $_GET["id"] ?? null;

        if (!$id) {
            echo json_encode([
                "success" => false,
                "message" => "Identifiant utilisateur manquant."
            ]);
            return;
        }

        $user = $this->user->getById($id);

        if (!$user) {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur introuvable."
            ]);
            return;
        }

        $rawStatut = strtolower(trim($user["statut_dossier"] ?? "en_attente"));
        $normStatut = in_array($rawStatut, ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"])
            ? "accepte"
            : (in_array($rawStatut, ["refuse", "refusee", "refuser", "refusé", "refusée", "rejected"])
                ? "refuse"
                : "en_attente");

        echo json_encode([
            "success" => true,
            "statut_dossier" => $normStatut,
            "raw_statut" => $user["statut_dossier"],
            "motif_refus" => $user["motif_refus"] ?? null
        ]);
    }

    // ==========================
    // METTRE À JOUR LE STATUT DU DOSSIER (Admin)
    // Attend en POST (JSON) : id, statut_dossier, motif_refus (optionnel)
    // ==========================
    public function updateDossierStatus()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        $id = $data["id"] ?? null;
        $statut = $data["statut_dossier"] ?? $data["statut"] ?? null;
        $motif = $data["motif_refus"] ?? null;

        if (!$id || !$statut) {
            echo json_encode([
                "success" => false,
                "message" => "Identifiant utilisateur ou statut manquant."
            ]);
            return;
        }

        $validStatuts = ["en_attente", "accepte", "refuse"];
        if (!in_array($statut, $validStatuts)) {
            echo json_encode([
                "success" => false,
                "message" => "Statut invalide. Choisir entre en_attente, accepte, ou refuse."
            ]);
            return;
        }

        $result = $this->user->updateDossierStatus($id, $statut, $motif);

        if ($result) {
            $updatedUser = $this->user->getById($id);
            unset($updatedUser["mot_de_passe"]);

            echo json_encode([
                "success" => true,
                "message" => "Statut du dossier mis à jour avec succès.",
                "user" => $updatedUser
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la mise à jour du statut du dossier."
            ]);
        }
    }
}