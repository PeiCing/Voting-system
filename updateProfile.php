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

// 获取当前用户信息
$currentUsername = $_SESSION['username'];
$currentPassword = $_POST['currentPassword'];
$newUsername = $_POST['newUsername'];
$newPassword = $_POST['newPassword'];
// 检查是否有新的相片上傳
if(isset($_FILES['newPhoto']) && $_FILES['newPhoto']['name'] != '') {
    $newPhoto = $_FILES['newPhoto']['name']; // 從 $_FILES 中獲取上傳的文件名稱
} else {
    $newPhoto = null; // 如果未上傳新相片，設置為 null
}
// 檢查是否有空白欄位
if (empty($currentPassword)) {
    http_response_code(400);
    echo json_encode(array('error' => '請填寫目前密碼'));
    exit();
}

// 验证当前密码是否正确
$sql = "SELECT * FROM user WHERE username='$currentUsername'";
$result = $conn->query($sql);

// 检查查询是否成功
if ($result === FALSE) {
    http_response_code(500);
    echo json_encode(array('error' => '查询用户时出错：' . $conn->error));
    exit();
} elseif ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(array('error' => '未找到匹配的用户。'));
    exit();
} else {
    //echo "查询用户时成功：";
    $row = $result->fetch_assoc(); // 将结果集转换为关联数组
    
    // 驗證舊密碼是否正確
    if (password_verify($currentPassword, $row["password"])) {
        if(!empty($newPassword)) {
        // 檢查密碼是否符合條件
        if (strlen($newPassword) < 6 || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
            $response = array(
                'success' => false,
                'error' => '無效的密碼格式。<br>1. 密碼必須包含至少一個大寫字母。<br>2. 密碼必須至少包含一位數字。<br>3. 密碼長度必須至少為 6 個字元。'
            );
            echo json_encode($response);
            exit();
        }
        
        // 更新密码
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE user SET password='$hashedPassword' WHERE username='$currentUsername'";
        if ($conn->query($sql) !== TRUE) {
            echo "更新密碼時出錯：" . $conn->error;
            exit();
        }
        }

        if(isset($_FILES['newPhoto']) && $_FILES['newPhoto']['name'] != '') {
            // 上傳文件的處理代碼
            $targetDirectory = "uploads/"; // 上傳目錄
            $targetFilePath = $targetDirectory . basename($_FILES["newPhoto"]["name"]);
            $fileType = pathinfo($targetFilePath,PATHINFO_EXTENSION);
            move_uploaded_file($_FILES["newPhoto"]["tmp_name"], $targetFilePath);
            $newPhoto = $targetFilePath;

            $sql = "UPDATE user SET photo='$newPhoto' WHERE username='$currentUsername'";
            if ($conn->query($sql) !== TRUE) {
                echo "更新照片時出錯：" . $conn->error;
                exit();
            }

            $_SESSION['photo'] = $newPhoto;
        }

        $updatedFields = array();

        if(!empty($newUsername)) {
            // 驗證新用戶名是否存在
            $sql = "SELECT * FROM user WHERE username='$newUsername'";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $response = array(
                    'success' => false,
                    'error' => '新名稱已經存在於資料庫中。'
                );
                echo json_encode($response);

                exit();
            }

            // 更新用户名
            $sql = "UPDATE user SET username='$newUsername' WHERE username='$currentUsername'";
            if ($conn->query($sql) !== TRUE) {
                echo "更新使用名稱時出錯：" . $conn->error;
                exit();
            }

            // 更新 topics 表中的 owner 列
            $sql = "UPDATE topics SET owner='$newUsername' WHERE owner='$currentUsername'";
            if ($conn->query($sql) !== TRUE) {
                echo "更新topics表中的owner时出错：" . $conn->error;
                exit();
            }

            // 更新 $_SESSION 中的用户名
            $_SESSION['username'] = $newUsername;
        }
        // 檢查哪些欄位已被更新
        if(!empty($newPassword)) {
            $updatedFields['newPassword'] = true;
        }
        
        if(!empty($newUsername) && $newUsername !== $currentUsername) {
            $updatedFields['newUsername'] = $newUsername;
        }
        
        if(isset($_FILES['newPhoto']) && $_FILES['newPhoto']['name'] != '') {            
            $updatedFields['newPhoto'] = $newPhoto;
        }
        
        // 如果至少有一個欄位被更新
        if(!empty($updatedFields)) {
            $response = array(
                'success' => true,
                'updatedFields' => $updatedFields
            );
            echo json_encode($response);
        
            // 更新 $_SESSION 中的相關資訊
            if(isset($updatedFields['newUsername'])) {
                $_SESSION['username'] = $updatedFields['newUsername'];
            }
            if(isset($updatedFields['newPassword'])) {
                $_SESSION['password'] = $hashedPassword;
            }
            if(isset($updatedFields['newPhoto'])) {
                $_SESSION['photo'] = $updatedFields['newPhoto'];
            }
        } else {
            // 如果沒有任何欄位被更新,返回成功但不包含更新內容
            $response = array('success' => true);
            echo json_encode($response);
        }


    } else {
        // 当前密码不正确
       echo "當前密碼不正確";
    }
}

// 关闭数据库连接
$conn->close();
?>
