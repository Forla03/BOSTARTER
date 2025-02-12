<?php
session_start();
require 'config.php';

$email = $_SESSION['email'];

// Controlla se l'utente è già un creatore
$sql = "SELECT email_utente FROM Creatore_enrollement WHERE email_utente = :email";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$creatore = $stmt->fetch();

if ($creatore) {
    echo json_encode(['status' => 'error', 'message' => 'Sei già un creatore.']);
    exit();
}


?>
