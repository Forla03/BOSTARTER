<?php
session_start();
require 'config.php';
require 'log_helper.php';

if (!isset($_SESSION["email"])) {
    echo "Devi essere loggato per rimuovere una skill.";
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $emailUtente = $_SESSION["email"];
    $skill = $_POST["skill"];
    $livello_skill = $_POST["level"];  
    try {
        $stmt = $conn->prepare("DELETE FROM Possedimento WHERE emailUtente = :emailUtente AND skill = :skill AND livello_skill = :livello_skill");

        $stmt->bindParam(":emailUtente", $emailUtente);
        $stmt->bindParam(":skill", $skill);
        $stmt->bindParam(":livello_skill", $livello_skill);

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo "Skill eliminata dal tuo curriculum!";
        } else {
            echo "Nessuna skill trovata da eliminare.";
        }

        saveLog($mongoDb, "Skill removed from $emailUtente's curriculum: $skill", "Skill assocation");

    } catch (PDOException $e) {
        echo "Errore: " . $e->getMessage();
    }
}
?>

