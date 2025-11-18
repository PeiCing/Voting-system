<?php
session_start();

// 检查用户是否已登录
if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true) {
    $isLoggedIn = true;
} else {
    $isLoggedIn = false;
}

// 构建响应数据
$response = array(
    'isLoggedIn' => $isLoggedIn
);

// 如果未登录，则返回需要刷新页面的标志
if (!$isLoggedIn) {
    $response['refreshPage'] = true;
}

// 设置响应头为 JSON 格式
header('Content-Type: application/json');

// 输出 JSON 数据
echo json_encode($response);
?>
