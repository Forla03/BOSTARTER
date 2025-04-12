<?php
session_start();
require '../config.php'; // Connection to the database

try {
    // Query used to get user rewards 
    $email = $_SESSION['email'];
    $stmt = $conn->prepare("CALL GetUserRewards(:email)"); // Rimuovi la duplicazione
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    $rewards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rewards as &$reward) {
        if (isset($reward['FotoReward'])) {
            $reward['FotoReward'] = base64_encode($reward['FotoReward']);
        }
    }

    echo json_encode([
        "success" => true,
        "data" => $rewards
    ]);
   
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>