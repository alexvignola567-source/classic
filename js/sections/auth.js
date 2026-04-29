/**
 * FantaLega Classic - Auth Section
 */
const AuthSection = {
    /**
     * Initialize auth section
     */
    init() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authMessage = document.getElementById('auth-message');
        // Toggle forms
        document.getElementById('show-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authMessage.textContent = '';
        });
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authMessage.textContent = '';
        });
        // Login form
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const result = UsersDB.authenticate(email, password);
            if (!result.success) {
                Forms.showMessage(authMessage, result.message, 'error');
                return;
            }
            UsersDB.cleanupFriends(email);
            App.showHome();
        });
        // Register form
        registerForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            if (password.length < CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
                Forms.showMessage(authMessage, 
                    `La password deve avere almeno ${CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caratteri`, 
                    'error'
                );
                return;
            }
            const result = UsersDB.create(email, password, name);
            if (!result.success) {
                Forms.showMessage(authMessage, result.message, 'error');
                return;
            }
            UsersDB.setCurrentUser(email);
            Toast.success('Benvenuto Mister!', `Account creato con ID #${result.userId}`);
            setTimeout(() => App.showHome(), 500);
        });
    },
    /**
     * Show auth container
     */
    show() {
        document.getElementById('home-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }
};
