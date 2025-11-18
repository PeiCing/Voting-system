<?php
session_start(); // 开始会话
// 检查是否传递了 numEntries 参数
if (!isset($_POST['numEntries'])) {
    echo json_encode(array("error" => "numEntries parameter is not set"));
    exit(); // 终止脚本执行
}

// 获取 POST 请求中的 numEntries 参数值
$numEntries = $_POST['numEntries'];

// 在这里进行进一步的处理，例如连接数据库、执行查询等

// 输出 numEntries 参数值，仅用于测试
echo json_encode(array("numEntries" => $numEntries));

// 检查用户是否已经登录
if (!isset($_SESSION['username'])) {
    // 如果用户未登录，返回错误信息
    echo json_encode(array("error" => "User is not logged in"));
    exit(); // 终止脚本执行
}

// 获取当前用户的用户名
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

// 修改SQL查询语句，根据numEntries参数限制查询结果的数量
$sql = "SELECT id, topic_name, title, created_time FROM topics WHERE owner = '$currentUsername' LIMIT $numEntries";

// 执行查询
$result = $conn->query($sql);

// 创建一个空数组，用于存储主题数据
$topics = array();

// 如果查询结果不为空
if ($result->num_rows > 0) {
    // 遍历查询结果，并将每一行数据存储到数组中
    while ($row = $result->fetch_assoc()) {
        $topics[] = $row;
    }
}

// 输出主题数据的 JSON 格式
echo json_encode(array("topics" => $topics));

// 关闭数据库连接
$conn->close();
?>
