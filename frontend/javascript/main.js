const coursesData = [
  {
    "id": 1,
    "code": "MTH1101",
    "title": "สถิติวิศวกรรมศาสตร์ 1 และ 1-5 ห้องปฏิบัติการวิศวกรรม",
    "image": "/public/mathematics-notes.jpg",
    "tags": ["แบบทดสอบ", "บันทึก", "ปัญหา", "อื่นๆ"],
    "views": 240,
    "comments": 12,
    "saves": 4,
    "category": "ทั้งหมด",
    "author": {
      "id": 101,
      "username": "Somsak K.",
      "profileImage": "/public/profiles/user-01.png"
    }
  },
  {
    "id": 2,
    "code": "CSS233",
    "title": "ไม่ระบุไม่ใช่ศาสตร์สถานะ",
    "image": "/public/computer-programming-illustration.jpg",
    "tags": ["บันทึก", "โครงร่าง"],
    "views": 892,
    "comments": 27,
    "saves": 8,
    "category": "CSS233",
    "author": {
      "id": 102,
      "username": "Manee Jaidee",
      "profileImage": "/public/profiles/user-02.jpg"
    }
  },
  {
    "id": 3,
    "code": "CSS111",
    "title": "Computer Programming 1",
    "image": "/public/computer-lab-desk-setup.jpg",
    "tags": ["การเขียน", "ประมวลผล", "อ้างอิง"],
    "views": 756,
    "comments": 34,
    "saves": 6,
    "category": "CSS111",
    "author": {
      "id": 102,
      "username": "Manee Jaidee",
      "profileImage": "/public/profiles/user-02.jpg"
    }
  },
  {
    "id": 4,
    "code": "ENG4501",
    "title": "ENGLISH",
    "image": "/public/english-language-learning-colorful.jpg",
    "tags": ["บันทึก", "คำศัพท์", "ไวยากรณ์", "การอ่าน"],
    "views": 432,
    "comments": 15,
    "saves": 5,
    "category": "ทั้งหมด",
    "author": {
      "id": 103,
      "username": "David Smith",
      "profileImage": "/public/profiles/user-03.png"
    }
  },
  {
    "id": 5,
    "code": "BIO3001",
    "title": "Human Brain And AI",
    "image": "/public/human-brain-with-ai-illustration-rainbow.jpg",
    "tags": ["บันทึก", "ชีววิทยา", "ปัญญาประดิษฐ์"],
    "views": 521,
    "comments": 19,
    "saves": 7,
    "category": "ทั้งหมด",
    "author": {
      "id": 104,
      "username": "Wassana N.",
      "profileImage": "/public/profiles/user-04.jpg"
    }
  },
  {
    "id": 6,
    "code": "DB2001",
    "title": "Database Architecture",
    "image": "/public/database-structure-isometric-3d.jpg",
    "tags": ["แผนผัง", "โครงสร้าง", "ระบบ"],
    "views": 618,
    "comments": 22,
    "saves": 9,
    "category": "ทั้งหมด",
    "author": {
      "id": 101,
      "username": "Somsak K.",
      "profileImage": "/public/profiles/user-01.png"
    }
  }
]

const list = document.getElementById('course-list');
const renderCourse = () => {
  let htmlContent = "";

  coursesData.forEach((course) => {
    htmlContent += 
    `
    <div class="course-card">
            <div class="course-image">
                <img src="${course.image}" alt="${course.title}">
            </div>
            <div class="course-body">
                <p class="course-code">${course.code}</p>
                <h3 class="course-title">${course.title}</h3>
                
                <div class="course-tags">
                    ${course.tags
                      .slice(0, 4)
                      .map(tag => `<span class="course-tag">${tag}</span>`)
                      .join("")}
                </div>
                
                <button class="course-btn" onclick="read(${course.id})">ชม</button>
                
                <div class="course-info">
                  <div class="course-profile">
                    <img src="${course.author.profileImage}" alt="" class="profile">
                    <span>${course.author.username}</span>
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
                        <span>${course.comments}</span>
                    </div>
                    <div class="stat-item">
                        <svg class="stat-icon" viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3"></circle>
                            <path d="M23 13v5H1V8h5"></path>
                            <path d="M1 5h5"></path>
                        </svg>
                        <span>${course.saves}</span>
                    </div>
                  </div>
                </div>

            </div>
        </div>
    `;
  });
  list.innerHTML = htmlContent;
}


document.addEventListener('DOMContentLoaded', ()=> {
  renderCourse();
})

const read = (id) => {
  console.log(id);
}

