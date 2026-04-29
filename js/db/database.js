/**
 * FantaLega Classic - Database Core
 * Handles localStorage operations
 */
const Database = {
    /**
     * Get data from localStorage
     * @param {string} key
     * @returns {Object}
     */
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
            console.error(`Error reading ${key} from localStorage:`, e);
            return {};
        }
    },
    /**
     * Save data to localStorage
     * @param {string} key
     * @param {Object} data
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage:`, e);
        }
    },
    /**
     * Get array data from localStorage
     * @param {string} key
     * @returns {Array}
     */
    getArray(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.error(`Error reading ${key} from localStorage:`, e);
            return [];
        }
    },
    /**
     * Clear specific key from localStorage
     * @param {string} key
     */
    clear(key) {
        localStorage.removeItem(key);
    },
    /**
     * Clear all app data from localStorage
     */
    clearAll() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};
