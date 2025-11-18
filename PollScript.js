document.addEventListener('DOMContentLoaded', function() {
    var topicsData; // 声明全局变量
    var startIndex = 0; // 默认起始索引为0
    var numEntries = 5; // 默认每页显示5条目
    // 获取 select 元素
    var entriesSelect = document.getElementById('entriesSelect');
    var username_search = document.getElementById('usernameDisplay1').textContent;
    // 获取 select 元素和按钮元素
    var previousButton = document.getElementById('Previous');
    var nextButton = document.getElementById('Next');

    console.log("entriesSelect:"+entriesSelect);
        
    // 在页面加载完成时调用更新条目数量的函数，并设置默认值为5
    // 即时更新用户信息
    fetchUserData();
    fetchPhotoData();
    console.log("topicsData: "+topicsData);
    // 获取并显示用户信息
    function fetchUserData() {
        fetch('getUsername.php') 
            .then(response => response.text()) // 使用 text() 解析响应数据
            .then(username => {
                // 创建包含用户名的对象
                const userData = { username: username };
                // 显示用户名
                document.getElementById('usernameDisplay1').textContent = username;
                document.getElementById('usernameDisplay2').textContent = username;
                document.getElementById('usernameDisplay3').textContent = username;
                // 获取并显示用户的Topics数据
                fetchTopicsData(userData.username);
                if (username === '未登入') {
                    // 使用者已登出，更新 UI
                    document.getElementById('OnOutLine').textContent = "🔴 Outline";
                    document.getElementById('SignOut').textContent = "SignIn"; 
                    document.getElementById('SignOut').removeAttribute('onclick'); // 取消點擊事件
                    // 新增 onclick 事件
                    document.getElementById('SignOut').addEventListener('click', signInFunction);
                    document.getElementById('Update').disabled = true;
                }
            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // 获取并显示用户信息
    function fetchPhotoData() {
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
    }
    var topicsData; // 在全局范围内定义 topicsData 变量

    function fetchTopicsData(username) {
        fetch('getTopicsData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => response.json())
            .then(data => {
                topicsData = data.topics; // 直接给全局的 topicsData 赋值
                console.log("topicsData: "+topicsData);
                updateTableWithData(topicsData);
                updateTableWithData_Show(topicsData, entriesSelect.value);
            })
            .catch(error => console.error('Error fetching topics data:', error));
    }
    
    // ------------------------- 展示資料表格的行數 --------------------------------
     
    // 更新显示的页码
    function updatePageNumber() {
        // 计算当前页码（起始索引除以每页显示的条目数量加1，因为起始索引从0开始）
        var currentPage = Math.floor(startIndex / numEntries) + 1;
        
        // 获取页面元素
        var pageNumberElement = document.getElementById('Page');
        
        // 更新页面显示的页码
        pageNumberElement.textContent = currentPage;
    }

    // 在页面加载完成时调用一次以显示初始页码
    updatePageNumber();

    // 监听 change 事件
    entriesSelect.addEventListener('change', function() {
        // 获取用户选择的值
        var selectedValue = parseInt(entriesSelect.value);
        startIndex = 0; // 重置起始索引为0
        numEntries = selectedValue; // 更新每页显示的条目数量
        // 调用更新条目数量的函数
        updateEntries(selectedValue);
    });

    // 监听“上一页”按钮的点击事件
    previousButton.addEventListener('click', function() {
        // 更新起始索引为上一页的起始索引
        startIndex -= numEntries;
        if (startIndex < 0) {
            startIndex = 0;
        }
        updateEntries(numEntries);
    });

    // 监听“下一页”按钮的点击事件
    nextButton.addEventListener('click', function() {
        // 更新起始索引为下一页的起始索引
        startIndex += numEntries;

        fetch('getTopicsData.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username_search })
        })
        .then(response => response.json())
        .then(data => {
            topicsData = data.topics; // 更新全局的 topicsData 变量

            if (startIndex >= topicsData.length) {
                startIndex -= numEntries;
            }
            // 更新表格数据
            updateEntries(numEntries);
        })
        .catch(error => console.error('Error fetching topics data:', error));
    });

    function updateEntries(value) {
        // 根据需要更新显示的逻辑
        // 这里只是一个示例，你需要根据你的实际情况更新显示的条目数量
        console.log("用户选择的条目数量：" + value);
    
        // 清空当前表格内容
        var tableBody = document.querySelector('.Content_List table tbody');
        tableBody.innerHTML = '';
    
        if (topicsData && topicsData.length > 0) {
            // 根据起始索引和每页显示的条目数量，显示相应的数据
            for (let i = startIndex; i < startIndex + value && i < topicsData.length; i++) {
                var topic = topicsData[i];
                var newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${topic.topic_name}</td>
                    <td>${topic.title}</td>
                    <td>${topic.created_time}</td>
                    <td data-topic-id="${topic.id}">
                        <button class="editButton" style="background: transparent; border: none;">
                            <img src="pic/edit.png" style="height: 35px;">
                        </button>
                        <button class="deleteButton" style="background: transparent; border: none;">
                            <img src="pic/delete.png" style="height: 35px;">
                        </button>
                    </td>`;
    
                // 在父元素上绑定事件
                newRow.addEventListener('click', function(event) {
                    const targetButton = event.target.closest('.editButton, .deleteButton');
    
                    // 检查点击的是哪个按钮
                    if (targetButton && targetButton.classList.contains('editButton')) {
                        // 编辑按钮被点击时执行的代码
                        // 可以调用 fetchData 函数或其他需要的处理程序
                        fetchData(targetButton);
                    } else if (targetButton && targetButton.classList.contains('deleteButton')) {
                        // 删除按钮被点击时执行的代码
                        // 可以调用删除数据的函数或其他需要的处理程序
                        deleteData(targetButton);
                    }
                });
                tableBody.appendChild(newRow);
            }
        } else {
            console.error("topicsData is empty or undefined.");
        }
        // 更新页码显示
        updatePageNumber();
    }
    

    // 更新表格数据，并指定显示的条目数量
    function updateTableWithData_Show(topicsData, numEntries) {
        // 清空当前表格内容
        var tableBody = document.querySelector('.Content_List table tbody');
        tableBody.innerHTML = ''; // 清空表格内容
    
        // 根据指定的条目数量显示数据
        for (let i = 0; i < numEntries && i < topicsData.length; i++) {
            var topic = topicsData[i];
            var newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${topic.topic_name}</td>
                <td>${topic.title}</td>
                <td>${topic.created_time}</td>
                <td data-topic-id="${topic.id}">
                    <button class="editButton" style="background: transparent; border: none;">
                        <img src="pic/edit.png" style="height: 35px;">
                    </button>
                    <button class="deleteButton" style="background: transparent; border: none;">
                        <img src="pic/delete.png" style="height: 35px;">
                    </button>
                </td>`;
    
            // 在父元素上绑定事件
            newRow.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.editButton, .deleteButton');
    
                // 检查点击的是哪个按钮
                if (targetButton && targetButton.classList.contains('editButton')) {
                    // 编辑按钮被点击时执行的代码
                    // 可以调用 fetchData 函数或其他需要的处理程序
                    fetchData(targetButton);
                } else if (targetButton && targetButton.classList.contains('deleteButton')) {
                    // 删除按钮被点击时执行的代码
                    // 可以调用删除数据的函数或其他需要的处理程序
                    deleteData(targetButton);
                }
            });
            tableBody.appendChild(newRow);
        }
        }

    // 更新表格数据
    function updateTableWithData(topicsData) {
        //console.log("topicsData:", topicsData);
        // 清空当前表格内容
        var tableBody = document.querySelector('.Content_List table tbody');
        //tableBody.innerHTML = '';

        // 显示获取到的Topics数据
        topicsData.forEach(function(topic) {
            var newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td>${topic.topic_name}</td>
            <td>${topic.title}</td>
            <td>${topic.created_time}</td>
            <td data-topic-id="${topic.id}">
                <button class="editButton" style="background: transparent; border: none;">
                    <img src="pic/edit.png" style="height: 35px;">
                </button>
                <button class="deleteButton" style="background: transparent; border: none;">
                    <img src="pic/delete.png" style="height: 35px;">
                </button>
            </td>`;

            // 在父元素上綁定事件
            newRow.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.editButton, .deleteButton');

                // 檢查點擊的是哪個按鈕
                if (targetButton && targetButton.classList.contains('editButton')) {
                    // 編輯按鈕被點擊時執行的程式碼
                    // 可以調用 fetchData 函式或其他需要的處理程序
                    fetchData(targetButton);
                } else if (targetButton && targetButton.classList.contains('deleteButton')) {
                    // 刪除按鈕被點擊時執行的程式碼
                    // 可以調用刪除資料的函式或其他需要的處理程序
                    deleteData(targetButton);
                }
            });
            tableBody.appendChild(newRow);
        });
    }

    

    
});

// ----------- 執行搜索框 -----------  -----------  -----------  ----------- 
var keyword; // 定义 keyword 变量为全局变量
keyword = document.getElementById('searchInput').value.toLowerCase();

function searchTopics() {
    var username_search = document.getElementById('usernameDisplay1').textContent;

    console.log("username_search: " + username_search);

    // 获取搜索框的输入值
    var keyword = document.getElementById('searchInput').value.toLowerCase();
    console.log("keyword:" + keyword);// 确定已成功获取

    // 假设fetchTopicsData是用来获取topics数据的函数
    fetchTopicsData(keyword)
        .then(function(results) {
            // 如果找到匹配的条目
            if (results.length > 0) {
                // 在 searchTopics 函数中调用 updateTableWithData 时，将 keyword 作为参数传递进去
                updateTableWithData(results, keyword);

            } else {
                // 如果没有找到匹配的条目，可以进行适当的处理
                console.log("No matching topics found.");
            }
        })
        .catch(function(error) {
            console.error("Error fetching topics:", error);
        });
}
// 获取并显示用户的Topics数据
function fetchTopicsData(username) {
    return new Promise(function(resolve, reject) {
        fetch('getTopicsData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => response.json())
            .then(data => {
                const topicsData = data.topics; // 提取出 topics 数组
                console.log(topicsData);
                resolve(topicsData);
            })
            .catch(error => reject(error));
    });
}
// 更新表格数据
function updateTableWithData(topicsData, keyword) {
    console.log("topicsData:", topicsData);
    // 清空当前表格内容
    var tableBody = document.querySelector('.Content_List table tbody');
    tableBody.innerHTML = '';

    // 显示获取到的Topics数据
    topicsData.forEach(function(topic) {
        // 判断主题的 topic_name 或 title 是否包含关键字
        if (topic.topic_name.toLowerCase().includes(keyword) || topic.title.toLowerCase().includes(keyword)) {
            var newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td>${topic.topic_name}</td>
            <td>${topic.title}</td>
            <td>${topic.created_time}</td>
            <td data-topic-id="${topic.id}">
                <button class="editButton" style="background: transparent; border: none;">
                    <img src="pic/edit.png" style="height: 35px;">
                </button>
                <button class="deleteButton" style="background: transparent; border: none;">
                    <img src="pic/delete.png" style="height: 35px;">
                </button>
            </td>`;

            // 在父元素上绑定事件
            newRow.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.editButton, .deleteButton');

                // 检查点击的是哪个按钮
                if (targetButton && targetButton.classList.contains('editButton')) {
                    // 编辑按钮被点击时执行的代码
                    // 可以调用 fetchData 函数或其他需要的处理程序
                    fetchData(targetButton);
                } else if (targetButton && targetButton.classList.contains('deleteButton')) {
                    // 删除按钮被点击时执行的代码
                    // 可以调用删除数据的函数或其他需要的处理程序
                    deleteData(targetButton);
                }
            });
            tableBody.appendChild(newRow);
        }
    });
}
//  -----------  -----------  -----------  -----------  -----------  ----------- 




// ----------- 編輯按鈕 -----------
function fetchData(targetButton) {
    console.log("編輯按鈕被點擊了！");

    // 获取按钮元素的父级<tr>元素
    var rowToEdit = targetButton.closest('tr'); // 使用 closest 方法获取最近的父级 tr 元素

    // 獲取該行中的數據
    var rowData = {
        topicName: rowToEdit.querySelector('td:nth-child(1)').textContent,
        title: rowToEdit.querySelector('td:nth-child(2)').textContent,
        createdTime: rowToEdit.querySelector('td:nth-child(3)').textContent
    };

    // 使用 fetch 函式向後端發送請求獲取要編輯的資料
    fetch('SelectData.php', {
        method: 'POST', // 使用 POST 請求
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rowData) // 將要編輯的資料發送到後端
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // 返回 JSON 格式的數據
        } else {
            throw new Error('獲取數據失敗');
        }
    })
    .then(data => {
        // 如果获取数据成功，调用 openEditModal 函数打开编辑模态框
        openEditModal(data.topicName, data.title, data.options);
    
        // 将 topic_id 存储在全局变量中
        window.topicId = data.topicId;
        window.createdtime = data.createdTime;
    })
    .catch(error => {
        console.error('發生錯誤:', error);
    });
}

// ----------- 打开编辑框的函数 -----------
function openEditModal(topicName, title, options) {
    var editModal = document.getElementById("EditPollModal");
    editModal.style.display = "block";
    document.getElementById("EditTopicInput").value = topicName;
    document.getElementById("EditTitleInput").value = title;

    // 清空選項
    var optionsContainer = document.getElementById("EditoptionInputs");
    optionsContainer.innerHTML = '';

    // 添加新的選項
    options.reverse().forEach(option => {
        var optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.value = option;
        optionsContainer.appendChild(optionInput);
    });
}

// ----------- 按下新投票事件的儲存按鈕並傳輸到AddNewTopics.php -----------
function savePollChanges(event) {
    errorContainer = document.getElementById('save_error-container');
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单中的值
    var selectedTopic = document.getElementById('topicSelect').value;
    var selectedTitle = document.getElementById('titleSelect').value;
    var newTopicInput = document.getElementById('newTopicInput').value;
    var newTitleInput = document.getElementById('newTitleInput').value;
    

    /*------- 檢查Topic是否有輸入值 ------- */
    if(newTopicInput !== ""){
        var newTopic = newTopicInput;
    }else{
        var newTopic = selectedTopic;
    }
    /*------- 檢查Title是否有輸入值 ------- */
    if(newTitleInput !== ""){
        var newTitle = newTitleInput;
    }else{
        var newTitle = selectedTitle;
    }
    
    if(newTopic == "Select existing"){
        console.log("==")
        // 顯示錯誤訊息:請選擇Topic或輸入Topic
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請選擇Topic或輸入Topic";
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }
    if(newTitle == "Select existing"){
        // 顯示錯誤訊息:請選擇Title或輸入Title
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請選擇Title或輸入Title";
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }
    
    var newOptions = [];
    var optionInputs = document.querySelectorAll('#optionInputs input');
    optionInputs.forEach(function(input) {
        // 检查输入值是否为空或为 "NILL"
        if (input.value.trim() !== '' && input.value.trim().toUpperCase() !== 'NILL') {
            newOptions.push(input.value.trim());
        }
    });
    

    if (!newOptions.some(option => option.trim() !== "")) {
        console.log("0");
        // 顯示錯誤訊息:請選擇Title或輸入Title
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請輸入選項";    
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }

    // 使用 FormData 对象构建表单数据
    var formData = new FormData();
    formData.append('selectedTopic', selectedTopic);
    formData.append('selectedTitle', selectedTitle);
    formData.append('newTopic', newTopic);
    formData.append('newTitle', newTitle);
    newOptions.forEach(function(option) {
        formData.append('newOptions[]', option);
    });

    // 发送 POST 请求到后端处理
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'AddNewTopics.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 处理后端响应
            var errorContainer = document.getElementById('save_error-container');
            errorContainer.style.display = 'block';
            errorContainer.innerText = xhr.responseText;
    
            // 解析 JSON 响应
            var response = JSON.parse(xhr.responseText);
            //console.log(response);
            // 检查响应是否成功
            if (response.success) {
                // 检查是否存在表格行
                var tableRows = document.querySelectorAll('.Content_List table tbody tr');
                if (tableRows.length > 0) {
                    // 隐藏默认的空行
                    tableRows[0].style.display = 'none';
                }
    
                // 更新页面上的内容
                updateTableWithData2(response);
                // 关闭弹窗
                window.location.href = 'PollPage.html'; // 重新導向到首頁
                closePollModal();
            }else{
                errorContainer.innerText = "";
                errorContainer.innerText +=  response;    
                return; // 停止函数执行
            }
        }
    };

    //window.location.href = 'PollPage.html'; // 重新導向到首頁
    // 发送 FormData 作为请求的 body
    xhr.send(formData);
}
// ----------- 新投票事件的儲存按鈕更新表格数据 -----------
function updateTableWithData2(response) {
    console.log("进入 updateTableWithData2");
    //console.log("response"+response);
    // 检查是否存在成功的数据
    if (!response || !response.success || !response.newTopic || !response.newTitle || !response.newCreatedTime) {
        console.error('Invalid or no data provided');
        console.log(response);
        return; // 如果数据无效，则退出函数
    }

    var tableBody = document.querySelector('.Content_List table tbody');

    // 创建新行
    var newRow = document.createElement('tr');


    // 创建单元格并填充内容
    var topicCell = document.createElement('td');
    topicCell.textContent = response.newTopic;
    newRow.appendChild(topicCell);

    var titleCell = document.createElement('td');
    titleCell.textContent = response.newTitle;
    newRow.appendChild(titleCell);

    var createdTimeCell = document.createElement('td');
    createdTimeCell.textContent = response.newCreatedTime;
    newRow.appendChild(createdTimeCell);

    // 创建包含编辑和删除按钮的单元格
    var toolsCell = document.createElement('td');
    toolsCell.setAttribute('data-topic-id', response.id);
    var editButton = document.createElement('button');
    editButton.style.background = 'transparent';
    editButton.style.border = 'none';
    var editImage = document.createElement('img');
    editImage.src = 'pic/edit.png';
    editImage.style.height = '35px';
    editButton.appendChild(editImage);
    toolsCell.appendChild(editButton);

    var deleteButton = document.createElement('button');
    deleteButton.style.background = 'transparent';
    deleteButton.style.border = 'none';
    var deleteImage = document.createElement('img');
    deleteImage.src = 'pic/delete.png';
    deleteImage.style.height = '35px';
    deleteButton.appendChild(deleteImage);
    toolsCell.appendChild(deleteButton);

    newRow.appendChild(toolsCell);

    // 将新行添加到表格中
    tableBody.appendChild(newRow);
    errorContainer = document.getElementById('save_Edit_error-container');
    errorContainer2 = document.getElementById('save_error-container');
    errorContainer.innerText = "";
    errorContainer2.innerText = "";
}
// ----------- 按下編輯框的儲存按鈕並傳輸到EditPoll.php
function saveEditChanges(event) {
    errorContainer = document.getElementById('save_Edit_error-container');
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取编辑模态框中的值
    var editTopicInput = document.getElementById('EditTopicInput').value;
    var editTitleInput = document.getElementById('EditTitleInput').value;
    var editselectedTopic = document.getElementById('EdittopicSelect').value;
    var editselectedTitle = document.getElementById('EdittitleSelect').value;


    /*------- 檢查Topic是否有輸入值 ------- */
    if(editTopicInput !== ""){
        var editnewTopic = editTopicInput;
    }else{
        var editnewTopic = editselectedTopic;
    }
    /*------- 檢查Title是否有輸入值 ------- */
    if(editTitleInput !== ""){
        var editnewTitle = editTitleInput;
    }else{
        var editnewTitle = editselectedTitle;
    }

    if(editnewTopic == "Select existing"){
        console.log("==")
        // 顯示錯誤訊息:請選擇Topic或輸入Topic
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請選擇Topic或輸入Topic";
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }
    if(editnewTitle == "Select existing"){
        // 顯示錯誤訊息:請選擇Title或輸入Title
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請選擇Title或輸入Title";
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }
   
    var newOptions = [];
    var optionInputs = document.querySelectorAll('#EditoptionInputs input');
    optionInputs.forEach(function(input) {
        // 检查输入值是否为空或为 "NILL"
        if (input.value.trim() !== '' && input.value.trim().toUpperCase() !== 'NILL') {
            newOptions.push(input.value.trim());
        }
    });

    console.log("newOptions".newOptions);//newOptions:1,2,3,5

    if (!newOptions.some(option => option.trim() !== "")) {
        console.log("0");
        // 顯示錯誤訊息:請選擇Title或輸入Title
        errorContainer.style.display = 'block';
        errorContainer.innerText +=  "請輸入選項";    
        return; // 停止函数执行
    } else {
        // 清除任何可能存在的错误消息
        errorContainer.innerText = "";
    }

    // 使用 FormData 对象构建表单数据
    var formData = new FormData();
    formData.append('editedTopic', editnewTopic);
    formData.append('editedTitle', editnewTitle);
    formData.append('topic_id', topicId); 
    formData.append('editedCreatedTime', createdtime); 
    // 如果有新选项，添加到表单数据中
    if (newOptions.length > 0) {
        newOptions.forEach(function(option) {
            formData.append('newOptions[]', option);
        });
    }

    console.log("editedTopic:"+editnewTopic);
    console.log("editedTitle:"+editnewTitle);
    console.log("topic_id:"+topicId);
    console.log("editedCreatedTime:"+createdtime);
    console.log("newOptions:"+newOptions);

    
    // 发送 POST 请求到后端处理
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'EditPoll.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                console.log(response);
                if (response.success) {
                    // 这里应该从 response 中获取已编辑的选项数组，例如 editedOptions
                    var editedOptions = response.editedOptions;
                    updateTableWithData_Edit(editnewTopic, editnewTitle, editedOptions, createdtime, topicId);
                    closeModal('EditPollModal');
                } else {
                    errorContainer.style.display = 'block';
                    errorContainer.innerText = "";
                    errorContainer.innerText +=  response;
                }
            } catch (e) {
                console.error('Error parsing JSON!', e);
                errorContainer.style.display = 'block';
                 
                return; // 停止函数执行
            }
        }
    };
    //window.location.href = 'PollPage.html'; // 重新導向到首頁

    // 发送 FormData 作为请求的 body
    xhr.send(formData);
}

// ----------- 編輯框的儲存按鈕更新表格数据 -----------
function updateTableWithData_Edit(editedTopic, editedTitle, editedOptions, editedCreatedTime, topic_id) {
    console.log("Updating table with new data");
    console.log("editedTopic:" + editedTopic);
    console.log("editedTitle:" + editedTitle);
    console.log("editedOptions:", editedOptions);
    console.log("editedCreatedTime:" + editedCreatedTime);
    console.log("topic_id:" + topic_id);
    // 找到表格中对应的行
    var rows = document.querySelectorAll('.Content_List table tbody tr');
    var found = false;
    rows.forEach(function(row) {
        var cell = row.querySelector('td:last-child'); // 假设每行最后一个单元格有操作按钮
        if (cell && cell.getAttribute('data-topic-id') === topic_id) {
            // 更新表格内容
            var cells = row.cells;
            cells[0].textContent = editedTopic; // 假设第一个单元格是 topic
            cells[1].textContent = editedTitle; // 第二个单元格是 title
            cells[2].textContent = editedCreatedTime; // 第三个单元格是创建时间
            
            found = true;
        }
    });

    if (!found) {
        console.error('Unable to find the row with topic_id:', topic_id);
    } else {
        console.log('Table updated successfully for topic_id:', topic_id);
    }
}

// ----------- 刪除按鈕 -----------
function deleteData(targetButton) {
    // 獲取要刪除的行
    var rowToDelete = targetButton.closest('tr');
  
    // 獲取該行中的數據
    var rowData = {
      topicName: rowToDelete.querySelector('td:nth-child(1)').textContent,
      title: rowToDelete.querySelector('td:nth-child(2)').textContent,
      createdTime: rowToDelete.querySelector('td:nth-child(3)').textContent
    };
  
    // 向後端發送請求刪除資料
    fetch('deleteData.php', {
      method: 'POST', // 使用 POST 請求
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rowData) // 將要刪除的資料發送到後端
    })
    .then(response => {
      if (response.ok) {
        // 如果刪除成功，從前端刪除該行
        rowToDelete.remove();
      } else {
        // 處理刪除失敗的情況
        console.error('刪除失敗');
      }
    })
    .catch(error => {
      console.error('發生錯誤:', error);
    });
}

// ----------- 按下更新使用者資料的儲存按鈕並傳輸到updateProfile.php -----------
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


// ----------- 檢查用戶登入狀態 -----------
function isLoggedIn() {
    // 檢查 sessionStorage 或 localStorage 中是否存在用戶登入信息
    // 假設你在登入成功時設置了一個名為 'isLoggedIn' 的項目
    return sessionStorage.getItem('isLoggedIn') === 'true'; // 或者 localStorage
}

/* ----------- 登出並註銷 ----------- */
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
            document.getElementById('New').disabled = true;
            
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

/* ----------- 前往登入並跳轉 ----------- */
function signInFunction() {
    // 登入邏輯，然後更新 UI 和 sessionStorage
    window.location.href = 'index.html';
    //sessionStorage.setItem('userSignedOut', 'false');
}
// ----------- 導向到目標網頁的URL -----------
function redirectToHomePage(value) {
    window.location.href = value+".html"; 
}
// ----------- 表單內容排序 -----------
function ClickSort(button) {
    var columnIndex = button.closest('th').cellIndex; // 獲取按鈕所在列的索引

    var table = button.closest('table');

    // 獲取表格中的所有行（不包括表頭）
    var rows = Array.from(table.rows).slice(1);

    // 根據點擊的列索引進行排序
    rows.sort(function(a, b) {
        var aValue = "";
        var bValue = "";
    
        // 检查行中是否有足够的列数
        if (a.cells.length > columnIndex && b.cells.length > columnIndex) {
            // 如果列存在，获取文本内容
            aValue = a.cells[columnIndex].textContent.trim(); // 獲取第columnIndex列的文本內容
            bValue = b.cells[columnIndex].textContent.trim(); // 獲取第columnIndex列的文本內容
        }

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
// ----------- 使用者相片與姓名，點擊跳出小視窗 -----------
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

// ----------- 開啟myModal框 -----------
function openModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}
// ----------- 開啟PollModal框 -----------
function openPollModal() {
    var modal = document.getElementById("PollModal");
    modal.style.display = "block";
}
  
// 關閉模態框
function closeModal(id) {
    errorContainer = document.getElementById('save_Edit_error-container');
    errorContainer2 = document.getElementById('save_error-container');
    errorContainer.innerText = "";
    errorContainer2.innerText = "";
    var modal = document.getElementById(id);
    modal.style.display = "none";
}
function closePollModal() {
    var modal = document.getElementById("PollModal");
    modal.style.display = "none";
}

//----------- 添加選項輸入框 -----------
function addOption() {
    // 找到包含所有輸入框的容器
    const optionContainer = document.getElementById('optionInputs');

    // 創建新的輸入框
    const newOptionInput = document.createElement('input');
    newOptionInput.type = 'text';
    newOptionInput.placeholder = 'NewOptions';
    newOptionInput.classList.add('input-field');

    // 在輸入框之後插入一個斷行
    optionContainer.appendChild(document.createElement('br'));

    // 將新的輸入框添加到容器中
    optionContainer.appendChild(newOptionInput);
}
//----------- 編輯框的添加選項輸入框 -----------
function addOption_Edit(){
    console.log("addOption_Edit");
    // 找到包含所有輸入框的容器
    const Edit_optionContainer = document.getElementById('EditoptionInputs');

    // 創建新的輸入框
    const Edit_newOptionInput = document.createElement('input');
    Edit_newOptionInput.type = 'text';
    Edit_newOptionInput.placeholder = 'NewOptions';
    Edit_newOptionInput.classList.add('input-field');

    // 在輸入框之後插入一個斷行
    Edit_optionContainer.appendChild(document.createElement('br'));

    // 將新的輸入框添加到容器中
    Edit_optionContainer.appendChild(Edit_newOptionInput);
}



// 在頁面加載完成後獲取資料
/*window.addEventListener('DOMContentLoaded', function() {
    fetchData();
});*/



// 发送更新请求的函数
function updateRowData() {
    // 获取编辑后的数据
    var editedTopic = document.getElementById('selectedTopic').value;
    var editedTitle = document.getElementById('selectedTitle').value;
    var editedCreatedTime = document.getElementById('createdTime').value;

    // 构建请求参数
    var formData = new FormData();
    formData.append('editedTopic', editedTopic);
    formData.append('editedTitle', editedTitle);
    formData.append('editedCreatedTime', editedCreatedTime);

    // 发送更新请求
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'UpdateRowData.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // 处理响应
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                // 更新页面上的数据
                newRow.cells[0].textContent = editedTopic;
                newRow.cells[1].textContent = editedTitle;
                newRow.cells[2].textContent = editedCreatedTime;

                // 关闭编辑模态框
                closeEditModal();
            } else {
                // 处理更新失败的情况
                console.error('更新失败:', response.message);
            }
        }
    };
    xhr.send(formData);
    w
}

// 关闭编辑模态框的函数
function closeEditModal() {
    var editModal = document.getElementById("editModal");
    editModal.style.display = "none";
}



