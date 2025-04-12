<?php
session_start();
require '../config.php'; 

try {
    // Query used to get user accepted applications
    $email = $_SESSION['email'];
    $stmt = $conn->prepare("CALL GetUserApplications(?)");
    $stmt->bindParam(1, $email, PDO::PARAM_STR); 
    $stmt->execute();

    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $applications
    ]);
   
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>