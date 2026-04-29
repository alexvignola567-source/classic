/**
 * FantaLega Classic - Navigation
 */
const Navigation = {
    currentSection: 'home',
    returnToGroupId: null,
    /**
     * Update notification badge
     */
    updateNotificationBadge() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const count = NotificationsDB.getUnreadCount(user.id);
        const badge = document.getElementById('notification-badge');
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    },
    /**
     * Update nav avatar
     */
    updateNavAvatar() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const navAvatar = document.getElementById('nav-avatar');
        if (user.avatar) {
            navAvatar.innerHTML = `<img src="${user.avatar}" alt="${Utils.escapeHtml(user.name)}">`;
        } else {
            navAvatar.innerHTML = Utils.getInitials(user.name);
        }
    },
    /**
     * Update nav dropdown info
     */
    updateNavDropdownInfo() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        document.getElementById('dropdown-name').textContent = user.name;
        document.getElementById('dropdown-id').textContent = `#${user.id}`;
    },
    /**
     * Render nav groups list
     */
    renderNavGroups() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const groups = GroupsDB.getUserGroups(user.id);
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
                    ? `<img src="${group.avatar}" alt="${Utils.escapeHtml(group.name)}">`
                    : Utils.getInitials(group.name);
                const bgStyle = group.avatar ? '' : 'background: var(--gradient-gold); color: var(--primary-dark);';
                return `
                    <button class="nav-dropdown-item" onclick="Dropdowns.closeNavDropdown(); GroupsSection.show('${group.id}');">
                        <div class="nav-dropdown-group-avatar" style="${bgStyle}">${avatarContent}</div>
                        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${Utils.escapeHtml(group.name)}
                        </span>
                        <span style="font-size: 0.6875rem; color: var(--gray-400);">${group.members.length}</span>
                    </button>
                `;
            }).join('');
            if (groups.length > 5) {
                listEl.innerHTML += `
                    <button class="nav-dropdown-item" onclick="Dropdowns.closeNavDropdown(); App.showSection('home');" style="color: var(--primary); font-size: 0.75rem;">
                        <i class="fas fa-list"></i> Vedi tutte le leghe (${groups.length})
                    </button>
                `;
            }
        }
    },
    /**
     * Render notifications
     */
    renderNotifications() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const listEl = document.getElementById('notification-list');
        const friendRequests = user.friendRequests || [];
        const groups = GroupsDB.getAll();
        let items = [];
        // Friend requests
        friendRequests.forEach(fromId => {
            const fromUser = UsersDB.getById(fromId);
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
        // Group invites
        Object.values(groups).forEach(group => {
            if ((group.pendingInvites || []).includes(user.id)) {
                const inviter = UsersDB.getById(group.creator);
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
        // Sort by timestamp
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
            const icon = item.type === 'friend_request' 
                ? '<i class="fas fa-user"></i>' 
                : '<i class="fas fa-trophy"></i>';
            let actions = '';
            if (item.type === 'friend_request' && item.isFriendRequest) {
                actions = `
                    <div class="notification-actions">
                        <button class="btn btn-success btn-sm" onclick="FriendsSection.acceptFromNotif('${item.fromId}')">
                            <i class="fas fa-check"></i> Accetta
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="FriendsSection.rejectFromNotif('${item.fromId}')">
                            <i class="fas fa-times"></i> Rifiuta
                        </button>
                    </div>
                `;
            } else if (item.type === 'group_invite') {
                actions = `
                    <div class="notification-actions">
                        <button class="btn btn-success btn-sm" onclick="GroupsSection.acceptInviteFromNotif('${item.groupId}')">
                            <i class="fas fa-sign-in-alt"></i> Unisciti
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="GroupsSection.rejectInviteFromNotif('${item.groupId}')">
                            <i class="fas fa-times"></i> Rifiuta
                        </button>
                    </div>
                `;
            }
            return `
                <div class="notification-item ${item.read ? '' : 'unread'}" data-id="${item.id}">
                    <div class="notification-icon ${iconClass}">${icon}</div>
                    <div class="notification-content">
                        <div class="notification-text">${Utils.escapeHtml(item.message)}</div>
                        <div class="notification-time">${Utils.formatRelativeDate(item.timestamp)}</div>
                        ${actions}
                    </div>
                </div>
            `;
        }).join('');
    },
    /**
     * Navigate to friends from group
     * @param {string} groupId
     */
    navigateToFriendsFromGroup(groupId) {
        this.returnToGroupId = groupId;
        App.showSection('friends');
    },
    /**
     * Go back from friends section
     */
    goBackFromFriends() {
        if (this.returnToGroupId) {
            const groupId = this.returnToGroupId;
            this.returnToGroupId = null;
            GroupsSection.show(groupId);
        } else {
            App.showSection('home');
        }
    }
};
