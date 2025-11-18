<?php
session_start();

// 检查用户是否已登录
if (!isset($_SESSION['isLoggedIn']) || !$_SESSION['isLoggedIn']) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// 處理 POST 請求
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 從請求主體中解析 JSON 數據
    $postData = json_decode(file_get_contents("php://input"), true);
    // 確保 topicId 和 username 參數存在
    if (!isset($postData['topicId']) || !isset($postData['username'])) {
        echo json_encode(['error' => 'Missing parameters']);
        exit;
    }

    // 连接到数据库
    $servername = "140.123.102.94";
    $dbUsername = "613410025";
    $dbPassword = "bVFxhpqQO(/vh)zV";
    $database = "613410025";

    $conn = new mysqli($servername, $dbUsername, $dbPassword, $database);

    // 检查数据库连接是否成功
    if ($conn->connect_error) {
        echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
        exit;
    }

    // 获取当前用户的用户名
    $username = $_SESSION['username'];

    // 查询该用户是否已经投过某个 topic_id 的票
    $topicIds = [];
    $userVotes = [];

    $sql = "SELECT DISTINCT topic_id FROM vote_records WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $topicIds[] = $row['topic_id'];
        }
    }

    // 查询该用户投票的详细情况
    $sql = "SELECT topic_id, option_id FROM vote_records WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $userVotes[] = ['topic_id' => $row['topic_id'], 'option_id' => $row['option_id']];
        }
    }

    // 关闭数据库连接
    $conn->close();

    // 返回 JSON 格式的数据
    echo json_encode(['topicIds' => $topicIds, 'userVotes' => $userVotes]);
} else {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}
?>
