<?php

require_once "../config/Database.php";
require_once "../models/Candidature.php";
require_once "../models/User.php";

class CandidatureController
{
    private $candidature;
    private $userModel;

    public function __construct()
    {
        $database = new Database();
        $db = $database->connect();
        $this->candidature = new Candidature($db);
        $this->userModel = new User($db);
    }

    // ==========================
    // POSTULER À UNE OFFRE
    // Attend en POST (JSON) : offre_id, candidat_id
    // ==========================
    public function postuler()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        $offreId = $data["offre_id"] ?? null;
        $candidatId = $data["candidat_id"] ?? null;

        if (!$offreId || !$candidatId) {
            echo json_encode([
                "success" => false,
                "message" => "Offre ou candidat manquant."
            ]);
            return;
        }

        // Vérification du statut du dossier candidat
        $user = $this->userModel->getById($candidatId);
        $statutRaw = strtolower(trim($user["statut_dossier"] ?? "en_attente"));
        $isAccepte = in_array($statutRaw, ["accepte", "acceptee", "accepter", "accepté", "acceptée", "accepted"]);
        if (!$user || !$isAccepte) {
            $msg = (in_array($statutRaw, ["refuse", "refusee", "refuser", "refusé", "refusée", "rejected"]))
                ? "Votre dossier a été refusé. Vous ne pouvez pas postuler."
                : "Votre dossier est en cours de vérification. Vous pourrez postuler dès sa validation.";
            echo json_encode([
                "success" => false,
                "message" => $msg,
                "statut_dossier" => $statutRaw
            ]);
            return;
        }

        // Vérifier si le candidat a déjà postulé
        $existingStatus = $this->candidature->getStatus($offreId, $candidatId);

        if ($existingStatus !== null) {
            echo json_encode([
                "success" => false,
                "message" => "Vous avez déjà postulé à cette offre.",
                "status" => $existingStatus
            ]);
            return;
        }

        $result = $this->candidature->create($offreId, $candidatId);

        if ($result) {
            echo json_encode([
                "success" => true,
                "message" => "Candidature envoyée avec succès."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de l'envoi de la candidature."
            ]);
        }
    }

    // ==========================
    // VÉRIFIER LE STATUT D'UNE CANDIDATURE
    // Attend en GET : offre_id, candidat_id
    // ==========================
    public function checkCandidature()
    {
        header("Content-Type: application/json");

        $offreId = $_GET["offre_id"] ?? null;
        $candidatId = $_GET["candidat_id"] ?? null;

        if (!$offreId || !$candidatId) {
            echo json_encode([
                "success" => false,
                "message" => "Offre ou candidat manquant."
            ]);
            return;
        }

        $candidature = $this->candidature->getDetails($offreId, $candidatId);

        echo json_encode([
            "success" => true,
            "status" => $candidature ? $candidature["statut"] : null,
            "candidature_id" => $candidature ? $candidature["id"] : null,
            "date_candidature" => $candidature ? $candidature["date_candidature"] : null
        ]);
    }

    // ==========================
    // LISTE DES CANDIDATURES D'UN CANDIDAT (écran Favorite)
    // Attend en GET : candidat_id
    // ==========================
    public function mesCandidatures()
    {
        header("Content-Type: application/json");

        $candidatId = $_GET["candidat_id"] ?? null;

        if (!$candidatId) {
            echo json_encode([
                "success" => false,
                "message" => "Candidat non identifié."
            ]);
            return;
        }

        $candidatures = $this->candidature->getByCandidat($candidatId);

        echo json_encode([
            "success" => true,
            "candidatures" => $candidatures
        ]);
    }

    // ==========================
    // CHANGER LE STATUT D'UNE CANDIDATURE
    // Attend en POST (JSON) : candidature_id, status
    // ==========================
    public function updateStatus()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        $candidatureId = $data["candidature_id"] ?? null;
        $status = $data["status"] ?? null;

        if (!$candidatureId || !$status) {
            echo json_encode([
                "success" => false,
                "message" => "Identifiant candidature ou statut manquant."
            ]);
            return;
        }

        $result = $this->candidature->updateStatus($candidatureId, $status);

        if ($result) {
            echo json_encode([
                "success" => true,
                "message" => "Statut de candidature mis à jour avec succès."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Impossible de mettre à jour le statut."
            ]);
        }
    }

    // ==========================
    // ANNULER UNE CANDIDATURE
    // Attend en POST (JSON) : candidature_id, candidat_id
    // ==========================
    public function annulerCandidature()
    {
        header("Content-Type: application/json");

        $data = json_decode(file_get_contents("php://input"), true);

        $candidatureId = $data["candidature_id"] ?? null;
        $candidatId = $data["candidat_id"] ?? null;

        if (!$candidatureId || !$candidatId) {
            echo json_encode([
                "success" => false,
                "message" => "Informations manquantes pour l'annulation."
            ]);
            return;
        }

        $deleted = $this->candidature->delete($candidatureId, $candidatId);

        if ($deleted) {
            echo json_encode([
                "success" => true,
                "message" => "Candidature annulée avec succès."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Impossible d'annuler la candidature (peut-être déjà traitée ou inexistante)."
            ]);
        }
    }

    // ==========================
    // RÉCUPÉRER LES NOTIFICATIONS D'UN CANDIDAT
    // Attend en GET : candidat_id
    // ==========================
    public function getNotifications()
    {
        header("Content-Type: application/json");

        $candidatId = $_GET["candidat_id"] ?? null;

        if (!$candidatId) {
            echo json_encode([
                "success" => false,
                "message" => "Candidat non identifié."
            ]);
            return;
        }

        $notifications = $this->candidature->getNotifications($candidatId);

        echo json_encode([
            "success" => true,
            "count" => count($notifications),
            "notifications" => $notifications
        ]);
    }
}