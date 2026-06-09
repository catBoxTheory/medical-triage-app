// ---------------------
// 全域變數
// ---------------------
let generatedCode = null;

// ---------------------
// 按下「註冊並寄送驗證碼」按鈕事件
// ---------------------
document.addEventListener('DOMContentLoaded', function() {
const signupBtn = document.getElementById('signupBtn');
const verifyBtn = document.getElementById('verifyBtn');
const saveHealthInfoBtn = document.getElementById('saveHealthInfoBtn');
const calcNearestBtn = document.getElementById('calcNearestBtn');
const chatBotButton = document.getElementById('chatBotButton');

    // ---------------------
    // 按下「註冊並寄送驗證碼」按鈕事件
    // ---------------------
    signupBtn.addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 驗證電子郵件格式
        if (!validateEmail(email)) {
            alert("請輸入有效的電子信箱(如:xxxx@gmail.com)。");
            return;
        }

        // 驗證密碼強度
        if (!validatePassword(password)) {
            alert("密碼必須至少8位,包含大寫字母、小寫字母和數字。");
            return;
        }

        // 驗證確認密碼是否一致
        if (password !== confirmPassword) {
            alert("兩次輸入的密碼不一致，請重新輸入。");
            return;
        }

        // 所有驗證通過，生成驗證碼

          // 1) 產生隨機驗證碼
          generatedCode = String(Math.floor(100000 + Math.random() * 900000));
          alert("驗證碼已寄送！(範例: " + generatedCode + ")");
          // 2) 顯示驗證碼輸入區塊
          document.getElementById('verifyCodeSection').style.display = 'block';
          // 創建用戶物件
          const user = {
            email,
            password
        };
          // 3) 寄送郵件
          sendVerificationCode();
          
          // ---------------------
          // 按下「送出驗證碼」按鈕事件
          // ---------------------
          verifyBtn.addEventListener('click', function(){
          const inputCode = document.getElementById('verifyCode').value;
          if (inputCode === generatedCode) {
                alert("驗證成功!");
                // 跳轉至驗證頁面
                fetch("http://localhost:3000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(user)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message.includes("成功")) {
                        alert(data.message);
                        // 跳轉至登入頁面或其他頁面
                        window.location.href = '../index.html';
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error("錯誤:", error);
                    alert("註冊失敗，請稍後再試。");
                });
          } 
          else {
          alert("驗證碼錯誤，請再試一次。");
          }
          });
          }); 
    });

    // ---------------------
    // 驗證電子信箱格式
    // ---------------------
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        return re.test(email);
    }

    // ---------------------
    // 驗證密碼強度
    // ---------------------
    function validatePassword(password) {
        // 至少8位，包含大寫、小寫和數字
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }
// ---------------------
// 寄送驗證碼（EmailJS）
// ---------------------
function sendVerificationCode(){
  let params = {
  email: document.getElementById('email').value,
  verifyCode: generatedCode
  };
  emailjs.send("service_rz8skkh","template_c38tzud", params)
  .then(function(res) {
  console.log("Email sent successfully!", res.status, res.text);
  }, function(err) {
  console.error("Email sending failed:", err);
  });
  }

