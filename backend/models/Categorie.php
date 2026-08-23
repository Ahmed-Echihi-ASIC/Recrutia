<?php

class Categorie
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // Liste de toutes les catégories
    // ==========================
    public function getAll()
    {
        $sql = "SELECT id, nom, icone FROM categories ORDER BY nom ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
