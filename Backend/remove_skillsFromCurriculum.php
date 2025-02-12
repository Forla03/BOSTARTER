<?php
session_start();
require 'config.php';

if (!isset($_SESSION["email"])) {
    echo "Devi essere loggato per rimuovere una skill.";
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $emailUtente = $_SESSION["email"];
    $skill = $_POST["skill"];
    $livello_skill = $_POST["level"];  // Assicurati che il nome del parametro sia corretto

    try {
        $stmt = $conn->prepare("DELETE FROM Possedimento WHERE emailUtente = :emailUtente AND skill = :skill AND livello_skill = :livello_skill");

        // Associa i parametri
        $stmt->bindParam(":emailUtente", $emailUtente);
        $stmt->bindParam(":skill", $skill);
        $stmt->bindParam(":livello_skill", $livello_skill);

        // Esegui la query
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo "Skill eliminata dal tuo curriculum!";
        } else {
            echo "Nessuna skill trovata da eliminare.";
        }
    } catch (PDOException $e) {
        echo "Errore: " . $e->getMessage();
    }
}
?>

