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
    $isCreator = isset($_POST["creator"]) ? 1 : 0; // Controllo se la checkbox è selezionata

    // Controllo se le password coincidono
    if ($password !== $confirmPassword) {
        die("Le password non coincidono.");
    }

    // Hash della password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        // Inserimento nella tabella Utente
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

        $logCollection = $mongoDb->selectCollection("logs_db");

        try {
            $logEntry = [
                'timestamp' => new MongoDB\BSON\UTCDateTime((int) (microtime(true) * 1000)),
                'message' => 'New user registered: ' . $email,
                'type' => 'Registration',
            ];
            $logCollection->insertOne($logEntry);
        } catch (Exception $e) {
            error_log("Errore nel salvataggio del log MongoDB: " . $e->getMessage());
        }

        // Se l'utente vuole essere un creator, lo aggiungiamo alla tabella Creator
        if ($isCreator) {
            $stmtCreator = $conn->prepare("INSERT INTO Creatore (email_utente) VALUES (:email)");
            $stmtCreator->bindParam(":email", $email);
            $stmtCreator->execute();

            $logEntry = [
                'timestamp' => new MongoDB\BSON\UTCDateTime(),
                'message' => 'New creator registered: ' . $email,
                'type' => 'Registration',
            ];
            $mongoDb->register_logs->insertOne($logEntry);
        }

        // Reindirizzamento alla pagina di login
        header('Location: ../Frontend/login/login.html');
        exit();
    } catch (PDOException $e) {
        echo "Errore nella registrazione: " . $e->getMessage();
    }
}
?>
