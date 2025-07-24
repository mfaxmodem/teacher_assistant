// static/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // --- منطق ثبت‌نام ---
    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const experience = parseInt(document.getElementById('register-experience').value, 10);
        const subject = document.getElementById('register-subject').value;
        const field = document.getElementById('register-field').value;

        if (!username || !password || !subject || !field || isNaN(experience)) {
            registerError.textContent = 'لطفاً تمام فیلدها را به درستی پر کنید.';
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, experience, subject, field })
            });
            const data = await response.json();
            if (response.ok) {
                alert('ثبت‌نام با موفقیت انجام شد! اکنون می‌توانید وارد شوید.');
                showLoginLink.click();
            } else {
                registerError.textContent = data.detail || 'خطا در ثبت‌نام.';
            }
        } catch (error) {
            registerError.textContent = 'خطای شبکه.';
        }
    });

    // --- منطق ورود ---
    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            loginError.textContent = 'لطفاً نام کاربری و رمز عبور را وارد کنید.';
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                // ذخیره اطلاعات کاربر در حافظه مرورگر
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                // انتقال به صفحه اصلی اپلیکیشن
                window.location.href = '/app.html';
            } else {
                loginError.textContent = data.detail || 'خطا در ورود.';
            }
        } catch (error) {
            loginError.textContent = 'خطای شبکه.';
        }
    });
});