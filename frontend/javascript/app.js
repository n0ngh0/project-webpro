const API = "http://localhost:3000"

const openPopup = (id) => {
    document.getElementById(id).classList.add('active');
}

const closePopup = (id) => {
    document.getElementById(id).classList.remove('active');
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


const list = document.getElementById('course-list');
const courseData = fetch(`${API}/api/notes`);

const renderCourse = () => {
    
}



 

