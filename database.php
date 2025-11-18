<?php
$servername = "localhost"; // 資料庫伺服器位置
$username = "613410025"; // 資料庫帳號
$password = "bVFxhpqQO(/vh)zV"; // 資料庫密碼
$database = "613410025"; // 資料庫名稱

// 建立連線
$conn = new mysqli($servername, $username, $password, $database);

// 檢查連線是否成功
if ($conn->connect_error) {
    die("連線失敗: " . $conn->connect_error);
}
?>
