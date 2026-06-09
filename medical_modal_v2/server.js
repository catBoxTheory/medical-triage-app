const express = require("express");
const mysql2 = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// 中間件設置
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// MySQL 連接設置
const connection = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345678abC",
    database: "medical_system"
});

// 連接到 MySQL
connection.connect(err => {
    if (err) {
        console.error("連接數據庫失敗:", err);
        return;
    }
    console.log("成功連接到 MySQL 數據庫！");
});

// 註冊 API
app.post("/register", async (req, res) => {
    const { email, password} = req.body;

    if (!email || !password ) {
        return res.status(400).json({ message: "請填寫所有必填欄位。" });
    }

    // 檢查用戶是否已存在
    const checkUserQuery = "SELECT * FROM patient_info WHERE gmail_ac = ?";
    connection.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            console.error("查詢錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "用戶已存在。" });
        }

        // 密碼加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 插入新用戶
        const insertUserQuery = "INSERT INTO patient_info (gmail_ac, pw) VALUES (?, ?)";
        connection.query(insertUserQuery, [email, hashedPassword], (err, results) => {
            if (err) {
                console.error("插入用戶錯誤:", err);
                return res.status(500).json({ message: "伺服器錯誤。" });
            }
            res.status(201).json({ message: "註冊成功！" });
        });
    });
});
// 登入 API
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "請輸入電子信箱和密碼。" });
    }

    const getUserQuery = "SELECT * FROM patient_info WHERE gmail_ac = ?";
    connection.query(getUserQuery, [email], async (err, results) => {
        if (err) {
            console.error("查詢錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "用戶不存在。" });
        }

        const user = results[0];

        // 驗證密碼
        const isMatch = await bcrypt.compare(password, user.pw);
        if (!isMatch) {
            return res.status(400).json({ message: "密碼錯誤。" });
        }

        // 登入成功
        res.status(200).json({ message: "登入成功！", user: { id: user.id, email: user.gmail_ac} });
    });
});
// 更新用戶資料 API
app.post("/updateProfile", (req, res) => {
    const { email, gender, age, height, weight, diseaseHistory, medicationHistory } = req.body;

    if (!email || !gender || !age || !height || !weight) {
        return res.status(400).json({ message: "請填寫所有必填欄位。" });
    }

    const updateProfileQuery = `
        UPDATE patient_info 
        SET gender = ?, age = ?, height = ?, weight = ?, disease_history = ?, medication_history = ?
        WHERE gmail_ac = ?
    `;

    connection.query(updateProfileQuery, [gender, age, height, weight, diseaseHistory, medicationHistory, email], (err, results) => {
        if (err) {
            console.error("更新用戶資訊錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.affectedRows === 0) {
            return res.status(400).json({ message: "用戶不存在或無更新內容。" });
        }

        res.status(200).json({ message: "用戶資訊更新成功！" });
    });
});

//取得用戶資料 API
app.post("/getUserProfile", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "請提供電子信箱。" });
    }

    const getUserQuery = "SELECT * FROM patient_info WHERE gmail_ac = ?";
    connection.query(getUserQuery, [email], (err, results) => {
        if (err) {
            console.error("查詢用戶資料錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "用戶不存在。" });
        }

        const user = results[0];

        res.status(200).json({
            message: "用戶資料取得成功！",
            user: {
                gmail_ac: user.gmail_ac,
                gender: user.gender,
                age: user.age,
                height: user.height,
                weight: user.weight,
                diseaseHistory: user.disease_history,
                medicationHistory: user.medication_history
            }
        });
    });
});


// 更新用戶位置資料 API
app.post("/updatePosition", (req, res) => {
    const { email, latitude, longitude } = req.body;

    if (!email || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "請提供電子信箱、緯度和經度。" });
    }

    const updatePositionQuery = `
        UPDATE patient_info 
        SET latitude = ?, longitude = ?
        WHERE gmail_ac = ?
    `;

    connection.query(updatePositionQuery, [latitude, longitude, email], (err, results) => {
        if (err) {
            console.error("更新用戶位置錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.affectedRows === 0) {
            return res.status(400).json({ message: "用戶不存在或無更新內容。" });
        }

        res.status(200).json({ message: "用戶位置更新成功！" });
    });
});


//暫存用戶數據
app.post("/cacheUserData", (req, res) => {
    const { gmail_ac, gender, age, height, weight, diseaseHistory, medicationHistory , latitude, longitude} = req.body;

    if (!gmail_ac) {
        return res.status(400).json({ message: "請提供所有必填欄位。" });
    }

    const upsertCacheQuery = `
        UPDATE patient_info_cache 
        SET gmail_ac= ?, gender= ?, age=?, height= ?, weight= ?, disease_history= ?, medication_history= ?,latitude= ?, longitude=?
        WHERE id=1
    `;

    connection.query(upsertCacheQuery, [gmail_ac, gender, age, height, weight, diseaseHistory, medicationHistory, latitude, longitude], (err, results) => {
        if (err) {
            console.error("存入用戶快取資料錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        res.status(200).json({ message: "用戶快取資料存入成功！" });
    });
});
// 新增提取 `patient_info_cache` 的 API
app.get("/cacheUserData", (req, res) => {
    // 假設最多只有一筆資料，如果有多筆，可以調整此邏輯
    const getCacheQuery = "SELECT * FROM patient_info_cache";

    connection.query(getCacheQuery, (err, results) => {
        if (err) {
            console.error("提取用戶快取資料錯誤:", err);
            return res.status(500).json({ message: "伺服器錯誤。" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "無快取資料。" });
        }

        res.status(200).json({
            message: "用戶快取資料提取成功！",
            cache: results[0]
        });
    });
});


// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在運行於端口 ${PORT}...`);
});