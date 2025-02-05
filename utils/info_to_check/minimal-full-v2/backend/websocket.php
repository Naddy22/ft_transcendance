<?php
error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

$host = "0.0.0.0";
$port = 8081;

$serverSocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($serverSocket, SOL_SOCKET, SO_REUSEADDR, 1);
socket_bind($serverSocket, $host, $port);
socket_listen($serverSocket);

$clients = [];
$paddle1 = ["x" => 10, "y" => 90, "width" => 10, "height" => 50];
$paddle2 = ["x" => 280, "y" => 90, "width" => 10, "height" => 50];
$ball = ["x" => 150, "y" => 100, "dx" => 3, "dy" => 3, "radius" => 5];
$scores = ["player1" => 0, "player2" => 0];

echo "WebSocket Server started on ws://$host:$port\n";

while (true) {
    $changed = $clients;
    $changed[] = $serverSocket;
    socket_select($changed, $write, $except, 0, 10);

    if (in_array($serverSocket, $changed)) {
        $clientSocket = socket_accept($serverSocket);
        $clients[] = $clientSocket;
        unset($changed[array_search($serverSocket, $changed)]);
    }

    foreach ($changed as $client) {
        $data = @socket_read($client, 1024);
        if ($data === false) {
            unset($clients[array_search($client, $clients)]);
            continue;
        }

        $message = json_decode(trim($data), true);
        if ($message) {
            if ($message["type"] == "paddle") {
                if ($message["player"] == 1) $paddle1["y"] = $message["y"];
                else if ($message["player"] == 2) $paddle2["y"] = $message["y"];

                broadcast(["type" => "paddle", "player" => $message["player"], "y" => $message["y"]], $clients, $client);
            }
        }
    }

    // Move Ball
    $ball["x"] += $ball["dx"];
    $ball["y"] += $ball["dy"];

    // Bounce off top/bottom walls
    if ($ball["y"] <= 0 || $ball["y"] >= 200) $ball["dy"] *= -1;

    // Paddle Collision (Player 1)
    if ($ball["x"] - $ball["radius"] <= $paddle1["x"] + $paddle1["width"] &&
        $ball["y"] >= $paddle1["y"] &&
        $ball["y"] <= $paddle1["y"] + $paddle1["height"]) {
        $ball["dx"] *= -1; // Reverse direction
        $ball["x"] = $paddle1["x"] + $paddle1["width"] + $ball["radius"]; // Prevent sticking
    }

    // Paddle Collision (Player 2)
    if ($ball["x"] + $ball["radius"] >= $paddle2["x"] &&
        $ball["y"] >= $paddle2["y"] &&
        $ball["y"] <= $paddle2["y"] + $paddle2["height"]) {
        $ball["dx"] *= -1; // Reverse direction
        $ball["x"] = $paddle2["x"] - $ball["radius"]; // Prevent sticking
    }

    // Scoring System
    if ($ball["x"] <= 0) {
        $scores["player2"] += 1;
        resetBall();
    } elseif ($ball["x"] >= 300) {
        $scores["player1"] += 1;
        resetBall();
    }

    // Broadcast ball position & scores
    broadcast(["type" => "update", "ball" => $ball, "scores" => $scores], $clients);
}

function broadcast($message, $clients, $exclude = null) {
    $msg = json_encode($message);
    foreach ($clients as $client) {
        if ($client !== $exclude) {
            socket_write($client, $msg . "\n");
        }
    }
}

function resetBall() {
    global $ball;
    $ball["x"] = 150;
    $ball["y"] = 100;
    $ball["dx"] = rand(0, 1) ? 3 : -3;
    $ball["dy"] = rand(0, 1) ? 3 : -3;
}
?>
