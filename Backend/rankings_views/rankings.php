<?php
session_start();
require '../config.php'; 

header('Content-Type: application/json');

try {  
    $rankings = [];

    // Query for View_top_creators
    $stmt = $conn->prepare("SELECT nickname, affidabilita FROM View_top_creators");
    $stmt->execute();
    $topCreators = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $rankings["top_creators"] = $topCreators;

    // Query for View_progetti_vicini_completamento
    $stmt = $conn->prepare("
        SELECT NomeProgetto, Descrizione, Budget, TotaleFinanziato, Differenza 
        FROM View_progetti_vicini_completamento
    ");
    $stmt->execute();
    $projectsNearCompletion = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $rankings["near_completion"] = $projectsNearCompletion;

    // Query for View_top_funders
    $stmt = $conn->prepare("SELECT nickname, TotaleFinanziato FROM View_top_funders");
    $stmt->execute();
    $topFunders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $rankings["top_funders"] = $topFunders;

    echo json_encode(["success" => true, "rankings" => $rankings]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
}
?>