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

signupBtn.addEventListener('click', function() {
// 1) 產生隨機驗證碼
generatedCode = String(Math.floor(100000 + Math.random() * 900000));
alert("驗證碼已寄送！(範例: " + generatedCode + ")");
// 2) 顯示驗證碼輸入區塊
document.getElementById('verifyCodeSection').style.display = 'block';

// 3) 寄送郵件
sendVerificationCode();
});

// ---------------------
// 按下「送出驗證碼」按鈕事件
// ---------------------
verifyBtn.addEventListener('click', function(){
const inputCode = document.getElementById('verifyCode').value;
if (inputCode === generatedCode) {
alert("驗證成功!");
document.getElementById('healthInfoSection').style.display = 'block';
} else {
alert("驗證碼錯誤，請再試一次。");
}
});
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

// ---------------------
// 按下「儲存健康資訊」按鈕事件
// ---------------------
saveHealthInfoBtn.addEventListener('click', function(){
// 這裡可呼叫後端 API 將資料存入 MySQL (示例省略)
alert("健康資訊已儲存!");
document.getElementById('locationSection').style.display = 'block';
getLocation();
});
// ---------------------
// 按下「計算最近機構」按鈕事件
// ---------------------
calcNearestBtn.addEventListener('click', function(){
const userLat = parseFloat(document.getElementById('latitude').textContent);
const userLon = parseFloat(document.getElementById('longitude').textContent);
let results = medicalData.map(item => {
    let dist = calcDistance(userLat, userLon, item.latitude, item.longitude);
    return { ...item, dist: dist };
  });
  
  // 依距離排序取前五筆
  results.sort((a,b)=> a.dist - b.dist);
  results = results.slice(0, 5);
  
  const tbody = document.querySelector('#recommendTable tbody');
  tbody.innerHTML = "";
  results.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.name}</td>
      <td>${r.latitude}</td>
      <td>${r.longitude}</td>
      <td>${r.dist.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('recommendTable').style.display = 'table';
  document.getElementById('chatSection').style.display = 'block';
});

// ---------------------
// 按下「啟動聊天機器人」按鈕事件
// ---------------------
chatBotButton.addEventListener('click', function(){
alert("啟動聊天機器人（此處可引導使用者進入後端 Python + Poe 的聊天介面）。");
});
});
// ---------------------
// 取得地理位置
// ---------------------
function getLocation() {
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(function(position){
document.getElementById('longitude').textContent = position.coords.longitude;
document.getElementById('latitude').textContent = position.coords.latitude;
document.getElementById('recommendSection').style.display = 'block';
}, function(error){
alert("無法取得位置，請確認權限設定。");
});
} else {
alert("瀏覽器不支援地理定位功能！");
}
}

// ---------------------
// 醫療機構資料 (僅示例)
// ---------------------
const medicalData = [
{ name: "廣華醫院", latitude: 22.31429, longitude: 114.1721 },
{ name: "瑪嘉烈醫院", latitude: 22.3400569, longitude: 114.1347 },
{ name: "葵涌醫院", latitude: 22.342892, longitude: 114.13336 },
{ name: "靈實醫院", latitude: 22.3137729, longitude: 114.25627 },
{ name: "黃竹坑醫院", latitude: 22.250966, longitude: 114.17591 },
{ name: "基督教聯合醫院", latitude: 22.322291, longitude: 114.2279 },
];

// ---------------------
// haversine formula 計算距離(公里)
// ---------------------
function calcDistance(lat1, lon1, lat2, lon2) {
const R = 6371;
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
const a =
Math.sin(dLat/2)*Math.sin(dLat/2) +
Math.cos(lat1Math.PI/180)*Math.cos(lat2Math.PI/180) *
Math.sin(dLon/2)*Math.sin(dLon/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
return R * c;
}