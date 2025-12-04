const API_URL = 'http://localhost:3000';
const userId = localStorage.getItem('user_id');

const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const isPublicInput = document.getElementById('is-public');
const showStatsInput = document.getElementById('show-stats');

document.addEventListener('DOMContentLoaded', async () => {
    if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อนครับ");
        return window.location.href = 'index.html';
    }

    try {
        const res = await fetch(`${API_URL}/api/users/profile/${userId}`);
        if (res.ok) {
            const data = await res.json();
            // Backend อาจส่งมาเป็น Array หรือ Object (กันเหนียวไว้)
            const user = Array.isArray(data) ? data[0] : data;

            // 1.1 ใส่ข้อมูล Text
            usernameInput.value = user.nickname;
            emailInput.value = user.email;
            
            // 1.2 ตั้งค่า Checkbox (Database เก็บ 1/0 ต้องแปลงเป็น true/false)
            isPublicInput.checked = (user.is_public == 1);
            showStatsInput.checked = (user.show_stats == 1);

            // 1.3 แสดงรูปภาพเดิม
            if (user.file_img) {
                // *** จุดสำคัญเรื่อง Path ***
                // Backend บันทึก: "img/profile-xxxx.jpg"
                // HTML เราอยู่: "frontend/src/edit-profile.html"
                // รูปอยู่: "frontend/img/..."
                // ดังนั้นต้องถอยหลัง 1 ขั้น (../) เพื่อไปหารูป
                previewImg.src = '../' + user.file_img; 
            } else {
                previewImg.src = '../img/default.png'; // รูปสำรอง
            }
        }
    } catch (err) {
        console.error("Error loading profile:", err);
    }
});


fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("รูปภาพใหญ่เกินไป! กรุณาใช้รูปขนาดไม่เกิน 2MB");
            fileInput.value = "";
            return;
        }

        // อ่านไฟล์เพื่อมาแสดงผล
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

function resetImage() {
    fileInput.value = ""; 
    previewImg.src = "./img/images.png";
}


document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    formData.append('username', usernameInput.value);
    formData.append('email', emailInput.value);
    
    formData.append('is_public', isPublicInput.checked);
    formData.append('show_stats', showStatsInput.checked);

    if (fileInput.files[0]) {
        formData.append('profile_img', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/api/users/update/${userId}`, {
            method: 'PUT',
            body: formData 
        });

        const result = await res.json();

        if (res.ok) {
            alert('บันทึกข้อมูลสำเร็จ!');
            localStorage.setItem('username', usernameInput.value);
            
            window.location.href = 'profile.html'; 
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.message);
        }

    } catch (err) {
        console.error(err);
        alert('เชื่อมต่อ Server ไม่ได้');
    }
});