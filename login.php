<?php 

$servername = "140.123.102.94";// 遠端資料庫伺服器位置
$username = "613410025"; // 資料庫帳號
$password = "bVFxhpqQO(/vh)zV"; // 資料庫密碼
$database = "613410025"; // 資料庫名稱

// 建立連線
$conn = new mysqli($servername, $username, $password, $database);

// 檢查連線是否成功
if ($conn->connect_error) {
    die("連線失敗: " . $conn->connect_error);
}

// 獲取POST請求的資料
$email = $_POST['email'];
$password = $_POST["password"];

// 檢查是否有空白欄位
if ( empty($email) || empty($password) ) {
    echo "所有欄位均為必填";
    exit();
}

// 準備 SQL 查詢
$sql = "SELECT * FROM user WHERE email='$email'";

// 執行查詢
$result = $conn->query($sql);

// 檢查查詢結果是否有資料
if ($result->num_rows > 0) {
    // 將查詢結果轉換為關聯數組
    $row = $result->fetch_assoc();
    
    // 檢查密碼是否相符
    if (password_verify($password, $row["password"])) {
        // 密碼正確，可以登入
        session_start();//告知script.JS登入成功要抓使用者名稱
        $_SESSION['username'] = $row['username']; // 存储用户名
        $_SESSION['photo'] = $row['photo']; // 確保這行在用戶登入時執行
        $_SESSION['isLoggedIn'] = true; // 设置登录状态为true
        // 登入成功，输出JavaScript代码来设置sessionStorage
        echo "登入成功";

        exit();
    } else {
        // 密碼不正確，顯示錯誤訊息
        echo "密碼錯誤";
    }
} else {
    // 查不到使用者，顯示錯誤訊息
    echo "使用者不存在";
}

// 關閉資料庫連線
$conn->close();
?>
