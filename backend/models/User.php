<?php

class User
{
    private $conn;

    private $table = "users";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function login($email,$password)
    {
        $sql = "SELECT * FROM users
                WHERE email=:email
                AND password=:password";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(":email",$email);
        $stmt->bindParam(":password",$password);

        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}