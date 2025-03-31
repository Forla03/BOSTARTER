<?php
require '../config.php';

$data = json_decode(file_get_contents("php://input"), true);
$nome_progetto = $data['nome_progetto'] ?? null;

if ($nome_progetto === null) {
    echo json_encode(['error' => 'Il nome del progetto è richiesto.']);
    exit;
}

try {
    // Query to get project's rewards
    $stmt = $conn->prepare("SELECT * FROM Reward WHERE nome_progetto = :nome_progetto");
    $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
    $stmt->execute();
    $rewards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rewards as &$reward) {
        if (!empty($reward['foto'])) {
            $reward['foto'] = "data:image/jpeg;base64," . base64_encode($reward['foto']);
        }
    }

    echo json_encode($rewards);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Errore durante l\'esecuzione della query: ' . $e->getMessage()]);
}
?>