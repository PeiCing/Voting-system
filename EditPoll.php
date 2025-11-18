<?php
session_start();

// 检查用户是否登录
if (!isset($_SESSION['username'])) {
    echo json_encode(array('success' => false, 'message' => '未登入'));
    exit();
}

// 检查是否收到必要的参数
if (!isset($_POST['editedTopic']) || !isset($_POST['editedTitle']) || !isset($_POST['editedCreatedTime']) || !isset($_POST['topic_id'])) {
    echo json_encode(array('success' => false, 'message' => '缺少参数'));
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
    echo json_encode(array('success' => false, 'message' => '连接失败: ' . $conn->connect_error));
    exit();
}

// 准备和过滤数据
$editedTopic = mysqli_real_escape_string($conn, $_POST['editedTopic']);
$editedTitle = mysqli_real_escape_string($conn, $_POST['editedTitle']);
$editedCreatedTime = mysqli_real_escape_string($conn, $_POST['editedCreatedTime']);
$topic_id = intval($_POST['topic_id']); // 转换为整数以保证安全

// 构建 SQL 查询语句，检查是否存在相同 Topic 和 Title 的记录
$check_duplicate_sql = "SELECT * FROM topics WHERE topic_name = '$editedTopic' AND title = '$editedTitle'";
$check_duplicate_result = $conn->query($check_duplicate_sql);
$row = $check_duplicate_result->fetch_assoc();

// 检查是否存在重复的记录
if ($check_duplicate_result->num_rows > 0) {
    if($row['id'] === $topic_id){
        // 如果存在重复的记录，返回错误消息
        $response ='相同Topic下已存在相同的Title';
        echo json_encode($response);
        exit(); // 终止脚本执行
    }
}

// 构建 SQL 查询语句
$sql = "UPDATE topics SET topic_name = ?, title = ?, created_time = ? WHERE id = ?";
$stmt = $conn->prepare($sql);

// 绑定参数
$stmt->bind_param("sssi", $editedTopic, $editedTitle, $editedCreatedTime, $topic_id);

// 执行更新操作
if ($stmt->execute()) {
    // 更新成功，获取已编辑的选项数组
    $editedOptions = array();
    if (isset($_POST['newOptions'])) {
        $editedOptions = $_POST['newOptions'];
    }

    // 更新选项
    $deleteSql = "DELETE FROM poll_options WHERE topic_id = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param("i", $topic_id);
    $deleteStmt->execute();
    $deleteStmt->close();

    if (!empty($editedOptions)) {
        $insertSql = "INSERT INTO poll_options (topic_id, item_name) VALUES (?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        foreach ($editedOptions as $option) {
            $insertStmt->bind_param("is", $topic_id, $option);
            $insertStmt->execute();
        }
        $insertStmt->close();
    }

    // 更新成功
    echo json_encode(array(
        'success' => true, 
        'message' => '更新成功',
        'editedOptions' => $editedOptions
    ));
} else {
    // 更新失败
    echo json_encode(array(
        'success' => false, 
        'message' => '更新失败: ' . $conn->error
    ));
}


// 关闭语句和连接
$stmt->close();
$conn->close();
?>
