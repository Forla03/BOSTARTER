<?php
session_start();
require '../config.php'; 
require '../log_helper.php'; 

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $nome_progetto = $data['nome_progetto'] ?? null;
    $nome_profilo = $data['nome_profilo'] ?? null;
    $email_utente = $data['email_utente'] ?? null;
    $email_corrente = $_SESSION['email'] ?? null;

    if (!$nome_progetto || !$nome_profilo || !$email_utente || !$email_corrente) {
        echo json_encode(["success" => false, "message" => "Dati mancanti."]);
        exit;
    }

    try {
        // Call the stored procedure to reject the application
        $stmt = $conn->prepare("CALL RifiutaCandidatura(:p_email_candidato, :p_nome_progetto, :p_nome_profilo, :p_email_corrente)");
        $stmt->bindParam(':p_email_candidato', $email_utente);
        $stmt->bindParam(':p_nome_progetto', $nome_progetto);
        $stmt->bindParam(':p_nome_profilo', $nome_profilo);
        $stmt->bindParam(':p_email_corrente', $email_corrente);
        
        $stmt->execute();

        saveLog($mongoDb, "Applicant rejected: $email_utente", "Application");

        echo json_encode(["success" => true, "message" => "Candidatura rifiutata con successo."]);

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Metodo non consentito."]);
}
?>