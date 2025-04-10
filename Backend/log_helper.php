<?php
require 'config.php';
function saveLog($mongoDb, $message, $type = 'General') {
    $logCollection = $mongoDb->selectCollection("logs_db");

    try {
        $logEntry = [
            'timestamp' => new MongoDB\BSON\UTCDateTime((int) (microtime(true) * 1000)),
            'message' => $message,
            'type' => $type,
        ];
        $logCollection->insertOne($logEntry);
    } catch (Exception $e) {
        error_log("Errore nel salvataggio del log MongoDB: " . $e->getMessage());
    }
}

?>