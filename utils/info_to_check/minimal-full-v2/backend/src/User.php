
<?php
require_once 'Database.php';

class User {
    public static function getAllUsers() {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function createUser($username) {
        $db = Database::connect();
        $stmt = $db->prepare("INSERT INTO users (username) VALUES (?)");
        $stmt->execute([$username]);
    }
}
?>
