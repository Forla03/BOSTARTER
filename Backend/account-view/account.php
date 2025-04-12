<?php
session_start();
require '../config.php'; // Connection to the database

try {
    // Query used to get user information from a view
    $email = $_SESSION['email'];
    $is_creator = $_SESSION['is_creator'];
    $stmt = $conn->prepare("SELECT * FROM View_user_features WHERE email = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    // Get the user information
    $userInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        "success" => true,
        "user" => $userInfo
    ];

    // If the user is a creator, fetch their projects
    if ($is_creator) {
        // Fetch software projects
        $softwareStmt = $conn->prepare("CALL GetSoftwareProjects(:email)");
        $softwareStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $softwareStmt->execute();
        $softwareProjects = $softwareStmt->fetchAll(PDO::FETCH_ASSOC);
        $softwareStmt->closeCursor(); // Close the cursor to free the connection

        // Fetch hardware projects
        $hardwareStmt = $conn->prepare("CALL GetHardwareProjects(:email)");
        $hardwareStmt->bindParam(':email', $email, PDO::PARAM_STR);
        $hardwareStmt->execute();
        $hardwareProjects = $hardwareStmt->fetchAll(PDO::FETCH_ASSOC);
        $hardwareStmt->closeCursor(); // Close the cursor to free the connection

        // Add projects to the response
        $response["projects"] = [
            "software" => $softwareProjects,
            "hardware" => $hardwareProjects
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>