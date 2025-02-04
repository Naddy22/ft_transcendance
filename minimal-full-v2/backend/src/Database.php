
<?php
class Database {
    private static $connection = null;

    public static function connect() {
        if (self::$connection === null) {
            self::$connection = new PDO("mysql:host=db;dbname=ft_transcendence", "root", "password");
            self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        return self::$connection;
    }
}
?>
