<?php
session_start();
require 'config.php'; // Connessione al database

// Ricezione dati via POST
$p_nome = $_POST['nome'];
$p_descrizione = $_POST['descrizione'];
$p_data_inserimento = $_POST['data_inserimento'];
$p_budget = $_POST['budget'];
$p_data_limite = $_POST['data_limite'];
$p_email_creatore = $_SESSION['email'];

// Preparazione della query
$sql = "INSERT INTO PROGETTO (? , ?, ?, ?, ?, ?) 
        VALUES(:nome, :descrizione, :data_inserimento, :budget, :data_limite, :email_creatore)";
$stmt = $conn->prepare($sql);

// Legatura dei parametri
$stmt->bindParam(':nome', $p_nome);
$stmt->bindParam(':descrizione', $p_descrizione);
$stmt->bindParam(':data_inserimento', $p_data_inserimento);
$stmt->bindParam(':budget', $p_budget);
$stmt->bindParam(':data_limite', $p_data_limite);
$stmt->bindParam(':email_creatore', $p_email_creatore);

// Esecuzione della query
if ($stmt->execute()) {
    echo "Progetto software aggiunto con successo!";
} else {
    echo "Errore: " . $stmt->errorInfo()[2];
}
?>
