
window.UsersDB = {
    getUsers() {
        return JSON.parse(localStorage.getItem("fantalega_users")) || [];
    },

    saveUsers(users) {
        localStorage.setItem("fantalega_users", JSON.stringify(users));
    },

    register(name, email, password) {
        const users = this.getUsers();
        const existing = users.find(u => u.email === email);

        if (existing) {
            return {
                success: false,
                message: "Email già registrata"
            };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password
        };

        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            message: "Registrazione completata"
        };
    },

    login(email, password) {
        const users = this.getUsers();

        const user = users.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            return {
                success: false,
                message: "Credenziali non valide"
            };
        }

        localStorage.setItem(
            "fantalega_current_user",
            JSON.stringify(user)
        );

        return {
            success: true,
            user
        };
    },

    logout() {
        localStorage.removeItem("fantalega_current_user");
    },

    getCurrentUser() {
        return JSON.parse(
            localStorage.getItem("fantalega_current_user")
        );
    }
};
