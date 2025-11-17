const API = 'http://localhost:3000';
const loginMessage = document.getElementById('login-message');
const regMessage = document.getElementById('reg-message');


const openPopup = (id) => {
    document.getElementById(id).classList.add('active');
}

const closePopup = (id) => {
    document.getElementById(id).classList.remove('active');
    if(id == 'login-form') {
        loginMessage.textContent="";
        return;
    }
    regMessage.textContent="";
}

const switchToSignIn = () => { 
    closePopup('register-form');
    openPopup('login-form');
}

const switchToSignUp = () => { 
    closePopup('login-form');
    openPopup('register-form');
}

document.getElementById('login-form').addEventListener('click', (e)=> {
    if(e.target.id === 'login-form') closePopup('login-form');
});
document.getElementById('register-form').addEventListener('click', (e)=>{
    if (e.target.id === 'register-form') closePopup('register-form');
});
// LOGIN && REGISTER FORM

document.addEventListener('DOMContentLoaded', () => {
    UpdateNavbar();
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (regForm) regForm.addEventListener('submit', handleSignUp);
});

// LOGIN SYSTEM
const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    loginMessage.textContent = 'กำลังโหลดข้อมูล...';

    try {
        const response = await fetch(`${API}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('user_id', data.userId);
            
            closePopup('login-form');
            window.location.reload();
        } else {
            loginMessage.textContent = data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }

    } catch (err) {
        console.error('Login error', err);
        loginMessage.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    }
};

// REGISTER SYSTEM
const handleSignUp = async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg_username').value;
    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    const password2 = document.getElementById('check_password').value;

    regMessage.textContent = 'กำลังโหลดข้อมูล...';

    if (password !== password2) {
        return regMessage.textContent = "รหัสผ่านไม่ตรงกัน";
    }

    try {
        const response = await fetch(`${API}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('username', username.value);
            localStorage.setItem('user_id', data.userId);

            closePopup('register-form');
            window.location.reload();
        } else {
            regMessage.textContent = data.error || "สมัครสมาชิกไม่สำเร็จ";
        }

    } catch (err) {
        console.error("Register error", err);
        regMessage.textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
    }
};

const UpdateNavbar =  async () => {
    if(localStorage.getItem('authToken') != null) {
        try {
            const id = localStorage.getItem('user_id');
            const response = await fetch(`${API}/api/users/profile/${id}`); 

            if(response.ok) {
                const data = await response.json();
                document.getElementById('login_btn').style.display = "none";
                document.getElementById('profile').style.display = "block";
                document.getElementById('profile').src = `../${data[0].file_img}`;
            }
        }catch (err) {
            console.error("Something went wrong", err);
        }
    }else {
        document.getElementById('login_btn').style.display = "block";
        document.getElementById('profile').style.display = "none";
    }
}
