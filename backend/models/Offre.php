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
}