const API = 'http://localhost:3000';
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
            <img src="${course.file_img || 'placeholder-image.png'}" alt="${course.note_title}">
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
                    <img src="default-profile.png" alt="" class="profile">
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
      console.log("TAGS RAW:", course.tags);
      console.log("TAGS PARSED:", tags);
    }

    const coursesData = await response.json();
    renderCourse(coursesData);

  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    list.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
};

document.addEventListener('DOMContentLoaded', fetchCourses);
