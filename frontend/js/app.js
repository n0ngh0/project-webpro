const API = 'http://localhost:3000'; // ใช้ตัวแปรนี้ตัวเดียวนะครับ
const loginMessage = document.getElementById('login-message');
const regMessage = document.getElementById('reg-message');
const upload = document.getElementById('upload-button');

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
    if(!localStorage.getItem('user_id')){
        upload.style.display = 'none';
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        // loginForm.addEventListener('click', (e)=> {
        //     if(e.target.id === 'login-form') closePopup('login-form');
        // });
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        // registerForm.addEventListener('click', (e)=>{
        //     if (e.target.id === 'register-form') closePopup('register-form');
        // });
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
    if(document.getElementById('course-profile-list')) {
        fetchProfileCourses();
        if (plist) {
            const btn = document.querySelector('.tab-btn'); 
            switchTab('uploads', btn);
        }
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
                    const pSrc = `../`+user.file_img || '../img/images.png';
                    profileIcon.src = pSrc;
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

            const profileImgSrc = `../`+user.file_img || '../img/images.png';
            if(imgElement) imgElement.src = profileImgSrc;
            if(usernameEl) usernameEl.textContent = user.nickname + `(${user.username})`;
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
const plist = document.getElementById('course-profile-list');


const renderCourse = (coursesData, isProfile = false) => {
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
    // Always point to backend public for thumbnails (consistent across pages)
    const imgSrc = course.file_img
        ? (`../backend/public${course.file_img.startsWith('/') ? course.file_img : ('/' + course.file_img)}`)
        : '../img/images.png';

    htmlContent += 
    `
    <div class="course-card">
        <div class="course-image">
            <img src="${imgSrc}" alt="${course.note_title}">
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
                    ${(() => {
                        const profileSrc = course.profile
                            ? (`../backend/public${course.profile.startsWith('/') ? course.profile : ('/' + course.profile)}`)
                            : '../img/images.png';
                        return `<img src="${profileSrc}" alt="" class="profile">`;
                    })()}
                    <span>${course.nickname}</span>
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

    if(list) list.innerHTML = htmlContent;
    else plist.innerHTML = htmlContent;
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
const fetchProfileCourses = async () => {
    const id = localStorage.getItem('user_id');  
    try {
    const response = await fetch(`${API}/api/notes/${id}`);

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

const switchTab = async (type, btnElement) => {
    const plist = 'course-profile-list';
    const container = document.getElementById(plist);
    const userId = localStorage.getItem('user_id');

    if (!container || !userId) return;

    const allTabs = Array.from(document.querySelectorAll('.tab-item'));
    const index = allTabs.indexOf(btnElement);

    const box = document.querySelector('.tabs-container');
    box.setAttribute('data-active', index);

    allTabs.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    container.innerHTML = '<p style="text-align:center; padding: 20px;">กำลังโหลด...</p>';

    try {
        let endpoint = '';
        
        if (type === 'uploads') {
            endpoint = `${API}/api/notes/${userId}`;
        } else if (type === 'likes') {
            endpoint = `${API}/api/notes/${userId}/likes`;
        } else if (type === 'favorites') {
            endpoint = `${API}/api/notes/${userId}/favorites`;
        }
        
        const response = await fetch(endpoint);

        if (!response.ok) throw new Error('Failed to fetch');

        const coursesData = await response.json();

        renderCourse(coursesData, plist);

    } catch (error) {
        console.error('Error fetching tab data:', error);
        container.innerHTML = '<p style="positon: absolute; top: 50%;text-align:center; color: #888;">ไม่พบข้อมูลรายการนี้</p>';
    }
};

// -----------------------
// Merged: upload.js
// -----------------------

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const msg = document.getElementById('statusMessage');


const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewContainer = document.getElementById('preview-container');
const previewImg = document.getElementById('preview-img');
const loadingText = document.getElementById('loading-text');

let coverBlob = null; 

if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];

      if (!file || file.type !== 'application/pdf') {
          if (msg) msg.textContent = "กรุณาเลือกไฟล์ PDF";
          setTimeout(() => {}, 1500);
          if (msg) msg.textContent = "";
          return;
      }

      if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
      if (previewContainer) previewContainer.style.display = 'none';
      if (loadingText) loadingText.style.display = 'block';

      try {
          const fileURL = URL.createObjectURL(file);
          const pdf = await pdfjsLib.getDocument(fileURL).promise;
          const page = await pdf.getPage(1);

          const scale = 1.5;
          const viewport = page.getViewport({ scale: scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport: viewport }).promise;

          canvas.toBlob((blob) => {
              coverBlob = blob; // ✅ เก็บไฟล์รูปไว้
              if (previewImg) previewImg.src = URL.createObjectURL(blob);
              if (loadingText) loadingText.style.display = 'none';
              if (previewContainer) previewContainer.style.display = 'block';
          }, 'image/jpeg', 0.9);

      } catch (err) {
          console.error(err);
          if (loadingText) loadingText.style.display = 'none';
          if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
          if (msg) {
              msg.textContent = "เกิดข้อผิดพลาดในการอ่านไฟล์ PDF";
              msg.style.color = "red";
          }
      }
  });
}

if (form) {
  form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!fileInput || fileInput.files.length === 0) {
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
          if (msg) {
              msg.textContent = "กำลังอัปโหลด...";
              msg.style.color = "blue";
          }

          const btn = form.querySelector('button');
          if (btn) btn.disabled = true;

          const response = await fetch(`${API}/api/notes`, { 
              method: 'POST',
              body: formData
          });
          
          if (response.ok) {
              if (msg) {
                  msg.textContent = "✅ อัปโหลดสำเร็จ";
                  msg.style.color = "green";
              }
              setTimeout(() => {
                  window.location.href = 'main.html';
              }, 1500);
          } else {
              if (msg) {
                  msg.textContent = "❌ ไม่สามารถอัปโหลด: ";
                  msg.style.color = "red";
              }
              if (btn) btn.disabled = false;
          }
      } catch (err) {
          console.error(err);
          if (msg) {
              msg.textContent = "Error: เชื่อมต่อ Server ไม่ได้";
              msg.style.color = "red";
          }
          const btn = form.querySelector('button');
          if (btn) btn.disabled = false;
      }
  });
}

// -----------------------
// Merged: edit-profile.js
// -----------------------

const userId = localStorage.getItem('user_id');

const ep_fileInput = document.getElementById('file-input');
const ep_previewImg = document.getElementById('preview-img');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const isPublicInput = document.getElementById('is-public');
const showStatsInput = document.getElementById('show-stats');

document.addEventListener('DOMContentLoaded', async () => {
    // If profile page elements exist, load profile data
    if (document.getElementById('edit-profile-form')) {
        if (!userId) {
            alert("กรุณาเข้าสู่ระบบก่อนครับ");
            return window.location.href = 'index.html';
        }

        try {
            const res = await fetch(`${API}/api/users/profile/${userId}`);
            if (res.ok) {
                const data = await res.json();
                const user = Array.isArray(data) ? data[0] : data;

                if (usernameInput) usernameInput.value = user.nickname;
                if (emailInput) emailInput.value = user.email;
                if (isPublicInput) isPublicInput.checked = (user.is_public == 1);
                if (showStatsInput) showStatsInput.checked = (user.show_stats == 1);

                const epSrc = user.file_img
                    ? (`../backend/public${user.file_img.startsWith('/') ? user.file_img : ('/' + user.file_img)}`)
                    : '../img/images.png';
                if (ep_previewImg) ep_previewImg.src = epSrc;
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        }
    }
});

if (ep_fileInput) {
  ep_fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) {
              alert("รูปภาพใหญ่เกินไป! กรุณาใช้รูปขนาดไม่เกิน 2MB");
              ep_fileInput.value = "";
              return;
          }

          const reader = new FileReader();
          reader.onload = function(e) {
              if (ep_previewImg) ep_previewImg.src = e.target.result;
          }
          reader.readAsDataURL(file);
      }
  });
}

function resetImage() {
    if (ep_fileInput) ep_fileInput.value = ""; 
    if (ep_previewImg) ep_previewImg.src = "../img/images.png";
}

const editForm = document.getElementById('edit-profile-form');
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append('username', usernameInput.value);
      formData.append('email', emailInput.value);
      formData.append('is_public', isPublicInput.checked);
      formData.append('show_stats', showStatsInput.checked);

      if (ep_fileInput && ep_fileInput.files[0]) {
          formData.append('profile_img', ep_fileInput.files[0]);
      }

      try {
          const res = await fetch(`${API}/api/users/update/${userId}`, {
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
}

