<?php
session_start();
require 'config.php';
require 'log_helper.php';

header('Content-Type: application/json');

try {

    if (!isset($_SESSION['email'])) {
        throw new Exception("User not authenticated.");
    }

    $requiredFields = ['nome', 'descrizione', 'data_inserimento', 'budget', 'data_limite', 'componenti'];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $components = json_decode($_POST['componenti'], true);
    if (!is_array($components) || empty($components)) {
        throw new Exception("Invalid or empty components list.");
    }

    $name = $_POST['nome'];
    $description = $_POST['descrizione'];
    $start_date = $_POST['data_inserimento'];
    $budget = $_POST['budget'];
    $final_date = $_POST['data_limite'];
    $creator_email = $_SESSION['email'];

    $conn->beginTransaction();

    $stmt = $conn->prepare("CALL AggiungiProgettoHardware(:name, :description, :start_date, :budget, :final_date, :creator_email)");
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

    $stmtComp = $conn->prepare("INSERT INTO ProgettoComponente (nome_progetto, nome_componente, quantita, descrizione, prezzo) 
                               VALUES (:project_name, :component_name, :quantity, :description, :price)");

    foreach ($components as $component) {
        if (!isset($component['nome_componente'], $component['quantita'], $component['descrizione'], $component['prezzo'])) {
            throw new Exception("Missing required component data.");
        }

        $quantity = (int)$component['quantita'];
        $price = (float)$component['prezzo'];

        if ($quantity <= 0 || $price <= 0) {
            throw new Exception("Quantity and price must be greater than zero.");
        }

        $stmtComp->execute([
            ':project_name' => $name,
            ':component_name' => $component['nome_componente'],
            ':quantity' => $quantity,
            ':description' => $component['descrizione'],
            ':price' => $price
        ]);
    }

    // Insert images if any
    if (!empty($_FILES['immagini'])) {
        $stmtImg = $conn->prepare("INSERT INTO FotoProgetto (nome_progetto, foto) VALUES (?, ?)");
        
        foreach ($_FILES['immagini']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['immagini']['error'][$key] !== UPLOAD_ERR_OK) {
                throw new Exception("Error uploading file: " . $_FILES['immagini']['name'][$key]);
            }

            // Modify here to allow only images
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

    saveLog($mongoDb, "New hardware project created: $name by $creator_email", "Hardware Project Creation");

} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage(),
        "file_errors" => !empty($_FILES['immagini']) ? $_FILES['immagini']['error'] : null
    ]);
}
?>