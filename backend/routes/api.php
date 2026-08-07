<?php

require_once "../controllers/UserController.php";

$controller = new UserController();

$action = $_GET["action"] ?? "";

switch($action){

    case "login":
        $controller->login();
        break;

    case "forgot_password":
        $controller->forgotPassword();
        break;

    case "reset_password":
        $controller->resetPassword();
        break;

    case "register":
        $controller->register();
        break;

    case "update_profile":
        $controller->updateProfile();
        break;

    default:
        echo json_encode([
            "message"=>"API Recrutia"
        ]);
}
