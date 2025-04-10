<?php
require 'config.php'; 
require 'log_helper.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $nickname = $_POST["nickname"];
    $password = $_POST["password"];
    $confirmPassword = $_POST["confirmPassword"];
    $nome = $_POST["nome"];
    $cognome = $_POST["cognome"];
    $anno_nascita = $_POST["anno_nascita"];
    $luogo_nascita = $_POST["luogo_nascita"];
    $isCreator = isset($_POST["creator"]) ? 1 : 0; // Check if the checkbox is checked
    if ($password !== $confirmPassword) {
        die("Le password non coincidono.");
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        //Insert into the Utente table
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

        saveLog($mongoDb, "New user registered: $email", "Registration");

        // If the user wants to be a creator, insert into Creatore table
        if ($isCreator) {
            $stmtCreator = $conn->prepare("INSERT INTO Creatore (email_utente) VALUES (:email)");
            $stmtCreator->bindParam(":email", $email);
            $stmtCreator->execute();

            saveLog($mongoDb, "New creator registered: $email", "Registration");
        }

        // Redirect to login page
        header('Location: ../Frontend/login/login.html');
        exit();
    } catch (PDOException $e) {
        echo "Errore nella registrazione: " . $e->getMessage();
    }
}
?>
