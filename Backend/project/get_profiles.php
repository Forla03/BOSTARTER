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

        // Get the profiles data
        $stmt = $conn->prepare("
        SELECT 
            pp.nome_profilo,
            sp.nome_skill,
            sp.livello
        FROM ProgettoProfilo pp
        LEFT JOIN SkillsProfilo sp 
            ON pp.nome_profilo = sp.nome_profilo 
            AND pp.nome_progetto = sp.nome_progetto
        WHERE pp.nome_progetto = ?
        ");
        $stmt->execute([$nome_progetto]);

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Organize the data into a structured array
        $profiles = [];
        foreach ($result as $row) {
            $profileName = $row['nome_profilo'];
            if (!isset($profiles[$profileName])) {
                $profiles[$profileName] = [
                    'nome_profilo' => $profileName,
                    'skills' => []
                ];
            }
            if ($row['nome_skill'] && $row['livello']) {
                $profiles[$profileName]['skills'][] = [
                    'nome_skill' => $row['nome_skill'],
                    'livello' => $row['livello']
                ];
            }
        }

        echo json_encode(["success" => true, "profiles" => array_values($profiles)]);
        
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Errore: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Metodo non consentito."]);
}
?>