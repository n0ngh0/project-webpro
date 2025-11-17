const express = require('express');
const multer = require('multer');

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

router.post('/', async (req, res) => {

});


module.exports = router