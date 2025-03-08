<?php
require 'config.php'; // Connessione al database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $nickname = $_POST["nickname"];
    $password = $_POST["password"];
    $confirmPassword = $_POST["confirmPassword"];
    $nome = $_POST["nome"];
    $cognome = $_POST["cognome"];
    $anno_nascita = $_POST["anno_nascita"];
    $luogo_nascita = $_POST["luogo_nascita"];

    // Controllo se le password coincidono
    if ($password !== $confirmPassword) {
        die("Le password non coincidono.");
    }

    // Hash della password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Query per inserire l'utente
        $stmt = $conn->prepare("INSERT INTO Utente (email, nickname, password, nome, cognome, anno_nascita, luogo_nascita) 
                                VALUES (:email, :nickname, :password, :nome, :cognome, :anno_nascita, :luogo_nascita)");
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":nickname", $nickname);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":nome", $nome);
        $stmt->bindParam(":cognome", $cognome);
        $stmt->bindParam(":anno_nascita", $anno_nascita, PDO::PARAM_INT);
        $stmt->bindParam(":luogo_nascita", $luogo_nascita);
        $stmt->execute();

        header('Location: ../Frontend/login/login.html');
        exit();
    } catch (PDOException $e) {
        echo "Errore nella registrazione: " . $e->getMessage();
    }
}
?>

