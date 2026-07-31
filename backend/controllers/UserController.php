<?php

require_once "../config/Database.php";
require_once "../models/User.php";

class UserController
{

    private $user;

    public function __construct()
    {
        $database = new Database();

        $db = $database->connect();

        $this->user = new User($db);
    }

    
public function login()
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "Aucune donnée reçue"
        ]);
        return;
    }

    $email = trim($data["email"] ?? "");
    $password = trim($data["password"] ?? "");

    $result = $this->user->login($email, $password);

    if ($result) {

        echo json_encode([
            "success" => true,
            "user" => $result
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Email ou mot de passe incorrect"
        ]);

    }
}

}