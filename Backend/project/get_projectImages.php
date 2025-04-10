<?php
require '../config.php';

$data = json_decode(file_get_contents("php://input"), true);
$nome_progetto = $data['nome_progetto'] ?? null;

if ($nome_progetto === null) {
    echo json_encode(['error' => 'Il nome del progetto è richiesto.']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT foto FROM FotoProgetto WHERE nome_progetto = :nome_progetto");
    $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
    $stmt->execute();
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $encodedImages = [];

    foreach ($images as $img) {
        $encodedImages[] = base64_encode($img['foto']);
    }

    echo json_encode(['images' => $encodedImages]);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Errore durante l\'esecuzione della query: ' . $e->getMessage()]);
}
?>
