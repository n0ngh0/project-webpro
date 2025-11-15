const API_BASE_URL = 'http://localhost:3000';
const loginForm = document.getElementById('login-form');


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin); 
    }
});


const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    loginMessage.textContent = 'กำลังโหลดข้อมูล...';

    try {
        const response = await fetch(API_BASE_URL + "/api/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username,password})
        }); 

        const data = await response.json();

        if(response.ok && data.token) {
            localStorage.setItem('authToken', data.dataToken);
            localStorage.setItem('username',username);
            // updateNavbar();
            closePopup('login-form');
            window.location.reload()
        }else {
            loginMessage.textContent = data.error || "Invalid username or password";
        }

    }catch(err) {
        console.error('Login error', err.message);
        loginMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
    }

}