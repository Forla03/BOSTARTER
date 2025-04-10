<?php
session_start();
require 'config.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    try {
        $stmt = $conn->prepare("SELECT * FROM Utente WHERE email = :email");
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        $utente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($utente && password_verify($password, $utente["password"])) {
            $_SESSION["email"] = $utente["email"];
            $_SESSION["nickname"] = $utente["nickname"];

            // Check if the user is a creator
            $sql = "SELECT * FROM Creatore WHERE email_utente = :email";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            $creatore = $stmt->fetch(PDO::FETCH_ASSOC);

            $_SESSION["is_creator"] = $creatore ? true : false;

            header("Location: /index.php"); // Redirect to the home
            exit();
        } else {
            echo "Email o password errati.";
        }
    } catch (PDOException $e) {
        echo "Errore nel login: " . $e->getMessage();
    }
}
?>

