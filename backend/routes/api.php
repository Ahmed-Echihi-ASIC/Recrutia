<?php

require_once "../controllers/UserController.php";

$controller = new UserController();

$action = $_GET["action"] ?? "";

switch($action){

    case "login":
        $controller->login();
        break;

    default:
        echo json_encode([
            "message"=>"API Recrutia"
        ]);
}