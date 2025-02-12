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

        echo "Skill aggiunta al tuo curriculum!";
    } catch (PDOException $e) {
        echo "Errore: " . $e->getMessage();
    }
}
?>