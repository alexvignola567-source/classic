/**
 * FantaLega Classic - Users Database Module
 */
const UsersDB = {
    /**
     * Get all users
     * @returns {Object}
     */
    getAll() {
        return Database.get(CONFIG.STORAGE_KEYS.USERS);
    },
    /**
     * Save all users
     * @param {Object} users
     */
    saveAll(users) {
        Database.save(CONFIG.STORAGE_KEYS.USERS, users);
    },
    /**
     * Get user by email
     * @param {string} email
     * @returns {Object|null}
     */
    getByEmail(email) {
        const users = this.getAll();
        return users[email.toLowerCase()] || null;
    },
    /**
     * Get user by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getById(id) {
        const users = this.getAll();
        return Object.values(users).find(u => u.id === id) || null;
    },
    /**
     * Check if email exists
     * @param {string} email
     * @returns {boolean}
     */
    emailExists(email) {
        return this.getByEmail(email) !== null;
    },
    /**
     * Check if ID exists
     * @param {string} id
     * @returns {boolean}
     */
    idExists(id) {
        return this.getById(id) !== null;
    },
    /**
     * Create a new user
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @returns {{success: boolean, message?: string, userId?: string}}
     */
    create(email, password, name) {
        const normalizedEmail = email.toLowerCase().trim();
        if (!Utils.isValidEmail(normalizedEmail)) {
            return { success: false, message: 'Formato email non valido' };
        }
        if (this.emailExists(normalizedEmail)) {
            return { success: false, message: 'Questa email è già registrata.' };
        }
        const users = this.getAll();
        // Generate unique user ID
        let userId;
        do {
            userId = Utils.generateNumericId(CONFIG.VALIDATION.USER_ID_LENGTH);
        } while (this.idExists(userId));
        users[normalizedEmail] = {
            id: userId,
            email: normalizedEmail,
            password,
            name: name.trim(),
            bio: '',
            avatar: null,
            friends: [],
            friendRequests: [],
            sentRequests: [],
            groups: [],
            teams: [],
            lastOnline: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        this.saveAll(users);
        return { success: true, userId };
    },
    /**
     * Update user data
     * @param {string} email
     * @param {Object} data
     * @returns {boolean}
     */
    update(email, data) {
        const users = this.getAll();
        const normalizedEmail = email.toLowerCase();
        
        if (!users[normalizedEmail]) return false;
        
        users[normalizedEmail] = { 
            ...users[normalizedEmail], 
            ...data,
            lastOnline: new Date().toISOString()
        };
        
        this.saveAll(users);
        return true;
    },
    /**
     * Get current logged-in user
     * @returns {Object|null}
     */
    getCurrentUser() {
        const email = sessionStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        return email ? this.getByEmail(email) : null;
    },
    /**
     * Set current user session
     * @param {string} email
     */
    setCurrentUser(email) {
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, email.toLowerCase());
    },
    /**
     * Logout current user
     */
    logout() {
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    },
    /**
     * Authenticate user
     * @param {string} email
     * @param {string} password
     * @returns {{success: boolean, message?: string}}
     */
    authenticate(email, password) {
        const user = this.getByEmail(email);
        if (!user || user.password !== password) {
            return { success: false, message: 'Email o password non validi' };
        }
        this.setCurrentUser(email);
        this.update(email, { lastOnline: new Date().toISOString() });
        
        return { success: true };
    },
    /**
     * Cleanup user friend lists (remove duplicates and self)
     * @param {string} email
     */
    cleanupFriends(email) {
        const users = this.getAll();
        const user = users[email.toLowerCase()];
        
        if (!user) return;
        user.friends = [...new Set(user.friends || [])].filter(id => id !== user.id);
        user.friendRequests = [...new Set(user.friendRequests || [])].filter(id => id !== user.id);
        user.sentRequests = [...new Set(user.sentRequests || [])].filter(id => id !== user.id);
        this.saveAll(users);
    },
    /**
     * Add team to user
     * @param {string} userId
     * @param {string} teamId
     */
    addTeam(userId, teamId) {
        const users = this.getAll();
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        
        if (!userEmail) return;
        
        users[userEmail].teams = users[userEmail].teams || [];
        if (!users[userEmail].teams.includes(teamId)) {
            users[userEmail].teams.push(teamId);
        }
        
        this.saveAll(users);
    },
    /**
     * Remove team from user
     * @param {string} userId
     * @param {string} teamId
     */
    removeTeam(userId, teamId) {
        const users = this.getAll();
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        
        if (!userEmail) return;
        
        users[userEmail].teams = (users[userEmail].teams || []).filter(id => id !== teamId);
        this.saveAll(users);
    }
};
