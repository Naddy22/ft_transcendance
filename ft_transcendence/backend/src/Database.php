
<?php
class Database {
    private $pdo;

    public function __construct() {
        $dsn = "sqlite:../database/pong.db"; // Use SQLite for simplicity
        $this->pdo = new PDO($dsn);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getConnection() {
        return $this->pdo;
    }
}
?>
