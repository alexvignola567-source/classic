/**
 * FantaLega Classic - Modal System
 */
const Modal = {
    currentCallback: null,
    /**
     * Show confirmation modal
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     * @param {Object} options
     */
    confirm(title, message, onConfirm, options = {}) {
        const modalId = 'confirm-modal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = this.createConfirmModal(modalId);
        }
        document.getElementById('modal-title').innerHTML = 
            `<i class="fas fa-question-circle"></i> ${Utils.escapeHtml(title)}`;
        document.getElementById('modal-message').textContent = message;
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.className = `btn ${options.confirmClass || 'btn-danger'}`;
        confirmBtn.innerHTML = `<i class="fas fa-check"></i> ${options.confirmText || 'Conferma'}`;
        this.currentCallback = onConfirm;
        modal.classList.add('show');
    },
    /**
     * Close modal
     */
    close() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.currentCallback = null;
    },
    /**
     * Handle confirm action
     */
    handleConfirm() {
        if (this.currentCallback) {
            this.currentCallback();
        }
        this.close();
    },
    /**
     * Create confirmation modal
     * @param {string} id
     * @returns {HTMLElement}
     */
    createConfirmModal(id) {
        const container = document.getElementById('modals-container');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-body" style="padding-top: 1.5rem;">
                    <h3 id="modal-title"><i class="fas fa-question-circle"></i> Conferma</h3>
                    <p id="modal-message">Sei sicuro?</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="Modal.close()">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                    <button class="btn btn-danger" id="modal-confirm" onclick="Modal.handleConfirm()">
                        <i class="fas fa-check"></i> Conferma
                    </button>
                </div>
            </div>
        `;
        container.appendChild(modal);
        return modal;
    },
    /**
     * Show custom modal
     * @param {string} id
     * @param {string} html
     * @returns {HTMLElement}
     */
    showCustom(id, html) {
        let modal = document.getElementById(id);
        
        if (!modal) {
            const container = document.getElementById('modals-container');
            modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = id;
            modal.innerHTML = html;
            container.appendChild(modal);
        }
        modal.classList.add('show');
        return modal;
    },
    /**
     * Close custom modal
     * @param {string} id
     */
    closeCustom(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
        }
    },
    /**
     * Remove custom modal
     * @param {string} id
     */
    removeCustom(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }
};
