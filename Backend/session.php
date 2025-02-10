<?php
session_start();

$response = [
    "logged_in" => isset($_SESSION["email"]),
    "nickname" => isset($_SESSION["nickname"]) ? $_SESSION["nickname"] : null
];

header("Content-Type: application/json");
echo json_encode($response);
?>

