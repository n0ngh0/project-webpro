const API = 'http://localhost:3000';

form = document.getElementById('upload-form');
form.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const msg = document.getElementById('statusMessage');
    const formData = new FormData(form);

    const fileInput = document.getElementById('file'); // หรือ id ที่คุณตั้ง

    if (fileInput.files.length === 0) {
        alert("กรุณาเลือกไฟล์ PDF ก่อนกดปุ่มครับ");
        return;
    }

    try {
            msg.textContent = "กำลังอัปโหลด...";
            const response = await fetch(`${API}/api/notes`, {
                method: `POST`,
                body: formData
            });
            
            const result = await response.json();
            if(response.ok) {
                msg.textContent = "อัปโหลดสำเร็จ";
            }else {
                msg.textContent = "ไม่สามารถอัปโหลด";
            }
    }catch(err) {
        console.log("Somethin went wrong");
    }

});


