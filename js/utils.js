/**
 * FantaLega Classic - Utility Functions
 */
const Utils = {
    /**
     * Generate a random numeric ID
     * @param {number} length - Length of the ID
     * @returns {string}
     */
    generateNumericId(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    },
    /**
     * Generate an alphanumeric code (excluding ambiguous characters)
     * @param {number} length - Length of the code
     * @returns {string}
     */
    generateAlphanumericCode(length = 6) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
    /**
     * Generate a unique ID
     * @param {string} prefix - Prefix for the ID
     * @returns {string}
     */
    generateUniqueId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    /**
     * Get initials from a name
     * @param {string} name
     * @returns {string}
     */
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },
    /**
     * Format a date relative to now
     * @param {string} dateString
     * @returns {string}
     */
    formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Ora';
        if (diffMins < 60) return `${diffMins}m fa`;
        if (diffHours < 24) return `${diffHours}h fa`;
        if (diffDays < 7) return `${diffDays}g fa`;
        return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    },
    /**
     * Format a date in Italian short format
     * @param {string} dateString
     * @returns {string}
     */
    formatShortDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    },
    /**
     * Copy text to clipboard
     * @param {string} text
     * @returns {Promise}
     */
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise((resolve, reject) => {
            document.execCommand('copy') ? resolve() : reject();
            textArea.remove();
        });
    },
    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    /**
     * Debounce function
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    /**
     * Check if a string is a valid hex color
     * @param {string} color
     * @returns {boolean}
     */
    isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },
    /**
     * Validate image file
     * @param {File} file
     * @returns {{valid: boolean, error?: string}}
     */
    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'Nessun file selezionato' };
        }
        
        if (!file.type.startsWith('image/')) {
            return { valid: false, error: 'Seleziona un\'immagine valida' };
        }
        
        if (file.size > CONFIG.VALIDATION.MAX_IMAGE_SIZE) {
            return { valid: false, error: 'L\'immagine deve essere inferiore a 2MB' };
        }
        
        return { valid: true };
    },
    /**
     * Read file as Base64
     * @param {File} file
     * @returns {Promise<string>}
     */
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    /**
     * Update clock display
     */
    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const clockEl = document.getElementById('current-time');
        if (clockEl) clockEl.textContent = timeStr;
    }
};
// Initialize clock
setInterval(Utils.updateClock, 1000);
Utils.updateClock();
