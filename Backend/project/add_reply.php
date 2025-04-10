<?php
session_start();
require '../config.php'; 
require '../log_helper.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "error" => "Metodo non consentito"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['email'])) {
    echo json_encode(["success" => false, "error" => "Utente non autenticato"]);
    exit;
}

if (!isset($data['id_commento']) || !isset($data['testo'])) {
    echo json_encode(["success" => false, "error" => "Dati mancanti"]);
    exit;
}

$email = $_SESSION['email'];
$id_commento = $data['id_commento'];
$testo = $data['testo'];

try {
    $stmt = $conn->prepare("CALL InserisciRispostaCommento(?, ?, ?)");
    $stmt->execute([$id_commento, $email, $testo]);

    saveLog($mongoDb, "New reply added to comment ID $id_commento by $email", "Reply");

    echo json_encode(["success" => true, "username" => $_SESSION['nickname']]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
exit;
?>