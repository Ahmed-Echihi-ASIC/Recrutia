<?php

require_once __DIR__ . "/../controllers/UserController.php";
require_once __DIR__ . "/../controllers/OffreController.php";
require_once __DIR__ . "/../controllers/CategorieController.php";
require_once __DIR__ . "/../controllers/CandidatureController.php";

try {
    $controller = new UserController();
    $offreController = new OffreController();
    $categorieController = new CategorieController();
    $candidatureController = new CandidatureController();

    $action = $_GET["action"] ?? "";

    switch($action){

        case "login":
            $controller->login();
            break;

        case "register":
            $controller->register();
            break;

        case "update_profile":
            $controller->updateProfile();
            break;

        case "change_password":
            $controller->changePassword();
            break;

        case "user_status":
            $controller->getUserStatus();
            break;

        case "update_dossier_status":
            $controller->updateDossierStatus();
            break;

        case "offres":
            $offreController->list();
            break;

        case "offre_detail":
            $offreController->detail();
            break;

        case "categories":
            $categorieController->list();
            break;

        case "category_detail":
            $categorieController->detail();
            break;

        case "postuler":
            $candidatureController->postuler();
            break;

        case "check_candidature":
            $candidatureController->checkCandidature();
            break;

        case "mes_candidatures":
            $candidatureController->mesCandidatures();
            break;

        case "update_candidature_status":
            $candidatureController->updateStatus();
            break;

        case "annuler_candidature":
            $candidatureController->annulerCandidature();
            break;

        case "notifications":
            $candidatureController->getNotifications();
            break;

        default:
            echo json_encode([
                "message"=>"API Recrutia"
            ]);
    }
} catch (Throwable $e) {
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}