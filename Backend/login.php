<?php
session_start();
require 'config.php'; // Connessione al database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    try {
        // Controlla se l'utente esiste
        $stmt = $conn->prepare("SELECT * FROM Utente WHERE email = :email");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        $utente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($utente && password_verify($password, $utente["password"])) {
            $_SESSION["email"] = $utente["email"];
            $_SESSION["nickname"] = $utente["nickname"];

            // Controlla se l'utente è un creator
            $sql = "SELECT * FROM Creatore WHERE email_utente = :email";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            $creatore = $stmt->fetch(PDO::FETCH_ASSOC);

            // Se esiste nella tabella Creatore, è un creator
            $_SESSION["is_creator"] = $creatore ? true : false;

            header("Location: ../Frontend/home/home.php"); // Reindirizza alla home
            exit();
        } else {
            echo "Email o password errati.";
        }
    } catch (PDOException $e) {
        echo "Errore nel login: " . $e->getMessage();
    }
}
?>

