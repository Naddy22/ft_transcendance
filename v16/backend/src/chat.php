
<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $message = $_POST["message"];
    $user = $_SESSION["user"] ?? "Guest";

    $data = json_encode(["user" => $user, "message" => $message]);
    file_put_contents("chat.log", $data.PHP_EOL, FILE_APPEND);
}
?>
