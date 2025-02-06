<?php
$env = parse_ini_file(__DIR__ . '/../.env', true);

define('DB_PATH', $env['DB_PATH'] ?? '/database/db.sqlite');
?>