<?php

class Categorie
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // Liste de toutes les catégories (avec comptage d'offres actives)
    // ==========================
    public function getAll($includeCounts = true)
    {
        if ($includeCounts) {
            $sql = "SELECT 
                        c.id, 
                        c.nom, 
                        c.icone,
                        COUNT(o.id) AS nombre_offres
                    FROM categories c
                    LEFT JOIN offres_emploi o ON o.categorie_id = c.id AND o.statut = 'active'
                    GROUP BY c.id, c.nom, c.icone
                    ORDER BY c.nom ASC";
        } else {
            $sql = "SELECT id, nom, icone FROM categories ORDER BY nom ASC";
        }

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================
    // Récupérer une catégorie par ID
    // ==========================
    public function getById($id)
    {
        $sql = "SELECT 
                    c.id, 
                    c.nom, 
                    c.icone,
                    COUNT(o.id) AS nombre_offres
                FROM categories c
                LEFT JOIN offres_emploi o ON o.categorie_id = c.id AND o.statut = 'active'
                WHERE c.id = :id
                GROUP BY c.id, c.nom, c.icone";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $cat = $stmt->fetch(PDO::FETCH_ASSOC);
        return $cat ?: null;
    }

    // ==========================
    // Rechercher une catégorie par nom ou spécialité (case-insensitive)
    // ==========================
    public function getByNom($nom)
    {
        if (empty($nom)) return null;

        $sql = "SELECT id, nom, icone FROM categories 
                WHERE LOWER(nom) LIKE LOWER(:nom) 
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $term = "%" . trim($nom) . "%";
        $stmt->bindParam(":nom", $term);
        $stmt->execute();

        $cat = $stmt->fetch(PDO::FETCH_ASSOC);
        return $cat ?: null;
    }
}
