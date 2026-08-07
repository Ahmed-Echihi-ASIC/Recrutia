<?php

class Mailer
{
    private $host;
    private $port;
    private $username;
    private $password;
    private $fromEmail;
    private $fromName;
    private $encryption;

    public function __construct()
    {
        $config = $this->loadConfig();

        $this->host = getenv("SMTP_HOST") ?: ($config["host"] ?? "");
        $this->port = (int) (getenv("SMTP_PORT") ?: ($config["port"] ?? 587));
        $this->username = getenv("SMTP_USERNAME") ?: ($config["username"] ?? "");
        $this->password = getenv("SMTP_PASSWORD") ?: ($config["password"] ?? "");
        $this->fromEmail =
            getenv("SMTP_FROM_EMAIL") ?:
            ($config["from_email"] ?? $this->username);
        $this->fromName =
            getenv("SMTP_FROM_NAME") ?:
            ($config["from_name"] ?? "Recrutia");
        $this->encryption = strtolower(
            getenv("SMTP_ENCRYPTION") ?:
            ($config["encryption"] ?? "tls")
        );
    }

    private function loadConfig()
    {
        $configPath = __DIR__ . "/mail.php";

        if (!file_exists($configPath)) {
            return [];
        }

        $config = require $configPath;

        return is_array($config) ? $config : [];
    }

    public function isConfigured()
    {
        return $this->host !== "" &&
            $this->username !== "" &&
            $this->password !== "" &&
            $this->fromEmail !== "";
    }

    public function sendPasswordReset($toEmail, $token)
    {
        if (!$this->isConfigured()) {
            error_log("Mailer non configuré : variables SMTP manquantes.");
            return false;
        }

        $subject = "Réinitialisation de votre mot de passe Recrutia";
        $body = "Bonjour,\n\n" .
            "Vous avez demandé la réinitialisation de votre mot de passe Recrutia.\n\n" .
            "Code de réinitialisation : " . $token . "\n\n" .
            "Ce code expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n" .
            "Recrutia";

        return $this->send($toEmail, $subject, $body);
    }

    private function send($toEmail, $subject, $body)
    {
        $remote = $this->encryption === "ssl"
            ? "ssl://" . $this->host
            : $this->host;

        $socket = fsockopen($remote, $this->port, $errno, $errstr, 20);

        if (!$socket) {
            error_log("SMTP connexion échouée : " . $errstr . " (" . $errno . ")");
            return false;
        }

        stream_set_timeout($socket, 20);

        try {
            $this->expect($socket, [220]);
            $this->command($socket, "EHLO localhost", [250]);

            if ($this->encryption === "tls") {
                $this->command($socket, "STARTTLS", [220]);

                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    error_log("SMTP STARTTLS impossible.");
                    fclose($socket);
                    return false;
                }

                $this->command($socket, "EHLO localhost", [250]);
            }

            $this->command($socket, "AUTH LOGIN", [334]);
            $this->command($socket, base64_encode($this->username), [334]);
            $this->command($socket, base64_encode($this->password), [235]);

            $this->command($socket, "MAIL FROM:<" . $this->fromEmail . ">", [250]);
            $this->command($socket, "RCPT TO:<" . $toEmail . ">", [250, 251]);
            $this->command($socket, "DATA", [354]);

            $headers = [
                "From: " . $this->encodeHeader($this->fromName) . " <" . $this->fromEmail . ">",
                "To: <" . $toEmail . ">",
                "Subject: " . $this->encodeHeader($subject),
                "MIME-Version: 1.0",
                "Content-Type: text/plain; charset=UTF-8",
                "Content-Transfer-Encoding: 8bit",
            ];

            $message = implode("\r\n", $headers) .
                "\r\n\r\n" .
                str_replace("\n", "\r\n", $body) .
                "\r\n.";

            $this->command($socket, $message, [250]);
            $this->command($socket, "QUIT", [221]);
            fclose($socket);

            return true;
        } catch (Exception $e) {
            error_log("SMTP erreur : " . $e->getMessage());
            fclose($socket);
            return false;
        }
    }

    private function command($socket, $command, $expectedCodes)
    {
        fwrite($socket, $command . "\r\n");
        return $this->expect($socket, $expectedCodes);
    }

    private function expect($socket, $expectedCodes)
    {
        $response = "";

        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;

            if (isset($line[3]) && $line[3] === " ") {
                break;
            }
        }

        $code = (int) substr($response, 0, 3);

        if (!in_array($code, $expectedCodes, true)) {
            throw new Exception(trim($response));
        }

        return $response;
    }

    private function encodeHeader($value)
    {
        return "=?UTF-8?B?" . base64_encode($value) . "?=";
    }
}
