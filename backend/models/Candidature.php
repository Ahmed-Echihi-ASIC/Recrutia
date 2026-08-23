<?php

class Candidature
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================
    // Enregistre une nouvelle candidature.
    // Retourne false si le candidat a déjà postulé (contrainte UNIQUE).
    // ==========================
    public function create($offreId, $candidatId)
    {
        $sql = "INSERT INTO candidatures (offre_id, candidat_id, statut, date_candidature)
                VALUES (:offre_id, :candidat_id, 'en_attente', NOW())";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":offre_id", $offreId);
            $stmt->bindParam(":candidat_id", $candidatId);
            return $stmt->execute();
        } catch (PDOException $e) {
            // Violation de la contrainte UNIQUE (déjà postulé) ou autre erreur
            error_log("Candidature::create erreur : " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // Vérifie si un candidat a déjà postulé à une offre donnée.
    // Retourne le statut ("en_attente" | "acceptee" | "refusee") ou null.
    // ==========================
    public function getStatus($offreId, $candidatId)
    {
        $sql = "SELECT statut FROM candidatures
                WHERE offre_id = :offre_id AND candidat_id = :candidat_id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":offre_id", $offreId);
        $stmt->bindParam(":candidat_id", $candidatId);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $row["statut"] : null;
    }

    // ==========================
    // Récupère les détails complets de la candidature d'un candidat pour une offre
    // ==========================
    public function getDetails($offreId, $candidatId)
    {
        $sql = "SELECT id, statut, date_candidature FROM candidatures
                WHERE offre_id = :offre_id AND candidat_id = :candidat_id";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":offre_id", $offreId);
        $stmt->bindParam(":candidat_id", $candidatId);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    // ==========================
    // Liste toutes les candidatures d'un candidat, jointes avec
    // l'offre et l'entreprise pour l'affichage dans "Favorite".
    // ==========================
    public function getByCandidat($candidatId)
    {
        $sql = "SELECT
                    c.id,
                    c.offre_id,
                    c.statut,
                    c.date_candidature,
                    o.titre,
                    o.lieu,
                    o.type_contrat,
                    e.nom AS entreprise_nom,
                    e.logo AS entreprise_logo
                FROM candidatures c
                JOIN offres_emploi o ON o.id = c.offre_id
                JOIN entreprises e ON e.id = o.entreprise_id
                WHERE c.candidat_id = :candidat_id
                ORDER BY c.date_candidature DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":candidat_id", $candidatId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================
    // Met à jour le statut d'une candidature ("en_attente", "acceptee", "refusee")
    // ==========================
    public function updateStatus($candidatureId, $newStatus)
    {
        $validStatuses = ['en_attente', 'acceptee', 'accepte', 'refusee', 'refuse'];
        if (!in_array($newStatus, $validStatuses)) {
            return false;
        }

        $sql = "UPDATE candidatures SET statut = :statut WHERE id = :id";
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":statut", $newStatus);
            $stmt->bindParam(":id", $candidatureId);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Candidature::updateStatus erreur : " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // Supprime/Annule une candidature (seulement si elle est en_attente)
    // ==========================
    public function delete($candidatureId, $candidatId)
    {
        $sql = "DELETE FROM candidatures 
                WHERE id = :id AND candidat_id = :candidat_id AND statut = 'en_attente'";
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":id", $candidatureId);
            $stmt->bindParam(":candidat_id", $candidatId);
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Candidature::delete erreur : " . $e->getMessage());
            return false;
        }
    }

    // ==========================
    // Récupère la liste des notifications pour les candidatures mises à jour
    // (statuts "acceptee", "accepte", "refusee", "refuse")
    // ==========================
    public function getNotifications($candidatId)
    {
        $sql = "SELECT
                    c.id AS candidature_id,
                    c.offre_id,
                    c.statut,
                    c.date_candidature,
                    o.titre AS offre_titre,
                    e.nom AS entreprise_nom,
                    e.logo AS entreprise_logo
                FROM candidatures c
                JOIN offres_emploi o ON o.id = c.offre_id
                JOIN entreprises e ON e.id = o.entreprise_id
                WHERE c.candidat_id = :candidat_id
                  AND c.statut IN ('acceptee', 'accepte', 'refusee', 'refuse')
                ORDER BY c.date_candidature DESC";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":candidat_id", $candidatId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Candidature::getNotifications erreur : " . $e->getMessage());
            return [];
        }
    }
}