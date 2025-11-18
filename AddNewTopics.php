<?php
session_start();

// 检查用户是否登录
if (!isset($_SESSION['username'])) {
    echo "未登入";
    exit();
}

// 连接数据库
$servername = "140.123.102.94"; // 你的数据库服务器地址
$username = "613410025"; // 你的数据库用户名
$password = "bVFxhpqQO(/vh)zV"; // 你的数据库密码
$database = "613410025"; // 你的数据库名

// 建立连接
$conn = new mysqli($servername, $username, $password, $database);

// 检查连接是否成功
if ($conn->connect_error) {
    die("連接失敗ㄌ: " . $conn->connect_error);
}

// 获取表单数据
$newTopic = $_POST['newTopic']; //topics
$newTitle = $_POST['newTitle'];           // titles
$newOptions = $_POST['newOptions'];       //

// 过滤和准备数据
$newTopic = mysqli_real_escape_string($conn, $newTopic);
$newTitle = mysqli_real_escape_string($conn, $newTitle);
// 获取当前时间戳
$newCreatedTime = date('Y-m-d H:i:s');
// 在此处可以执行更多的数据验证和清理

// 构建 SQL 查询语句，检查是否存在相同 Topic 和 Title 的记录
$check_duplicate_sql = "SELECT * FROM topics WHERE topic_name = '$newTopic' AND title = '$newTitle'";
$check_duplicate_result = $conn->query($check_duplicate_sql);

// 检查是否存在重复的记录
if ($check_duplicate_result->num_rows > 0) {
    // 如果存在重复的记录，返回错误消息
    $response ='相同Topic下已存在相同的Title';
    echo json_encode($response);
    exit(); // 终止脚本执行
}
// 取得台北時間
$taipeiTime = new DateTime('now', new DateTimeZone('Asia/Taipei'));
$newCreatedTime = $taipeiTime->format('Y-m-d H:i:s');

// 构建 SQL 查询语句
$sql = "INSERT INTO topics (topic_name, title, owner, created_time) VALUES ('$newTopic', '$newTitle', '{$_SESSION['username']}','$newCreatedTime')";

// 执行查询
// 执行查询
if ($conn->query($sql) === TRUE) {
    // 获取刚插入的记录的ID
    $topic_id = $conn->insert_id;

    // 处理新选项
    foreach ($newOptions as $option) {
        $option = mysqli_real_escape_string($conn, $option);

        // 插入新选项到 poll_options 表中
        $sql_poll_options = "INSERT INTO poll_options(topic_id, item_name) VALUES ($topic_id, '$option')";
        $conn->query($sql_poll_options);
    }

    // 构建响应数据
    $response = array(
        'success' => true,
        'message' => '成功添加主题和选项',
        'newTopic' => $newTopic,
        'newTitle' => $newTitle,
        'newCreatedTime' => $newCreatedTime,
        'newOptions' => $newOptions
    );
    echo json_encode($response);
} else {
    // 构建错误响应
    $response = array(
        'success' => false,
        'message' => '添加主题和选项时出错：' . $conn->error
    );
    echo json_encode($response);
}


// 关闭数据库连接
$conn->close();
?>
