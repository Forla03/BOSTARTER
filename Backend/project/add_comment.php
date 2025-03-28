<?php
session_start();
require '../config.php'; 

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "error" => "Metodo non consentito"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['testo'], $data['nome_progetto'], $data['data'])) {
    echo json_encode(["success" => false, "error" => "Dati mancanti"]);
    exit;
}

if (!isset($_SESSION['email'])) {
    echo json_encode(["success" => false, "error" => "Utente non autenticato"]);
    exit;
}

$text = trim($data['testo']);
$name = trim($data['nome_progetto']);
$email = $_SESSION['email'];
$date = trim($data['data']);

try {
    $stmt = $conn->prepare("CALL InserisciCommento(?, ?, ?, ?)");   
    $stmt->bindValue(1, $email, PDO::PARAM_STR);
    $stmt->bindValue(2,$name, PDO::PARAM_STR);
    $stmt->bindValue(3,$date, PDO::PARAM_STR);
    $stmt->bindValue(4,$text, $text, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode(["success" => true, "username" => $_SESSION['nickname']]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
exit;
?>
