/**
 * FantaLega Classic - Friends Section
 */
const FriendsSection = {
    /**
     * Render friends section
     */
    render() {
        const section = document.getElementById('section-friends');
        
        section.innerHTML = `
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-users"></i> Compagni di Lega</h1>
                    <p>Gestisci i tuoi contatti</p>
                </div>
                <button class="btn btn-secondary" onclick="Navigation.goBackFromFriends()">
                    <i class="fas fa-arrow-left"></i> Indietro
                </button>
            </div>
            <div class="friends-container">
                <div class="profile-card">
                    <div class="profile-body">
                        <h3 class="section-title"><i class="fas fa-user-plus"></i> Aggiungi Compagno</h3>
                        <p style="color: var(--gray-500); font-size: 0.8125rem; margin-bottom: 0.875rem;">
                            Inserisci l'ID a 6 cifre dell'allenatore per inviargli una richiesta di amicizia.
                        </p>
                        <div class="add-friend-form">
                            <input type="text" id="friend-id-input" placeholder="000000" maxlength="6">
                            <button type="button" class="btn btn-primary" onclick="FriendsSection.sendRequest()">
                                <i class="fas fa-paper-plane"></i> Invia richiesta
                            </button>
                        </div>
                        <div id="friend-message" class="message"></div>
                        <div style="margin-top: 1.5rem;">
                            <div class="tabs">
                                <button class="tab active" data-tab="friends">
                                    <i class="fas fa-user-friends"></i> Compagni
                                    <span class="tab-badge hidden" id="friends-count-badge">0</span>
                                </button>
                                <button class="tab" data-tab="requests">
                                    <i class="fas fa-inbox"></i> Richieste
                                    <span class="tab-badge hidden" id="requests-badge">0</span>
                                </button>
                                <button class="tab" data-tab="sent">
                                    <i class="fas fa-paper-plane"></i> Inviate
                                    <span class="tab-badge hidden" id="sent-badge">0</span>
                                </button>
                            </div>
                            <div id="tab-friends" class="list-container">
                                <div id="friends-list"></div>
                            </div>
                            <div id="tab-requests" class="list-container hidden">
                                <div id="requests-list"></div>
                            </div>
                            <div id="tab-sent" class="list-container hidden">
                                <div id="sent-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.setupEventListeners();
        this.renderLists();
    },
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                document.getElementById('tab-friends').classList.toggle('hidden', tabName !== 'friends');
                document.getElementById('tab-requests').classList.toggle('hidden', tabName !== 'requests');
                document.getElementById('tab-sent').classList.toggle('hidden', tabName !== 'sent');
            });
        });
        // Friend ID input
        const input = document.getElementById('friend-id-input');
        input?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendRequest();
            }
        });
    },
    /**
     * Render all lists
     */
    renderLists() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        UsersDB.cleanupFriends(user.email);
        const freshUser = UsersDB.getCurrentUser();
        const friends = freshUser.friends || [];
        const requests = freshUser.friendRequests || [];
        const sent = freshUser.sentRequests || [];
        // Update badges
        const requestsBadge = document.getElementById('requests-badge');
        requestsBadge.textContent = requests.length;
        requestsBadge.classList.toggle('hidden', requests.length === 0);
        const sentBadge = document.getElementById('sent-badge');
        sentBadge.textContent = sent.length;
        sentBadge.classList.toggle('hidden', sent.length === 0);
        // Render friends list
        const friendsList = document.getElementById('friends-list');
        if (friends.length === 0) {
            friendsList.innerHTML = `
                <div class="no-items">
                    <div class="no-items-icon"><i class="fas fa-users"></i></div>
                    <p>Nessun compagno ancora</p>
                    <small>Aggiungi compagni inserendo il loro ID a 6 cifre!</small>
                </div>
            `;
        } else {
            friendsList.innerHTML = friends.map(id => {
                const friend = UsersDB.getById(id);
                return friend ? Cards.renderFriend(friend) : '';
            }).join('');
        }
        // Render requests list
        const requestsList = document.getElementById('requests-list');
        if (requests.length === 0) {
            requestsList.innerHTML = `
                <div class="no-items">
                    <div class="no-items-icon"><i class="fas fa-inbox"></i></div>
                    <p>Nessuna richiesta in arrivo</p>
                    <small>Le richieste appariranno qui</small>
                </div>
            `;
        } else {
            requestsList.innerHTML = requests.map(id => {
                const requester = UsersDB.getById(id);
                return requester ? Cards.renderFriendRequest(requester) : '';
            }).join('');
        }
        // Render sent list
        const sentList = document.getElementById('sent-list');
        if (sent.length === 0) {
            sentList.innerHTML = `
                <div class="no-items">
                    <div class="no-items-icon"><i class="fas fa-paper-plane"></i></div>
                    <p>Nessuna richiesta inviata</p>
                    <small>Le tue richieste in attesa appariranno qui</small>
                </div>
            `;
        } else {
            sentList.innerHTML = sent.map(id => {
                const target = UsersDB.getById(id);
                return target ? Cards.renderSentRequest(target) : '';
            }).join('');
        }
    },
    /**
     * Send friend request
     */
    sendRequest() {
        const input = document.getElementById('friend-id-input');
        const messageEl = document.getElementById('friend-message');
        const friendId = input.value.trim();
        if (!friendId) {
            Forms.showMessage(messageEl, 'Inserisci un ID allenatore', 'error');
            return;
        }
        if (friendId.length !== 6 || !/^\d{6}$/.test(friendId)) {
            Forms.showMessage(messageEl, 'L\'ID deve essere di 6 cifre', 'error');
            return;
        }
        const user = UsersDB.getCurrentUser();
        const result = FriendsDB.sendRequest(user.email, friendId);
        if (result.success) {
            Toast.success('Richiesta inviata!', result.message);
            input.value = '';
            messageEl.textContent = '';
            this.renderLists();
            // Switch to sent tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.tab[data-tab="sent"]').classList.add('active');
            document.getElementById('tab-friends').classList.add('hidden');
            document.getElementById('tab-requests').classList.add('hidden');
            document.getElementById('tab-sent').classList.remove('hidden');
        } else {
            Forms.showMessage(messageEl, result.message, 'error');
        }
    },
    /**
     * Accept friend request
     */
    accept(userId) {
        const user = UsersDB.getCurrentUser();
        const result = FriendsDB.acceptRequest(user.email, userId);
        
        if (result.success) {
            Toast.success('Nuovo compagno!', result.message);
            this.renderLists();
            Navigation.updateNotificationBadge();
            Navigation.renderNotifications();
        }
    },
    /**
     * Reject friend request
     */
    reject(userId) {
        const user = UsersDB.getCurrentUser();
        FriendsDB.rejectRequest(user.email, userId);
        Toast.info('Richiesta rifiutata');
        this.renderLists();
        Navigation.updateNotificationBadge();
        Navigation.renderNotifications();
    },
    /**
     * Cancel sent request
     */
    cancel(userId) {
        const user = UsersDB.getCurrentUser();
        FriendsDB.cancelRequest(user.email, userId);
        Toast.info('Richiesta annullata');
        this.renderLists();
    },
    /**
     * Send poke
     */
    sendPoke(friendId) {
        const friend = UsersDB.getById(friendId);
        if (friend) {
            Toast.success('Saluto inviato!', `Hai salutato ${friend.name}`);
        }
    },
    /**
     * Confirm remove friend
     */
    confirmRemove(friendId) {
        const friend = UsersDB.getById(friendId);
        Modal.confirm(
            'Rimuovi compagno',
            `Sei sicuro di voler rimuovere ${friend?.name || 'questo allenatore'} dai compagni?`,
            () => {
                const user = UsersDB.getCurrentUser();
                FriendsDB.remove(user.email, friendId);
                Toast.info('Compagno rimosso');
                this.renderLists();
            }
        );
    },
    /**
     * Accept from notification
     */
    acceptFromNotif(fromId) {
        const user = UsersDB.getCurrentUser();
        const result = FriendsDB.acceptRequest(user.email, fromId);
        
        if (result.success) {
            Toast.success('Nuovo compagno!', result.message);
            Navigation.renderNotifications();
            Navigation.updateNotificationBadge();
            this.renderLists();
        }
    },
    /**
     * Reject from notification
     */
    rejectFromNotif(fromId) {
        const user = UsersDB.getCurrentUser();
        FriendsDB.rejectRequest(user.email, fromId);
        Toast.info('Richiesta rifiutata');
        Navigation.renderNotifications();
        Navigation.updateNotificationBadge();
        this.renderLists();
    }
};
