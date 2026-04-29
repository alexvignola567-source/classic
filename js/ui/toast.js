/**
 * FantaLega Classic - Toast Notifications
 */
const Toast = {
    /**
     * Show a toast notification
     * @param {string} title
     * @param {string} message
     * @param {string} type - 'success', 'error', or 'info'
     */
    show(title, message = '', type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${Utils.escapeHtml(title)}</div>
                ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(toast);
        // Auto-remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    },
    /**
     * Show success toast
     */
    success(title, message = '') {
        this.show(title, message, 'success');
    },
    /**
     * Show error toast
     */
    error(title, message = '') {
        this.show(title, message, 'error');
    },
    /**
     * Show info toast
     */
    info(title, message = '') {
        this.show(title, message, 'info');
    }
};
