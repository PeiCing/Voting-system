<?php
session_start(); // 開始會話

// 清除所有會話變數
$_SESSION = array();

// 如果要清除會話，也可以使用下面的方法
// if (ini_get("session.use_cookies")) {
//     $params = session_get_cookie_params();
//     setcookie(session_name(), '', time() - 42000,
//         $params["path"], $params["domain"],
//         $params["secure"], $params["httponly"]
// );
// }

// 最終銷毀會話
session_destroy();

// 返回成功註銷的訊息
echo "登出成功";
?>
