<?php
session_start(); // 開始會話

// 檢查用戶是否已經登錄
if (!isset($_SESSION['username'])) {
    // 如果用戶未登錄，請返回錯誤或執行其他操作
    echo json_encode(array("error" => "User is not logged in"));
    exit(); // 終止腳本執行
}

// 獲取當前用戶的用戶名
$currentUsername = $_SESSION['username'];

// 连接数据库
$servername = "140.123.102.94"; // 你的数据库服务器地址
$username = "613410025"; // 你的数据库用户名
$password = "bVFxhpqQO(/vh)zV"; // 你的数据库密码
$database = "613410025"; // 你的数据库名
// 创建连接
$conn = new mysqli($servername, $username, $password, $database);

// 检查连接
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// 查询获取主题数据的SQL语句
$sql = "SELECT id, topic_name, title, created_time FROM topics WHERE owner = '$currentUsername'";

// 执行查询
$result = $conn->query($sql);

// 创建一个空数组，用于存储主题数据
$topics = array();

// 如果查询结果不为空
if ($result->num_rows > 0) {
    // 遍历查询结果，并将每一行数据存储到数组中
    while($row = $result->fetch_assoc()) {
        $topics[] = $row;
    }
}

// 输出主题数据的JSON格式
echo json_encode(array("topics" => $topics));

// 关闭数据库连接
$conn->close();
?>
