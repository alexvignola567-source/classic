// Update clock in header
        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const clockEl = document.getElementById('current-time');
            if (clockEl) clockEl.textContent = timeStr;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Utility functions
        function generateUserId() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }

        function generateGroupCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function getInitials(name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }

        function formatDate(dateString) {
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
        }

        function showToast(title, message, type = 'info') {
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
                    <div class="toast-title">${title}</div>
                    ${message ? `<div class="toast-message">${message}</div>` : ''}
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        function copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            } else {
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
            }
        }

        // Modal functions
        let modalCallback = null;

        function showModal(title, message, onConfirm) {
            document.getElementById('modal-title').innerHTML = '<i class="fas fa-question-circle"></i> ' + title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('confirm-modal').classList.add('show');
            modalCallback = onConfirm;
        }

        function closeModal() {
            document.getElementById('confirm-modal').classList.remove('show');
            modalCallback = null;
        }

        document.getElementById('modal-confirm').addEventListener('click', () => {
            if (modalCallback) modalCallback();
            closeModal();
        });

        // Profile Modal
        function showProfileModal(userId) {
            const user = DB.getUserById(userId);
            if (!user) return;

            const currentUser = DB.getCurrentUser();
            const isOwnProfile = currentUser && currentUser.id === userId;
            const isFriend = currentUser && (currentUser.friends || []).includes(userId);
            const hasSentRequest = currentUser && (currentUser.sentRequests || []).includes(userId);
            const hasReceivedRequest = currentUser && (currentUser.friendRequests || []).includes(userId);

            const avatarEl = document.getElementById('view-profile-avatar');
            if (user.avatar) {
                avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
            } else {
                avatarEl.innerHTML = getInitials(user.name);
            }

            document.getElementById('view-profile-name').textContent = user.name;
            document.getElementById('view-profile-id').textContent = `#${user.id}`;
            document.getElementById('view-profile-bio').textContent = user.bio || 'Nessun motto';

            const actionsEl = document.getElementById('view-profile-actions');
            let actionsHtml = '';

            if (!isOwnProfile && currentUser) {
                if (isFriend) {
                    actionsHtml = `
                        <button class="btn btn-secondary" onclick="sendPokeFromProfile('${userId}')">
                            <i class="fas fa-hand-paper"></i> Saluta
                        </button>
                        <button class="btn btn-danger" onclick="removeFriendFromProfile('${userId}')">
                            <i class="fas fa-user-minus"></i> Rimuovi compagno
                        </button>
                    `;
                } else if (hasSentRequest) {
                    actionsHtml = `
                        <button class="btn btn-secondary" disabled>
                            <i class="fas fa-clock"></i> Richiesta inviata
                        </button>
                        <button class="btn btn-ghost" onclick="cancelRequestFromProfile('${userId}')">
                            Annulla richiesta
                        </button>
                    `;
                } else if (hasReceivedRequest) {
                    actionsHtml = `
                        <button class="btn btn-success" onclick="acceptFriendFromProfile('${userId}')">
                            <i class="fas fa-check"></i> Accetta
                        </button>
                        <button class="btn btn-secondary" onclick="rejectFriendFromProfile('${userId}')">
                            <i class="fas fa-times"></i> Rifiuta
                        </button>
                    `;
                } else {
                    actionsHtml = `
                        <button class="btn btn-primary" onclick="addFriendFromProfile('${userId}')">
                            <i class="fas fa-user-plus"></i> Aggiungi compagno
                        </button>
                    `;
                }
            }

            actionsEl.innerHTML = actionsHtml;
            document.getElementById('profile-view-modal').classList.add('show');
        }

        window.closeProfileModal = function() {
            document.getElementById('profile-view-modal').classList.remove('show');
        };

        window.addFriendFromProfile = function(userId) {
            const currentUser = DB.getCurrentUser();
            const result = DB.sendFriendRequest(currentUser.email, userId);
            if (result.success) {
                showToast('Richiesta inviata!', result.message, 'success');
                closeProfileModal();
                renderFriends();
            } else {
                showToast('Errore', result.message, 'error');
            }
        };

        window.acceptFriendFromProfile = function(userId) {
            const currentUser = DB.getCurrentUser();
            const result = DB.acceptFriendRequest(currentUser.email, userId);
            if (result.success) {
                showToast('Nuovo compagno!', result.message, 'success');
                closeProfileModal();
                renderFriends();
                updateNotificationBadge();
                renderNotifications();
            }
        };

        window.rejectFriendFromProfile = function(userId) {
            const currentUser = DB.getCurrentUser();
            DB.rejectFriendRequest(currentUser.email, userId);
            showToast('Richiesta rifiutata', '', 'info');
            closeProfileModal();
            renderFriends();
            updateNotificationBadge();
            renderNotifications();
        };

        window.cancelRequestFromProfile = function(userId) {
            const currentUser = DB.getCurrentUser();
            DB.cancelFriendRequest(currentUser.email, userId);
            showToast('Richiesta annullata', '', 'info');
            closeProfileModal();
            renderFriends();
        };

        window.sendPokeFromProfile = function(userId) {
            const friend = DB.getUserById(userId);
            if (friend) {
                showToast('Saluto inviato!', `Hai salutato ${friend.name}`, 'success');
            }
        };

        window.removeFriendFromProfile = function(userId) {
            const friend = DB.getUserById(userId);
            closeProfileModal();
            showModal(
                'Rimuovi compagno',
                `Sei sicuro di voler rimuovere ${friend?.name || 'questo allenatore'} dai compagni?`,
                () => {
                    const currentUser = DB.getCurrentUser();
                    DB.removeFriend(currentUser.email, userId);
                    showToast('Compagno rimosso', '', 'info');
                    renderFriends();
                }
            );
        };

        // Create League Modal
        let newGroupAvatarData = null;

        window.openCreateGroupModal = function() {
            document.getElementById('create-group-modal').classList.add('show');
            document.getElementById('group-name').value = '';
            document.getElementById('group-description').value = '';
            document.getElementById('group-visibility').value = 'invite';
            document.getElementById('group-invite-permission').value = 'all';
            document.getElementById('group-max-members').value = '10';
            document.getElementById('new-group-avatar-preview').innerHTML = 'L';
            newGroupAvatarData = null;
        };

        window.closeCreateGroupModal = function() {
            document.getElementById('create-group-modal').classList.remove('show');
            newGroupAvatarData = null;
        };

        // Edit League Modal
        window.openEditGroupModal = function() {
            const group = DB.getGroupById(currentGroupId);
            if (!group) return;

            document.getElementById('edit-group-name').value = group.name;
            document.getElementById('edit-group-description').value = group.description || '';
            document.getElementById('edit-group-visibility').value = group.visibility || 'invite';
            document.getElementById('edit-group-invite-permission').value = group.invitePermission || 'all';
            document.getElementById('edit-group-max-members').value = group.maxMembers || '0';
            
            document.getElementById('edit-group-modal').classList.add('show');
        };

        window.closeEditGroupModal = function() {
            document.getElementById('edit-group-modal').classList.remove('show');
        };

        document.getElementById('edit-group-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('edit-group-name').value.trim();
            if (!name) {
                showToast('Errore', 'Il nome non puÃ² essere vuoto', 'error');
                return;
            }

            DB.updateGroup(currentGroupId, {
                name,
                description: document.getElementById('edit-group-description').value,
                visibility: document.getElementById('edit-group-visibility').value,
                invitePermission: document.getElementById('edit-group-invite-permission').value,
                maxMembers: parseInt(document.getElementById('edit-group-max-members').value)
            });

            closeEditGroupModal();
            showToast('Salvato!', 'Impostazioni aggiornate', 'success');
            showGroup(currentGroupId);
            renderGroups();
            renderNavGroups();
        });

        // Transfer Ownership Modal
        window.openTransferModal = function() {
            const group = DB.getGroupById(currentGroupId);
            const user = DB.getCurrentUser();
            if (!group) return;

            const otherMembers = group.members.filter(id => id !== user.id);
            const listEl = document.getElementById('transfer-members-list');

            if (otherMembers.length === 0) {
                listEl.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <p>Non ci sono altri partecipanti a cui trasferire la presidenza</p>
                    </div>
                `;
            } else {
                listEl.innerHTML = otherMembers.map(memberId => {
                    const member = DB.getUserById(memberId);
                    if (!member) return '';
                    
                    const avatarContent = member.avatar 
                        ? `<img src="${member.avatar}" alt="${member.name}">`
                        : getInitials(member.name);
                    
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div class="friend-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">${avatarContent}</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--gray-900);">${member.name}</div>
                                    <div style="font-size: 0.6875rem; color: var(--gray-500); font-family: 'Courier New', monospace;">#${member.id}</div>
                                </div>
                            </div>
                            <button class="btn btn-warning btn-sm" onclick="confirmTransferOwnership('${memberId}')"><i class="fas fa-crown"></i> Trasferisci</button>
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('transfer-ownership-modal').classList.add('show');
        };

        window.closeTransferModal = function() {
            document.getElementById('transfer-ownership-modal').classList.remove('show');
        };

        window.confirmTransferOwnership = function(newOwnerId) {
            const member = DB.getUserById(newOwnerId);
            closeTransferModal();
            
            showModal(
                'Conferma trasferimento',
                `Sei sicuro di voler trasferire la presidenza della lega a ${member?.name}? Questa azione Ã¨ irreversibile.`,
                () => {
                    const result = DB.transferOwnership(currentGroupId, newOwnerId);
                    if (result.success) {
                        showToast('Presidenza trasferita!', `${member?.name} Ã¨ ora il presidente`, 'success');
                        showGroup(currentGroupId);
                    } else {
                        showToast('Errore', result.message, 'error');
                    }
                }
            );
        };

        // New league avatar preview
        document.getElementById('new-group-avatar').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Errore', 'Seleziona un\'immagine valida', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Errore', 'L\'immagine deve essere inferiore a 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                newGroupAvatarData = event.target.result;
                document.getElementById('new-group-avatar-preview').innerHTML = `<img src="${newGroupAvatarData}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('group-name').addEventListener('input', function(e) {
            if (!newGroupAvatarData) {
                const name = e.target.value.trim();
                document.getElementById('new-group-avatar-preview').innerHTML = name ? getInitials(name) : 'L';
            }
        });

        // Invite Modal
        window.openInviteModal = function(groupId) {
            const user = DB.getCurrentUser();
            const friends = user.friends || [];
            const group = DB.getGroupById(groupId);
            
            if (!group) return;

            const listEl = document.getElementById('invite-friends-modal-list');
            
            if (friends.length === 0) {
                listEl.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <p>Non hai ancora compagni da invitare</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="closeInviteModal(); navigateToFriendsFromGroup('${groupId}');">
                            <i class="fas fa-user-plus"></i> Aggiungi compagni
                        </button>
                    </div>
                `;
            } else {
                listEl.innerHTML = friends.map(friendId => {
                    const friend = DB.getUserById(friendId);
                    if (!friend) return '';
                    
                    const isInGroup = group.members.includes(friendId);
                    const isPending = (group.pendingInvites || []).includes(friendId);
                    
                    const avatarContent = friend.avatar 
                        ? `<img src="${friend.avatar}" alt="${friend.name}">`
                        : getInitials(friend.name);
                    
                    let actionBtn = '';
                    if (isInGroup) {
                        actionBtn = `<span style="color: var(--success); font-size: 0.75rem; font-weight: 600;"><i class="fas fa-check"></i> GiÃ  in lega</span>`;
                    } else if (isPending) {
                        actionBtn = `<span style="color: var(--warning); font-size: 0.75rem; font-weight: 600;"><i class="fas fa-clock"></i> Invito inviato</span>`;
                    } else {
                        actionBtn = `<button class="btn btn-primary btn-sm" onclick="sendGroupInvite('${groupId}', '${friendId}')"><i class="fas fa-paper-plane"></i> Invita</button>`;
                    }
                    
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div class="friend-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">${avatarContent}</div>
                                <div>
                                    <div style="font-weight: 600; color: var(--gray-900);">${friend.name}</div>
                                    <div style="font-size: 0.6875rem; color: var(--gray-500); font-family: 'Courier New', monospace;">#${friend.id}</div>
                                </div>
                            </div>
                            ${actionBtn}
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('invite-group-modal').classList.add('show');
            window.currentInviteGroupId = groupId;
        };

        window.closeInviteModal = function() {
            document.getElementById('invite-group-modal').classList.remove('show');
        };

        window.sendGroupInvite = function(groupId, friendId) {
            const user = DB.getCurrentUser();
            const result = DB.inviteToGroup(groupId, friendId, user.id);
            
            if (result.success) {
                showToast('Invito inviato!', result.message, 'success');
                openInviteModal(groupId);
                renderNotifications();
            } else {
                showToast('Errore', result.message, 'error');
            }
        };

        // Navigation
        let navigationHistory = ['home'];
        let returnToGroupId = null;

        window.navigateToFriendsFromGroup = function(groupId) {
            returnToGroupId = groupId;
            showSection('friends');
        };

        window.goBackFromFriends = function() {
            if (returnToGroupId) {
                const groupId = returnToGroupId;
                returnToGroupId = null;
                showGroup(groupId);
            } else {
                showSection('home');
            }
        };

        // Database
        const DB = {
            getUsers() {
                return JSON.parse(localStorage.getItem('users') || '{}');
            },

            saveUsers(users) {
                localStorage.setItem('users', JSON.stringify(users));
            },

            getGroups() {
                return JSON.parse(localStorage.getItem('groups') || '{}');
            },

            saveGroups(groups) {
                localStorage.setItem('groups', JSON.stringify(groups));
            },

            getNotifications() {
                return JSON.parse(localStorage.getItem('notifications') || '{}');
            },

            saveNotifications(notifications) {
                localStorage.setItem('notifications', JSON.stringify(notifications));
            },

            getUser(email) {
                const users = this.getUsers();
                return users[email.toLowerCase()] || null;
            },

            getUserById(id) {
                const users = this.getUsers();
                return Object.values(users).find(u => u.id === id) || null;
            },

            getGroupById(groupId) {
                const groups = this.getGroups();
                return groups[groupId] || null;
            },

            getGroupByCode(code) {
                const groups = this.getGroups();
                return Object.values(groups).find(g => g.code.toUpperCase() === code.toUpperCase()) || null;
            },

            emailExists(email) {
                return this.getUser(email) !== null;
            },

            idExists(id) {
                return this.getUserById(id) !== null;
            },

            createUser(email, password, name) {
                const normalizedEmail = email.toLowerCase().trim();

                if (!isValidEmail(normalizedEmail)) {
                    return { success: false, message: 'Formato email non valido' };
                }

                if (this.emailExists(normalizedEmail)) {
                    return { success: false, message: 'Questa email Ã¨ giÃ  registrata.' };
                }

                const users = this.getUsers();

                let userId;
                do {
                    userId = generateUserId();
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
                    lastOnline: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                this.saveUsers(users);
                return { success: true, userId };
            },

            updateUser(email, data) {
                const users = this.getUsers();
                const normalizedEmail = email.toLowerCase();
                if (!users[normalizedEmail]) return false;
                users[normalizedEmail] = { ...users[normalizedEmail], ...data };
                this.saveUsers(users);
                return true;
            },

            getCurrentUser() {
                const email = sessionStorage.getItem('currentUser');
                return email ? this.getUser(email) : null;
            },

            setCurrentUser(email) {
                sessionStorage.setItem('currentUser', email.toLowerCase());
            },

            logout() {
                sessionStorage.removeItem('currentUser');
            },

            cleanupUserFriends(userEmail) {
                const users = this.getUsers();
                const user = users[userEmail.toLowerCase()];
                if (!user) return;

                const uniqueFriends = [...new Set(user.friends || [])].filter(id => id !== user.id);
                user.friends = uniqueFriends;

                const uniqueRequests = [...new Set(user.friendRequests || [])].filter(id => id !== user.id);
                user.friendRequests = uniqueRequests;

                const uniqueSent = [...new Set(user.sentRequests || [])].filter(id => id !== user.id);
                user.sentRequests = uniqueSent;

                this.saveUsers(users);
            },

            sendFriendRequest(fromEmail, toId) {
                const users = this.getUsers();
                const fromUser = users[fromEmail.toLowerCase()];
                const toUser = Object.values(users).find(u => u.id === toId);

                if (!toUser) {
                    return { success: false, message: 'Allenatore non trovato. Verifica l\'ID inserito.' };
                }

                if (fromUser.id === toId) {
                    return { success: false, message: 'Non puoi aggiungere te stesso!' };
                }

                fromUser.friends = fromUser.friends || [];
                fromUser.sentRequests = fromUser.sentRequests || [];
                fromUser.friendRequests = fromUser.friendRequests || [];
                toUser.friends = toUser.friends || [];
                toUser.sentRequests = toUser.sentRequests || [];
                toUser.friendRequests = toUser.friendRequests || [];

                if (fromUser.friends.includes(toId)) {
                    return { success: false, message: 'Siete giÃ  compagni!' };
                }

                if (fromUser.sentRequests.includes(toId)) {
                    return { success: false, message: 'Hai giÃ  inviato una richiesta a questo allenatore.' };
                }

                if (fromUser.friendRequests.includes(toId)) {
                    return { success: false, message: 'Questo allenatore ti ha giÃ  inviato una richiesta! Vai su "Richieste" per accettarla.' };
                }

                fromUser.sentRequests.push(toId);
                toUser.friendRequests.push(fromUser.id);

                this.addNotification(toUser.id, {
                    type: 'friend_request',
                    fromId: fromUser.id,
                    fromName: fromUser.name,
                    message: `${fromUser.name} ti ha inviato una richiesta di amicizia`,
                    timestamp: new Date().toISOString(),
                    read: false
                });

                this.saveUsers(users);
                return { success: true, message: `Richiesta inviata a ${toUser.name}!`, targetName: toUser.name };
            },

            acceptFriendRequest(userEmail, fromId) {
                const users = this.getUsers();
                const user = users[userEmail.toLowerCase()];
                const fromUser = Object.values(users).find(u => u.id === fromId);

                if (!fromUser) return { success: false, message: 'Allenatore non trovato' };

                user.friendRequests = user.friendRequests || [];
                user.friends = user.friends || [];
                fromUser.sentRequests = fromUser.sentRequests || [];
                fromUser.friends = fromUser.friends || [];

                user.friendRequests = user.friendRequests.filter(id => id !== fromId);
                fromUser.sentRequests = fromUser.sentRequests.filter(id => id !== user.id);

                if (!user.friends.includes(fromId)) {
                    user.friends.push(fromId);
                }
                if (!fromUser.friends.includes(user.id)) {
                    fromUser.friends.push(user.id);
                }

                this.saveUsers(users);
                return { success: true, message: `${fromUser.name} Ã¨ ora tuo compagno!`, friendName: fromUser.name };
            },

            rejectFriendRequest(userEmail, fromId) {
                const users = this.getUsers();
                const user = users[userEmail.toLowerCase()];
                const fromUser = Object.values(users).find(u => u.id === fromId);

                user.friendRequests = (user.friendRequests || []).filter(id => id !== fromId);
                if (fromUser) {
                    fromUser.sentRequests = (fromUser.sentRequests || []).filter(id => id !== user.id);
                }

                this.saveUsers(users);
                return { success: true };
            },

            cancelFriendRequest(userEmail, toId) {
                const users = this.getUsers();
                const user = users[userEmail.toLowerCase()];
                const toUser = Object.values(users).find(u => u.id === toId);

                user.sentRequests = (user.sentRequests || []).filter(id => id !== toId);
                if (toUser) {
                    toUser.friendRequests = (toUser.friendRequests || []).filter(id => id !== user.id);
                }

                this.saveUsers(users);
                return { success: true };
            },

            removeFriend(userEmail, friendId) {
                const users = this.getUsers();
                const user = users[userEmail.toLowerCase()];
                const friend = Object.values(users).find(u => u.id === friendId);

                user.friends = (user.friends || []).filter(id => id !== friendId);
                if (friend) {
                    friend.friends = (friend.friends || []).filter(id => id !== user.id);
                }

                this.saveUsers(users);
                return { success: true };
            },

            // Group/League functions
            createGroup(creatorEmail, groupData) {
                const users = this.getUsers();
                const groups = this.getGroups();
                const creator = users[creatorEmail.toLowerCase()];

                if (!creator) return { success: false, message: 'Allenatore non trovato' };

                let groupCode;
                do {
                    groupCode = generateGroupCode();
                } while (this.getGroupByCode(groupCode));

                const groupId = 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                const group = {
                    id: groupId,
                    code: groupCode,
                    name: groupData.name.trim(),
                    description: groupData.description || '',
                    avatar: groupData.avatar || null,
                    visibility: groupData.visibility || 'invite',
                    invitePermission: groupData.invitePermission || 'all',
                    maxMembers: parseInt(groupData.maxMembers) || 0,
                    creator: creator.id,
                    owner: creator.id,
                    admins: [creator.id],
                    members: [creator.id],
                    pendingInvites: [],
                    createdAt: new Date().toISOString()
                };

                groups[groupId] = group;
                this.saveGroups(groups);

                creator.groups = creator.groups || [];
                creator.groups.push(groupId);
                this.saveUsers(users);

                return { success: true, groupId, groupCode };
            },

            updateGroup(groupId, data) {
                const groups = this.getGroups();
                if (!groups[groupId]) return false;
                groups[groupId] = { ...groups[groupId], ...data };
                this.saveGroups(groups);
                return true;
            },

            inviteToGroup(groupId, userId, inviterId) {
                const groups = this.getGroups();
                const users = this.getUsers();
                const group = groups[groupId];
                const invitee = this.getUserById(userId);
                const inviter = this.getUserById(inviterId);

                if (!group) return { success: false, message: 'Lega non trovata' };
                if (!invitee) return { success: false, message: 'Allenatore non trovato' };

                if (group.members.includes(userId)) {
                    return { success: false, message: 'Allenatore giÃ  nella lega' };
                }

                if ((group.pendingInvites || []).includes(userId)) {
                    return { success: false, message: 'Invito giÃ  inviato' };
                }

                if (group.invitePermission === 'admin' && !group.admins.includes(inviterId)) {
                    return { success: false, message: 'Solo gli admin possono invitare' };
                }

                group.pendingInvites = group.pendingInvites || [];
                group.pendingInvites.push(userId);
                this.saveGroups(groups);

                this.addNotification(userId, {
                    type: 'group_invite',
                    groupId: groupId,
                    groupName: group.name,
                    fromId: inviterId,
                    fromName: inviter.name,
                    message: `${inviter.name} ti ha invitato alla lega "${group.name}"`,
                    timestamp: new Date().toISOString(),
                    read: false
                });

                return { success: true, message: `Invito inviato a ${invitee.name}` };
            },

            acceptGroupInvite(userId, groupId) {
                const groups = this.getGroups();
                const users = this.getUsers();
                const group = groups[groupId];
                const user = this.getUserById(userId);

                if (!group || !user) return { success: false, message: 'Errore' };

                if (group.maxMembers > 0 && group.members.length >= group.maxMembers) {
                    return { success: false, message: 'La lega Ã¨ piena' };
                }

                group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
                if (!group.members.includes(userId)) {
                    group.members.push(userId);
                }
                this.saveGroups(groups);

                const userEmail = Object.keys(users).find(email => users[email].id === userId);
                if (userEmail) {
                    users[userEmail].groups = users[userEmail].groups || [];
                    if (!users[userEmail].groups.includes(groupId)) {
                        users[userEmail].groups.push(groupId);
                    }
                    this.saveUsers(users);
                }

                return { success: true, message: `Sei entrato nella lega "${group.name}"` };
            },

            rejectGroupInvite(userId, groupId) {
                const groups = this.getGroups();
                const group = groups[groupId];

                if (!group) return { success: false };

                group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
                this.saveGroups(groups);

                return { success: true };
            },

            joinGroupByCode(userId, code) {
                const group = this.getGroupByCode(code);
                const user = this.getUserById(userId);

                if (!group) return { success: false, message: 'Codice non valido' };
                if (!user) return { success: false, message: 'Allenatore non trovato' };

                if (group.members.includes(userId)) {
                    return { success: false, message: 'Sei giÃ  partecipante di questa lega' };
                }

                if (group.maxMembers > 0 && group.members.length >= group.maxMembers) {
                    return { success: false, message: 'La lega Ã¨ piena' };
                }

                const users = this.getUsers();
                const groups = this.getGroups();

                group.members.push(userId);
                group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
                groups[group.id] = group;
                this.saveGroups(groups);

                const userEmail = Object.keys(users).find(email => users[email].id === userId);
                if (userEmail) {
                    users[userEmail].groups = users[userEmail].groups || [];
                    users[userEmail].groups.push(group.id);
                    this.saveUsers(users);
                }

                return { success: true, message: `Sei entrato nella lega "${group.name}"!`, groupId: group.id };
            },

            leaveGroup(userId, groupId) {
                const groups = this.getGroups();
                const users = this.getUsers();
                const group = groups[groupId];

                if (!group) return { success: false };

                group.members = group.members.filter(id => id !== userId);
                group.admins = group.admins.filter(id => id !== userId);

                if (group.members.length === 0) {
                    delete groups[groupId];
                } else {
                    if (group.owner === userId) {
                        group.owner = group.admins[0] || group.members[0];
                        if (!group.admins.includes(group.owner)) {
                            group.admins.push(group.owner);
                        }
                    }
                    if (group.admins.length === 0) {
                        group.admins.push(group.members[0]);
                    }
                }

                this.saveGroups(groups);

                const userEmail = Object.keys(users).find(email => users[email].id === userId);
                if (userEmail) {
                    users[userEmail].groups = (users[userEmail].groups || []).filter(id => id !== groupId);
                    this.saveUsers(users);
                }

                return { success: true };
            },

            kickFromGroup(groupId, userId, kickerId) {
                const groups = this.getGroups();
                const users = this.getUsers();
                const group = groups[groupId];

                if (!group) return { success: false, message: 'Lega non trovata' };
                
                const isOwner = group.owner === kickerId;
                const isAdmin = group.admins.includes(kickerId);
                const targetIsAdmin = group.admins.includes(userId);
                const targetIsOwner = group.owner === userId;

                if (targetIsOwner) {
                    return { success: false, message: 'Non puoi espellere il presidente' };
                }

                if (!isOwner && !isAdmin) {
                    return { success: false, message: 'Solo admin e presidente possono espellere' };
                }

                if (targetIsAdmin && !isOwner) {
                    return { success: false, message: 'Solo il presidente puÃ² espellere un admin' };
                }

                group.members = group.members.filter(id => id !== userId);
                group.admins = group.admins.filter(id => id !== userId);
                this.saveGroups(groups);

                const userEmail = Object.keys(users).find(email => users[email].id === userId);
                if (userEmail) {
                    users[userEmail].groups = (users[userEmail].groups || []).filter(id => id !== groupId);
                    this.saveUsers(users);
                }

                const kickedUser = this.getUserById(userId);
                return { success: true, message: `${kickedUser?.name || 'Allenatore'} Ã¨ stato espulso` };
            },

            promoteToAdmin(groupId, userId, promoterId) {
                const groups = this.getGroups();
                const group = groups[groupId];

                if (!group) return { success: false, message: 'Lega non trovata' };
                
                const isOwner = group.owner === promoterId;
                if (!isOwner) {
                    return { success: false, message: 'Solo il presidente puÃ² promuovere admin' };
                }

                if (group.admins.includes(userId)) {
                    return { success: false, message: 'Allenatore giÃ  admin' };
                }

                group.admins.push(userId);
                this.saveGroups(groups);

                const promotedUser = this.getUserById(userId);
                return { success: true, message: `${promotedUser?.name} Ã¨ ora admin` };
            },

            demoteFromAdmin(groupId, userId, demoterId) {
                const groups = this.getGroups();
                const group = groups[groupId];

                if (!group) return { success: false, message: 'Lega non trovata' };
                
                const isOwner = group.owner === demoterId;
                if (!isOwner) {
                    return { success: false, message: 'Solo il presidente puÃ² rimuovere admin' };
                }

                if (group.owner === userId) {
                    return { success: false, message: 'Non puoi rimuovere i privilegi del presidente' };
                }

                group.admins = group.admins.filter(id => id !== userId);
                this.saveGroups(groups);

                const demotedUser = this.getUserById(userId);
                return { success: true, message: `${demotedUser?.name} non Ã¨ piÃ¹ admin` };
            },

            transferOwnership(groupId, newOwnerId) {
                const groups = this.getGroups();
                const group = groups[groupId];
                const user = this.getCurrentUser();

                if (!group) return { success: false, message: 'Lega non trovata' };
                
                if (group.owner !== user.id) {
                    return { success: false, message: 'Solo il presidente puÃ² trasferire la presidenza' };
                }

                if (!group.members.includes(newOwnerId)) {
                    return { success: false, message: 'L\'allenatore deve essere partecipante della lega' };
                }

                group.owner = newOwnerId;
                if (!group.admins.includes(newOwnerId)) {
                    group.admins.push(newOwnerId);
                }
                
                this.saveGroups(groups);
                return { success: true };
            },

            getUserGroups(userId) {
                const user = this.getUserById(userId);
                if (!user) return [];

                const groups = this.getGroups();
                return (user.groups || [])
                    .map(groupId => groups[groupId])
                    .filter(g => g !== undefined);
            },

            canSeeGroupCode(groupId, userId) {
                const group = this.getGroupById(groupId);
                if (!group) return false;
                
                if (group.visibility === 'code') return true;
                
                const isOwner = group.owner === userId;
                const isAdmin = group.admins.includes(userId);
                
                return isOwner || isAdmin;
            },

            canInvite(groupId, userId) {
                const group = this.getGroupById(groupId);
                if (!group) return false;
                
                const isOwner = group.owner === userId;
                const isAdmin = group.admins.includes(userId);
                
                if (group.invitePermission === 'admin') {
                    return isOwner || isAdmin;
                }
                
                return true;
            },

            // Notifications
            addNotification(userId, notification) {
                const notifications = this.getNotifications();
                notifications[userId] = notifications[userId] || [];
                notification.id = 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                notifications[userId].unshift(notification);
                notifications[userId] = notifications[userId].slice(0, 50);
                this.saveNotifications(notifications);
            },

            getUserNotifications(userId) {
                const notifications = this.getNotifications();
                return notifications[userId] || [];
            },

            markNotificationRead(userId, notificationId) {
                const notifications = this.getNotifications();
                if (!notifications[userId]) return;
                
                const notif = notifications[userId].find(n => n.id === notificationId);
                if (notif) {
                    notif.read = true;
                    this.saveNotifications(notifications);
                }
            },

            markAllNotificationsRead(userId) {
                const notifications = this.getNotifications();
                if (!notifications[userId]) return;
                
                notifications[userId].forEach(n => n.read = true);
                this.saveNotifications(notifications);
            },

            removeNotification(userId, notificationId) {
                const notifications = this.getNotifications();
                if (!notifications[userId]) return;
                
                notifications[userId] = notifications[userId].filter(n => n.id !== notificationId);
                this.saveNotifications(notifications);
            },

            getUnreadCount(userId) {
                const user = this.getUserById(userId);
                if (!user) return 0;

                const friendRequests = (user.friendRequests || []).length;
                
                const groups = this.getGroups();
                let pendingGroupInvites = 0;
                Object.values(groups).forEach(group => {
                    if ((group.pendingInvites || []).includes(userId)) {
                        pendingGroupInvites++;
                    }
                });

                return friendRequests + pendingGroupInvites;
            }
        };

        // DOM Elements
        const authContainer = document.getElementById('auth-container');
        const homeContainer = document.getElementById('home-container');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authMessage = document.getElementById('auth-message');
        const profileMessage = document.getElementById('profile-message');
        const friendMessage = document.getElementById('friend-message');

        let currentSection = 'home';
        let currentGroupId = null;
        let openMenuId = null;
        let navDropdownOpen = false;
        let notificationDropdownOpen = false;
        let lastGroupVersion = {};

        function showMessage(element, text, type) {
            element.textContent = text;
            element.className = `message ${type}`;
            setTimeout(() => {
                element.textContent = '';
                element.className = 'message';
            }, 4000);
        }

        // Auth form switching
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authMessage.textContent = '';
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authMessage.textContent = '';
        });

        // Login
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const user = DB.getUser(email);

            if (!user || user.password !== password) {
                showMessage(authMessage, 'Email o password non validi', 'error');
                return;
            }

            DB.setCurrentUser(email);
            DB.updateUser(email, { lastOnline: new Date().toISOString() });
            DB.cleanupUserFriends(email);
            
            showHome();
        });

        // Register
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            if (password.length < 6) {
                showMessage(authMessage, 'La password deve avere almeno 6 caratteri', 'error');
                return;
            }

            const result = DB.createUser(email, password, name);

            if (!result.success) {
                showMessage(authMessage, result.message, 'error');
                return;
            }

            DB.setCurrentUser(email);
            showToast('Benvenuto Mister!', `Account creato con ID #${result.userId}`, 'success');
            setTimeout(showHome, 500);
        });

        // Notification Bell
        document.getElementById('notification-bell').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationDropdown();
        });

        function toggleNotificationDropdown() {
            const dropdown = document.getElementById('notification-dropdown');
            notificationDropdownOpen = !notificationDropdownOpen;
            dropdown.classList.toggle('show', notificationDropdownOpen);
            
            if (notificationDropdownOpen) {
                closeNavDropdown();
                renderNotifications();
            }
        }

        function closeNotificationDropdown() {
            notificationDropdownOpen = false;
            document.getElementById('notification-dropdown').classList.remove('show');
        }

        document.getElementById('mark-all-read').addEventListener('click', () => {
            const user = DB.getCurrentUser();
            if (user) {
                DB.markAllNotificationsRead(user.id);
                renderNotifications();
                updateNotificationBadge();
            }
        });

        function renderNotifications() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const listEl = document.getElementById('notification-list');
            const friendRequests = user.friendRequests || [];
            const groups = DB.getGroups();

            let items = [];

            friendRequests.forEach(fromId => {
                const fromUser = DB.getUserById(fromId);
                if (fromUser) {
                    items.push({
                        id: 'fr_' + fromId,
                        type: 'friend_request',
                        fromId: fromId,
                        fromName: fromUser.name,
                        message: `${fromUser.name} vuole diventare tuo compagno`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        isFriendRequest: true
                    });
                }
            });

            Object.values(groups).forEach(group => {
                if ((group.pendingInvites || []).includes(user.id)) {
                    const inviter = DB.getUserById(group.creator);
                    items.push({
                        id: 'gi_' + group.id,
                        type: 'group_invite',
                        groupId: group.id,
                        groupName: group.name,
                        fromId: group.creator,
                        fromName: inviter ? inviter.name : 'Qualcuno',
                        message: `Sei stato invitato alla lega "${group.name}"`,
                        timestamp: group.createdAt,
                        read: false
                    });
                }
            });

            items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (items.length === 0) {
                listEl.innerHTML = `
                    <div class="notification-empty">
                        <div class="notification-empty-icon"><i class="fas fa-bell-slash"></i></div>
                        <p>Nessuna notifica</p>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = items.map(item => {
                const iconClass = item.type === 'friend_request' ? 'friend' : 'group';
                const icon = item.type === 'friend_request' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-trophy"></i>';
                
                let actions = '';
                if (item.type === 'friend_request' && item.isFriendRequest) {
                    actions = `
                        <div class="notification-actions">
                            <button class="btn btn-success btn-sm" onclick="acceptFriendFromNotif('${item.fromId}')"><i class="fas fa-check"></i> Accetta</button>
                            <button class="btn btn-secondary btn-sm" onclick="rejectFriendFromNotif('${item.fromId}')"><i class="fas fa-times"></i> Rifiuta</button>
                        </div>
                    `;
                } else if (item.type === 'group_invite') {
                    actions = `
                        <div class="notification-actions">
                            <button class="btn btn-success btn-sm" onclick="acceptGroupFromNotif('${item.groupId}')"><i class="fas fa-sign-in-alt"></i> Unisciti</button>
                            <button class="btn btn-secondary btn-sm" onclick="rejectGroupFromNotif('${item.groupId}')"><i class="fas fa-times"></i> Rifiuta</button>
                        </div>
                    `;
                }

                return `
                    <div class="notification-item ${item.read ? '' : 'unread'}" data-id="${item.id}">
                        <div class="notification-icon ${iconClass}">${icon}</div>
                        <div class="notification-content">
                            <div class="notification-text">${item.message}</div>
                            <div class="notification-time">${formatDate(item.timestamp)}</div>
                            ${actions}
                        </div>
                    </div>
                `;
            }).join('');
        }

        window.acceptFriendFromNotif = function(fromId) {
            const user = DB.getCurrentUser();
            const result = DB.acceptFriendRequest(user.email, fromId);
            if (result.success) {
                showToast('Nuovo compagno!', result.message, 'success');
                renderNotifications();
                updateNotificationBadge();
                renderFriends();
            }
        };

        window.rejectFriendFromNotif = function(fromId) {
            const user = DB.getCurrentUser();
            DB.rejectFriendRequest(user.email, fromId);
            showToast('Richiesta rifiutata', '', 'info');
            renderNotifications();
            updateNotificationBadge();
            renderFriends();
        };

        window.acceptGroupFromNotif = function(groupId) {
            const user = DB.getCurrentUser();
            const result = DB.acceptGroupInvite(user.id, groupId);
            if (result.success) {
                showToast('Benvenuto nella lega!', result.message, 'success');
                renderNotifications();
                updateNotificationBadge();
                renderGroups();
                renderNavGroups();
            }
        };

        window.rejectGroupFromNotif = function(groupId) {
            const user = DB.getCurrentUser();
            DB.rejectGroupInvite(user.id, groupId);
            showToast('Invito rifiutato', '', 'info');
            renderNotifications();
            updateNotificationBadge();
        };

        function updateNotificationBadge() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const count = DB.getUnreadCount(user.id);
            const badge = document.getElementById('notification-badge');
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }

        // Nav Avatar Dropdown
        document.getElementById('nav-avatar').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNavDropdown();
        });

        function toggleNavDropdown() {
            const dropdown = document.getElementById('nav-dropdown');
            navDropdownOpen = !navDropdownOpen;
            dropdown.classList.toggle('show', navDropdownOpen);
            
            if (navDropdownOpen) {
                closeNotificationDropdown();
                updateNavDropdownInfo();
                renderNavGroups();
            }
        }

        function closeNavDropdown() {
            navDropdownOpen = false;
            document.getElementById('nav-dropdown').classList.remove('show');
        }

        function updateNavDropdownInfo() {
            const user = DB.getCurrentUser();
            if (!user) return;
            
            document.getElementById('dropdown-name').textContent = user.name;
            document.getElementById('dropdown-id').textContent = `#${user.id}`;
        }

        function renderNavGroups() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const groups = DB.getUserGroups(user.id);
            const listEl = document.getElementById('nav-groups-list');

            if (groups.length === 0) {
                listEl.innerHTML = `
                    <div style="padding: 0.625rem 0.75rem; color: var(--gray-400); font-size: 0.75rem; font-style: italic;">
                        Nessuna lega
                    </div>
                `;
            } else {
                listEl.innerHTML = groups.slice(0, 5).map(group => {
                    const avatarContent = group.avatar 
                        ? `<img src="${group.avatar}" alt="${group.name}">`
                        : getInitials(group.name);
                    
                    const bgStyle = group.avatar ? '' : 'background: var(--gradient-gold); color: var(--primary-dark);';
                    
                    return `
                        <button class="nav-dropdown-item" onclick="closeNavDropdown(); showGroup('${group.id}');">
                            <div class="nav-dropdown-group-avatar" style="${bgStyle}">${avatarContent}</div>
                            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${group.name}</span>
                            <span style="font-size: 0.6875rem; color: var(--gray-400);">${group.members.length}</span>
                        </button>
                    `;
                }).join('');

                if (groups.length > 5) {
                    listEl.innerHTML += `
                        <button class="nav-dropdown-item" onclick="closeNavDropdown(); showSection('home');" style="color: var(--primary); font-size: 0.75rem;">
                            <i class="fas fa-list"></i> Vedi tutte le leghe (${groups.length})
                        </button>
                    `;
                }
            }
        }

        document.querySelectorAll('.nav-dropdown-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                closeNavDropdown();
                showSection(section);
            });
        });

        document.getElementById('dropdown-logout').addEventListener('click', () => {
            closeNavDropdown();
            showModal(
                'Esci dall\'account',
                'Sei sicuro di voler uscire?',
                () => {
                    stopPolling();
                    DB.logout();
                    showAuth();
                }
            );
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-avatar-container') && !e.target.closest('.notification-bell')) {
                closeNavDropdown();
                closeNotificationDropdown();
            }
            if (!e.target.closest('.friend-menu') && !e.target.closest('.member-actions')) {
                closeAllMenus();
            }
        });

        function updateNavAvatar() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const navAvatar = document.getElementById('nav-avatar');
            if (user.avatar) {
                navAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
            } else {
                navAvatar.innerHTML = getInitials(user.name);
            }
        }

        function showHome() {
            const user = DB.getCurrentUser();
            if (!user) {
                showAuth();
                return;
            }

            authContainer.classList.add('hidden');
            homeContainer.classList.remove('hidden');
            document.getElementById('user-greeting').textContent = `Mister ${user.name}`;
            updateNavAvatar();
            updateNotificationBadge();

            showSection('home');
            startPolling();
        }

        function showAuth() {
            stopPolling();
            homeContainer.classList.add('hidden');
            authContainer.classList.remove('hidden');
            loginForm.reset();
            registerForm.reset();
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        }

        window.copyUserId = function() {
            const userId = document.getElementById('profile-user-id').textContent;
            copyToClipboard(userId).then(() => {
                showToast('Copiato!', `ID #${userId} copiato negli appunti`, 'success');
            }).catch(() => {
                showToast('Errore', 'Impossibile copiare', 'error');
            });
        };

        window.copyGroupCode = function() {
            const code = document.getElementById('group-code-display').textContent;
            copyToClipboard(code).then(() => {
                showToast('Copiato!', `Codice ${code} copiato negli appunti`, 'success');
            }).catch(() => {
                showToast('Errore', 'Impossibile copiare', 'error');
            });
        };

        // Tabs
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

        // Render functions
        function createFriendItemHTML(friend) {
            const avatarContent = friend.avatar
                ? `<img src="${friend.avatar}" alt="${friend.name}">`
                : getInitials(friend.name);

            return `
                <div class="friend-item" data-id="${friend.id}">
                    <div class="friend-info">
                        <div class="friend-avatar">${avatarContent}</div>
                        <div class="friend-details">
                            <span class="friend-name">${friend.name}</span>
                            <span class="friend-id">#${friend.id}</span>
                            <span class="friend-status"><span class="status-dot"></span> In panchina</span>
                        </div>
                    </div>
                    <div class="friend-menu" onclick="event.stopPropagation();">
                        <button class="friend-menu-btn" onclick="toggleFriendMenu('${friend.id}')"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="friend-dropdown" id="menu-${friend.id}">
                            <button class="dropdown-item" onclick="showProfileModal('${friend.id}'); closeAllMenus();">
                                <i class="fas fa-user"></i> Vedi scheda
                            </button>
                            <button class="dropdown-item" onclick="sendPoke('${friend.id}'); closeAllMenus();">
                                <i class="fas fa-hand-paper"></i> Saluta
                            </button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item danger" onclick="confirmRemoveFriend('${friend.id}'); closeAllMenus();">
                                <i class="fas fa-user-minus"></i> Rimuovi
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        window.sendPoke = function(friendId) {
            const friend = DB.getUserById(friendId);
            if (friend) {
                showToast('Saluto inviato!', `Hai salutato ${friend.name}`, 'success');
            }
        };

        window.confirmRemoveFriend = function(friendId) {
            const friend = DB.getUserById(friendId);
            showModal(
                'Rimuovi compagno',
                `Sei sicuro di voler rimuovere ${friend?.name || 'questo allenatore'} dai compagni?`,
                () => {
                    const user = DB.getCurrentUser();
                    DB.removeFriend(user.email, friendId);
                    showToast('Compagno rimosso', '', 'info');
                    renderFriends();
                }
            );
        };

        function createRequestItemHTML(requester) {
            const avatarContent = requester.avatar
                ? `<img src="${requester.avatar}" alt="${requester.name}">`
                : getInitials(requester.name);

            return `
                <div class="request-item" data-id="${requester.id}">
                    <div class="friend-info">
                        <div class="friend-avatar">${avatarContent}</div>
                        <div class="friend-details">
                            <span class="friend-name">${requester.name}</span>
                            <span class="friend-id">#${requester.id}</span>
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button class="btn btn-success btn-sm" data-action="accept" data-id="${requester.id}"><i class="fas fa-check"></i> Accetta</button>
                        <button class="btn btn-secondary btn-sm" data-action="reject" data-id="${requester.id}"><i class="fas fa-times"></i> Rifiuta</button>
                    </div>
                </div>
            `;
        }

        function createSentItemHTML(target) {
            const avatarContent = target.avatar
                ? `<img src="${target.avatar}" alt="${target.name}">`
                : getInitials(target.name);

            return `
                <div class="request-item" data-id="${target.id}">
                    <div class="friend-info">
                        <div class="friend-avatar">${avatarContent}</div>
                        <div class="friend-details">
                            <span class="friend-name">${target.name}</span>
                            <span class="friend-id">#${target.id}</span>
                            <span style="font-size: 0.6875rem; color: var(--warning); font-weight: 600;"><i class="fas fa-clock"></i> In attesa</span>
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button class="btn btn-secondary btn-sm" data-action="cancel" data-id="${target.id}"><i class="fas fa-times"></i> Annulla</button>
                    </div>
                </div>
            `;
        }

        function renderFriends() {
            const user = DB.getCurrentUser();
            if (!user) return;

            DB.cleanupUserFriends(user.email);
            const freshUser = DB.getCurrentUser();

            const requestsList = document.getElementById('requests-list');
            const friendsList = document.getElementById('friends-list');
            const sentList = document.getElementById('sent-list');
            const requestsBadge = document.getElementById('requests-badge');
            const sentBadge = document.getElementById('sent-badge');

            const friends = freshUser.friends || [];
            const requests = freshUser.friendRequests || [];
            const sent = freshUser.sentRequests || [];

            const requestCount = requests.length;
            requestsBadge.textContent = requestCount;
            requestsBadge.classList.toggle('hidden', requestCount === 0);

            sentBadge.textContent = sent.length;
            sentBadge.classList.toggle('hidden', sent.length === 0);

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
                    const friend = DB.getUserById(id);
                    return friend ? createFriendItemHTML(friend) : '';
                }).join('');
            }

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
                    const requester = DB.getUserById(id);
                    return requester ? createRequestItemHTML(requester) : '';
                }).join('');
            }

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
                    const target = DB.getUserById(id);
                    return target ? createSentItemHTML(target) : '';
                }).join('');
            }
        }

        function renderGroups() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const groups = DB.getUserGroups(user.id);
            const listEl = document.getElementById('groups-list');

            if (groups.length === 0) {
                listEl.innerHTML = `
                    <div class="no-leagues">
                        <div class="no-leagues-icon"><i class="fas fa-trophy"></i></div>
                        <h3>Nessuna lega ancora</h3>
                        <p>Le leghe ti permettono di sfidare altri allenatori. Crea la tua prima lega per iniziare la competizione!</p>
                        <button class="btn btn-gold" onclick="openCreateGroupModal()">
                            <i class="fas fa-plus"></i> Crea la tua prima lega
                        </button>
                    </div>
                `;
            } else {
                listEl.innerHTML = `
                    <div class="leagues-grid">
                        ${groups.map(group => {
                            const memberAvatars = group.members.slice(0, 3).map(memberId => {
                                const member = DB.getUserById(memberId);
                                if (!member) return '';
                                const avatarContent = member.avatar 
                                    ? `<img src="${member.avatar}" alt="${member.name}">`
                                    : getInitials(member.name);
                                return `<div class="mini-avatar">${avatarContent}</div>`;
                            }).join('');

                            const groupAvatarContent = group.avatar 
                                ? `<img src="${group.avatar}" alt="${group.name}">`
                                : getInitials(group.name);

                            return `
                                <div class="league-card" onclick="showGroup('${group.id}')">
                                    <div class="league-card-header">
                                        <div class="league-avatar">${groupAvatarContent}</div>
                                        <div class="league-info">
                                            <h3>${group.name}</h3>
                                            <p>${group.description || 'Nessuna descrizione'}</p>
                                        </div>
                                    </div>
                                    <div class="league-card-body">
                                        <div class="league-members">
                                            <div class="league-members-avatars">
                                                ${memberAvatars}
                                            </div>
                                            <span class="league-members-count">${group.members.length} partecipanti</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }

        window.showGroup = function(groupId) {
            const group = DB.getGroupById(groupId);
            if (!group) return;

            currentGroupId = groupId;
            const user = DB.getCurrentUser();
            const isOwner = group.owner === user.id;
            const isAdmin = group.admins.includes(user.id);
            const canSeeCode = DB.canSeeGroupCode(groupId, user.id);
            const canInvite = DB.canInvite(groupId, user.id);

            document.getElementById('group-detail-title').innerHTML = `<i class="fas fa-trophy"></i> ${group.name}`;
            document.getElementById('group-name-display').textContent = group.name;
            
            const codeSection = document.getElementById('group-code-section');
            const shareCodeSection = document.getElementById('share-code-section');
            
            if (canSeeCode) {
                document.getElementById('group-code-display').textContent = group.code;
                codeSection.style.display = 'inline-flex';
                shareCodeSection.style.display = 'block';
            } else {
                codeSection.style.display = 'none';
                shareCodeSection.style.display = 'none';
            }
            
            const avatarEl = document.getElementById('group-avatar-large');
            if (group.avatar) {
                avatarEl.innerHTML = `<img src="${group.avatar}" alt="${group.name}">`;
            } else {
                avatarEl.innerHTML = getInitials(group.name);
            }

            const avatarEditLabel = document.getElementById('group-avatar-edit-label');
            avatarEditLabel.style.display = isAdmin ? 'flex' : 'none';

            document.getElementById('group-members-count').textContent = group.members.length;
            document.getElementById('members-count-label').textContent = group.members.length;
            
            const createdDate = new Date(group.createdAt);
            document.getElementById('group-created-date').textContent = createdDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

            const settingsSection = document.getElementById('group-settings-section');
            const settingsContent = document.getElementById('group-settings-content');
            
            if (isAdmin || isOwner) {
                settingsSection.style.display = 'block';
                const visibilityText = group.visibility === 'invite' ? 'Solo su invito' : 'Chiunque con codice';
                const invitePermissionText = group.invitePermission === 'all' ? 'Tutti i partecipanti' : 'Solo amministratori';
                const maxMembersText = group.maxMembers > 0 ? `${group.maxMembers} allenatori` : 'Illimitato';

                settingsContent.innerHTML = `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <strong><i class="fas fa-eye"></i> VisibilitÃ </strong>
                            <p>${visibilityText}</p>
                        </div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <strong><i class="fas fa-user-shield"></i> Chi puÃ² invitare</strong>
                            <p>${invitePermissionText}</p>
                        </div>
                    </div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <strong><i class="fas fa-users-cog"></i> Limite partecipanti</strong>
                            <p>${maxMembersText}</p>
                        </div>
                    </div>
                    ${isAdmin ? `
                        <button class="btn btn-secondary" style="margin-top: 0.875rem;" onclick="openEditGroupModal()">
                            <i class="fas fa-edit"></i> Modifica impostazioni
                        </button>
                    ` : ''}
                    ${isOwner ? `
                        <button class="btn btn-warning" style="margin-top: 0.375rem;" onclick="openTransferModal()">
                            <i class="fas fa-crown"></i> Trasferisci presidenza
                        </button>
                    ` : ''}
                `;
            } else {
                settingsSection.style.display = 'none';
            }

            const friends = user.friends || [];
            const inviteFriendsSection = document.getElementById('invite-friends-section');
            const inviteFriendsEl = document.getElementById('invite-friends-list');
            
            if (!canInvite) {
                inviteFriendsSection.style.display = 'block';
                inviteFriendsEl.innerHTML = `
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-lock"></i></div>
                        <div class="invite-card-content">
                            <h4>Inviti limitati</h4>
                            <p>Solo gli amministratori possono invitare nuovi partecipanti</p>
                        </div>
                    </div>
                `;
            } else if (friends.length === 0) {
                inviteFriendsSection.style.display = 'block';
                inviteFriendsEl.innerHTML = `
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-users"></i></div>
                        <div class="invite-card-content">
                            <h4>Aggiungi compagni</h4>
                            <p>Per invitare allenatori, prima aggiungili come compagni</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="navigateToFriendsFromGroup('${groupId}')"><i class="fas fa-user-plus"></i> Vai</button>
                    </div>
                `;
            } else {
                const availableFriends = friends.filter(fId => !group.members.includes(fId));
                if (availableFriends.length === 0) {
                    inviteFriendsSection.style.display = 'block';
                    inviteFriendsEl.innerHTML = `
                        <div class="invite-card">
                            <div class="invite-card-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="invite-card-content">
                                <h4>Tutti invitati!</h4>
                                <p>Tutti i tuoi compagni sono giÃ  nella lega</p>
                            </div>
                        </div>
                    `;
                } else {
                    inviteFriendsSection.style.display = 'block';
                    inviteFriendsEl.innerHTML = `
                        <div class="invite-card">
                            <div class="invite-card-icon"><i class="fas fa-user-friends"></i></div>
                            <div class="invite-card-content">
                                <h4>${availableFriends.length} compagni disponibili</h4>
                                <p>Invita i tuoi compagni a partecipare</p>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="openInviteModal('${groupId}')"><i class="fas fa-paper-plane"></i> Invita</button>
                        </div>
                    `;
                }
            }

            renderGroupMembers(group, user, isOwner, isAdmin);

            const dangerZone = document.getElementById('group-danger-zone');
            const dangerText = document.getElementById('group-danger-text');
            const leaveBtn = document.getElementById('btn-leave-group');

            if (isOwner && group.members.length === 1) {
                dangerText.textContent = 'Eliminando la lega, essa sarÃ  rimossa definitivamente.';
                leaveBtn.innerHTML = '<i class="fas fa-trash"></i> Elimina lega';
            } else {
                dangerText.textContent = 'Abbandonando la lega, non potrai piÃ¹ accedere ai suoi contenuti.';
                leaveBtn.innerHTML = '<i class="fas fa-door-open"></i> Abbandona lega';
            }

            lastGroupVersion[groupId] = JSON.stringify(group);

            showSection('group');
        };

        function renderGroupMembers(group, user, isOwner, isAdmin) {
            const membersEl = document.getElementById('group-members-list');
            
            membersEl.innerHTML = group.members.map(memberId => {
                const member = DB.getUserById(memberId);
                if (!member) return '';
                
                const avatarContent = member.avatar 
                    ? `<img src="${member.avatar}" alt="${member.name}">`
                    : getInitials(member.name);
                
                const memberIsOwner = group.owner === memberId;
                const memberIsAdmin = group.admins.includes(memberId);
                const isCurrentUser = member.id === user.id;
                
                let roleText = '';
                let roleClass = '';
                if (memberIsOwner) {
                    roleText = '<i class="fas fa-crown"></i> Presidente';
                    roleClass = 'owner';
                } else if (memberIsAdmin) {
                    roleText = '<i class="fas fa-shield-alt"></i> Admin';
                    roleClass = '';
                }

                let actionsHtml = '';
                if (!isCurrentUser && (isOwner || (isAdmin && !memberIsOwner && !memberIsAdmin))) {
                    let menuItems = `
                        <button class="dropdown-item" onclick="showProfileModal('${memberId}'); closeAllMenus();">
                            <i class="fas fa-user"></i> Vedi scheda
                        </button>
                    `;

                    if (isOwner && !memberIsOwner) {
                        if (memberIsAdmin) {
                            menuItems += `
                                <button class="dropdown-item warning" onclick="demoteMember('${memberId}')">
                                    <i class="fas fa-level-down-alt"></i> Rimuovi admin
                                </button>
                            `;
                        } else {
                            menuItems += `
                                <button class="dropdown-item" onclick="promoteMember('${memberId}')">
                                    <i class="fas fa-level-up-alt"></i> Promuovi admin
                                </button>
                            `;
                        }
                    }

                    if ((isOwner && !memberIsOwner) || (isAdmin && !memberIsAdmin && !memberIsOwner)) {
                        menuItems += `
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item danger" onclick="kickMember('${memberId}')">
                                <i class="fas fa-ban"></i> Espelli
                            </button>
                        `;
                    }

                    actionsHtml = `
                        <div class="member-actions" onclick="event.stopPropagation();">
                            <button class="friend-menu-btn" onclick="toggleMemberMenu('${memberId}')"><i class="fas fa-ellipsis-v"></i></button>
                            <div class="friend-dropdown" id="member-menu-${memberId}">
                                ${menuItems}
                            </div>
                        </div>
                    `;
                } else if (!isCurrentUser) {
                    actionsHtml = `
                        <div class="member-actions" onclick="event.stopPropagation();">
                            <button class="friend-menu-btn" onclick="toggleMemberMenu('${memberId}')"><i class="fas fa-ellipsis-v"></i></button>
                            <div class="friend-dropdown" id="member-menu-${memberId}">
                                <button class="dropdown-item" onclick="showProfileModal('${memberId}'); closeAllMenus();">
                                    <i class="fas fa-user"></i> Vedi scheda
                                </button>
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="member-item" onclick="showProfileModal('${memberId}')">
                        <div class="member-info">
                            <div class="member-avatar">${avatarContent}</div>
                            <div>
                                <div class="member-name">${member.name}${isCurrentUser ? ' (tu)' : ''}</div>
                                ${roleText ? `<div class="member-role ${roleClass}">${roleText}</div>` : ''}
                            </div>
                        </div>
                        ${actionsHtml}
                    </div>
                `;
            }).join('');
        }

        window.toggleMemberMenu = function(memberId) {
            event.stopPropagation();
            const menuId = `member-menu-${memberId}`;
            const menu = document.getElementById(menuId);
            
            if (openMenuId === menuId) {
                closeAllMenus();
            } else {
                closeAllMenus();
                openMenuId = menuId;
                if (menu) menu.classList.add('show');
            }
        };

        window.promoteMember = function(memberId) {
            event.stopPropagation();
            const user = DB.getCurrentUser();
            const result = DB.promoteToAdmin(currentGroupId, memberId, user.id);
            
            closeAllMenus();
            
            if (result.success) {
                showToast('Admin promosso!', result.message, 'success');
                showGroup(currentGroupId);
            } else {
                showToast('Errore', result.message, 'error');
            }
        };

        window.demoteMember = function(memberId) {
            event.stopPropagation();
            const member = DB.getUserById(memberId);
            
            closeAllMenus();
            
            showModal(
                'Rimuovi privilegi admin',
                `Sei sicuro di voler rimuovere i privilegi admin di ${member?.name}?`,
                () => {
                    const user = DB.getCurrentUser();
                    const result = DB.demoteFromAdmin(currentGroupId, memberId, user.id);
                    
                    if (result.success) {
                        showToast('Admin rimosso', result.message, 'success');
                        showGroup(currentGroupId);
                    } else {
                        showToast('Errore', result.message, 'error');
                    }
                }
            );
        };

        window.kickMember = function(memberId) {
            event.stopPropagation();
            const member = DB.getUserById(memberId);
            
            closeAllMenus();
            
            showModal(
                'Espelli partecipante',
                `Sei sicuro di voler espellere ${member?.name} dalla lega?`,
                () => {
                    const user = DB.getCurrentUser();
                    const result = DB.kickFromGroup(currentGroupId, memberId, user.id);
                    
                    if (result.success) {
                        showToast('Partecipante espulso', result.message, 'success');
                        showGroup(currentGroupId);
                    } else {
                        showToast('Errore', result.message, 'error');
                    }
                }
            );
        };

        // League avatar upload
        document.getElementById('group-avatar-upload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file || !currentGroupId) return;

            if (!file.type.startsWith('image/')) {
                showToast('Errore', 'Seleziona un\'immagine valida', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Errore', 'L\'immagine deve essere inferiore a 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                DB.updateGroup(currentGroupId, { avatar: base64 });

                document.getElementById('group-avatar-large').innerHTML = `<img src="${base64}" alt="League">`;
                renderGroups();
                renderNavGroups();
                showToast('Stemma aggiornato!', 'Lo stemma della lega Ã¨ stato cambiato', 'success');
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btn-leave-group').addEventListener('click', () => {
            const group = DB.getGroupById(currentGroupId);
            const user = DB.getCurrentUser();
            
            if (!group) return;

            const isOwner = group.owner === user.id;
            const isOnlyMember = group.members.length === 1;

            const title = isOwner && isOnlyMember ? 'Elimina lega' : 'Abbandona lega';
            const message = isOwner && isOnlyMember 
                ? `Sei sicuro di voler eliminare "${group.name}"? Questa azione Ã¨ irreversibile.`
                : `Sei sicuro di voler abbandonare "${group.name}"?`;

            showModal(title, message, () => {
                DB.leaveGroup(user.id, currentGroupId);
                showToast(isOwner && isOnlyMember ? 'Lega eliminata' : 'Hai lasciato la lega', '', 'info');
                showSection('home');
                renderGroups();
                renderNavGroups();
            });
        });

        // Create League Form
        document.getElementById('create-group-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('group-name').value.trim();
            if (!name) {
                showToast('Errore', 'Inserisci un nome per la lega', 'error');
                return;
            }

            const user = DB.getCurrentUser();
            const result = DB.createGroup(user.email, {
                name,
                description: document.getElementById('group-description').value,
                avatar: newGroupAvatarData,
                visibility: document.getElementById('group-visibility').value,
                invitePermission: document.getElementById('group-invite-permission').value,
                maxMembers: document.getElementById('group-max-members').value
            });

            if (result.success) {
                closeCreateGroupModal();
                showToast('Lega creata!', `Codice: ${result.groupCode}`, 'success');
                renderGroups();
                renderNavGroups();
                showGroup(result.groupId);
            } else {
                showToast('Errore', result.message, 'error');
            }
        });

        // Join League
        window.joinGroupByCode = function() {
            const code = document.getElementById('join-group-code').value.trim().toUpperCase();
            const messageEl = document.getElementById('join-group-message');

            if (!code || code.length !== 6) {
                showMessage(messageEl, 'Inserisci un codice valido di 6 caratteri', 'error');
                return;
            }

            const user = DB.getCurrentUser();
            const result = DB.joinGroupByCode(user.id, code);

            if (result.success) {
                document.getElementById('join-group-code').value = '';
                showToast('Benvenuto in lega!', result.message, 'success');
                renderGroups();
                renderNavGroups();
                showGroup(result.groupId);
            } else {
                showMessage(messageEl, result.message, 'error');
            }
        };

        document.getElementById('join-group-code').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });

        document.getElementById('join-group-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                joinGroupByCode();
            }
        });

        // Event delegation for request/sent actions
        document.getElementById('requests-list').addEventListener('click', handleRequestAction);
        document.getElementById('sent-list').addEventListener('click', handleSentAction);

        function handleRequestAction(e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const user = DB.getCurrentUser();

            if (action === 'accept') {
                const result = DB.acceptFriendRequest(user.email, id);
                if (result.success) {
                    showToast('Nuovo compagno!', result.message, 'success');
                    renderFriends();
                    updateNotificationBadge();
                    renderNotifications();
                }
            } else if (action === 'reject') {
                DB.rejectFriendRequest(user.email, id);
                showToast('Richiesta rifiutata', '', 'info');
                renderFriends();
                updateNotificationBadge();
                renderNotifications();
            }
        }

        function handleSentAction(e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const user = DB.getCurrentUser();

            if (action === 'cancel') {
                DB.cancelFriendRequest(user.email, id);
                showToast('Richiesta annullata', '', 'info');
                renderFriends();
            }
        }

        window.toggleFriendMenu = function(id) {
            event.stopPropagation();
            const menuId = `menu-${id}`;
            const menu = document.getElementById(menuId);
            
            if (openMenuId === menuId) {
                closeAllMenus();
            } else {
                closeAllMenus();
                openMenuId = menuId;
                if (menu) menu.classList.add('show');
            }
        };

        function closeAllMenus() {
            openMenuId = null;
            document.querySelectorAll('.friend-dropdown').forEach(m => m.classList.remove('show'));
        }

        // Add friend
        const friendIdInput = document.getElementById('friend-id-input');
        
        friendIdInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        document.getElementById('btn-add-friend').addEventListener('click', () => {
            const friendId = friendIdInput.value.trim();

            if (!friendId) {
                showMessage(friendMessage, 'Inserisci un ID allenatore', 'error');
                return;
            }

            if (friendId.length !== 6) {
                showMessage(friendMessage, 'L\'ID deve essere di 6 cifre', 'error');
                return;
            }

            if (!/^\d{6}$/.test(friendId)) {
                showMessage(friendMessage, 'L\'ID deve contenere solo numeri', 'error');
                return;
            }

            const user = DB.getCurrentUser();
            const result = DB.sendFriendRequest(user.email, friendId);

            if (result.success) {
                showToast('Richiesta inviata!', result.message, 'success');
                friendIdInput.value = '';
                friendMessage.textContent = '';
                friendMessage.className = 'message';
                renderFriends();
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.tab[data-tab="sent"]').classList.add('active');
                document.getElementById('tab-friends').classList.add('hidden');
                document.getElementById('tab-requests').classList.add('hidden');
                document.getElementById('tab-sent').classList.remove('hidden');
            } else {
                showMessage(friendMessage, result.message, 'error');
            }
        });

        friendIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('btn-add-friend').click();
            }
        });

        // Section navigation
        window.showSection = function(section) {
            currentSection = section;
            
            document.getElementById('section-home').classList.add('hidden');
            document.getElementById('section-profile').classList.add('hidden');
            document.getElementById('section-friends').classList.add('hidden');
            document.getElementById('section-group').classList.add('hidden');

            document.querySelectorAll('.nav-dropdown-item[data-section]').forEach(item => {
                item.classList.toggle('active', item.dataset.section === section);
            });

            if (section === 'home') {
                document.getElementById('section-home').classList.remove('hidden');
                renderGroups();
                returnToGroupId = null;
            } else if (section === 'profile') {
                const user = DB.getCurrentUser();
                DB.cleanupUserFriends(user.email);
                const freshUser = DB.getCurrentUser();
                
                document.getElementById('profile-name').value = freshUser.name;
                document.getElementById('profile-email').value = freshUser.email;
                document.getElementById('profile-bio').value = freshUser.bio || '';
                document.getElementById('profile-user-id').textContent = freshUser.id;
                document.getElementById('profile-display-name').textContent = freshUser.name;

                const profileAvatar = document.getElementById('profile-avatar');
                if (freshUser.avatar) {
                    profileAvatar.innerHTML = `<img src="${freshUser.avatar}" alt="${freshUser.name}">`;
                } else {
                    profileAvatar.innerHTML = getInitials(freshUser.name);
                }

                document.getElementById('section-profile').classList.remove('hidden');
            } else if (section === 'friends') {
                document.getElementById('section-friends').classList.remove('hidden');
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.tab[data-tab="friends"]').classList.add('active');
                document.getElementById('tab-friends').classList.remove('hidden');
                document.getElementById('tab-requests').classList.add('hidden');
                document.getElementById('tab-sent').classList.add('hidden');
                
                renderFriends();
            } else if (section === 'group') {
                document.getElementById('section-group').classList.remove('hidden');
            }
        };

        // Avatar upload
        document.getElementById('avatar-upload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Errore', 'Seleziona un\'immagine valida', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast('Errore', 'L\'immagine deve essere inferiore a 2MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                const user = DB.getCurrentUser();
                DB.updateUser(user.email, { avatar: base64 });

                document.getElementById('profile-avatar').innerHTML = `<img src="${base64}" alt="${user.name}">`;
                updateNavAvatar();
                showToast('Foto aggiornata!', 'La tua foto Ã¨ stata cambiata', 'success');
            };
            reader.readAsDataURL(file);
        });

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const user = DB.getCurrentUser();
            const name = document.getElementById('profile-name').value.trim();
            const bio = document.getElementById('profile-bio').value;

            if (!name) {
                showMessage(profileMessage, 'Il nome non puÃ² essere vuoto', 'error');
                return;
            }

            DB.updateUser(user.email, { name, bio });
            document.getElementById('user-greeting').textContent = `Mister ${name}`;
            document.getElementById('profile-display-name').textContent = name;

            if (!user.avatar) {
                document.getElementById('profile-avatar').innerHTML = getInitials(name);
            }
            updateNavAvatar();

            showToast('Salvato!', 'Profilo aggiornato con successo', 'success');
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            showModal(
                'Esci dall\'account',
                'Sei sicuro di voler uscire?',
                () => {
                    stopPolling();
                    DB.logout();
                    showAuth();
                }
            );
        });

        // Polling
        let pollingInterval = null;
        let lastRequestCount = 0;

        function startPolling() {
            checkForUpdates();
            pollingInterval = setInterval(checkForUpdates, 1000);
        }

        function stopPolling() {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            lastRequestCount = 0;
        }

        function checkForUpdates() {
            const user = DB.getCurrentUser();
            if (!user) return;

            const currentUnreadCount = DB.getUnreadCount(user.id);

            lastRequestCount = currentUnreadCount;
            updateNotificationBadge();

            if (currentSection === 'friends') {
                renderFriends();
            }

            if (currentSection === 'group' && currentGroupId) {
                const group = DB.getGroupById(currentGroupId);
                if (group) {
                    const currentVersion = JSON.stringify(group);
                    if (lastGroupVersion[currentGroupId] !== currentVersion) {
                        showGroup(currentGroupId);
                    }
                } else {
                    showToast('Lega eliminata', 'La lega non esiste piÃ¹', 'info');
                    showSection('home');
                }
            }

            if (currentSection === 'home') {
                renderGroups();
                renderNavGroups();
            }
        }

        // Initialize
        if (DB.getCurrentUser()) {
            const user = DB.getCurrentUser();
            DB.cleanupUserFriends(user.email);
            showHome();
        }