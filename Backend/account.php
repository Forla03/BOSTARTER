<?php
session_start();
require 'config.php'; //Connection to the database

try {
    // Query used to get user information from a view
    $email = $_SESSION['email'];
    $stmt = $conn->prepare("SELECT * FROM View_user_features WHERE email = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    // Get the informations
    $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    if ($userInfo) {
        // Show the informations in JSON format
        echo json_encode([
            "success" => true,
            "user" => $userInfo
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No data found for this user."
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>