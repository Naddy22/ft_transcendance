
<!-- <?php
$server = stream_socket_server("tcp://0.0.0.0:8080", $errno, $errstr);
if (!$server) die("$errstr ($errno)");

$clients = [];

while ($client = @stream_socket_accept($server)) {
    stream_set_blocking($client, false);
    $clients[] = $client;

    foreach ($clients as $c) {
        fwrite($c, json_encode(["message" => "New player connected"]));
    }
}
?> -->

<!-- This WebSocket server will handle real-time game state updates, chat, and matchmaking. -->

<?php
error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

$host = "0.0.0.0";
$port = 8080;
$clients = [];

$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_bind($socket, $host, $port);
socket_listen($socket);

echo "WebSocket Server Started at ws://$host:$port\n";

while (true) {
    $changed = $clients;
    $changed[] = $socket;
    socket_select($changed, $null, $null, 0, 10);

    if (in_array($socket, $changed)) {
        $client = socket_accept($socket);
        $clients[] = $client;
        socket_getpeername($client, $ip);
        echo "New connection from $ip\n";
        unset($changed[array_search($socket, $changed)]);
    }

    foreach ($changed as $client) {
        $input = socket_read($client, 1024);
        if ($input === false) {
            socket_close($client);
            unset($clients[array_search($client, $clients)]);
            continue;
        }

        foreach ($clients as $send_client) {
            if ($send_client != $client) {
                socket_write($send_client, $input, strlen($input));
            }
        }
    }
}
socket_close($socket);
?>
