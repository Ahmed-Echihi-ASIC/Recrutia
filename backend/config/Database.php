<?php

// Charger les variables du fichier .env
function loadEnv($path)
{
    if (!file_exists($path)) {
        return false;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue; // ignore les commentaires et lignes vides
        }

        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Supprimer d'éventuels guillemets entourant la valeur
            if (strlen($value) >= 2 && 
                (($value[0] === '"' && $value[strlen($value) - 1] === '"') ||
                 ($value[0] === "'" && $value[strlen($value) - 1] === "'"))) {
                $value = substr($value, 1, -1);
            }
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }
    return true;
}

// Chercher d'abord dans backend/.env, puis dans le dossier racine du projet
if (!loadEnv(__DIR__ . '/../.env')) {
    loadEnv(__DIR__ . '/../../.env');
}

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
    $this->host     = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost');
    $this->port     = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '5432');
    $this->dbname   = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'recrutia_db');
    $this->username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'postgres');
    $this->password = getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? null);
}

    public function connect()
    {
        $this->conn = null;

        try {

            $sslmode = getenv('DB_SSLMODE') ?: ($_ENV['DB_SSLMODE'] ?? 'prefer');

$this->conn = new PDO(
    "pgsql:host={$this->host};port={$this->port};dbname={$this->dbname};sslmode={$sslmode}",
    $this->username,
    $this->password
);

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch (PDOException $e) {

            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Erreur de connexion à la base de données : " . $e->getMessage());

        }

        return $this->conn;
    }
}