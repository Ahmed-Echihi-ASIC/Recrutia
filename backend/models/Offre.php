<?php

class Offre
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // Liste des offres actives (pour l'écran d'accueil)
    // On ne renvoie que les colonnes utiles à l'affichage en liste,
    // ==========================
    // Liste des offres actives avec pagination (pour l'écran d'accueil)
    // ==========================
    public function getAll($page = null, $limit = null)
    {
        $sql = "SELECT
                    o.id,
                    o.titre,
                    o.poste,
                    o.type_contrat,
                    o.lieu,
                    o.salaire,
                    o.date_publication,
                    o.date_expiration,
                    o.statut,
                    o.categorie_id,
                    c.nom AS categorie_nom,
                    e.id AS entreprise_id,
                    e.nom AS entreprise_nom,
                    e.logo AS entreprise_logo
                FROM offres_emploi o
                JOIN entreprises e ON e.id = o.entreprise_id
                LEFT JOIN categories c ON c.id = o.categorie_id
                WHERE o.statut = 'active'
                ORDER BY o.date_publication DESC";

        if ($page !== null && $limit !== null) {
            $pageInt = max(1, (int)$page);
            $limitInt = max(1, (int)$limit);
            $offset = ($pageInt - 1) * $limitInt;
            $sql .= " LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(":limit", $limitInt, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        } else {
            $stmt = $this->conn->prepare($sql);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================
    // Nombre total d'offres actives
    // ==========================
    public function getTotalCount()
    {
        $sql = "SELECT COUNT(*) as total FROM offres_emploi WHERE statut = 'active'";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row["total"] : 0;
    }

    // ==========================
    // Détail complet d'une offre + toutes les infos de l'entreprise
    // qui l'a publiée (jointure).
    // ==========================
    public function getById($id)
    {
        $sql = "SELECT
                    o.id,
                    o.titre,
                    o.description,
                    o.poste,
                    o.type_contrat,
                    o.lieu,
                    o.salaire,
                    o.niveau_etude_requis,
                    o.specialite_requise,
                    o.experience_requise,
                    o.competences,
                    o.date_publication,
                    o.date_expiration,
                    o.statut,
                    o.categorie_id,
                    cat.nom AS categorie_nom,

                    e.id AS entreprise_id,
                    e.nom AS entreprise_nom,
                    e.description AS entreprise_description,
                    e.secteur_activite AS entreprise_secteur,
                    e.logo AS entreprise_logo,
                    e.adresse AS entreprise_adresse,
                    e.ville AS entreprise_ville,
                    e.telephone AS entreprise_telephone,
                    e.email AS entreprise_email,
                    e.site_web AS entreprise_site_web

                FROM offres_emploi o
                JOIN entreprises e ON e.id = o.entreprise_id
                LEFT JOIN categories cat ON cat.id = o.categorie_id
                WHERE o.id = :id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $offre = $stmt->fetch(PDO::FETCH_ASSOC);

        return $offre ?: null;
    }

    // ==========================
    // Système de matching & recommandation rule-based pour candidat
    // ==========================
    public function getMatchedOffresForCandidat($user, $page = null, $limit = null, $categorieId = null, $search = null)
    {
        $specialite = trim($user["specialite"] ?? "");
        $ville      = trim($user["ville"] ?? "");
        $region     = trim($user["region"] ?? "");
        $diplome    = trim($user["diplome"] ?? "");
        $experience = trim($user["duree_experience"] ?? "");

        $sql = "SELECT
                    o.id,
                    o.titre,
                    o.poste,
                    o.type_contrat,
                    o.lieu,
                    o.salaire,
                    o.date_publication,
                    o.date_expiration,
                    o.statut,
                    o.categorie_id,
                    c.nom AS categorie_nom,
                    e.id AS entreprise_id,
                    e.nom AS entreprise_nom,
                    e.logo AS entreprise_logo,
                    
                    -- Rule-Based Scoring calculation (Sur 100 points)
                    (
                        (CASE 
                            WHEN :specialite <> '' AND (
                                LOWER(o.specialite_requise) LIKE LOWER(:spec_like) OR
                                LOWER(o.titre) LIKE LOWER(:spec_like) OR
                                LOWER(o.poste) LIKE LOWER(:spec_like)
                            ) THEN 40
                            WHEN :specialite <> '' AND LOWER(c.nom) LIKE LOWER(:spec_like) THEN 25
                            ELSE 0
                        END)
                        +
                        (CASE 
                            WHEN :ville <> '' AND LOWER(o.lieu) LIKE LOWER(:ville_like) THEN 30
                            WHEN :region <> '' AND LOWER(o.lieu) LIKE LOWER(:region_like) THEN 20
                            ELSE 0
                        END)
                        +
                        (CASE 
                            WHEN :diplome <> '' AND (
                                LOWER(c.nom) LIKE LOWER(:diplome_like) OR
                                LOWER(o.niveau_etude_requis) LIKE LOWER(:diplome_like)
                            ) THEN 20
                            ELSE 0
                        END)
                        +
                        (CASE 
                            WHEN :experience <> '' AND LOWER(o.experience_requise) LIKE LOWER(:exp_like) THEN 10
                            ELSE 5
                        END)
                    ) AS score_pertinence,

                    -- Match breakdown badges
                    CASE WHEN :specialite <> '' AND (
                        LOWER(o.specialite_requise) LIKE LOWER(:spec_like) OR 
                        LOWER(o.titre) LIKE LOWER(:spec_like) OR 
                        LOWER(o.poste) LIKE LOWER(:spec_like)
                    ) THEN TRUE ELSE FALSE END AS is_specialite_match,

                    CASE WHEN :ville <> '' AND LOWER(o.lieu) LIKE LOWER(:ville_like) THEN TRUE ELSE FALSE END AS is_lieu_match,

                    CASE WHEN :diplome <> '' AND (
                        LOWER(c.nom) LIKE LOWER(:diplome_like)
                    ) THEN TRUE ELSE FALSE END AS is_categorie_match

                FROM offres_emploi o
                JOIN entreprises e ON e.id = o.entreprise_id
                LEFT JOIN categories c ON c.id = o.categorie_id
                WHERE o.statut = 'active'";

        if ($categorieId !== null && $categorieId !== "") {
            $sql .= " AND o.categorie_id = :categorie_id";
        }

        if ($search !== null && trim($search) !== "") {
            $sql .= " AND (LOWER(o.titre) LIKE LOWER(:search) OR LOWER(o.poste) LIKE LOWER(:search) OR LOWER(e.nom) LIKE LOWER(:search))";
        }

        $sql .= " ORDER BY score_pertinence DESC, o.date_publication DESC";

        if ($page !== null && $limit !== null) {
            $pageInt = max(1, (int)$page);
            $limitInt = max(1, (int)$limit);
            $offset = ($pageInt - 1) * $limitInt;
            $sql .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->conn->prepare($sql);

        $specLike = "%" . $specialite . "%";
        $villeLike = "%" . $ville . "%";
        $regionLike = "%" . $region . "%";
        $diplomeLike = "%" . $diplome . "%";
        $expLike = "%" . $experience . "%";

        $stmt->bindValue(":specialite", $specialite);
        $stmt->bindValue(":spec_like", $specLike);
        $stmt->bindValue(":ville", $ville);
        $stmt->bindValue(":ville_like", $villeLike);
        $stmt->bindValue(":region", $region);
        $stmt->bindValue(":region_like", $regionLike);
        $stmt->bindValue(":diplome", $diplome);
        $stmt->bindValue(":diplome_like", $diplomeLike);
        $stmt->bindValue(":experience", $experience);
        $stmt->bindValue(":exp_like", $expLike);

        if ($categorieId !== null && $categorieId !== "") {
            $stmt->bindValue(":categorie_id", (int)$categorieId, PDO::PARAM_INT);
        }

        if ($search !== null && trim($search) !== "") {
            $stmt->bindValue(":search", "%" . trim($search) . "%");
        }

        if ($page !== null && $limit !== null) {
            $stmt->bindValue(":limit", $limitInt, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}