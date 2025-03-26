<?php
session_start();
require 'config.php'; 

try {
    // Get data from POST
    $name = $_POST['nome'] ?? null;
    $description = $_POST['descrizione'] ?? null;
    $start_date = $_POST['data_inserimento'] ?? null;
    $budget = $_POST['budget'] ?? null;
    $final_date = $_POST['data_limite'] ?? null;
    $creator_email = $_SESSION['email'] ?? null;
    $skills = json_decode($_POST['skills'] ?? '[]', true);

    if (!$name || !$description || !$start_date || !$budget || !$final_date || !$creator_email) {
        throw new Exception("Dati mancanti o non validi.");
    }

    $conn->beginTransaction();

    $stmt = $conn->prepare("CALL AggiungiProgettoSoftware(:name, :description, :start_date, :budget, :final_date, :creator_email)");
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":description", $description);
    $stmt->bindParam(":start_date", $start_date);
    $stmt->bindParam(":budget", $budget);
    $stmt->bindParam(":final_date", $final_date);
    $stmt->bindParam(":creator_email", $creator_email);

    if (!$stmt->execute()) {
        throw new Exception("Error executing stored procedure: " . implode(" ", $stmt->errorInfo()));
    }
    $stmt->closeCursor();

    $stmtSkills = $conn->prepare("INSERT INTO progettoskill (nome_progetto, nome_skill, livello_skill) 
                                   VALUES (:project_name, :skill_name, :skill_level)");

    foreach ($skills as $skill) {
        $skill_name = $skill['nome_skill'] ?? null;
        $skill_level = (int)($skill['livello'] ?? 0);

        if (!$skill_name || $skill_level <= 0) {
            throw new Exception("Dati skill non validi.");
        }

        $stmtSkills->execute([
            ':project_name' => $name,
            ':skill_name' => $skill_name,
            ':skill_level' => $skill_level
        ]);
    }

    // Put images if any
    if (!empty($_FILES['immagini'])) {
        $stmtImg = $conn->prepare("INSERT INTO FotoProgetto (nome_progetto, foto) VALUES (?, ?)");

        foreach ($_FILES['immagini']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['immagini']['error'][$key] !== UPLOAD_ERR_OK) {
                throw new Exception("Error uploading file: " . $_FILES['immagini']['name'][$key]);
            }

            // Check MIME-Type
            $mimeType = mime_content_type($tmpName);
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!in_array($mimeType, $allowedTypes)) {
                throw new Exception("Invalid file type: " . $_FILES['immagini']['name'][$key]);
            }

            $imageBlob = file_get_contents($tmpName);
            $stmtImg->execute([$name, $imageBlob]);
        }
    }

    $conn->commit();
    echo json_encode([
        "success" => true, 
        "message" => "Project and components added successfully",
        "uploaded_files" => !empty($_FILES['immagini']) ? count($_FILES['immagini']['name']) : 0
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>