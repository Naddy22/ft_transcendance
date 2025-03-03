<?php
// Ensure no output before headers
ob_start();

require_once '../config/config.php';

// Send correct JSON headers
header("Content-Type: application/json");

// Output response
echo json_encode(["message" => "Backend is running!"]);

// Ensure nothing extra is sent
ob_end_flush();
?>
