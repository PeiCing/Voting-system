<?php
session_start();

// 获取 POST 请求中的投票信息
$data = json_decode(file_get_contents('php://input'), true);

// 连接数据库
$servername = "140.123.102.94";
$dbUsername = "613410025";
$dbPassword = "bVFxhpqQO(/vh)zV";
$database = "613410025";

$conn = new mysqli($servername, $dbUsername, $dbPassword, $database);

// 检查连接
if ($conn->connect_error) {
    echo json_encode(array("success" => false, "error" => "Connection failed: " . $conn->connect_error));
    exit;
}


// 插入投票记录
$sql = "INSERT INTO vote_records (topic_id, option_id, username, vote_time) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(array("success" => false, "error" => "Error preparing statement: " . $conn->error));
    exit;
}
$stmt->bind_param("iiss", $topicId, $optionId, $username, $vote_time);

$topicId = $data['topicId'];
$optionId = $data['optionId'];
$username = $_SESSION['username'];
$taipeiTime = new DateTime('now', new DateTimeZone('Asia/Taipei'));
$vote_time = $taipeiTime->format('Y-m-d H:i:s');
if (!$stmt->execute()) {
    echo json_encode(array("success" => false, "error" => "Error executing statement: " . $stmt->error));
    exit;
}

// 更新投票总数
$updateSql = "UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
if (!$updateStmt) {
    echo json_encode(array("success" => false, "error" => "Error preparing update statement: " . $conn->error));
    exit;
}
$updateStmt->bind_param("i", $optionId);
if (!$updateStmt->execute()) {
    echo json_encode(array("success" => false, "error" => "Error executing update: " . $updateStmt->error));
    exit;
}

// 获取所有选项的投票总数
$totalVotesSql = "SELECT SUM(vote_count) AS total_votes FROM poll_options WHERE topic_id = ?";
$totalVotesStmt = $conn->prepare($totalVotesSql);
if (!$totalVotesStmt) {
    echo json_encode(array("success" => false, "error" => "Error preparing totalVotesSql statement: " . $conn->error));
    exit;
}
$totalVotesStmt->bind_param("i", $topicId);
if (!$totalVotesStmt->execute()) {
    echo json_encode(array("success" => false, "error" => "Error executing totalVotesSql statement: " . $totalVotesStmt->error));
    exit;
}
$totalVotesResult = $totalVotesStmt->get_result();
$totalVotesRow = $totalVotesResult->fetch_assoc();
$totalVotes = $totalVotesRow['total_votes'];

// 获取新的投票总数
$selectSql = "SELECT vote_count FROM poll_options WHERE id = ?";
$selectStmt = $conn->prepare($selectSql);
if (!$selectStmt) {
    echo json_encode(array("success" => false, "error" => "Error preparing selectSql statement: " . $conn->error));
    exit;
}
$selectStmt->bind_param("i", $optionId);
if (!$selectStmt->execute()) {
    echo json_encode(array("success" => false, "error" => "Error executing selectStmt statement: " . $selectStmt->error));
    exit;
}
$selectStmt->bind_result($newVoteCount);
$selectStmt->fetch();

// 关闭连接
$stmt->close();
$updateStmt->close();
$selectStmt->close();
$totalVotesStmt->close();
$conn->close();

// 计算并返回百分比
$percentage = ($newVoteCount / $totalVotes) * 100;
$percentage = number_format($percentage, 0); // 格式化百分比为整数

// 输出 JSON 格式的成功响应，包括新的投票总数和百分比
echo json_encode(array("success" => true, "newVoteCount" => $newVoteCount, "percentage" => $percentage));

?>
