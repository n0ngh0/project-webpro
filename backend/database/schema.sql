CREATE SCHEMA IF NOT EXISTS webpro;
USE webpro;

-- 1. สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(255),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- ในการใช้งานจริงควรเก็บเป็น Hashed Password
    role ENUM('user', 'admin') DEFAULT 'user',
    faculty VARCHAR(100),
    major VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_img VARCHAR(255)
);

-- 2. สร้างตาราง subjects
CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    faculty VARCHAR(100)
);

-- 3. สร้างตาราง tags
CREATE TABLE IF NOT EXISTS tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE
);

-- 4. สร้างตาราง notes (เชื่อมกับ users และ subjects)
CREATE TABLE IF NOT EXISTS notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    uploader_id INT NOT NULL,
    subject_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    thumbnail_url VARCHAR(255),
    FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- 5. สร้างตาราง note_tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS note_tags (
    note_id INT,
    tag_id INT,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- 6. สร้างตาราง comments
CREATE TABLE IF NOT EXISTS comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. สร้างตาราง likes
CREATE TABLE IF NOT EXISTS likes (
    note_id INT,
    user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, user_id),
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 8. สร้างตาราง favorites
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    note_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE
);

-- =============================================
-- INSERT MOCK DATA (ข้อมูลตัวอย่าง)
-- =============================================

-- เพิ่มข้อมูล Users
INSERT INTO users (username, nickname, email, password, role, faculty, major, file_img) VALUES
('admin_guy', 'Admin A', 'admin@example.com', 'hashed_pass_123', 'admin', 'Engineering', 'Computer Engineering', 'avatar1.png'),
('student_b', 'Boy', 'boy@example.com', 'pass1234', 'user', 'Science', 'CS', 'avatar2.png'),
('student_c', 'Cat', 'cat@example.com', 'pass5678', 'user', 'Engineering', 'Software', 'avatar3.png');

-- เพิ่มข้อมูล Subjects
INSERT INTO subjects (subject_code, subject_name, faculty) VALUES
('CS101', 'Intro to Computer Science', 'Science'),
('ENG202', 'Database Systems', 'Engineering'),
('GEN111', 'English for Communication', 'Liberal Arts');

-- เพิ่มข้อมูล Tags
INSERT INTO tags (tag_name) VALUES
('Lecture Note'), ('Exam Prep'), ('Summary'), ('Assignment'), ('Slide');

-- เพิ่มข้อมูล Notes
INSERT INTO notes (title, description, file_url, uploader_id, subject_id, views, thumbnail_url) VALUES
('Database Chapter 1-5', 'สรุปบทเรียน Database ก่อนสอบ Midterm ครับ', 'files/db_chap1_5.pdf', 1, 2, 150, 'thumb_db.jpg'),
('CS101 Python Basics', 'โค้ดตัวอย่าง Python พื้นฐาน', 'files/python_basics.zip', 2, 1, 340, 'thumb_py.jpg'),
('English Vocab List', 'รวมคำศัพท์ที่ออกสอบบ่อยๆ', 'files/vocab.pdf', 3, 3, 89, 'thumb_eng.jpg');

-- เพิ่มข้อมูล Note_Tags (เชื่อม Note กับ Tag)
INSERT INTO note_tags (note_id, tag_id) VALUES
(1, 1), (1, 3), -- Note 1 คือ Lecture Note และ Summary
(2, 4),         -- Note 2 คือ Assignment
(3, 2), (3, 3); -- Note 3 คือ Exam Prep และ Summary

-- เพิ่มข้อมูล Comments
INSERT INTO comments (note_id, user_id, content) VALUES
(1, 2, 'ขอบคุณครับ สรุปดีมากเลย'),
(1, 3, 'ละเอียดมาก อ่านเข้าใจง่าย'),
(2, 1, 'Code clean มากครับ');

-- เพิ่มข้อมูล Likes
INSERT INTO likes (note_id, user_id) VALUES
(1, 2), (1, 3), -- User 2 และ 3 กดไลค์ Note 1
(2, 1);

-- เพิ่มข้อมูล Favorites
INSERT INTO favorites (user_id, note_id) VALUES
(2, 1), -- User 2 เก็บ Note 1 เข้ารายการโปรด
(3, 2);

