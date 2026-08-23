<?php

class User
{
    private $conn;
    private $table = "utilisateurs";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // LOGIN
    // ==========================
    public function login($email, $mot_de_passe)
    {
        // On ne compare plus le mot de passe en clair dans le SQL :
        // on récupère l'utilisateur par email, puis on vérifie le hash en PHP.
        $sql = "SELECT * FROM utilisateurs WHERE email = :email";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return false;
        }

        if (!password_verify($mot_de_passe, $user["mot_de_passe"])) {
            return false;
        }

        // On ne renvoie jamais le hash du mot de passe au frontend
        unset($user["mot_de_passe"]);

        return $user;
    }

    // ==========================
    // Convertit '' / undefined en NULL pour éviter les erreurs
    // PostgreSQL (ex: SQLSTATE[22007] sur les colonnes DATE)
    // ==========================
    private function nullIfEmpty($value)
    {
        if (!isset($value) || $value === "" || $value === null) {
            return null;
        }
        return $value;
    }

    // ==========================
    // Vérifier si l'email existe
    // ==========================
    public function emailExists($email)
    {
        $sql = "SELECT id FROM utilisateurs WHERE email = :email";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // ==========================
    // Vérifier si l'email existe déjà pour un AUTRE utilisateur
    // (utile lors de la modification de profil, où l'utilisateur
    // garde forcément son propre email)
    // ==========================
    public function emailExistsForOtherUser($email, $id)
    {
        $sql = "SELECT id FROM utilisateurs
                WHERE email = :email AND id != :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // ==========================
    // CHANGER LE MOT DE PASSE
    // ==========================
    // Le mot de passe actuel est déjà vérifié en amont (dans le
    // contrôleur, via password_verify). Ici on se contente de
    // hasher et enregistrer le nouveau.
    // ==========================
    public function changePassword($id, $newPassword)
    {
        $sql = "UPDATE utilisateurs SET mot_de_passe = :mot_de_passe WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $hash = password_hash($newPassword, PASSWORD_BCRYPT);

        $stmt->bindParam(":mot_de_passe", $hash);
        $stmt->bindParam(":id", $id);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur changePassword: " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // Récupérer un utilisateur par son id
    // (retourne toutes les colonnes, y compris mot_de_passe —
    // à retirer par l'appelant avant de renvoyer au frontend)
    // ==========================
    public function getById($id)
    {
        $sql = "SELECT * FROM utilisateurs WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    // ==========================
    // INSCRIPTION
    // ==========================
    public function register($data)
    {
        $sql = "INSERT INTO utilisateurs
        (
            nom,
            prenom,
            email,
            mot_de_passe,
            date_naissance,
            lieu_naissance,
            region,
            ville,
            telephone,
            situation_familiale,
            nombre_enfants,
            adresse,
            arrondissement,
            diplome,
            niveau_etude,
            specialite,
            condition_physique,
            nombre_experiences,
            duree_experience,
            cv,
            photo,
            numero_national,
            type_piece_identite,
            numero_piece_identite,
            date_expiration_piece,
            fichier_piece_identite,
            certificat_nni,
            statut_dossier,
            motif_refus,
            role
        )
        VALUES
        (
            :nom,
            :prenom,
            :email,
            :mot_de_passe,
            :date_naissance,
            :lieu_naissance,
            :region,
            :ville,
            :telephone,
            :situation_familiale,
            :nombre_enfants,
            :adresse,
            :arrondissement,
            :diplome,
            :niveau_etude,
            :specialite,
            :condition_physique,
            :nombre_experiences,
            :duree_experience,
            :cv,
            :photo,
            :numero_national,
            :type_piece_identite,
            :numero_piece_identite,
            :date_expiration_piece,
            :fichier_piece_identite,
            :certificat_nni,
            'en_attente',
            NULL,
            'candidat'
        )";

        $stmt = $this->conn->prepare($sql);

        // Hash du mot de passe avant stockage (jamais en clair en base)
        $mot_de_passe_hash = password_hash($data["mot_de_passe"], PASSWORD_BCRYPT);

        // Toutes les valeurs optionnelles passent par nullIfEmpty()
        // pour éviter les erreurs Postgres du type
        // "invalid input syntax for type date" quand le champ est vide.
        $nom                    = $data["nom"];
        $prenom                 = $data["prenom"];
        $email                  = $data["email"];
        $date_naissance         = $this->nullIfEmpty($data["date_naissance"] ?? null);
        $lieu_naissance         = $this->nullIfEmpty($data["lieu_naissance"] ?? null);
        $region                 = $this->nullIfEmpty($data["region"] ?? null);
        $ville                  = $this->nullIfEmpty($data["ville"] ?? null);
        $telephone              = $this->nullIfEmpty($data["telephone"] ?? null);
        $situation_familiale    = $this->nullIfEmpty($data["situation_familiale"] ?? null);
        $nombre_enfants         = $this->nullIfEmpty($data["nombre_enfants"] ?? null);
        $adresse                = $this->nullIfEmpty($data["adresse"] ?? null);
        $arrondissement         = $this->nullIfEmpty($data["arrondissement"] ?? null);
        $diplome                = $this->nullIfEmpty($data["diplome"] ?? null);
        $niveau_etude           = $this->nullIfEmpty($data["niveau_etude"] ?? null);
        $specialite             = $this->nullIfEmpty($data["specialite"] ?? null);
        $condition_physique     = $this->nullIfEmpty($data["condition_physique"] ?? null);
        $nombre_experiences     = $this->nullIfEmpty($data["nombre_experiences"] ?? null);
        $duree_experience       = $this->nullIfEmpty($data["duree_experience"] ?? null);
        $cv                     = $this->nullIfEmpty($data["cv"] ?? null);
        $photo                  = $this->nullIfEmpty($data["photo"] ?? null);
        $numero_national        = $this->nullIfEmpty($data["numero_national"] ?? null);
        $type_piece_identite    = $this->nullIfEmpty($data["type_piece_identite"] ?? null);
        $numero_piece_identite  = $this->nullIfEmpty($data["numero_piece_identite"] ?? null);
        $date_expiration_piece  = $this->nullIfEmpty($data["date_expiration_piece"] ?? null);
        $fichier_piece_identite = $this->nullIfEmpty($data["fichier_piece_identite"] ?? null);
        $certificat_nni         = $this->nullIfEmpty($data["certificat_nni"] ?? null);

        $stmt->bindParam(":nom", $nom);
        $stmt->bindParam(":prenom", $prenom);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":mot_de_passe", $mot_de_passe_hash);
        $stmt->bindParam(":date_naissance", $date_naissance);
        $stmt->bindParam(":lieu_naissance", $lieu_naissance);
        $stmt->bindParam(":region", $region);
        $stmt->bindParam(":ville", $ville);
        $stmt->bindParam(":telephone", $telephone);
        $stmt->bindParam(":situation_familiale", $situation_familiale);
        $stmt->bindParam(":nombre_enfants", $nombre_enfants);
        $stmt->bindParam(":adresse", $adresse);
        $stmt->bindParam(":arrondissement", $arrondissement);
        $stmt->bindParam(":diplome", $diplome);
        $stmt->bindParam(":niveau_etude", $niveau_etude);
        $stmt->bindParam(":specialite", $specialite);
        $stmt->bindParam(":condition_physique", $condition_physique);
        $stmt->bindParam(":nombre_experiences", $nombre_experiences);
        $stmt->bindParam(":duree_experience", $duree_experience);
        $stmt->bindParam(":cv", $cv);
        $stmt->bindParam(":photo", $photo);
        $stmt->bindParam(":numero_national", $numero_national);
        $stmt->bindParam(":type_piece_identite", $type_piece_identite);
        $stmt->bindParam(":numero_piece_identite", $numero_piece_identite);
        $stmt->bindParam(":date_expiration_piece", $date_expiration_piece);
        $stmt->bindParam(":fichier_piece_identite", $fichier_piece_identite);
        $stmt->bindParam(":certificat_nni", $certificat_nni);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            // Log l'erreur réelle côté serveur au lieu de la laisser
            // remonter telle quelle jusqu'au JSON renvoyé à l'app
            error_log("Erreur inscription: " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // MODIFIER PROFIL
    // ==========================
    // Met à jour tous les champs modifiables du profil (infos
    // personnelles, parcours, identification, fichiers). Le mot de
    // passe n'est volontairement pas touché ici — il a son propre
    // flux ("Changer le mot de passe").
    // ==========================
    public function updateProfile($id, $data)
    {
        $sql = "UPDATE utilisateurs SET
            nom = :nom,
            prenom = :prenom,
            email = :email,
            telephone = :telephone,
            date_naissance = :date_naissance,
            lieu_naissance = :lieu_naissance,
            region = :region,
            ville = :ville,
            arrondissement = :arrondissement,
            adresse = :adresse,
            situation_familiale = :situation_familiale,
            nombre_enfants = :nombre_enfants,
            diplome = :diplome,
            niveau_etude = :niveau_etude,
            specialite = :specialite,
            condition_physique = :condition_physique,
            nombre_experiences = :nombre_experiences,
            duree_experience = :duree_experience,
            numero_national = :numero_national,
            type_piece_identite = :type_piece_identite,
            numero_piece_identite = :numero_piece_identite,
            date_expiration_piece = :date_expiration_piece,
            cv = :cv,
            photo = :photo,
            fichier_piece_identite = :fichier_piece_identite,
            certificat_nni = :certificat_nni
        WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $nom                    = $this->nullIfEmpty($data["nom"] ?? null);
        $prenom                 = $this->nullIfEmpty($data["prenom"] ?? null);
        $email                  = $this->nullIfEmpty($data["email"] ?? null);
        $telephone              = $this->nullIfEmpty($data["telephone"] ?? null);
        $date_naissance         = $this->nullIfEmpty($data["date_naissance"] ?? null);
        $lieu_naissance         = $this->nullIfEmpty($data["lieu_naissance"] ?? null);
        $region                 = $this->nullIfEmpty($data["region"] ?? null);
        $ville                  = $this->nullIfEmpty($data["ville"] ?? null);
        $arrondissement         = $this->nullIfEmpty($data["arrondissement"] ?? null);
        $adresse                = $this->nullIfEmpty($data["adresse"] ?? null);
        $situation_familiale    = $this->nullIfEmpty($data["situation_familiale"] ?? null);
        $nombre_enfants         = $this->nullIfEmpty($data["nombre_enfants"] ?? null);
        $diplome                = $this->nullIfEmpty($data["diplome"] ?? null);
        $niveau_etude           = $this->nullIfEmpty($data["niveau_etude"] ?? null);
        $specialite             = $this->nullIfEmpty($data["specialite"] ?? null);
        $condition_physique     = $this->nullIfEmpty($data["condition_physique"] ?? null);
        $nombre_experiences     = $this->nullIfEmpty($data["nombre_experiences"] ?? null);
        $duree_experience       = $this->nullIfEmpty($data["duree_experience"] ?? null);
        $numero_national        = $this->nullIfEmpty($data["numero_national"] ?? null);
        $type_piece_identite    = $this->nullIfEmpty($data["type_piece_identite"] ?? null);
        $numero_piece_identite  = $this->nullIfEmpty($data["numero_piece_identite"] ?? null);
        $date_expiration_piece  = $this->nullIfEmpty($data["date_expiration_piece"] ?? null);
        $cv                     = $this->nullIfEmpty($data["cv"] ?? null);
        $photo                  = $this->nullIfEmpty($data["photo"] ?? null);
        $fichier_piece_identite = $this->nullIfEmpty($data["fichier_piece_identite"] ?? null);
        $certificat_nni         = $this->nullIfEmpty($data["certificat_nni"] ?? null);

        $stmt->bindParam(":nom", $nom);
        $stmt->bindParam(":prenom", $prenom);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":telephone", $telephone);
        $stmt->bindParam(":date_naissance", $date_naissance);
        $stmt->bindParam(":lieu_naissance", $lieu_naissance);
        $stmt->bindParam(":region", $region);
        $stmt->bindParam(":ville", $ville);
        $stmt->bindParam(":arrondissement", $arrondissement);
        $stmt->bindParam(":adresse", $adresse);
        $stmt->bindParam(":situation_familiale", $situation_familiale);
        $stmt->bindParam(":nombre_enfants", $nombre_enfants);
        $stmt->bindParam(":diplome", $diplome);
        $stmt->bindParam(":niveau_etude", $niveau_etude);
        $stmt->bindParam(":specialite", $specialite);
        $stmt->bindParam(":condition_physique", $condition_physique);
        $stmt->bindParam(":nombre_experiences", $nombre_experiences);
        $stmt->bindParam(":duree_experience", $duree_experience);
        $stmt->bindParam(":numero_national", $numero_national);
        $stmt->bindParam(":type_piece_identite", $type_piece_identite);
        $stmt->bindParam(":numero_piece_identite", $numero_piece_identite);
        $stmt->bindParam(":date_expiration_piece", $date_expiration_piece);
        $stmt->bindParam(":cv", $cv);
        $stmt->bindParam(":photo", $photo);
        $stmt->bindParam(":fichier_piece_identite", $fichier_piece_identite);
        $stmt->bindParam(":certificat_nni", $certificat_nni);
        $stmt->bindParam(":id", $id);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur updateProfile: " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // METTRE À JOUR LE STATUT DU DOSSIER (Admin)
    // ==========================
    public function updateDossierStatus($id, $statut, $motif = null)
    {
        $sql = "UPDATE utilisateurs
                SET statut_dossier = :statut_dossier,
                    motif_refus = :motif_refus
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        $motifVal = $this->nullIfEmpty($motif);

        $stmt->bindParam(":statut_dossier", $statut);
        $stmt->bindParam(":motif_refus", $motifVal);
        $stmt->bindParam(":id", $id);

        try {
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur updateDossierStatus: " . $e->getMessage());
            return false;
        }
    }
}