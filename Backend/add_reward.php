<?php
session_start();
require 'config.php';
require 'log_helper.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        if (!isset($_POST['nome_progetto']) || empty($_POST['nome_progetto'])) {
            throw new Exception("Nome progetto mancante.");
        }

        $nome_progetto = $_POST['nome_progetto'];
        $rewards = $_POST['rewards'] ?? null;

        if (!isset($_POST['rewards']) || !is_array($_POST['rewards'])) {
            throw new Exception("Dati dei rewards mancanti o non validi.");
        }

        $conn->beginTransaction();
        $stmt = $conn->prepare("INSERT INTO Reward (nome_progetto, descrizione, foto) 
        VALUES (?, ?, ?)");

        foreach ($_POST['rewards'] as $index => $reward) {
            if (!isset($reward['description']) || empty($reward['description'])) {
                throw new Exception("Descrizione mancante per la ricompensa $index.");
            }

            if (!isset($_FILES['rewards']['tmp_name'][$index]['image']) || 
                $_FILES['rewards']['error'][$index]['image'] !== UPLOAD_ERR_OK) {
                throw new Exception("Errore nel caricamento dell'immagine per la ricompensa $index.");
            }

            $descrizione = $reward['description'];
            $tmpName = $_FILES['rewards']['tmp_name'][$index]['image'];
            $foto = file_get_contents($tmpName);
            $fileSize = filesize($tmpName);

            $stmt->execute([
                $nome_progetto,
                $descrizione,
                $foto
            ]);
        }
        $stmt->closeCursor();
        $conn->commit();

        saveLog($mongoDb, "New reward added for project $nome_progetto", "Reward");

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        error_log("Errore nell'inserimento: " . $e->getMessage());
    }
}
?>