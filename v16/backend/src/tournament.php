
<?php
session_start();
include "database.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_SESSION["user"] ?? "Guest";

    $stmt = $conn->prepare("INSERT INTO tournaments (username) VALUES (?)");
    $stmt->bind_param("s", $username);
    $stmt->execute();

    echo "You are registered in the tournament!";
}
?>
