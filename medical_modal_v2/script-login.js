let user={}
// ---------------------
// 當 DOM 內容載入完畢後
// ---------------------
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');

    // ---------------------
    // 按下「登入」按鈕事件
    // ---------------------
    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert("請輸入電子信箱和密碼。");
            return;
        }
        //暫存登入信息
        user={email,password};
        // 送出登入請求到後端
        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "登入成功！") {
                alert(data.message);
                // 儲存用戶資訊至 localStorage（或使用其他方式管理登入狀態）
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'locationChat/locationChat.html';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("錯誤:", error);
            alert("登入失敗，請稍後再試。");
        });
    });
});