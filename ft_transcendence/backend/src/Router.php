
<?php
class Router {
    public function handleRequest() {
        $uri = trim($_SERVER['REQUEST_URI'], '/');

        switch ($uri) {
            case '':
                echo json_encode(["message" => "Welcome to Pong Backend!"]);
                break;
            default:
                http_response_code(404);
                echo json_encode(["error" => "Not Found"]);
                break;
        }
    }
}
?>
