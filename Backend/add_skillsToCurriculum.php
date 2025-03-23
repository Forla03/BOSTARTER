<?php
session_start();
require 'config.php';

if (!isset($_SESSION["email"])) {
    echo "Devi essere loggato per aggiungere una skill.";
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $emailUtente = $_SESSION["email"];
    $skill = $_POST["skill"];
    $livello = $_POST["level"];

    try {
        $stmt = $conn->prepare("INSERT INTO Possedimento (emailUtente, skill, livello_skill) VALUES (:email, :skill, :livello)");
        $stmt->bindParam(":email", $emailUtente);
        $stmt->bindParam(":skill", $skill);
        $stmt->bindParam(":livello", $livello);
        $stmt->execute();

        $logCollection = $mongoDb->selectCollection("logs_db");

        try{
            $logEntry = [
                'timestamp' => new MongoDB\BSON\UTCDateTime((int) (microtime(true) * 1000)),
                'message' => 'Skill added to ' .$emailUtente. ' curriculum:'  . $skill,
                'type' => 'Skill association',
            ];
            $logCollection->insertOne($logEntry);
        }
        catch (Exception $e) {
            error_log("Errore nel salvataggio del log MongoDB: " . $e->getMessage());
        }
    } catch (PDOException $e) {
        echo "Errore: " . $e->getMessage();
    }
}
?>