/**
 * FantaLega Classic - Profile Section
 */
const ProfileSection = {
    /**
     * Render profile section
     */
    render() {
        const section = document.getElementById('section-profile');
        const user = UsersDB.getCurrentUser();
        
        if (!user) return;
        UsersDB.cleanupFriends(user.email);
        const freshUser = UsersDB.getCurrentUser();
        const avatarContent = freshUser.avatar 
            ? `<img src="${freshUser.avatar}" alt="${Utils.escapeHtml(freshUser.name)}">`
            : Utils.getInitials(freshUser.name);
        section.innerHTML = `
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-id-card"></i> Scheda Allenatore</h1>
                    <p>Personalizza il tuo profilo</p>
                </div>
                <button class="btn btn-secondary" onclick="App.showSection('home')">
                    <i class="fas fa-arrow-left"></i> Torna alla Bacheca
                </button>
            </div>
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="avatar-container">
                            <div class="avatar" id="profile-avatar">${avatarContent}</div>
                            <label class="avatar-edit" title="Cambia foto">
                                <i class="fas fa-camera"></i>
                                <input type="file" id="avatar-upload" accept="image/*">
                            </label>
                        </div>
                        <div class="profile-info">
                            <h2 id="profile-display-name">${Utils.escapeHtml(freshUser.name)}</h2>
                            <div class="user-id-badge">
                                <i class="fas fa-hashtag"></i> <span id="profile-user-id">${freshUser.id}</span>
                                <button type="button" class="copy-btn" onclick="ProfileSection.copyUserId()" title="Copia ID">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="status-badge">
                                <span class="status-dot"></span>
                                In panchina
                            </div>
                        </div>
                    </div>
                    <div class="profile-body">
                        <form id="profile-form" class="profile-form">
                            <div class="form-group">
                                <label for="profile-name"><i class="fas fa-user"></i> Nome Allenatore</label>
                                <input type="text" id="profile-name" required value="${Utils.escapeHtml(freshUser.name)}">
                            </div>
                            <div class="form-group">
                                <label for="profile-email"><i class="fas fa-envelope"></i> Email</label>
                                <input type="email" id="profile-email" disabled value="${Utils.escapeHtml(freshUser.email)}">
                            </div>
                            <div class="form-group">
                                <label for="profile-bio"><i class="fas fa-quote-left"></i> Motto</label>
                                <textarea id="profile-bio" rows="3" placeholder="Il tuo motto da allenatore...">${Utils.escapeHtml(freshUser.bio || '')}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salva modifiche
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="App.showSection('home')">
                                    <i class="fas fa-times"></i> Annulla
                                </button>
                            </div>
                        </form>
                        <div class="danger-zone">
                            <h3><i class="fas fa-exclamation-triangle"></i> Zona Pericolosa</h3>
                            <p>Disconnetti il tuo account da questo dispositivo.</p>
                            <button type="button" class="btn btn-danger" onclick="ProfileSection.logout()">
                                <i class="fas fa-sign-out-alt"></i> Esci dall'account
                            </button>
                        </div>
                    </div>
                </div>
                <div id="profile-message" class="message"></div>
            </div>
        `;
        this.setupEventListeners();
    },
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Avatar upload
        document.getElementById('avatar-upload')?.addEventListener('change', (e) => {
            Forms.handleImageUpload(e, (base64) => {
                const user = UsersDB.getCurrentUser();
                UsersDB.update(user.email, { avatar: base64 });
                document.getElementById('profile-avatar').innerHTML = 
                    `<img src="${base64}" alt="${Utils.escapeHtml(user.name)}">`;
                Navigation.updateNavAvatar();
                Toast.success('Foto aggiornata!', 'La tua foto è stata cambiata');
            });
        });
        // Profile form
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = UsersDB.getCurrentUser();
            const name = document.getElementById('profile-name').value.trim();
            const bio = document.getElementById('profile-bio').value;
            if (!name) {
                Forms.showMessage(
                    document.getElementById('profile-message'),
                    'Il nome non può essere vuoto',
                    'error'
                );
                return;
            }
            UsersDB.update(user.email, { name, bio });
            
            document.getElementById('user-greeting').textContent = `Mister ${name}`;
            document.getElementById('profile-display-name').textContent = name;
            if (!user.avatar) {
                document.getElementById('profile-avatar').innerHTML = Utils.getInitials(name);
            }
            
            Navigation.updateNavAvatar();
            Toast.success('Salvato!', 'Profilo aggiornato con successo');
        });
    },
    /**
     * Copy user ID to clipboard
     */
    copyUserId() {
        const userId = document.getElementById('profile-user-id').textContent;
        Utils.copyToClipboard(userId).then(() => {
            Toast.success('Copiato!', `ID #${userId} copiato negli appunti`);
        }).catch(() => {
            Toast.error('Errore', 'Impossibile copiare');
        });
    },
    /**
     * Logout
     */
    logout() {
        Modal.confirm(
            'Esci dall\'account',
            'Sei sicuro di voler uscire?',
            () => {
                App.logout();
            }
        );
    }
};
/**
 * Profile Modal - View other user's profile
 */
const ProfileModal = {
    /**
     * Show profile modal
     * @param {string} userId
     */
    show(userId) {
        const user = UsersDB.getById(userId);
        if (!user) return;
        const currentUser = UsersDB.getCurrentUser();
        const isOwnProfile = currentUser && currentUser.id === userId;
        const isFriend = currentUser && (currentUser.friends || []).includes(userId);
        const hasSentRequest = currentUser && (currentUser.sentRequests || []).includes(userId);
        const hasReceivedRequest = currentUser && (currentUser.friendRequests || []).includes(userId);
        const avatarContent = user.avatar
            ? `<img src="${user.avatar}" alt="${Utils.escapeHtml(user.name)}">`
            : Utils.getInitials(user.name);
        let actionsHtml = '';
        if (!isOwnProfile && currentUser) {
            if (isFriend) {
                actionsHtml = `
                    <button class="btn btn-secondary" onclick="ProfileModal.sendPoke('${userId}')">
                        <i class="fas fa-hand-paper"></i> Saluta
                    </button>
                    <button class="btn btn-danger" onclick="ProfileModal.removeFriend('${userId}')">
                        <i class="fas fa-user-minus"></i> Rimuovi compagno
                    </button>
                `;
            } else if (hasSentRequest) {
                actionsHtml = `
                    <button class="btn btn-secondary" disabled>
                        <i class="fas fa-clock"></i> Richiesta inviata
                    </button>
                    <button class="btn btn-ghost" onclick="ProfileModal.cancelRequest('${userId}')">
                        Annulla richiesta
                    </button>
                `;
            } else if (hasReceivedRequest) {
                actionsHtml = `
                    <button class="btn btn-success" onclick="ProfileModal.acceptFriend('${userId}')">
                        <i class="fas fa-check"></i> Accetta
                    </button>
                    <button class="btn btn-secondary" onclick="ProfileModal.rejectFriend('${userId}')">
                        <i class="fas fa-times"></i> Rifiuta
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn btn-primary" onclick="ProfileModal.addFriend('${userId}')">
                        <i class="fas fa-user-plus"></i> Aggiungi compagno
                    </button>
                `;
            }
        }
        const modalHtml = `
            <div class="modal">
                <div class="profile-modal-content">
                    <div class="profile-modal-avatar">${avatarContent}</div>
                    <div class="profile-modal-name">${Utils.escapeHtml(user.name)}</div>
                    <div class="profile-modal-id">#${user.id}</div>
                    <div class="profile-modal-status">
                        <span class="status-dot"></span>
                        In panchina
                    </div>
                    <div class="profile-modal-bio">${Utils.escapeHtml(user.bio || 'Nessun motto')}</div>
                    <div class="profile-modal-actions">
                        ${actionsHtml}
                    </div>
                </div>
                <div class="modal-actions" style="justify-content: center;">
                    <button class="btn btn-secondary" onclick="ProfileModal.close()">
                        <i class="fas fa-times"></i> Chiudi
                    </button>
                </div>
            </div>
        `;
        Modal.showCustom('profile-view-modal', modalHtml);
    },
    /**
     * Close profile modal
     */
    close() {
        Modal.closeCustom('profile-view-modal');
    },
    /**
     * Add friend from profile modal
     */
    addFriend(userId) {
        const currentUser = UsersDB.getCurrentUser();
        const result = FriendsDB.sendRequest(currentUser.email, userId);
        
        if (result.success) {
            Toast.success('Richiesta inviata!', result.message);
            this.close();
            FriendsSection.render();
        } else {
            Toast.error('Errore', result.message);
        }
    },
    /**
     * Accept friend from profile modal
     */
    acceptFriend(userId) {
        const currentUser = UsersDB.getCurrentUser();
        const result = FriendsDB.acceptRequest(currentUser.email, userId);
        
        if (result.success) {
            Toast.success('Nuovo compagno!', result.message);
            this.close();
            FriendsSection.render();
            Navigation.updateNotificationBadge();
            Navigation.renderNotifications();
        }
    },
    /**
     * Reject friend from profile modal
     */
    rejectFriend(userId) {
        const currentUser = UsersDB.getCurrentUser();
        FriendsDB.rejectRequest(currentUser.email, userId);
        Toast.info('Richiesta rifiutata');
        this.close();
        FriendsSection.render();
        Navigation.updateNotificationBadge();
        Navigation.renderNotifications();
    },
    /**
     * Cancel request from profile modal
     */
    cancelRequest(userId) {
        const currentUser = UsersDB.getCurrentUser();
        FriendsDB.cancelRequest(currentUser.email, userId);
        Toast.info('Richiesta annullata');
        this.close();
        FriendsSection.render();
    },
    /**
     * Send poke from profile modal
     */
    sendPoke(userId) {
        const friend = UsersDB.getById(userId);
        if (friend) {
            Toast.success('Saluto inviato!', `Hai salutato ${friend.name}`);
        }
    },
    /**
     * Remove friend from profile modal
     */
    removeFriend(userId) {
        const friend = UsersDB.getById(userId);
        this.close();
        
        Modal.confirm(
            'Rimuovi compagno',
            `Sei sicuro di voler rimuovere ${friend?.name || 'questo allenatore'} dai compagni?`,
            () => {
                const currentUser = UsersDB.getCurrentUser();
                FriendsDB.remove(currentUser.email, userId);
                Toast.info('Compagno rimosso');
                FriendsSection.render();
            }
        );
    }
};
