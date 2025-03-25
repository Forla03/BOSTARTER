<?php
session_start();
require 'config.php'; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $skill_name = $_POST["skill_name"];
    $skill_level = $_POST["skill_level"];

    try {
        // Add the skill
        $stmt = $conn->prepare("INSERT INTO CurriculumSkill (nome_skill, livello) 
                                VALUES (:skill_name, :skill_level)");
   
        $stmt->bindParam(":skill_name", $skill_name);
        $stmt->bindParam(":skill_level", $skill_level);
        $stmt->execute();

        $logCollection = $mongoDb->selectCollection("logs_db");

        $logEntry = [
            'timestamp' => new MongoDB\BSON\UTCDateTime((int) (microtime(true) * 1000)),
            'message' => 'New skill created:' .$skill_name. ', the level is '  . $skill_level,
            'type' => 'Skill creation',
        ];
        $logCollection->insertOne($logEntry);

        // Redirect to the add_skill page
        header('Location: ../Frontend/skills/add_skill.html');
    }
    catch (PDOException $e) {
        echo "Errore nell'inserimento: " . $e->getMessage();
    }
}
?>