// 註冊
document.addEventListener('DOMContentLoaded', function() {
      // 獲取 "Register" 按鈕
      var registerBtn = document.getElementById('register-btn');
      console.log("抓到註冊鍵");
  
      registerBtn.addEventListener('click', function() {
          // 獲取使用者名稱、電子郵件、密碼、確認密碼欄位的值
          var username = document.querySelector('input[placeholder="Username"]').value;
          var email = document.querySelector('input[placeholder="Email"]').value;
          var password = document.querySelector('input[placeholder="Password"]').value;
          var confirmPassword = document.querySelector('input[placeholder="Confirm Password"]').value;
  
          // 發送POST請求到register.php
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'register.php', true);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.onreadystatechange = function() {
              if (xhr.readyState === 4 && xhr.status === 200) {
                  // 顯示伺服器回應
                  console.log(xhr.responseText);
                  // 在 Register 按鈕下方顯示錯誤訊息
                  var errorContainer = document.getElementById('error-container');
                  errorContainer.style.display = 'block';
                  errorContainer.innerText = xhr.responseText;
              }
          };
          // 將資料作為POST請求的body發送
          xhr.send('username=' + username + '&email=' + email + '&password=' + password + '&confirmPassword=' + confirmPassword);
    });
});

