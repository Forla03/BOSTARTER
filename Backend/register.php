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
    $isAdmin = isset($_POST["admin"]) ? 1 : 0;
    $adminCode = $_POST["adminCode"] ?? null; // Get the admin code if provided
    if ($password !== $confirmPassword) {
        echo json_encode(["success" => false, "message" => "Le password non coincidono."]);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $conn->beginTransaction();
        // Insert into the Utente table
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

        // If the user wants to be an admin, insert into Amministratore table
        if ($isAdmin) {
            $stmtAdmin = $conn->prepare("CALL AggiungiAmministratore(:email, :adminCode)");
            $stmtAdmin->bindParam(":email", $email);
            $stmtAdmin->bindParam(":adminCode", $adminCode);
            $stmtAdmin->execute();

            saveLog($mongoDb, "New admin registered: $email", "Registration");
        }

        $conn->commit();

        echo json_encode(["success" => true, "message" => "Registrazione completata con successo."]);
        exit();
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry error code for MySQL
            if (strpos($e->getMessage(), 'email') !== false) {
                echo json_encode(["success" => false, "message" => "L'email è già registrata."]);
            } elseif (strpos($e->getMessage(), 'nickname') !== false) {
                echo json_encode(["success" => false, "message" => "Il nickname è già registrato."]);
            } else {
                echo json_encode(["success" => false, "message" => "L'email o il nickname sono già registrati."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Errore nella registrazione: " . $e->getMessage()]);
        }
        exit();
    }
}
?>