<?php

require_once "../config/Database.php";
require_once "../models/Offre.php";
require_once "../models/User.php";

class OffreController
{
    private $offre;
    private $userModel;

    public function __construct()
    {
        $database = new Database();
        $db = $database->connect();
        $this->offre = new Offre($db);
        $this->userModel = new User($db);
    }

    // ==========================
    // LISTE DES OFFRES (pour l'écran d'accueil)
    // Attend optionnellement ?candidat_id=X
    // ==========================
    public function list()
    {
        header("Content-Type: application/json");

        $candidatId = $_GET["candidat_id"] ?? $_GET["user_id"] ?? null;

        if ($candidatId) {
            $user = $this->userModel->getById($candidatId);
            if ($user) {
                $statutDossier = strtolower(trim($user["statut_dossier"] ?? "en_attente"));
                $isAccepte = in_array($statutDossier, ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"]);
                if (!$isAccepte) {
                    echo json_encode([
                        "success" => true,
                        "statut_dossier" => $statutDossier,
                        "motif_refus" => $user["motif_refus"] ?? null,
                        "offres" => []
                    ]);
                    return;
                }
            }
        }

        $page = isset($_GET["page"]) ? (int)$_GET["page"] : null;
        $limit = isset($_GET["limit"]) ? (int)$_GET["limit"] : null;

        if ($page !== null || $limit !== null) {
            $page = $page ? max(1, $page) : 1;
            $limit = $limit ? max(1, $limit) : 10;
            $offres = $this->offre->getAll($page, $limit);
            $total = $this->offre->getTotalCount();
            $hasMore = ($page * $limit) < $total;

            echo json_encode([
                "success" => true,
                "statut_dossier" => "accepte",
                "page" => $page,
                "limit" => $limit,
                "total" => $total,
                "has_more" => $hasMore,
                "offres" => $offres
            ]);
        } else {
            $offres = $this->offre->getAll();
            echo json_encode([
                "success" => true,
                "statut_dossier" => "accepte",
                "offres" => $offres
            ]);
        }
    }

    // ==========================
    // DÉTAIL D'UNE OFFRE (offre + entreprise)
    // Attend ?action=offre_detail&id=X
    // ==========================
    public function detail()
    {
        header("Content-Type: application/json");

        $id = $_GET["id"] ?? null;

        if (!$id) {
            echo json_encode([
                "success" => false,
                "message" => "Identifiant de l'offre manquant."
            ]);
            return;
        }

        $offre = $this->offre->getById($id);

        if (!$offre) {
            echo json_encode([
                "success" => false,
                "message" => "Offre introuvable."
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "offre" => $offre
        ]);
    }
}