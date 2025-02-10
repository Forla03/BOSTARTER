<?php
session_start();
require 'config.php'; // Connessione al database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $skill_name = $_POST["skill_name"];
    $skill_level = $_POST["skill_level"];

    try {
        // Inserisce la skill
        $stmt = $conn->prepare("INSERT INTO CurriculumSkill (nome_skill, livello) 
                                VALUES (:skill_name, :skill_level)");
   
        $stmt->bindParam(":skill_name", $skill_name);
        $stmt->bindParam(":skill_level", $skill_level);
        $stmt->execute();

        header('Location: ../../Frontend/skills/add_skill.html');

        }
    catch (PDOException $e) {
        echo "Errore nell'inserimento: " . $e->getMessage();
    }
}
?>