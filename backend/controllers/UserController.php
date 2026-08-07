<?php

require_once "../config/Database.php";
require_once "../config/Mailer.php";
require_once "../models/User.php";

class UserController
{
    private $user;
    private $mailer;

    public function __construct()
    {
        $database = new Database();
        $db = $database->connect();
        $this->user = new User($db);
        $this->mailer = new Mailer();
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
    // MOT DE PASSE OUBLIE
    // ==========================
    public function forgotPassword()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode([
                "success" => false,
                "message" => "Aucune donnée reçue."
            ]);
            return;
        }

        $email = trim($data["email"] ?? "");

        if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                "success" => false,
                "message" => "Adresse email invalide."
            ]);
            return;
        }

        try {
            $reset = $this->user->createPasswordResetToken($email);

            $emailSent = false;

            if ($reset) {
                $emailSent = $this->mailer->sendPasswordReset(
                    $email,
                    $reset["token"]
                );

                error_log(
                    "RESET PASSWORD TOKEN for " .
                    $email .
                    " : " .
                    $reset["token"] .
                    " (expires at " .
                    $reset["expires_at"] .
                    ")"
                );
            }

            $response = [
                "success" => true,
                "message" => $emailSent
                    ? "Code de réinitialisation envoyé par email."
                    : "Email non configuré sur le serveur. Code affiché en mode test."
            ];

            if ($reset && !$emailSent) {
                $response["dev_token"] = $reset["token"];
            }

            echo json_encode($response);

        } catch (Exception $e) {
            error_log(
                "Erreur forgotPassword: " .
                $e->getMessage()
            );

            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la demande de réinitialisation."
            ]);
        }
    }

    public function resetPassword()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode([
                "success" => false,
                "message" => "Aucune donnée reçue."
            ]);
            return;
        }

        $email = trim($data["email"] ?? "");
        $token = trim($data["token"] ?? "");
        $newPassword = $data["mot_de_passe"] ?? $data["password"] ?? "";

        if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                "success" => false,
                "message" => "Adresse email invalide."
            ]);
            return;
        }

        if ($token === "") {
            echo json_encode([
                "success" => false,
                "message" => "Jeton de réinitialisation manquant."
            ]);
            return;
        }

        if (strlen($newPassword) < 8) {
            echo json_encode([
                "success" => false,
                "message" => "Le mot de passe doit contenir au moins 8 caractères."
            ]);
            return;
        }

        try {
            $updated = $this->user->resetPasswordWithToken(
                $email,
                $token,
                $newPassword
            );

            if (!$updated) {
                echo json_encode([
                    "success" => false,
                    "message" => "Lien de réinitialisation invalide ou expiré."
                ]);
                return;
            }

            echo json_encode([
                "success" => true,
                "message" => "Mot de passe réinitialisé avec succès."
            ]);

        } catch (Exception $e) {
            error_log(
                "Erreur resetPassword: " .
                $e->getMessage()
            );

            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la réinitialisation du mot de passe."
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

        if ($this->user->emailExists($data["email"])) {
            echo json_encode([
                "success" => false,
                "message" => "Cet email existe déjà."
            ]);
            return;
        }

        // ==========================
        // UPLOAD
        // ==========================

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

        // ==========================
        // INSERTION
        // ==========================

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
    public function updateProfile()
    {
        header("Content-Type: application/json");

        /*
         * IMPORTANT :
         * Pour modifier les fichiers, le frontend doit envoyer
         * FormData et non JSON.
         *
         * Les champs texte arrivent dans $_POST
         * Les fichiers arrivent dans $_FILES
         */

        $data = $_POST;

        error_log("=== UPDATE PROFILE : POST ===");
        error_log(print_r($data, true));

        error_log("=== UPDATE PROFILE : FILES ===");
        error_log(print_r($_FILES, true));

        // ==========================
        // Vérifier ID
        // ==========================

        if (empty($data["id"])) {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur non identifié."
            ]);
            return;
        }

        $id = $data["id"];

        if (
            empty(trim($data["nom"] ?? "")) ||
            empty(trim($data["prenom"] ?? "")) ||
            empty(trim($data["email"] ?? "")) ||
            empty(trim($data["telephone"] ?? ""))
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Nom, prénom, email et téléphone sont obligatoires."
            ]);
            return;
        }

        if ($this->user->emailExistsForOtherUser($data["email"], $id)) {
            echo json_encode([
                "success" => false,
                "message" => "Cet email est déjà utilisé par un autre compte."
            ]);
            return;
        }

        // ==========================
        // FICHIERS
        // ==========================

        /*
         * On ne remplace le fichier que si
         * l'utilisateur en sélectionne un nouveau.
         */

        if (isset($_FILES["photo"])) {

            $photo = $this->uploadFile(
                "photo",
                "uploads/photos"
            );

            if ($photo !== "") {
                $data["photo"] = $photo;
            }
        }

        if (isset($_FILES["cv"])) {

            $cv = $this->uploadFile(
                "cv",
                "uploads/cv"
            );

            if ($cv !== "") {
                $data["cv"] = $cv;
            }
        }

        if (isset($_FILES["piece_identite"])) {

            $piece = $this->uploadFile(
                "piece_identite",
                "uploads/piece_identite"
            );

            if ($piece !== "") {
                $data["fichier_piece_identite"] = $piece;
            }
        }

        if (isset($_FILES["certificat_nni"])) {

            $certificat = $this->uploadFile(
                "certificat_nni",
                "uploads/certificat_nni"
            );

            if ($certificat !== "") {
                $data["certificat_nni"] = $certificat;
            }
        }

        // ==========================
        // UPDATE DATABASE
        // ==========================

        $result = $this->user->updateProfile(
            $id,
            $data
        );

        if ($result) {
            $updatedUser = $this->user->findById($id);

            if (!$updatedUser) {
                echo json_encode([
                    "success" => false,
                    "message" => "Profil mis à jour, mais impossible de relire l'utilisateur."
                ]);
                return;
            }

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
    // UPLOAD FICHIER
    // ==========================
    private function uploadFile($field, $folder)
    {
        if (!isset($_FILES[$field])) {

            error_log(
                "uploadFile : champ '$field' absent"
            );

            return "";
        }

        if ($_FILES[$field]["error"] !== UPLOAD_ERR_OK) {

            error_log(
                "uploadFile : erreur '$field' code = " .
                $_FILES[$field]["error"]
            );

            return "";
        }

        if (
            !isset($_FILES[$field]["tmp_name"]) ||
            !is_uploaded_file($_FILES[$field]["tmp_name"])
        ) {
            error_log(
                "uploadFile : fichier temporaire invalide pour '$field'"
            );

            return "";
        }

        // ==========================
        // Créer dossier
        // ==========================

        $relativeFolder = trim(
            str_replace("\\", "/", $folder),
            "/"
        );

        $basePublicPath = realpath(__DIR__ . "/../public");

        if (!$basePublicPath) {
            error_log("uploadFile : dossier public introuvable");
            return "";
        }

        $absoluteFolder =
            $basePublicPath .
            DIRECTORY_SEPARATOR .
            str_replace("/", DIRECTORY_SEPARATOR, $relativeFolder);

        if (!is_dir($absoluteFolder)) {

            mkdir(
                $absoluteFolder,
                0777,
                true
            );
        }

        // ==========================
        // Extension
        // ==========================

        $extension = strtolower(
            pathinfo(
                $_FILES[$field]["name"],
                PATHINFO_EXTENSION
            )
        );

        if ($extension === "") {
            $extension = $this->extensionFromMimeType(
                $_FILES[$field]["type"] ?? ""
            );
        }

        if ($extension === "") {
            error_log(
                "uploadFile : extension inconnue pour '$field'"
            );

            return "";
        }

        // ==========================
        // Nom unique
        // ==========================

        $filename =
            uniqid() .
            "_" .
            time() .
            "." .
            $extension;

        $absoluteDestination =
            $absoluteFolder .
            DIRECTORY_SEPARATOR .
            $filename;

        $relativeDestination =
            $relativeFolder .
            "/" .
            $filename;

        // ==========================
        // Déplacer fichier
        // ==========================

        if (
            move_uploaded_file(
                $_FILES[$field]["tmp_name"],
                $absoluteDestination
            )
        ) {

            error_log(
                "Fichier '$field' enregistré : " .
                $relativeDestination
            );

            return $relativeDestination;
        }

        error_log(
            "uploadFile : move_uploaded_file a échoué pour '$field'"
        );

        return "";
    }

    private function extensionFromMimeType($mimeType)
    {
        $extensions = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif",
            "application/pdf" => "pdf",
        ];

        return $extensions[$mimeType] ?? "";
    }
}
