<?php
session_start();
require 'config.php'; // Connessione già esistente al database

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verifica se l'utente è autenticato
    if (!isset($_SESSION["email"])) {
        echo json_encode(["success" => false, "message" => "Accesso non autorizzato."]);
        exit();
    }

    // Ricezione dati dal POST
    $nome_progetto = $_POST['nome'] ?? null;
    $nome_skill = $_POST["nome_skill"] ?? null;
    $livello_skill = $_POST["livello_skill"] ?? null;

    // Controlla che tutti i dati siano presenti
    if (!$nome_progetto || !$nome_skill || !$livello_skill) {
        echo json_encode(["success" => false, "message" => "Dati mancanti."]);
        exit();
    }

    try {
        // Chiamata alla stored procedure
        $stmt = $conn->prepare("CALL AggiungiSkillProgettoSoftware(:nome_progetto, :nome_skill, :livello_skill)");
        $stmt->bindParam(":nome_progetto", $nome_progetto, PDO::PARAM_STR);
        $stmt->bindParam(":nome_skill", $nome_skill, PDO::PARAM_STR);
        $stmt->bindParam(":livello_skill", $livello_skill, PDO::PARAM_INT);
        $stmt->execute();

        // Risposta di successo
        echo json_encode(["success" => true, "message" => "Skill aggiunta con successo."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
    }
}
?>
