<?php
session_start();
require '../config.php'; 
require '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_SESSION['email'])) {
    // Check if the user is logged in

    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['nome_progetto']) || empty($data['nome_progetto'])) {
        echo json_encode(["success" => false, "message" => "Nome progetto mancante."]);
        exit;
    }

    $nome_profilo = $data['nome_profilo'] ?? null;
    $nome_progetto = $data['nome_progetto'] ?? null;
    $email = $_SESSION['email'] ?? null;

    try {
        $stmt = $conn->prepare("CALL InviaCandidatura(:email, :nome_progetto, :nome_profilo)");
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
        $stmt->bindParam(':nome_profilo', $nome_profilo, PDO::PARAM_STR);

        $stmt->execute();

        saveLog($mongoDb, "New application sent for project $nome_progetto by $email", "Application");

        echo json_encode(["success" => true, "message" => "Candidatura inviata con successo."]);
    } catch (PDOException $e) {
        if ($e->getCode() == '45000') {
            $errorMessage = $e->getMessage();
    
            if ($errorMessage == 'SQLSTATE[45000]: <<Unknown error>>: 1644 TI_SEI_GIA_CANDIDATO') {
                echo json_encode(["success" => false, "message" => "Ti sei già candidato."]);
            } elseif ($errorMessage == 'SQLSTATE[45000]: <<Unknown error>>: 1644 SKILL_NON_SODDISFATTE') {
                echo json_encode(["success" => false, "message" => "Non hai le skills richieste."]);
            } else {
                echo json_encode(["success" => false, "message" => "Errore sconosciuto: " . $errorMessage]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Metodo non consentito."]);
}
?>