<?php

// Charger les variables du fichier .env
function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // ignore les commentaires
        }

        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Ajuste le chemin selon l'emplacement réel de ton .env par rapport à ce fichier
loadEnv(__DIR__ . '/../../.env');

class Database
{
    private $host;
    private $port;
    private $dbname;
    private $username;
    private $password;

    public $conn;

    public function __construct()
    {
        $this->host     = $_ENV['DB_HOST'] ?? 'localhost';
        $this->port     = $_ENV['DB_PORT'] ?? '5432';
        $this->dbname   = $_ENV['DB_NAME'] ?? '';
        $this->username = $_ENV['DB_USER'] ?? '';
        $this->password = $_ENV['DB_PASSWORD'] ?? '';
    }

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

            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Erreur de connexion à la base de données.");

        }

        return $this->conn;
    }
}