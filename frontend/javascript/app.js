const API = 'http://localhost:3000'; // ใช้ตัวแปรนี้ตัวเดียวนะครับ
const loginMessage = document.getElementById('login-message');
const regMessage = document.getElementById('reg-message');

// --- Utility Functions ---
const openPopup = (id) => {
    const e = document.getElementById(id);
    if(e) e.classList.add('active');
}

const closePopup = (id) => {
    const e = document.getElementById(id);
    if(e) e.classList.remove('active');
    
    if(id == 'login-form' && loginMessage) {
        loginMessage.textContent="";
        return;
    }
    if(regMessage) regMessage.textContent="";
}

const switchToSignIn = () => { 
    closePopup('register-form');
    openPopup('login-form');
}

const switchToSignUp = () => { 
    closePopup('login-form');
    openPopup('register-form');
}

document.addEventListener('DOMContentLoaded', () => {
    
    UpdateNavbar();

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('click', (e)=> {
            if(e.target.id === 'login-form') closePopup('login-form');
        });
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('click', (e)=>{
            if (e.target.id === 'register-form') closePopup('register-form');
        });
        registerForm.addEventListener('submit', handleSignUp);
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (document.getElementById('profile-username')) {
        FetchProfileData();
    }
    if(document.getElementById('course-list')) {
        fetchCourses();
    }
});


// --- System Functions ---

// LOGIN SYSTEM
const handleLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(loginMessage) loginMessage.textContent = 'กำลังโหลดข้อมูล...';

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
            if(loginMessage) loginMessage.textContent = data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }

    } catch (err) {
        console.error('Login error', err);
        if(loginMessage) loginMessage.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    }
};

// REGISTER SYSTEM
const handleSignUp = async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg_username').value;
    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    const password2 = document.getElementById('check_password').value;

    if(regMessage) regMessage.textContent = 'กำลังโหลดข้อมูล...';

    if (password !== password2) {
        if(regMessage) {
            regMessage.style.color = "red";
            regMessage.textContent = "รหัสผ่านไม่ตรงกัน";
        }
        return;
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
            localStorage.setItem('username', username);
            localStorage.setItem('user_id', data.userId);
            if(regMessage) regMessage.style.color = "green";

            closePopup('register-form');
            window.location.reload();
        } else {
            if(regMessage) {
                regMessage.textContent = data.error || "สมัครสมาชิกไม่สำเร็จ";
                regMessage.style.color = "red";
            }
        }

    } catch (err) {
        console.error("Register error", err);
        if(regMessage) {
            regMessage.textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
            regMessage.style.color = "red";
        }
    }
};

const UpdateNavbar =  async () => {
    const loginBtn = document.getElementById('login_btn');
    const profileIcon = document.getElementById('profile');

    if(localStorage.getItem('authToken') != null) {
        try {
            const id = localStorage.getItem('user_id');
            const response = await fetch(`${API}/api/users/profile/${id}`); 

            if(response.ok) {
                const data = await response.json();
                const user = data[0];

                if(loginBtn) loginBtn.style.display = "none";
                if(profileIcon) {
                    profileIcon.style.display = "block";
                    profileIcon.src = `${user.file_img}`;
                }
            }
        } catch (err) {
            console.error("Something went wrong", err);
        }
    } else {
        if(loginBtn) loginBtn.style.display = "block";
        if(profileIcon) profileIcon.style.display = "none";
    }
}

// FETCH PROFILE DATA
const FetchProfileData = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        window.location.href = 'main.html'; 
        return;
    }

    try {
        const response = await fetch(`${API}/api/users/profile/${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            const user = data[0];
            
            const imgElement = document.getElementById('profile-img');
            const usernameEl = document.getElementById('profile-username');
            const emailEl = document.getElementById('profile-email');
            const joinDateEl = document.getElementById('profile-join-date');

            if(imgElement) imgElement.src = user.file_img;
            if(usernameEl) usernameEl.textContent = user.username;
            if(emailEl) emailEl.textContent = user.email;
            
            if(joinDateEl) {
                const date = new Date(user.created_at);
                const thaiDate = date.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                joinDateEl.textContent = `เข้าร่วมเมื่อ ${thaiDate}`;
            }

        } else {
            console.error("โหลดข้อมูลไม่สำเร็จ");
        }
    } catch (err) {
        console.error("Error:", err);
    }
};

const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    window.location.href = 'main.html';
}

// Fecthing Course
const list = document.getElementById('course-list');

const renderCourse = (coursesData) => {
  let htmlContent = "";
  coursesData.forEach((course) => {
    let tags = course.tags;
    if (!tags) {
      tags = [];
    }
    if (!Array.isArray(tags)) {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [];
      }
    }
    htmlContent += 
    `
    <div class="course-card">
        <div class="course-image">
            <img src="/backend/public/${course.file_img || 'placeholder-image.png'}" alt="${course.note_title}">
        </div>

        <div class="course-body">
            <p class="course-code">${course.note_code}</p>
            <h3 class="course-title">${course.note_title}</h3>

            <div class="course-tags">
                ${tags.slice(0, 4)
                      .map(tag => `<span class="course-tag">${tag}</span>`)
                      .join("")}
            </div>

            <button class="course-btn" onclick="read(${course.id})">ชม</button>

            <div class="course-info">
                <div class="course-profile">
                    <img src="${course.profile}" alt="" class="profile">
                    <span>${course.uploader}</span>
                </div>

                <div class="course-stats">
                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>${course.views}</span>
                    </div>

                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${course.comment_count}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
    `;
  });

  list.innerHTML = htmlContent;
};


const fetchCourses = async () => {
  try {
    const response = await fetch(`${API}/api/notes`);

    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลได้');
    }

    const coursesData = await response.json();
    renderCourse(coursesData);

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    list.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
};

