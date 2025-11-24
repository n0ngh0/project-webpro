const API = 'http://localhost:3000';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const msg = document.getElementById('statusMessage');


const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewContainer = document.getElementById('preview-container');
const previewImg = document.getElementById('preview-img');
const loadingText = document.getElementById('loading-text');

let coverBlob = null; 

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];

    if (!file || file.type !== 'application/pdf') {
        msg.textContent = "กรุณาเลือกไฟล์ PDF";
        setTimeout(1500);
        return msg.textContent = "";
    }

    uploadPlaceholder.style.display = 'none';
    previewContainer.style.display = 'none';
    loadingText.style.display = 'block';

    try {
        const fileURL = URL.createObjectURL(file);
        const pdf = await pdfjsLib.getDocument(fileURL).promise;
        const page = await pdf.getPage(1);

        const scale = 0.5;
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        canvas.toBlob((blob) => {
            coverBlob = blob; // ✅ เก็บไฟล์รูปไว้
            previewImg.src = URL.createObjectURL(blob);
            loadingText.style.display = 'none';
            previewContainer.style.display = 'block';
        }, 'image/jpeg', 0.8);

    } catch (err) {
        console.error(err);
        loadingText.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        msg.textContent = "เกิดข้อผิดพลาดในการอ่านไฟล์ PDF";
        msg.style.color = "red";
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (fileInput.files.length === 0) {
        alert("กรุณาเลือกไฟล์ PDF ก่อนกดปุ่มครับ");
        return;
    }
    if (!coverBlob) {
        alert("กำลังสร้างรูปปก กรุณารอสักครู่...");
        return;
    }

    const formData = new FormData(form);

    formData.append('coverImage', coverBlob, 'cover.jpg');

    const user_id = localStorage.getItem('user_id') || 1; 
    formData.append('uploader_id', user_id);

    try {
        msg.textContent = "กำลังอัปโหลด...";
        msg.style.color = "blue";

        const btn = form.querySelector('button');
        btn.disabled = true;

        const response = await fetch(`${API}/api/notes`, { 
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            msg.textContent = "✅ อัปโหลดสำเร็จ";
            msg.style.color = "green";
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1500);
        } else {
            const errText = await response.text();
            msg.textContent = "❌ ไม่สามารถอัปโหลด: " + errText;
            msg.style.color = "red";
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        msg.textContent = "Error: เชื่อมต่อ Server ไม่ได้";
        msg.style.color = "red";
        form.querySelector('button').disabled = false;
    }
});