<?php

require_once "../config/Database.php";
require_once "../models/Categorie.php";

class CategorieController
{
    private $categorie;

    public function __construct()
    {
        $database = new Database();
        $db = $database->connect();
        $this->categorie = new Categorie($db);
    }

    // ==========================
    // LISTE DES CATÉGORIES
    // ==========================
    public function list()
    {
        header("Content-Type: application/json");

        $categories = $this->categorie->getAll();

        echo json_encode([
            "success" => true,
            "categories" => $categories
        ]);
    }
}
