<?php
require '../config.php';
session_start();
try {
    $conn->beginTransaction();
    $email = $_SESSION["email"] ?? null;
    $date = date('Y-m-d'); // Current date
    // Get data from POST
    $data = json_decode(file_get_contents("php://input"), true);
    $nome_progetto = $data['nome_progetto'] ?? null;
    $importo = $data['importo'] ?? null;
    $id_reward = $data['id_reward'] ?? null;


    if (!$nome_progetto || !$importo || !$id_reward) {
        throw new Exception("Dati mancanti per effettuare la donazione.");
    }

    // Call the stored procedure to insert the donation
    $stmt = $conn->prepare("CALL FinanziaProgetto(:email, :nome_progetto, :importo, :data, :id_reward)");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
    $stmt->bindParam(':importo', $importo, PDO::PARAM_STR);
    $stmt->bindParam(':data', $date, PDO::PARAM_STR);
    $stmt->bindParam(':id_reward', $id_reward, PDO::PARAM_INT);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Donation successful",
    ]);

    // Save log on MongoDB
    $logCollection = $mongoDb->selectCollection("logs_db");
    try {
        $logEntry = [
            'timestamp' => new MongoDB\BSON\UTCDateTime((int) (microtime(true) * 1000)),
            'message' => 'New donation to project: ' . $nome_progetto,
            'type' => 'Donation',
        ];
        $logCollection->insertOne($logEntry);
    } catch (Exception $e) {
        error_log("Errore nel salvataggio del log MongoDB: " . $e->getMessage());
    }

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>