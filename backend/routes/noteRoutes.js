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
                n.thumbnail_url AS file_img,
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
        let uploadPath = './public/files/pdfs'; // Default
        
        if (file.fieldname === 'coverImage') {
            uploadPath = './public/images/covers';
        }
        
        // สร้างโฟลเดอร์ถ้ายังไม่มี
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// --- 2. ตัวกรองไฟล์ (PDF และ รูปภาพ) ---
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์ PDF และรูปภาพเท่านั้น'), false);
    }
};

const Upload = multer({ storage: storage, fileFilter: fileFilter });

// --- 3. Route Upload ---
router.post('/', Upload.fields([
    { name: 'pdfFile', maxCount: 1 }, 
    { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {

    // เช็คไฟล์ก่อน
    if (!req.files || !req.files['pdfFile'] || !req.files['coverImage']) {
        return res.status(400).json({ message: "กรุณาส่งไฟล์ PDF และรูปปกให้ครบถ้วน" });
    }


    // ขอ Connection จาก Pool เพื่อทำ Transaction
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction(); // เริ่ม Transaction

        const pdfFile = req.files['pdfFile'][0];
        const coverImage = req.files['coverImage'][0];
        const { title, description, subject_id, tags, uploader_id } = req.body;

        // แปลง Path สำหรับลง Database (ตัด ./public ออก)
        const fileUrl = '/' + pdfFile.path.replace(/\\/g, '/').replace('public/', '');
        const thumbUrl = '/' + coverImage.path.replace(/\\/g, '/').replace('public/', '');

        // 1. Insert Note
        const sqlNote = `
            INSERT INTO notes (title, description, file_url, thumbnail_url, uploader_id, subject_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [noteResult] = await connection.execute(sqlNote, [
            title, 
            description || '', 
            fileUrl, 
            thumbUrl, 
            uploader_id, 
            subject_id
        ]);

        const newNoteId = noteResult.insertId;

        if (tags && tags.trim() !== '') {
            const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            for (const tagName of tagList) {
                await connection.execute(`INSERT IGNORE INTO tags (tag_name) VALUES (?)`, [tagName]);

                const [tagResult] = await connection.execute(`SELECT tag_id FROM tags WHERE tag_name = ?`, [tagName]);
                
                if (tagResult.length > 0) {
                    const tagId = tagResult[0].tag_id;
                    await connection.execute(
                        `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`, 
                        [newNoteId, tagId]
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ message: "อัปโหลดและบันทึกข้อมูลเรียบร้อย" });

    } catch (err) {
        await connection.rollback();
        console.error("Upload Error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    } finally {
        connection.release();
    }
});

module.exports = router;