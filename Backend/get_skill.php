<?php
require 'config.php'; // Connessione al database

header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT * FROM CurriculumSkill");
    $stmt->execute();
    
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($skills);
} catch (PDOException $e) {
    echo json_encode(["error" => "Errore nel recupero delle skill: " . $e->getMessage()]);
}
?>