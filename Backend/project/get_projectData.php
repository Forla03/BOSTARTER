<?php
session_start();
require '../config.php'; 

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['nome_progetto']) || empty($data['nome_progetto'])) {
        echo json_encode(["success" => false, "message" => "Nome progetto mancante."]);
        exit;
    }

    $nome_progetto = $data['nome_progetto'];

    try {

        // Get information from project table
        $stmt = $conn->prepare(" SELECT P.*, 
        COALESCE((SELECT SUM(importo) FROM Finanziamento WHERE nome_progetto = P.nome), 0) AS totale_finanziato
            FROM Progetto P
            WHERE P.nome = :nome_progetto");
        $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
        $stmt->execute();
        $progetto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$progetto) {
            echo json_encode(["success" => false, "message" => "Progetto non trovato."]);
            exit;
        }

        // Query to get project's comments
        $stmt = $conn->prepare("SELECT C.id, C.email_utente, C.data, C.testo, U.nickname
            FROM Commento C
            JOIN Utente U ON C.email_utente = U.email
            WHERE C.nome_progetto = :nome_progetto");
        $stmt->bindParam(':nome_progetto', $nome_progetto, PDO::PARAM_STR);
        $stmt->execute();
        $commenti = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Query to get replies for each comment

        $stmt = $conn->prepare("SELECT R.id_commento, R.email_creatore, R.testo, U.nickname
            FROM RispostaCommento R
            JOIN Creatore C ON R.email_creatore = C.email_utente
            JOIN Utente U ON C.email_utente = U.email");
        $stmt->execute();
        $risposte = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Associate replies with their respective comments
        foreach ($commenti as &$commento) {
            $commento['risposte'] = array_values(array_filter($risposte, function ($risposta) use ($commento) {
                return $risposta['id_commento'] === $commento['id'];
            }));
        }


        // Final data
        echo json_encode([
            "success" => true,
            "progetto" => $progetto,
            "commenti" => $commenti
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Metodo non consentito."]);
}
?>