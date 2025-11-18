<?php
session_start();

// 檢查用戶是否已登錄
if (!isset($_SESSION['isLoggedIn']) || !$_SESSION['isLoggedIn']) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// 處理 POST 請求中的資料
$requestData = json_decode(file_get_contents('php://input'), true);

// 資料庫連接資訊
$servername = "140.123.102.94";
$username = "613410025";
$password = "bVFxhpqQO(/vh)zV";
$database = "613410025";

// 建立與資料庫的連接
$conn = new mysqli($servername, $username, $password, $database);

// 檢查連接是否成功
if ($conn->connect_error) {
    die("連接失敗: " . $conn->connect_error);
}

// 構建 SQL 刪除語句
$sql = "DELETE FROM topics WHERE topic_name='" . $requestData['topicName'] . "' AND title='" . $requestData['title'] . "' AND created_time='" . $requestData['createdTime'] . "'";

// 執行 SQL 刪除語句
if ($conn->query($sql) === TRUE) {
    // 如果刪除成功，返回成功的 JSON 響應
    echo json_encode(['success' => 'Data deleted successfully']);
} else {
    // 如果刪除失敗，返回錯誤的 JSON 響應
    echo json_encode(['error' => 'Error deleting data: ' . $conn->error]);
}

// 關閉資料庫連接
$conn->close();
?>
