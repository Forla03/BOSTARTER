<?php
session_start();
require 'config.php'; // Connessione al database

$email = $_SESSION['email'];

// Controlla se l'utente è un creatore
$sql = "SELECT * FROM Creatore WHERE email_utente = :email";
$stmt = $conn->prepare($sql);
$stmt->bindParam(":email", $email);
$stmt->execute();  
$creatore = $stmt->fetch();

if ($creatore) {
    // Se l'utente è un creatore, mostra il menu di creazione
    $response = [
        'status' => 'creator',
        'nr_progetti' => $creatore['nr_progetti'],
        'affidabilita' => $creatore['affidabilita']
    ];
} else {
    // Se l'utente non è un creatore, mostra il modulo di richiesta
    $response = ['status' => 'not_creator'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>

