<?php
session_start();
require 'config.php'; 

try {
    // Query used to get project information from a view
    $stmt = $conn->prepare("SELECT * FROM View_general_project");
    $stmt->execute();

    // Fetch all results as an associative array
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set the response header to JSON
    header('Content-Type: application/json');

    // Return the results as a JSON response
    echo json_encode([
        "success" => true,
        "data" => $results
    ]);

} catch (PDOException $e) {
    // Return an error response in JSON format
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>