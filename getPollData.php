<?php
session_start();
if (!isset($_SESSION['isLoggedIn']) || !$_SESSION['isLoggedIn']) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$servername = "140.123.102.94";
$username = "613410025";
$password = "bVFxhpqQO(/vh)zV";
$database = "613410025";

// 建立連線
$conn = new mysqli($servername, $username, $password, $database);

// 檢查連線
if ($conn->connect_error) {
    die("連線失敗: " . $conn->connect_error);
}

// 查詢所有投票活動
$sql = "SELECT * FROM topics";
$result = $conn->query($sql);

$topics = [];
if ($result->num_rows > 0) {
    while($topic = $result->fetch_assoc()) {
        $topicData = [
            'topic_id' => $topic['id'],
            'topic' => $topic['topic_name'],
            'title' => $topic['title'],
            'owner' => [],
            'options' => []
        ];

        // 查詢擁有者信息
        $owner_sql = "SELECT * FROM user WHERE username=?";
        $stmt = $conn->prepare($owner_sql);
        $stmt->bind_param("s", $topic['owner']);
        $stmt->execute();
        $owner_result = $stmt->get_result();
        if ($owner_result->num_rows > 0) {
            $topicData['owner'] = $owner_result->fetch_assoc();
        }

        // 获取所有选项的投票总数
        $totalVotesSql = "SELECT SUM(vote_count) AS total_votes FROM poll_options WHERE topic_id=?";
        $totalVotesStmt = $conn->prepare($totalVotesSql);
        $totalVotesStmt->bind_param("i", $topic['id']);
        $totalVotesStmt->execute();
        $totalVotesResult = $totalVotesStmt->get_result();
        $totalVotesRow = $totalVotesResult->fetch_assoc();
        $totalVotes = intval($totalVotesRow['total_votes']);

        // 賦值投票總數
        $topicData['totalVotes'] = $totalVotes;
        
        // 查詢投票選項及投票數量
        $options_sql = "SELECT id, item_name, vote_count FROM poll_options WHERE topic_id=?";
        $stmt = $conn->prepare($options_sql);
        $stmt->bind_param("i", $topic['id']);
        $stmt->execute();
        $options_result = $stmt->get_result();
        while($option = $options_result->fetch_assoc()) {
            // 获取投票数
            $voteCount = intval($option['vote_count']);
            
            // 添加投票数到选项数据中
            $option['vote_count'] = $voteCount;
            
            // 将选项数据添加到主题数据中
            $topicData['options'][] = $option;
        }

        $topics[] = $topicData;
    }
    echo json_encode($topics);
} else {
    echo json_encode(['message' => "未找到投票活動"]);
}

$conn->close();
?>
