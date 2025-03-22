<?php
session_start();
require 'config.php'; 

try {
    $email = $_SESSION['email'];
    
    $stmt = $conn->prepare("SELECT * FROM View_user_features WHERE email = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    
    // Fetch the data
    $userInfo = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (empty($userInfo)) {
            // Set general user info once
            $userInfo = [
                "email" => $row['email'],
                "nickname" => $row['nickname'],
                "nome" => $row['nome'],
                "cognome" => $row['cognome'],
                "anno_nascita" => $row['anno_nascita'],
                "luogo_nascita" => $row['luogo_nascita'],
                "skills" => []
            ];
        }
        
        // Add every skill to the skills array
        $userInfo['skills'][] = [
            "nome_skill" => $row['nome_skill'],
            "livello_skill" => $row['livello_skill']
        ];
    }
    
    header('Content-Type: application/json');
    if (!empty($userInfo)) {
        echo json_encode(["success" => true, "user" => $userInfo]);
    } else {
        echo json_encode(["success" => false, "message" => "No data found for this user."]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "An error occurred: " . $e->getMessage()
    ]);
}
?>
