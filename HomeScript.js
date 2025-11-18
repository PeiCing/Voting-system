document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('load', function() {
        loadVoteRecords();
    });
    
    // 即時更新使用者名稱
    fetch('getUsername.php')
    .then(response => response.text())
    .then(username => {
        document.getElementById('usernameDisplay1').textContent = username;
        document.getElementById('usernameDisplay2').textContent = username;
        document.getElementById('usernameDisplay3').textContent = username;
        //document.getElementById('UserNum').textContent = username;
        if (username === '未登入') {
            // 使用者已登出，更新 UI
            document.getElementById('OnOutLine').textContent = "🔴 Outline";
            document.getElementById('SignOut').textContent = "SignIn"; 
            document.getElementById('SignOut').removeAttribute('onclick'); // 取消點擊事件
            document.getElementById('SignOut').addEventListener('click', signInFunction); // 新增 onclick 事件
            document.getElementById('Update').disabled = true;
        }
    
    })
    .catch(error => console.error('Error fetching username:', error));
    
    


    function checkUserVoted(topicId, username) {
        return fetch('check_Vote.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topicId: topicId,
                username: username
            })
        })
        .then(response => response.json())
        .then(data => {
            // 檢查後端返回的 topicIds 中是否包含當前主題的 topicId
            if (data.topicIds.includes(topicId)) {
                //console.log('You have already voted for this topic.');
                //console.log('User votes:', data.userVotes);
                
                // 檢查資料的正確性
                //console.log('User votes:', data.userVotes);
                
                // 设置样式
                data.userVotes.forEach(vote => {
                    const optionId = vote.option_id;
                    const button = document.querySelector(`button[data-id="option_${topicId}_${optionId}"]`);
                    if (button) {
                        button.style.backgroundColor = '#FFC107';
                        button.style.color = 'black';
                        button.disabled = true;
                    }
                });

                return true;
            }
            
             else {
                // 如果不包含，則表示該使用者還未投過票，返回 false
                //console.log('User votes:', data.userVotes); // 印出使用者投票的紀錄
                // 设置样式
                data.userVotes.forEach(vote => {
                    const optionId = vote.option_id;
                    const button = document.querySelector(`button[data-id="option_${topicId}_${optionId}"]`);
                    if (button) {
                        button.style.backgroundColor = '#FFC107';
                        button.style.color = 'black';
                        button.disabled = true;
                    }
                });
                return false;
            }
        })
        .catch(error => {
            console.error('Error checking user vote:', error);
            return false; // 發生錯誤時，假設該使用者還未投票
        });
    }
    
 
    

    function calculatePercentage(voteCount, totalVotes) {
        if (totalVotes === 0) {
            return 0;
        }
        return Math.round((voteCount / totalVotes) * 100);
    }
    // 获取投票数据+儲存至vote_record表+準備觸發checkUserVoted()
    fetch('getPollData.php')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log(data.error);
            return;
        }
        // 假設這是後端返回的 userVotes 數組
        //const userVotes = [
        //    { topic_id: '105', option_id: '177' },
            // 其他 topic_id 和 option_id 的組合...
        //];
    // 获取投票数据+儲存至vote_record表+準備觸發checkUserVoted()
    data.forEach(topic => {
        checkUserVoted(topic.topic_id, document.getElementById('usernameDisplay1').textContent).then(userHasVoted => {
            checkUserVoted(topic.topic_id, document.getElementById('usernameDisplay1').textContent);
            //console.log("topic.owner.photo"+topic.owner.photo);
            if(topic.owner.photo === null){
                topic.owner.photo = "pic/username_icon.png";
            }
            const topicDiv = document.createElement('div');
            topicDiv.className = 'AllModal';
            topicDiv.innerHTML = `
                <div>
                    <p>${topic.topic}</p>
                    <img id="owner_photo" src="${topic.owner.photo}" alt="User Photo">
                </div>
                <div>
                    <p>${topic.title}</p>
                    <p>${topic.owner.username}</p>
                </div>
                <form>
                ${topic.options.map(option => `
                    <button type="button" class="option-button ${userHasVoted && option.voted ? 'voted' : ''}" data-id="option_${topic.topic_id}_${option.id}" name="option${option.id}">
                        ${option.item_name} ${userHasVoted ? `- Votes:${option.vote_count} (${calculatePercentage(option.vote_count, topic.totalVotes)}%)` : ''}
                    </button>
                `).join('')}
                </form>`;
            document.body.appendChild(topicDiv);
            
            const modalContainerDiv = document.querySelector('.modal-container');
            if (modalContainerDiv) {
                modalContainerDiv.appendChild(topicDiv);
            } else {
                console.error('Modal container div not found.');
            }
            
            // 为每个选项按钮添加事件监听器
            const optionButtons = topicDiv.querySelectorAll('.option-button');
            optionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    
                    const [topicId, optionId] = this.dataset.id.split('_').slice(1);
                    const username = document.getElementById('usernameDisplay1').textContent;
                
                    // 檢查是否為已投票選項
                    const isVoted = data.userVotes && data.userVotes.some(vote => vote.topic_id === topicId && vote.option_id === optionId);
                
                    if (isVoted) {
                        //console.log('You have already voted for this option.');
                        return;
                    }
        
                    checkUserVoted(topicId, username)
                    .then(voted => {
                        if (voted) {
                            //console.log('You have already voted for this topic.');
                            return;
                        } else {
                            // 使用者還未投過票，可以進行投票操作
                            // 更改选项颜色为金色
                            this.style.backgroundColor = '#FFC107';
                            this.style.color = 'black';
                            // 禁用选项按钮
                            this.disabled = true;
                            // 获取当前选项按钮所在的投票区块
                            const allModal = this.closest('.AllModal');
                            // 获取该投票区块下的所有选项按钮
                            const allOptionButtons = allModal.querySelectorAll('.option-button');
                            // 禁用所有其他选项按钮
                            allOptionButtons.forEach(optionButton => {
                                if (optionButton !== this) {
                                    optionButton.disabled = true;
                                }
                            });
                            // 发送投票信息到服务器
                            fetch('recordvote.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    topicId: topicId,
                                    optionId: optionId
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    // 投票成功，更新投票百分比
                                    const optionElement = document.querySelector(`.option-button[data-id="option_${topicId}_${optionId}"]`);
                                    if (optionElement) {
                                        // 更新投票百分比
                                        const percentage = parseInt(data.percentage); // 将百分比解析为整数
                                        optionElement.textContent = `${optionElement.textContent}- Votes:${data.newVoteCount}(${percentage}%)`;
                                    }
                                } else {
                                    console.error('Failed to record vote:', data.error);
                                }
                            })
                            .catch(error => {
                                console.error('Error recording vote:', error);
                            });
                            }
                                                    
                        });          
                        window.location.href = 'HomePage.html'; // 重新導向到首頁
                    });        
                }); 
            });
        });
    });


            

    function loadVoteRecords() {
        // 发起请求到后端获取投票记录
        fetch('getVoteRecords.php')
        .then(response => response.json())
        .then(voteRecords => {
            // 遍历投票记录
            voteRecords.forEach(record => {
                // 根据记录中的 topic_id 和 option_id 找到对应的选项按钮
                const button = document.querySelector(`[data-id="option_${record.topic_id}_${record.option_id}"]`);
                // 如果找到了按钮，则更新按钮状态
                if (button) {
                    // 更改按钮颜色为金色
                    button.style.backgroundColor = '#FFC107';
                    button.style.color = 'black';
                    // 禁用按钮
                    button.disabled = true;
                }
            });
        })
        .catch(error => console.error('Error:', error));
    }
    // 即時更新使用者頭像
    fetch('getPhoto.php') 
    .then(response => response.json())
    .then(data => {
        if (data && data.photoUrl) {
            document.getElementById('userPhoto1').src = data.photoUrl;
            document.getElementById('userPhoto2').src = data.photoUrl;
            document.getElementById('userPhoto3').src = data.photoUrl;
        } else {
            // 如果未成功讀取到頭像資料，使用預設頭像
            document.getElementById('userPhoto1').src = "pic/username_icon.png";
            document.getElementById('userPhoto2').src = "pic/username_icon.png";
            document.getElementById('userPhoto3').src = "pic/username_icon.png";
        }
    })
    .catch(error => {
        console.error('Error fetching photo:', error);
        // 如果發生錯誤，使用預設頭像
        document.getElementById('userPhoto1').src = "pic/username_icon.png";
        document.getElementById('userPhoto2').src = "pic/username_icon.png";
        document.getElementById('userPhoto3').src = "pic/username_icon.png";
    });
    
    
});




// 檢查用戶登入狀態
function isLoggedIn() {
    // 檢查 sessionStorage 或 localStorage 中是否存在用戶登入信息
    // 假設你在登入成功時設置了一個名為 'isLoggedIn' 的項目
    return sessionStorage.getItem('isLoggedIn') === 'true'; // 或者 localStorage
}

function saveChanges(event) {
    event.preventDefault(); // 阻止表单默认提交行为
    var errorContainer = document.getElementById('error-container');

    errorContainer.innerText = '';
    
    var currentPassword = document.querySelector('input[placeholder="CurrentPassword"]').value;
    var newUsername = document.querySelector('input[placeholder="NewUsername"]').value;
    var newPassword =  document.querySelector('input[placeholder="NewPassword"]').value; // 获取新的密码
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0]; // 獲取文件
    
    // 使用FormData對象構建表單數據
    var formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newUsername', newUsername);
    formData.append('newPassword', newPassword);
    formData.append('newPhoto', file); // 添加文件到FormData

    // 發送 POST 請求到後端處理
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'updateProfile.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            errorContainer.style.display = 'block';
            
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // 更新页面元素，确保字段存在
                        if (response.updatedFields.newUsername) {
                            document.getElementById('usernameDisplay1').textContent = response.updatedFields.newUsername;
                            document.getElementById('usernameDisplay2').textContent = response.updatedFields.newUsername;
                            document.getElementById('usernameDisplay3').textContent = response.updatedFields.newUsername;
                        }
                        if (response.updatedFields.newPhoto) {
                            document.getElementById('userPhoto1').src = response.updatedFields.newPhoto;
                            document.getElementById('userPhoto2').src = response.updatedFields.newPhoto;
                            document.getElementById('userPhoto3').src = response.updatedFields.newPhoto;
                        }
                    
                        console.log("Changes were successful.");
                        // 显示修改成功的消息
                        errorContainer.innerText = '修改成功！';
                        // 清空错误消息
                        errorContainer.innerText = '';
                        // 清空确认密码输入框
                        document.getElementById("confirmPassword").value = '';

                        // 关闭模态窗口
                        closeModal('myModal');
                    } else {
                        errorContainer.innerHTML = response.error; // 显示密码格式错误的消息

                        // 在错误情况下也要关闭模态窗口
                        //closeModal('myModal');
                    }
                    
                } catch(e) {
                    errorContainer.innerText = '請輸入正確的目前密碼與需要修改的內容';
                }
                
            } else if (xhr.status === 400) {
                errorContainer.innerText = '請填寫目前密碼';
            } else {
                errorContainer.innerText = '服务器错误：' + xhr.status;
            }
        }
    };
    if(errorContainer.innerText.length < 0){
        console.log("Changes were successful.");
        // 显示修改成功的消息
        errorContainer.innerText = '修改成功！';
        // 清空错误消息
        errorContainer.innerText = '';
        // 清空确认密码输入框
        document.getElementById("confirmPassword").value = '';

        closeModal('myModal')// 关闭模态窗口
    }
    
    xhr.send(formData);
}

/* 登出並註銷 */
function SignOut() {
    // 使用 fetch 或者其他適當的方法向後端發送註銷的請求
    fetch('logout.php', {
        method: 'POST',
        credentials: 'include' // 如果你使用了會話，確保傳遞會話憑證
    })
    .then(response => {
        // 清除用戶會話
        if (response.ok) {
            // 將頭像設定為預設頭像的路徑
            document.getElementById('userPhoto1').src = "pic/username_icon.png";
            document.getElementById('userPhoto2').src = "pic/username_icon.png";
            document.getElementById('userPhoto3').src = "pic/username_icon.png";
            document.getElementById('usernameDisplay1').textContent = "未登入";
            document.getElementById('usernameDisplay2').textContent = "未登入";
            document.getElementById('usernameDisplay3').textContent = "未登入";
            document.getElementById('OnOutLine').textContent = "🔴 Outline";
            document.getElementById('SignOut').textContent = "SignIn"; 
            document.getElementById('SignOut').removeAttribute('onclick'); // 取消點擊事件
            // 新增 onclick 事件
            document.getElementById('SignOut').addEventListener('click', signInFunction);
            document.getElementById('Update').disabled = true;

            window.location.href = 'index.html'; // 重新導向到首頁
            // 更新狀態
            sessionStorage.setItem('userSignedOut', 'true');
            sessionStorage.setItem('outlineStatus', '🔴 Outline');
        } else {
            console.error('Sign out failed');
        }
    })
    .catch(error => console.error('Error signing out:', error));
}

function signInFunction() {
    // 登入邏輯，然後更新 UI 和 sessionStorage
    window.location.href = 'index.html';
    //sessionStorage.setItem('userSignedOut', 'false');

}

function redirectToHomePage(value) {
    window.location.href = value+".html"; // 導向到目標網頁的URL
}

function ClickSort(button) {
    var columnIndex = button.closest('th').cellIndex; // 獲取按鈕所在列的索引

    var table = button.closest('table');

    // 獲取表格中的所有行（不包括表頭）
    var rows = Array.from(table.rows).slice(1);

    // 根據點擊的列索引進行排序
    rows.sort(function(a, b) {
        var aValue = a.cells[columnIndex].textContent.trim(); // 獲取第columnIndex列的文本內容
        var bValue = b.cells[columnIndex].textContent.trim(); // 獲取第columnIndex列的文本內容

        // 如果是按照第一個字母排序，則比較第一個字母的Unicode編碼
        if (columnIndex === 0) {
            return aValue.localeCompare(bValue);
        } else {
            // 如果是按照時間排序，則將日期字符串轉換為日期對象並比較
            if (Date.parse(aValue) && Date.parse(bValue)) {
                return new Date(bValue) - new Date(aValue);
            } else {
                return aValue.localeCompare(bValue);
            }
        }
    });

    // 將排序後的行重新插入表格中
    rows.forEach(function(row) {
        table.appendChild(row);
    });
}
// 使用者相片與姓名，點擊跳出小視窗 
function ShowUserData() {
    var block1 = document.getElementById("Block1");
    var block2 = document.getElementById("Block2");
    block1.style.display = "block"; // 將 display 属性設置為 block，使其可見
    block2.style.display = "block"; // 將 display 属性設置為 block，使其可見
}

document.addEventListener('click', function(event) {
    var clickedElement = event.target;
    // 檢查點擊事件的目標元素是否為 ShowUser 或其子元素，如果是，則不隱藏 Block1
    if (clickedElement.id !== 'ShowUser' && !document.getElementById('ShowUser').contains(clickedElement)) {
        document.getElementById('Block1').style.display = 'none';
        document.getElementById('Block2').style.display = 'none';
    }
});

// 開啟模態框
function openModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
  }
  
// 關閉模態框
function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";

    // 清空输入框
    document.querySelector('input[placeholder="NewUsername"]').value = '';
    document.querySelector('input[placeholder="NewPassword"]').value = '';
    document.querySelector('input[placeholder="CurrentPassword"]').value = '';
    document.getElementById('fileInput').value = ''; // 清空文件输入

    // 清空错误信息
    var errorContainer = document.getElementById('error-container');
    errorContainer.style.display = 'none';
    errorContainer.innerText = '';

    // 关闭模态窗口，此处根据具体实现调整
    var modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
    }
}
  
