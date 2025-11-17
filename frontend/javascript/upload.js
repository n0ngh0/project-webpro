document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', handleUpload);
});

const handleUpload = async (e) => {
    e.preventDefault(); 

    const titleInput = document.getElementById('title');
    const fileInput = document.getElementById('file');
    
    const formData = new FormData();
    
    // formData.append('title', titleInput.value); 
    formData.append('file', fileInput.files[0]); 

    console.log('กำลังส่งข้อมูล...');

    try {
        const response = await fetch('/', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            console.log('อัปโหลดสำเร็จ:', result);
            alert(`อัปโหลดสำเร็จ: ${result.message}`);
        } else {
            console.error('อัปโหลดไม่สำเร็จ');
            alert('อัปโหลดไม่สำเร็จ');
        }
    } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
};