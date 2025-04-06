<?php
session_start();
require '../config.php'; 

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['nome_progetto']) || empty($data['nome_progetto'])) {
        echo json_encode(["success" => false, "message" => "Nome progetto mancante."]);
        exit;
    }

    $nome_progetto = $data['nome_progetto'] ?? null;
    $nome_profilo = $data['nome_profilo'] ?? null;

    try {

        // Get information from applicants table
        $stmt = $conn->prepare(" SELECT C.*
            FROM Candidatura C
            WHERE C.nome_progetto = :nome_progetto AND  nome_profilo = :nome_profilo AND C.accettata = false");
        $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
        $stmt->bindParam(':nome_profilo', $nome_profilo, PDO::PARAM_STR);
        $stmt->execute();
        $applicants = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$applicants) {
            echo json_encode(["success" => false, "message" => "Nessuna candidatura trovata."]);
            exit;
        }
        
        echo json_encode([
            "success" => true,
            "candidature" => $applicants,
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Metodo non consentito."]);
}
?>