<?php

class User
{
    private $conn;
    private $table = "utilisateurs";
    private $columns = [];

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // LOGIN
    // ==========================
    public function login($email, $mot_de_passe)
    {
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

        // Ne jamais envoyer le mot de passe
        unset($user["mot_de_passe"]);

        return $user;
    }

    // ==========================
    // PROFIL PAR ID
    // ==========================
    public function findById($id)
    {
        $sql = "SELECT * FROM utilisateurs WHERE id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return false;
        }

        unset($user["mot_de_passe"]);

        return $user;
    }

    // ==========================
    // Convertir valeur vide en NULL
    // ==========================
    private function nullIfEmpty($value)
    {
        if (!isset($value) || $value === "" || $value === null) {
            return null;
        }

        return $value;
    }

    private function columnExists($column)
    {
        if (empty($this->columns)) {
            $sql = "SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = :table";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ":table" => $this->table,
            ]);

            $this->columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        return in_array($column, $this->columns, true);
    }

    // ==========================
    // Vérifier email
    // ==========================
    public function emailExists($email)
    {
        $sql = "SELECT id
                FROM utilisateurs
                WHERE email = :email";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function emailExistsForOtherUser($email, $id)
    {
        $sql = "SELECT id
                FROM utilisateurs
                WHERE email = :email
                AND id <> :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function findByEmail($email)
    {
        $sql = "SELECT * FROM utilisateurs WHERE email = :email";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return false;
        }

        unset($user["mot_de_passe"]);

        return $user;
    }

    private function ensurePasswordResetTable()
    {
        $this->conn->exec(
            "CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used_at TIMESTAMP NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"
        );

        $this->conn->exec(
            "CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
             ON password_reset_tokens (user_id)"
        );
    }

    public function createPasswordResetToken($email)
    {
        $this->ensurePasswordResetTable();

        $user = $this->findByEmail($email);

        if (!$user) {
            return null;
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = password_hash($token, PASSWORD_BCRYPT);
        $expiresAt = date("Y-m-d H:i:s", time() + 3600);

        $invalidateSql = "UPDATE password_reset_tokens
                          SET used_at = CURRENT_TIMESTAMP
                          WHERE user_id = :user_id
                          AND used_at IS NULL";

        $invalidateStmt = $this->conn->prepare($invalidateSql);
        $invalidateStmt->execute([
            ":user_id" => $user["id"],
        ]);

        $sql = "INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
                VALUES
                (:user_id, :token_hash, :expires_at)";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ":user_id" => $user["id"],
            ":token_hash" => $tokenHash,
            ":expires_at" => $expiresAt,
        ]);

        return [
            "token" => $token,
            "expires_at" => $expiresAt,
            "user" => $user,
        ];
    }

    public function resetPasswordWithToken($email, $token, $newPassword)
    {
        $this->ensurePasswordResetTable();

        $user = $this->findByEmail($email);

        if (!$user) {
            return false;
        }

        $sql = "SELECT id, token_hash
                FROM password_reset_tokens
                WHERE user_id = :user_id
                AND used_at IS NULL
                AND expires_at > CURRENT_TIMESTAMP
                ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ":user_id" => $user["id"],
        ]);

        $tokens = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($tokens as $resetToken) {
            if (!password_verify($token, $resetToken["token_hash"])) {
                continue;
            }

            $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

            $updateUserSql = "UPDATE utilisateurs
                              SET mot_de_passe = :mot_de_passe
                              WHERE id = :id";

            $updateUserStmt = $this->conn->prepare($updateUserSql);
            $updateUserStmt->execute([
                ":mot_de_passe" => $passwordHash,
                ":id" => $user["id"],
            ]);

            $updateTokenSql = "UPDATE password_reset_tokens
                               SET used_at = CURRENT_TIMESTAMP
                               WHERE id = :id";

            $updateTokenStmt = $this->conn->prepare($updateTokenSql);
            $updateTokenStmt->execute([
                ":id" => $resetToken["id"],
            ]);

            return true;
        }

        return false;
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
            'candidat'
        )";

        $stmt = $this->conn->prepare($sql);

        $mot_de_passe_hash = password_hash(
            $data["mot_de_passe"],
            PASSWORD_BCRYPT
        );

        $nom = $data["nom"];
        $prenom = $data["prenom"];
        $email = $data["email"];

        $date_naissance =
            $this->nullIfEmpty($data["date_naissance"] ?? null);

        $lieu_naissance =
            $this->nullIfEmpty($data["lieu_naissance"] ?? null);

        $region =
            $this->nullIfEmpty($data["region"] ?? null);

        $ville =
            $this->nullIfEmpty($data["ville"] ?? null);

        $telephone =
            $this->nullIfEmpty($data["telephone"] ?? null);

        $situation_familiale =
            $this->nullIfEmpty($data["situation_familiale"] ?? null);

        $nombre_enfants =
            $this->nullIfEmpty($data["nombre_enfants"] ?? null);

        $adresse =
            $this->nullIfEmpty($data["adresse"] ?? null);

        $arrondissement =
            $this->nullIfEmpty($data["arrondissement"] ?? null);

        $diplome =
            $this->nullIfEmpty($data["diplome"] ?? null);

        $niveau_etude =
            $this->nullIfEmpty($data["niveau_etude"] ?? null);

        $specialite =
            $this->nullIfEmpty($data["specialite"] ?? null);

        $condition_physique =
            $this->nullIfEmpty($data["condition_physique"] ?? null);

        $nombre_experiences =
            $this->nullIfEmpty($data["nombre_experiences"] ?? null);

        $duree_experience =
            $this->nullIfEmpty($data["duree_experience"] ?? null);

        $cv =
            $this->nullIfEmpty($data["cv"] ?? null);

        $photo =
            $this->nullIfEmpty($data["photo"] ?? null);

        $numero_national =
            $this->nullIfEmpty($data["numero_national"] ?? null);

        $type_piece_identite =
            $this->nullIfEmpty($data["type_piece_identite"] ?? null);

        $numero_piece_identite =
            $this->nullIfEmpty($data["numero_piece_identite"] ?? null);

        $date_expiration_piece =
            $this->nullIfEmpty($data["date_expiration_piece"] ?? null);

        $fichier_piece_identite =
            $this->nullIfEmpty($data["fichier_piece_identite"] ?? null);

        $certificat_nni =
            $this->nullIfEmpty($data["certificat_nni"] ?? null);

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

            error_log(
                "Erreur inscription: " .
                $e->getMessage()
            );

            return false;
        }
    }

    // ==========================
    // MODIFIER PROFIL COMPLET
    // ==========================
    public function updateProfile($id, $data)
    {
        /*
         * On construit dynamiquement la requête.
         *
         * Cela permet de modifier uniquement les champs
         * envoyés par le frontend.
         *
         * Les fichiers déjà enregistrés restent inchangés
         * si aucun nouveau fichier n'est envoyé.
         */

        $fields = [];
        $params = [];

        // ==========================
        // Informations personnelles
        // ==========================

        if (array_key_exists("nom", $data)) {
            $fields[] = "nom = :nom";
            $params[":nom"] = $this->nullIfEmpty($data["nom"]);
        }

        if (array_key_exists("prenom", $data)) {
            $fields[] = "prenom = :prenom";
            $params[":prenom"] = $this->nullIfEmpty($data["prenom"]);
        }

        if (array_key_exists("email", $data)) {
            $fields[] = "email = :email";
            $params[":email"] = $this->nullIfEmpty($data["email"]);
        }

        if (array_key_exists("date_naissance", $data)) {
            $fields[] = "date_naissance = :date_naissance";
            $params[":date_naissance"] =
                $this->nullIfEmpty($data["date_naissance"]);
        }

        if (array_key_exists("lieu_naissance", $data)) {
            $fields[] = "lieu_naissance = :lieu_naissance";
            $params[":lieu_naissance"] =
                $this->nullIfEmpty($data["lieu_naissance"]);
        }

        if (array_key_exists("region", $data)) {
            $fields[] = "region = :region";
            $params[":region"] =
                $this->nullIfEmpty($data["region"]);
        }

        if (array_key_exists("ville", $data)) {
            $fields[] = "ville = :ville";
            $params[":ville"] =
                $this->nullIfEmpty($data["ville"]);
        }

        if (array_key_exists("arrondissement", $data)) {
            $fields[] = "arrondissement = :arrondissement";
            $params[":arrondissement"] =
                $this->nullIfEmpty($data["arrondissement"]);
        }

        if (array_key_exists("adresse", $data)) {
            $fields[] = "adresse = :adresse";
            $params[":adresse"] =
                $this->nullIfEmpty($data["adresse"]);
        }

        if (array_key_exists("telephone", $data)) {
            $fields[] = "telephone = :telephone";
            $params[":telephone"] =
                $this->nullIfEmpty($data["telephone"]);
        }

        if (array_key_exists("situation_familiale", $data)) {
            $fields[] = "situation_familiale = :situation_familiale";
            $params[":situation_familiale"] =
                $this->nullIfEmpty($data["situation_familiale"]);
        }

        if (array_key_exists("nombre_enfants", $data)) {
            $fields[] = "nombre_enfants = :nombre_enfants";
            $params[":nombre_enfants"] =
                $this->nullIfEmpty($data["nombre_enfants"]);
        }

        // ==========================
        // Parcours
        // ==========================

        if (array_key_exists("diplome", $data)) {
            $fields[] = "diplome = :diplome";
            $params[":diplome"] =
                $this->nullIfEmpty($data["diplome"]);
        }

        if (
            array_key_exists("nombre_diplomes", $data) &&
            $this->columnExists("nombre_diplomes")
        ) {
            $fields[] = "nombre_diplomes = :nombre_diplomes";
            $params[":nombre_diplomes"] =
                $this->nullIfEmpty($data["nombre_diplomes"]);
        }

        if (array_key_exists("niveau_etude", $data)) {
            $fields[] = "niveau_etude = :niveau_etude";
            $params[":niveau_etude"] =
                $this->nullIfEmpty($data["niveau_etude"]);
        }

        if (array_key_exists("specialite", $data)) {
            $fields[] = "specialite = :specialite";
            $params[":specialite"] =
                $this->nullIfEmpty($data["specialite"]);
        }

        if (array_key_exists("condition_physique", $data)) {
            $fields[] = "condition_physique = :condition_physique";
            $params[":condition_physique"] =
                $this->nullIfEmpty($data["condition_physique"]);
        }

        if (array_key_exists("nombre_experiences", $data)) {
            $fields[] = "nombre_experiences = :nombre_experiences";
            $params[":nombre_experiences"] =
                $this->nullIfEmpty($data["nombre_experiences"]);
        }

        if (array_key_exists("duree_experience", $data)) {
            $fields[] = "duree_experience = :duree_experience";
            $params[":duree_experience"] =
                $this->nullIfEmpty($data["duree_experience"]);
        }

        // ==========================
        // Identification
        // ==========================

        if (array_key_exists("numero_national", $data)) {
            $fields[] = "numero_national = :numero_national";
            $params[":numero_national"] =
                $this->nullIfEmpty($data["numero_national"]);
        }

        if (array_key_exists("type_piece_identite", $data)) {
            $fields[] = "type_piece_identite = :type_piece_identite";
            $params[":type_piece_identite"] =
                $this->nullIfEmpty($data["type_piece_identite"]);
        }

        if (array_key_exists("numero_piece_identite", $data)) {
            $fields[] = "numero_piece_identite = :numero_piece_identite";
            $params[":numero_piece_identite"] =
                $this->nullIfEmpty($data["numero_piece_identite"]);
        }

        if (array_key_exists("date_expiration_piece", $data)) {
            $fields[] = "date_expiration_piece = :date_expiration_piece";
            $params[":date_expiration_piece"] =
                $this->nullIfEmpty($data["date_expiration_piece"]);
        }

        // ==========================
        // Fichiers
        // ==========================

        if (
            array_key_exists("photo", $data) &&
            !empty($data["photo"])
        ) {
            $fields[] = "photo = :photo";
            $params[":photo"] = $data["photo"];
        }

        if (
            array_key_exists("cv", $data) &&
            !empty($data["cv"])
        ) {
            $fields[] = "cv = :cv";
            $params[":cv"] = $data["cv"];
        }

        if (
            array_key_exists("fichier_piece_identite", $data) &&
            !empty($data["fichier_piece_identite"])
        ) {
            $fields[] =
                "fichier_piece_identite = :fichier_piece_identite";

            $params[":fichier_piece_identite"] =
                $data["fichier_piece_identite"];
        }

        if (
            array_key_exists("certificat_nni", $data) &&
            !empty($data["certificat_nni"])
        ) {
            $fields[] = "certificat_nni = :certificat_nni";

            $params[":certificat_nni"] =
                $data["certificat_nni"];
        }

        // ==========================
        // Aucun champ à modifier
        // ==========================

        if (empty($fields)) {
            return true;
        }

        // ==========================
        // Requête UPDATE
        // ==========================

        $sql = "UPDATE utilisateurs
                SET " . implode(", ", $fields) . "
                WHERE id = :id";

        $stmt = $this->conn->prepare($sql);

        // ID
        $params[":id"] = $id;

        try {

            return $stmt->execute($params);

        } catch (PDOException $e) {

            error_log(
                "Erreur updateProfile: " .
                $e->getMessage()
            );

            return false;
        }
    }
}
