
<?php
$servername = "database";
$username = "root";
$password = "rootpassword";
$dbname = "pong";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
