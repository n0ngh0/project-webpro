const API = 'http://localhost:3000'; // ใช้ตัวแปรนี้ตัวเดียวนะครับ
const loginMessage = document.getElementById('login-message');
const regMessage = document.getElementById('reg-message');
const upload = document.getElementById('upload-button');
let isImageReset = false;

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
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('change', (e) => {
            const term = e.target.value.trim();
            fetchCourses(term);
        });
    }
    if(document.getElementById('course-list')) {
        fetchCourses();
    }
    if(document.getElementById('course-profile-list')) {
        fetchProfileCourses();
        if (plist) {
            const btn = document.querySelector('.tab-item'); 
            switchTab('uploads', btn);
        }
    }
    if(window.location.pathname.endsWith('view-note.html')) {
        loadViewNoteData();
    }
    if(document.getElementById('comments-container')) {
        loadComments();
    }
    if(document.getElementById('subject-list')) {
        loadSubjectsDatalist();
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
                const user = data;

                if(loginBtn) loginBtn.style.display = "none";
                if(profileIcon) {
                    profileIcon.style.display = "block";
                    const pSrc = user.file_img ? ('../' + user.file_img) : '../img/images.png';
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
            const user = data;
            
            const imgElement = document.getElementById('profile-img');
            const usernameEl = document.getElementById('profile-username');
            const nickname = document.getElementById('nametag');
            const emailEl = document.getElementById('profile-email');
            const joinDateEl = document.getElementById('profile-join-date');

            const profileImgSrc = user.file_img ? ('../' + user.file_img) : '../img/images.png';
            if(imgElement) imgElement.src = profileImgSrc;
            if(usernameEl) usernameEl.textContent = user.nickname;
            if(nickname) nickname.textContent =`@${user.username}`;
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
            document.getElementById('stat-total-notes').innerText = user.stats.total_notes;
            document.getElementById('stat-total-likes').innerText = user.stats.total_likes;

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
    if (!tags) tags = [];
    if (!Array.isArray(tags)) {
      try { tags = JSON.parse(tags); } catch { tags = []; }
    }

    const imgSrc = `./../backend/public/${(course.file_img)}`;
    const profileSrc = course.profile ? ('../img/' + course.profile.split('/').pop()) : '../img/images.png';;
    const heartClass = course.is_liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    const heartColor = course.is_liked ? 'red' : 'gray';
    // ---------------------------------------------
    htmlContent += `
    <div class="course-card">
        <div class="course-image">
            <img src="${imgSrc}" alt="${course.note_title}">
        </div>

        <div class="course-body">
            <p class="course-code">${course.subject_name}</p>
            <h3 class="course-title">${course.note_title}</h3>

            <div class="course-tags">
                ${tags.slice(0, 4).map(tag => `<span class="course-tag">${tag}</span>`).join("")}
            </div>

            <button class="course-btn" onclick="read(${course.id})">ชม</button>

            <div class="course-info">
                <div class="course-profile">
                    <img src="${profileSrc}" alt="" class="profile">
                    <span>${course.nickname}</span>
                </div>

                <div class="course-stats">
                    
                    <div class="stat-item">
                         <i class="${heartClass}" style="color: ${heartColor};"></i>
                         <span>${course.total_likes || 0}</span>
                    </div>

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
  else if (plist) plist.innerHTML = htmlContent;
};

const fetchCourses = async (searchTerm = '') => {
    const userId = localStorage.getItem('user_id');
    const params = new URLSearchParams();

    if (userId) params.set('userId', userId);
    if (searchTerm) params.set('search', searchTerm);

    const queryString = params.toString();
    const url = queryString ? `${API}/api/notes?${queryString}` : `${API}/api/notes`;

    if (list) list.innerHTML = '<p style="text-align:center; padding: 16px;">กำลังโหลด...</p>';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลได้');
        }

        const coursesData = await response.json();
        renderCourse(coursesData);

    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        if (list) list.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
};
const fetchProfileCourses = async () => {
    const userId = localStorage.getItem('user_id');  
    try {
    const response = await fetch(`${API}/api/notes/user/${userId}?userId=${userId}`);

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
            // ดึงโน้ตที่ user คนนี้เป็นคนอัปโหลด
            endpoint = `${API}/api/notes/user/${userId}?userId=${userId}`;
        } else if (type === 'likes') {
            // ดึงโน้ตที่ user คนนี้กดไลก์ไว้
            endpoint = `${API}/api/notes/user/${userId}/likes?userId=${userId}`;
        } else if (type === 'favorites') {
            // ดึงโน้ตที่ user คนนี้กด favorites ไว้
            endpoint = `${API}/api/notes/user/${userId}/favorites?userId=${userId}`;
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
// Merged: edit-profile.js
// -----------------------

const userId = localStorage.getItem('user_id');

const ep_fileInput = document.getElementById('file-input');
const ep_previewImg = document.getElementById('preview-img');
const usernameInput = document.getElementById('edit-username');
const emailInput = document.getElementById('email');

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('edit-profile-form')) {
        isImageReset = false;
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

                const epSrc = user.file_img ? ('../' + user.file_img) : '../img/images.png';
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
        isImageReset = false;
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
    isImageReset = true;
}

const editForm = document.getElementById('edit-profile-form');
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
    formData.append('username', usernameInput.value);
    formData.append('email', emailInput.value);

      if (isImageReset) {
          formData.append('profile_img', '../img/images.png'); 
      }else if (ep_fileInput && ep_fileInput.files[0]) {
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

const read = (noteId) => {
    if(localStorage.getItem('user_id')){
        window.location.href = `view-note.html?id=${noteId}`;
    }else {
        openPopup('login-form');
    }
};

const loadViewNoteData = async () => {
    const currentUserId = localStorage.getItem('user_id');
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');

    if (!noteId) {
        alert("ไม่พบรหัสโน้ต");
        window.location.href = "main.html";
        return;
    }

    try {
        const response = await fetch(`${API}/api/notes/detail/${noteId}?userId=${currentUserId}`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const note = await response.json();
        document.getElementById('note-title').textContent = note.title;
        document.getElementById('subject-name').textContent = note.subject_name;
        document.getElementById('note-desc').textContent = note.description || "ไม่มีคำอธิบาย";
        document.getElementById('uploader-name').textContent = note.nickname;
        document.getElementById('note-views').textContent = note.views;

        document.getElementById('like-count').textContent = note.total_likes;
        document.getElementById('save-count').textContent = note.total_saves;

        const btnDelete = document.getElementById('btn-delete');
        if (btnDelete && currentUserId && String(currentUserId) === String(note.uploader_id)) {
        btnDelete.style.display = 'inline-block';
        }
        
        updateIconState('like', note.is_liked);
        updateIconState('save', note.is_saved);

        const date = new Date(note.created_at);
        document.getElementById('date').textContent = date.toLocaleDateString('th-TH');
        const uploaderImg = `../${(note.uploader_img)}`  || '../img/images.png';
        document.getElementById('file_name').textContent= uploaderImg.replace('../img/', '');;
        document.getElementById('uploader-img').src = uploaderImg;
        const pdfUrl = `${API}${note.file_url}`; 
        document.getElementById('pdf-viewer').src = `${pdfUrl}#view=FitH`;

    } catch (err) {
        console.error("Error loading note:", err);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
};


loadComments = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    const container = document.getElementById('comments-container');

    try {
        const response = await fetch(`${API}/api/notes/comments/${noteId}`);
        const comments = await response.json();

        container.innerHTML = '';

        if (comments.length === 0) {
            container.innerHTML = '<p style="color:gray">ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มเลย!</p>';
            return;
        }
        comments.forEach(c => {
            const dateStr = new Date(c.created_at).toLocaleString('th-TH');
            const html = `
                <div style="display: flex; gap: 15px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <img src="/${c.file_img}" 
                         style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid #ccc;"> <div>
                        <div style="font-weight: bold; font-size: 1.1em;">
                            ${c.nickname} 
                            <span style="font-size: 0.8em; color: gray; font-weight: normal; margin-left: 10px;">
                                ${dateStr}
                            </span>
                        </div>
                        <div style="margin-top: 5px;">${c.content}</div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

    } catch (error) {
        console.error("Load comments failed:", error);
        container.innerHTML = '<p style="color:red">โหลดคอมเมนต์ไม่สำเร็จ</p>';
    }
}

postComment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    const content = document.getElementById('txt-comment').value;

    const userId = localStorage.getItem('user_id');
    if (!document.getElementById('comments-container')) return;
    if (!content.trim()) {
        alert("กรุณาพิมพ์ข้อความ");
        return;
    }

    try {
        const response = await fetch(`${API}/api/notes/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note_id: noteId,
                user_id: userId,
                content: content
            })
        });

        if (response.ok) {
            document.getElementById('txt-comment').value = '';
            loadComments();
        } else {
            alert("ส่งคอมเมนต์ไม่สำเร็จ");
        }

    } catch (error) {
        console.error("Post comment failed:", error);
        alert("เกิดข้อผิดพลาด");
    }
}

function updateIconState(type, isActive) {
    const icon = document.getElementById(`icon-${type}`);
    if (type === 'like') {
        icon.className = isActive ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        icon.style.color = isActive ? 'red' : 'black';
    } else {
        icon.className = isActive ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
        icon.style.color = isActive ? 'orange' : 'black';
    }
}

// ------------------------------------------
// 2. ฟังก์ชันกดปุ่ม Like
// ------------------------------------------
async function toggleLike() {
    const currentUserId = localStorage.getItem('user_id'); 
    if (!currentUserId) {
        alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    const btn = document.getElementById('btn-like');
    const countSpan = document.getElementById('like-count');

    try {
        const res = await fetch(`${API}/api/notes/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId, userId: currentUserId })
        });
        const data = await res.json();

        // เปลี่ยนสีปุ่มทันที
        updateIconState('like', data.liked);

        // อัปเดตตัวเลข (บวก/ลบ สดๆ หน้าเว็บ ไม่ต้องโหลดใหม่)
        let currentCount = parseInt(countSpan.innerText);
        if (data.liked) {
            countSpan.innerText = currentCount + 1;
        } else {
            countSpan.innerText = Math.max(0, currentCount - 1);
        }

    } catch (err) {
        console.error("Like error", err);
    }
}

// ------------------------------------------
// 3. ฟังก์ชันกดปุ่ม Save
// ------------------------------------------
async function toggleSave() {
    const noteId = new URLSearchParams(window.location.search).get('id');
    const countSpan = document.getElementById('save-count');
    const currentUserId = localStorage.getItem('user_id'); 
    

    if (!currentUserId) {
        alert("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
        return;
    }

    try {
        const res = await fetch(`${API}/api/notes/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ noteId, userId: currentUserId })
        });
        const data = await res.json();

        updateIconState('save', data.saved);

        // อัปเดตตัวเลขยอดเซฟรวม
        let currentCount = parseInt(countSpan.innerText);
        countSpan.innerText = data.saved ? currentCount + 1 : Math.max(0, currentCount - 1);

    } catch (err) { console.error(err); }
}

async function loadSubjectsDatalist() {
    try {

        const response = await fetch(`${API}/api/notes/subjects`); 
        const subjects = await response.json();

        const datalist = document.getElementById('subject-list');
        datalist.innerHTML = ''; 

        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.subject_name; 
            datalist.appendChild(option);
        });

    } catch (err) {
        console.error("Error loading subjects:", err);
    }
}

async function deleteNote() {
    if (!confirm("คุณแน่ใจไหมว่าจะลบโน้ตนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
        return;
    }

    const noteId = new URLSearchParams(window.location.search).get('id');
    const userId = localStorage.getItem('user_id');

    try {
        const res = await fetch(`${API}/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId }) 
        });

        if (res.ok) {
            alert("ลบโน้ตเรียบร้อยแล้ว");
            window.location.href = 'main.html';
        } else {
            const data = await res.json();
            alert("ลบไม่สำเร็จ: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
}

const burger = () => {
    const header = document.getElementById('header');
    const searchBar = document.getElementById('search-bar');
    const right = document.getElementById('right');

    header.classList.toggle('active');
    searchBar.style.display = searchBar.style.display === 'flex' ? 'none' : 'flex';
    right.style.display = right.style.display === 'flex' ? 'none' : 'flex';
}   