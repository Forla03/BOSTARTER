<?php
session_start();
require 'config.php'; // Connessione al database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];
    $securityCode = $_POST["securityCode"];

    try {
        // Controlla se l'utente esiste come amministratore
        $stmt = $conn->prepare("
            SELECT Utente.*, Amministratore.codice_sicurezza
            FROM Utente, Amministratore
            WHERE Utente.email = Amministratore.email_utente AND Utente.email = :email
        ");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        $utente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($utente) {
            if (password_verify($password, $utente["password"])) {
                if ($utente["codice_sicurezza"] == $securityCode) {
                    // Login riuscito
                    $_SESSION["email"] = $utente["email"];
                    $_SESSION["nickname"] = $utente["nickname"];
                    $_SESSION["is_admin"] = true; // Salva il ruolo
                    header("Location: ../Frontend/home/home.php"); // Reindirizza alla home
                    exit();
                } else {
                    echo "Codice di sicurezza errato.";
                }
            } else {
                echo "Password errata.";
            }
        } else {
            echo "Email non trovata o non è un amministratore.";
        }
    } catch (PDOException $e) {
        echo "Errore nel login: " . $e->getMessage();
    }
}
?>
