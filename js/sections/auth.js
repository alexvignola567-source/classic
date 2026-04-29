
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const authMessage = document.getElementById("auth-message");

    const authContainer = document.getElementById("auth-container");
    const homeContainer = document.getElementById("home-container");

    function showMessage(msg, type="success") {
        authMessage.textContent = msg;
        authMessage.className = "message " + type;
    }

    function checkLoggedUser() {
        const user = UsersDB.getCurrentUser();

        if (user) {
            authContainer.classList.add("hidden");
            homeContainer.classList.remove("hidden");

            const greeting = document.getElementById("user-greeting");
            if (greeting) {
                greeting.textContent = "Ciao, " + user.name;
            }
        }
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            const result = UsersDB.register(name, email, password);

            if (result.success) {
                showMessage(result.message, "success");
                registerForm.reset();
            } else {
                showMessage(result.message, "error");
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            const result = UsersDB.login(email, password);

            if (result.success) {
                location.reload();
            } else {
                showMessage(result.message, "error");
            }
        });
    }

    const logoutBtn = document.getElementById("dropdown-logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            UsersDB.logout();
            location.reload();
        });
    }

    checkLoggedUser();
});
