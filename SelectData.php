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

// 構建 SQL 查詢語句
$sql = "SELECT t.id, t.topic_name, t.title, t.created_time, GROUP_CONCAT(p.item_name) AS options 
        FROM topics t 
        LEFT JOIN poll_options p ON t.id = p.topic_id 
        WHERE t.topic_name = '" . $requestData['topicName'] . "' AND t.title = '" . $requestData['title'] . "'
        GROUP BY t.id, t.topic_name, t.title";

// 執行 SQL 查詢語句
$result = $conn->query($sql);

// 檢查查詢結果是否存在
if ($result->num_rows > 0) {
    // 将查询结果转换为关联数组
    $row = $result->fetch_assoc();

    // 将查询结果及 topic_id 返回给前端
    echo json_encode([
        'topicName' => $row['topic_name'],
        'title' => $row['title'],
        'topicId' => $row['id'], // 将 topic_id 返回给前端
        'createdTime' => $row['created_time'], // 将 created_time 返回给前端
        'options' => explode(',', $row['options']) // 假设选项是以逗号分隔的字符串，将其转换为数组
    ]);
} else {
    // 如果查询结果不存在，返回错误消息
    echo json_encode(['error' => 'No data found']);
}



// 關閉資料庫連接
$conn->close();
?>
