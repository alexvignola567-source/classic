/**
 * FantaLega Classic - Form Components
 */
const Forms = {
    /**
     * Show message in form
     * @param {HTMLElement} element
     * @param {string} text
     * @param {string} type
     */
    showMessage(element, text, type) {
        element.textContent = text;
        element.className = `message ${type}`;
        
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 4000);
    },
    /**
     * Handle image upload
     * @param {Event} e
     * @param {Function} onSuccess
     */
    async handleImageUpload(e, onSuccess) {
        const file = e.target.files[0];
        if (!file) return;
        const validation = Utils.validateImageFile(file);
        if (!validation.valid) {
            Toast.error('Errore', validation.error);
            return;
        }
        try {
            const base64 = await Utils.readFileAsBase64(file);
            onSuccess(base64);
        } catch (error) {
            Toast.error('Errore', 'Impossibile caricare l\'immagine');
        }
    }
};
