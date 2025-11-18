<?php
// 連接到資料庫
$servername = "140.123.102.94";// 遠端資料庫伺服器位置
$username = "613410025"; // 資料庫帳號
$password = "bVFxhpqQO(/vh)zV"; // 資料庫密碼
$database = "613410025"; // 資料庫名稱

try {
    $conn = new PDO("mysql:host=$servername;dbname=$database", $username, $password);
    // 設置 PDO 錯誤模式，用於異常處理
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 執行查詢以獲取使用者數量
    $stmt = $conn->prepare("SELECT COUNT(*) AS userCount FROM user");
    $stmt->execute();

    // 提取查詢結果
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $userCount = $row['userCount'];
    echo  $userCount;
    // 關閉資料庫連接
    $conn = null;
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>


