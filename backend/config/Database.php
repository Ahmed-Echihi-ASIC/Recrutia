<?php

class Database
{
    private $host = "localhost";
    private $port = "5432";
    private $dbname = "recrutia_db";
    private $username = "postgres";
    private $password = "09082004";

    public $conn;

    public function connect()
    {
        $this->conn = null;

        try {

            $this->conn = new PDO(
                "pgsql:host={$this->host};port={$this->port};dbname={$this->dbname}",
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch (PDOException $e) {

            echo $e->getMessage();

        }

        return $this->conn;
    }
}