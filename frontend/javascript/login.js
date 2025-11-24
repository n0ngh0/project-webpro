const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const loginbtn = document.getElementById('login_btn');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (regForm) regForm.addEventListener('submit', handleSignUp);
    if(localStorage.getItem(token)){
        document.innerHTML = `
            
        `;
    }
});

// LOGIN
const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    loginMessage.textContent = 'กำลังโหลดข้อมูล...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', username);

            closePopup('login-form');
            // window.location.reload();
        } else {
            loginMessage.textContent = data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }
        redirect('main.html');
    } catch (err) {
        console.error('Login error', err);
        loginMessage.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    }
};

// REGISTER
const handleSignUp = async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg_username');
    const email = document.getElementById('reg_email');
    const password = document.getElementById('reg_password');
    const password2 = document.getElementById('check_password');
    const regMessage = document.getElementById('reg-message');

    regMessage.textContent = 'กำลังโหลดข้อมูล...';

    if (password.value !== password2.value) {
        regMessage.style.backgroundColor = "red";
        return regMessage.textContent = "รหัสผ่านไม่ตรงกัน";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', username.value);
            regMessage.style.color = "green";
            closePopup('register-form');
            // window.location.reload();
        } else {
            regMessage.textContent = data.error || "สมัครสมาชิกไม่สำเร็จ";
            regMessage.style.color = "red";
        }

    } catch (err) {
        console.error("Register error", err);
        regMessage.textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
        regMessage.style.color = "red";
    }
};

const redirect = (path) => {
    window.location.href = path;
}