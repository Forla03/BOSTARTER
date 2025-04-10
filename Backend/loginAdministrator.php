<?php
session_start();
require 'config.php'; // Connection to the database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];
    $securityCode = $_POST["securityCode"];

    try {
        // Check if the user is an administrator
        $stmt = $conn->prepare("
            SELECT Utente.*, Amministratore.codice_sicurezza
            FROM Utente
            INNER JOIN Amministratore ON Utente.email = Amministratore.email_utente
            WHERE Utente.email = :email
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
                    $_SESSION["is_admin"] = true; //Save the admin status

                    // Check if the user is a creator
                    $sql = "SELECT * FROM Creatore WHERE email_utente = :email";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(":email", $email);
                    $stmt->execute();
                    $creatore = $stmt->fetch(PDO::FETCH_ASSOC);

                    $_SESSION["is_creator"] = $creatore ? true : false;

                    header("Location: /index.php"); 
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
