
<?php
header("Content-Type: application/json");
require_once '../src/User.php';

$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === 'GET') {
    echo json_encode(["users" => User::getAllUsers()]);
} elseif ($request_method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data["username"])) {
        User::createUser($data["username"]);
        echo json_encode(["message" => "User created"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
    }
}
?>
