<?php
session_start();
require 'config.php'; 
require 'log_helper.php';

try {
    // Get data from POST
    $name = $_POST['nome'] ?? null;
    $description = $_POST['descrizione'] ?? null;
    $start_date = $_POST['data_inserimento'] ?? null;
    $budget = $_POST['budget'] ?? null;
    $final_date = $_POST['data_limite'] ?? null;
    $creator_email = $_SESSION['email'] ?? null;
    $profiles = json_decode($_POST['profili'] ?? '[]', true);

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

    $stmtProfile = $conn->prepare("INSERT INTO ProgettoProfilo (nome_progetto, nome_profilo) 
                                   VALUES (:project_name, :profile_name)");
    $stmtSkills = $conn->prepare("INSERT INTO SkillsProfilo (nome_progetto, nome_profilo, nome_skill, livello) 
                                   VALUES (:project_name, :profile_name, :skill_name, :skill_level)");

    foreach ($profiles as $profile) {
        $profileName = $profile['nome_profilo'] ?? null;
        $skills = $profile['skills'] ?? [];

        if (!$profileName) {
            throw new Exception("Profile name is missing.");
        }

        // Insert profile into ProgettoProfilo
        $stmtProfile->bindParam(":project_name", $name);
        $stmtProfile->bindParam(":profile_name", $profileName);
        if (!$stmtProfile->execute()) {
            throw new Exception("Error inserting profile: " . implode(" ", $stmtProfile->errorInfo()));
        }

        // Insert skills into SkillsProfilo
        foreach ($skills as $skill) {
            $skillName = $skill['nome_skill'] ?? null;
            $skillLevel = $skill['livello'] ?? null;
            if (!$skillName || !$skillLevel) {
                throw new Exception("Skill name or level is missing for profile: $profileName.");
            }

            $stmtSkills->bindParam(":project_name", $name);
            $stmtSkills->bindParam(":profile_name", $profileName);
            $stmtSkills->bindParam(":skill_name", $skillName);
            $stmtSkills->bindParam(":skill_level", $skillLevel);
            if (!$stmtSkills->execute()) {
                throw new Exception("Error inserting skill: " . implode(" ", $stmtSkills->errorInfo()));
            }
        }
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
        "message" => "Project and profiles added successfully",
        "uploaded_files" => !empty($_FILES['immagini']) ? count($_FILES['immagini']['name']) : 0
    ]);

    saveLog($mongoDb, "New software project created: $name by $creator_email", "Software Project Creation");

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>