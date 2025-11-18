<?php
session_start();

header('Content-Type: application/json'); // 設定回傳的資料類型為 JSON

if (isset($_SESSION['photo'])) {
    echo json_encode(array('photoUrl' => $_SESSION['photo'])); // 將資料以 JSON 格式返回
} else {
    echo json_encode(array('error' => '未登入')); // 如果未登入，也以 JSON 格式返回錯誤訊息
}
?>
