const express = require('express');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'jwtthesecret'; 

const router = express.Router();


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [result] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

        if(result.length === 0) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({error: "Invalid username or password"});
        }

        const token = jwt.sign(
            { id: user.user_id,user: user.username },JWT_SECRET,{ expiresIn: '1h' }
        );
        res.status(200).json({message: 'Login Successfully',token: token, userId: user.user_id});

    }catch(err){
        res.status(500).json({ error: 'Login failed'+err.message });
    }
});
router.post('/', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            password: password_hash,
            email,
            role: 'user',
            faculty: null,
            major: null
        };

        const [result] = await pool.query("INSERT INTO users SET ?",newUser);
        const token = jwt.sign(
            { id: result.insertId,user: result.username },JWT_SECRET,{ expiresIn: '1h' }
        );
        res.status(200).json({message:'Registered Successfully',token: token, userId: result.insertId});
    }catch(err) {
        console.error('Error during registration:', err.message);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username or Email already exists.' });
        }

        return res.status(500).json({message: "Something went wrong", detail: err.message}); 
    }

});


router.get('/', async (req, res)=> {
    try{
        const [rows, fields] = await pool.query("SELECT * FROM users ");
        res.json(rows);
    }catch(err){
        res.status(500).json({message: 'Something went wrong' + err.message });
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // store profile images under frontend/img so frontend can access them directly
        const dest = path.join(__dirname, '..', '..', 'img');
        // create folder if it doesn't exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); 
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น (PNG, JPG)!'), false);
    }
};


const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.put('/update/:id', upload.single('profile_img'), async (req, res) => {
    const userId = req.params.id;

    const { username, email, is_public, show_stats } = req.body;

    let updateData = {
        nickname: username,
        email: email,
        is_public: (is_public === 'true' || is_public === 'on') ? 1 : 0,
        show_stats: (show_stats === 'true' || show_stats === 'on') ? 1 : 0
    };


    if (req.file) {
        updateData.file_img = 'img/' + req.file.filename; 
    }else {
        updateData.file_img = '/img/images.png'; 
    }

    try {
        const [results] = await pool.query("UPDATE users SET ? WHERE user_id = ?", [updateData, userId]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้งาน ID " + userId });
        }
        res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ"});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database Error: " + err.message });
    }
});

router.delete('/:id', async (req, res)=>{
    const user_id = req.params.id;
    try{
        const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [user_id]);
        if(result.affectedRows === 0 ) {
            return res.status(404).json({message: "user_id" + user_id + "is Not Found"});
        }
        res.status(200).json({message:"Delete Successfully"});
    }catch(err){    
        res.status(500).json({message: err.message});
    }
});

router.get('/profile/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 1. ดึงข้อมูลผู้ใช้ (User Info)
        const [users] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const data = users[0];

        if(data.nickname === null){ 
            data.nickname = data.username;
        }

        const user = users[0];
        const sqlStats = `
            SELECT 
                -- นับจำนวนโน้ตที่ user นี้อัปโหลด
                (SELECT COUNT(*) FROM notes WHERE uploader_id = ?) AS total_notes,
                
                -- นับจำนวนไลก์รวมทั้งหมด ที่โน้ตของ user นี้ได้รับ
                (SELECT COUNT(*) 
                 FROM likes l 
                 JOIN notes n ON l.note_id = n.note_id 
                 WHERE n.uploader_id = ?) AS total_likes
        `;

        const [stats] = await pool.query(sqlStats, [id, id]);
        user.stats = stats[0]; 

        // ส่งกลับทีเดียว
        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router;