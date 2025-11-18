document.addEventListener('DOMContentLoaded', function() {
      // 獲取 "login" 按鈕
      var loginBtn = document.getElementById('login-btn');
      console.log("抓到登入鍵");
  
      loginBtn.addEventListener('click', function() {
        event.preventDefault(); // 阻止表单默认提交行为
          // 獲取電子郵件、密碼欄位的值
          var email = document.querySelector('input[placeholder="Email"]').value;
          var password = document.querySelector('input[placeholder="Password"]').value;
  
          // 發送POST請求到register.php
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'login.php', true);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.onreadystatechange = function() {
              if (xhr.readyState === 4 && xhr.status === 200) {
                  // 顯示伺服器回應
                  // 在 Register 按鈕下方顯示錯誤訊息
                  var errorContainer = document.getElementById('error-container');
                  errorContainer.style.display = 'block';
                  errorContainer.innerText = xhr.responseText;

                  // 檢查登入是否成功，並重定向
                  if (xhr.responseText.trim() === "登入成功") {
                    console.log("回傳登入成功準備去首頁");
                    sessionStorage.setItem('userSignedOut', 'false');
                    window.location.href = "HomePage.html"; // 重定向到首頁
                  }  
              }
          };
          // 將資料作為POST請求的body發送
          xhr.send('email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password));
        });      
});

