<?php
session_start();
require 'config.php'; // Connessione al database

$email = $_SESSION['email'];
$is_creator = $_SESSION['is_creator'];

if ($is_creator) {
    // Recupera i dati aggiuntivi del creator
    $sql = "SELECT affidabilita FROM Creatore WHERE email_utente = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    $creatorData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($creatorData) {
        // Se l'utente è un creatore, restituisci i suoi dati
        $response = [
            'status' => 'creator',
            'affidabilita' => $creatorData['affidabilita']
        ];
    } else {
        // In caso di errore nel recupero dei dati, trattalo come non creator
        $response = ['status' => 'not_creator'];
    }
} else {
    // Se l'utente non è un creatore, mostra il modulo di richiesta
    $response = ['status' => 'not_creator'];
}

header('Content-Type: application/json');
echo json_encode($response);
?>


