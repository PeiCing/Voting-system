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
$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST["password"];
$confirmPassword = $_POST['confirmPassword'];

// 檢查是否有空白欄位
if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
    echo "所有欄位均為必填";
    exit();
}

if($username == "未登入"){
    echo "請換一個名字> <";
    exit();
}

// 在這裡進行資料驗證
if ($password != $confirmPassword) {
    echo "重新輸入的密碼與密碼不符";
    exit();
}

// 檢查密碼是否符合條件
if (strlen($password) < 6 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    echo "無效的密碼格式。
    1. 密碼必須包含至少一個大寫字母。
    2. 密碼必須至少包含一位數字。
    3. 密碼長度必須至少為 6 個字元。";
    exit();
}

// 在這裡進行密碼加密
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);


// 檢查使用者名稱是否符合規則
if (!preg_match('/^[a-zA-Z0-9\x{4e00}-\x{9fa5}]+$/u', $username)) {
    echo "使用者名稱僅能是數字、英文或中文字母，不能有其他的符號";
    exit();
}

// 檢查使用者名稱是否已存在
$sql_check_username = "SELECT * FROM user WHERE username='$username'";
$result_username = $conn->query($sql_check_username);
if ($result_username->num_rows > 0) {
    echo "使用者名稱已存在";
    exit();
}

// 檢查電子郵件是否已存在
$sql_check_email = "SELECT * FROM user WHERE email='$email'";
$result_email = $conn->query($sql_check_email);

if ($result_email->num_rows > 0) {
    echo "電子郵件已存在";
    exit();
}

// 檢查 $result_email 是否是一個有效的物件
if (!$result_email) {
    echo "資料庫錯誤，無法檢查電子郵件";
    exit();
}

// 檢查電子郵件格式是否錯誤
if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
    echo "電子郵件格式錯誤";
    exit();
}


// 插入資料到資料庫
$sql = "INSERT INTO user (username, password, email) VALUES ('$username', '$hashedPassword', '$email')";

if ($conn->query($sql) === TRUE) {
    echo "註冊成功";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// 關閉資料庫連線
$conn->close();
?>
