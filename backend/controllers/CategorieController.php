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

        $includeCounts = isset($_GET["include_counts"]) ? filter_var($_GET["include_counts"], FILTER_VALIDATE_BOOLEAN) : true;

        $categories = $this->categorie->getAll($includeCounts);

        echo json_encode([
            "success" => true,
            "categories" => $categories
        ]);
    }

    // ==========================
    // DÉTAIL D'UNE CATÉGORIE
    // Attend ?action=category_detail&id=X
    // ==========================
    public function detail()
    {
        header("Content-Type: application/json");

        $id = $_GET["id"] ?? null;

        if (!$id) {
            echo json_encode([
                "success" => false,
                "message" => "Identifiant de la catégorie manquant."
            ]);
            return;
        }

        $cat = $this->categorie->getById($id);

        if (!$cat) {
            echo json_encode([
                "success" => false,
                "message" => "Catégorie introuvable."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "categorie" => $cat
        ]);
    }
}
