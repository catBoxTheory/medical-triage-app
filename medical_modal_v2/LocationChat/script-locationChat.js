// ---------------------
// 全域變數
// ---------------------
let positionData = {};
let user={};

// ---------------------
// 當 DOM 內容載入完畢後
// ---------------------
document.addEventListener('DOMContentLoaded', function() {
    const startChatBtn = document.getElementById('startChatBtn');
    // ---------------------
    // 取得地理位置
    // ---------------------
    getLocation();
});

// ---------------------
// 取得地理位置
// ---------------------
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;

            document.getElementById('longitude').textContent = longitude;
            document.getElementById('latitude').textContent = latitude;

            positionData = { longitude, latitude };
            // 儲存至 localStorage
            localStorage.setItem('positionData', JSON.stringify(positionData));
              // 發送位置資料至後端
              updatePositionData(latitude, longitude);
        }, function(error){
            alert("無法取得位置，請確認權限設定。");
        });
    } else {
        alert("瀏覽器不支援地理定位功能！");
    }
}

// ---------------------
// 發送位置資料至後端
// ---------------------
function updatePositionData(latitude, longitude) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        console.error("無法識別用戶，請重新登入。");
        return;
    }

    let userObj;
    try {
        userObj = JSON.parse(userStr);
    } catch (e) {
        console.error("解析 user 資料失敗:", e);
        return;
    }

    const email = userObj.email;

    fetch("http://localhost:3000/updatePosition", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, latitude, longitude })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.includes("成功")) {
            console.log("位置資料更新成功！");
        } else {
            console.error("位置資料更新失敗：", data.message);
        }
    })
    .catch(error => {
        console.error("錯誤:", error);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profileBtn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const saveUserInfoBtn = document.getElementById('saveUserInfoBtn');
    // 點擊頭像 -> 顯示 / 隱藏側欄

    profileBtn.addEventListener('click', function(){
    sidebar.style.display = 'block';
    loadUserProfile(); 
    });

    closeSidebarBtn.addEventListener('click', function(){
    sidebar.style.display = 'none';
    });

    // 儲存更新
    saveUserInfoBtn.addEventListener('click', function(){
        updateUserProfile()
        cacheUserData();
    });
});

// ---------------------
//更新用戶資料 (updateUserProfile)
// ---------------------
function updateUserProfile(){
    // 從 localStorage 獲取用戶資訊
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("無法識別用戶，請重新登入。");
        return;
    }

    let userObj;
    try {
        userObj = JSON.parse(userStr);
    } catch (e) {
        console.error("解析 user 資料失敗:", e);
        alert("用戶資料有誤，請重新登入。");
        return;
    }
    const newData = {
    email: userObj.email,
    age: parseInt(document.getElementById('userAge').value.trim(),10),
    gender: document.getElementById('userGender').value,
    height: parseFloat(document.getElementById('userHeight').value.trim()),
    weight: parseFloat(document.getElementById('userWeight').value.trim()),
    diseaseHistory: document.getElementById('diseaseHistory').value,
    medicationHistory: document.getElementById('medicationHistory').value
    };
    console.log(newData);
    // 呼叫後端 API 更新用戶資料
    fetch("http://localhost:3000/updateProfile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.includes("成功")) {
            alert(data.message);
            // 更新 localStorage 中的用戶資訊
            user.email=newData.email;
            user.gender = newData.gender;
            user.age = newData.age;
            user.height = newData.height;
            user.weight = newData.weight;
            user.diseaseHistory = newData.diseaseHistory;
            user.medicationHistory = newData.medicationHistory;
            localStorage.setItem('user', JSON.stringify(user));
            sidebar.style.display = 'none';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("錯誤:", error);
        alert("更新資料失敗，請稍後再試。");
    });
}


// ---------------------
// 取得用戶資料並填充表單
// ---------------------
function loadUserProfile() {
    // 從 localStorage 獲取用戶資訊
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("無法識別用戶，請重新登入。");
        return;
    }

    let userObj;
    try {
        userObj = JSON.parse(userStr);
    } catch (e) {
        console.error("解析 user 資料失敗:", e);
        alert("用戶資料有誤，請重新登入。");
        return;
    }

    // 呼叫後端 API 取得完整的用戶資料
    fetch("http://localhost:3000/getUserProfile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userObj.email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.includes("成功")) {
            const profile = data.user;

            // 填充表單欄位
            document.getElementById('userGender').value = profile.gender || ""; // "N" 表示未設定
            document.getElementById('userAge').value = profile.age || "";
            document.getElementById('userHeight').value = profile.height || "";
            document.getElementById('userWeight').value = profile.weight || "";
            document.getElementById('diseaseHistory').value = profile.diseaseHistory || "";
            document.getElementById('medicationHistory').value = profile.medicationHistory || "";

            // 更新 localStorage 中的用戶資訊
            user = {
                ...userObj,
                ...profile
            };
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            // 若用戶是首次登入或無額外資料，保持表單欄位空白
            console.log("用戶無額外資料或其他問題:", data.message);
        }
    })
    .catch(error => {
        console.error("錯誤:", error);
        alert("無法取得用戶資料，請稍後再試。");
    });
}
// ---------------------
// 發送 cacheData 至數據庫
// ---------------------
function cacheUserData() {
    // 從 localStorage 獲取用戶資訊
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        console.error("無法識別用戶，請重新登入。");
        return;
    }

    let userObj;
    try {
        userObj = JSON.parse(userStr);
    } catch (e) {
        console.error("解析 user 資料失敗:", e);
        return;
    }

    const { email, gender, age, height, weight, diseaseHistory, medicationHistory} = userObj;
    const { latitude, longitude } = positionData

    fetch("http://localhost:3000/cacheUserData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            gmail_ac: email,
            gender,
            age,
            height,
            weight,
            diseaseHistory,
            medicationHistory,
            latitude,
            longitude
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.includes("成功")) {
            console.log("用戶快取資料存入成功！");
        } else {
            console.error("用戶快取資料存入失敗：", data.message);
        }
    })
    .catch(error => {
        console.error("錯誤：", error);
    });
}