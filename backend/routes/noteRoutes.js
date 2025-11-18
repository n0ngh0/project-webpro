const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf2pic');

const pool = require('./connection');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                n.note_id AS id,
                n.title AS note_title,
                n.file_url AS file_img,
                u.file_img as profile,
                n.views,
                s.subject_code AS note_code,
                s.subject_name,
                u.username AS uploader,
                COUNT(DISTINCT c.comment_id) AS comment_count,
                (
                    SELECT JSON_ARRAYAGG(t.tag_name)
                    FROM note_tags nt
                    JOIN tags t ON nt.tag_id = t.tag_id
                    WHERE nt.note_id = n.note_id
                ) AS tags
            FROM notes AS n
            JOIN subjects AS s ON n.subject_id = s.subject_id
            JOIN users AS u ON n.uploader_id = u.user_id
            LEFT JOIN comments AS c ON n.note_id = c.note_id
            GROUP BY n.note_id, n.title, n.file_url, n.views, s.subject_code, s.subject_name, u.username
            ORDER BY n.created_at DESC;
        `);

        // --- แปลง tags จาก JSON string → array ---
        rows.forEach(row => {
            if (typeof row.tags === "string") {
                try {
                    row.tags = JSON.parse(row.tags);
                } catch {
                    row.tags = [];
                }
            }
        });

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './../frontend/src') 
  },
  filename: (req, file, cb) => {
    const name = Date.now() + Math.round(Math.random() * 1E9);
    cb(null, name + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('รับเฉพาะไฟล์ PDF เท่านั้น'), false);
  }
};

const Upload = multer({
    storage: storage,
    fileFilter: fileFilter
})
console.log(Upload.storage);
const options = {
  saveFilename: "untitled", 
  savePath: "./images",    
  format: "png",
};

router.post('/', Upload.single('file') , async (req, res) => {
    const data = req.file;

    if(!data) {
        return res.status(404).json({message: "File Not Found"});
    }
    console.log(req.file.path);
    try{

    }catch(err) {
        console.log(err.message);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรูปปก" });
    }
});


module.exports = router