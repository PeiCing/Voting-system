<?php
session_start();

// 检查用户是否已登录
if (!isset($_SESSION['isLoggedIn']) || !$_SESSION['isLoggedIn']) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// 数据库连接参数
$servername = "140.123.102.94";
$username = "613410025";
$password = "bVFxhpqQO(/vh)zV";
$database = "613410025";

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $database);

// 检查连接是否成功
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



// 查询投票记录
$sql = "SELECT topic_id, option_id FROM vote_records WHERE username = '" . $_SESSION['username'] . "'";
$result = $conn->query($sql);

// 构建投票记录数组
$voteRecords = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $voteRecords[] = $row;
    }
}

// 输出投票记录的 JSON 格式
echo json_encode($voteRecords);

// 关闭数据库连接
$conn->close();
?>
