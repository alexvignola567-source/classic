/**
 * FantaLega Classic - Notifications Database Module
 */
const NotificationsDB = {
    /**
     * Get all notifications
     * @returns {Object}
     */
    getAll() {
        return Database.get(CONFIG.STORAGE_KEYS.NOTIFICATIONS);
    },
    /**
     * Save all notifications
     * @param {Object} notifications
     */
    saveAll(notifications) {
        Database.save(CONFIG.STORAGE_KEYS.NOTIFICATIONS, notifications);
    },
    /**
     * Add a notification
     * @param {string} userId
     * @param {Object} notification
     */
    add(userId, notification) {
        const notifications = this.getAll();
        notifications[userId] = notifications[userId] || [];
        
        notification.id = Utils.generateUniqueId('n');
        notifications[userId].unshift(notification);
        
        // Keep only last 50 notifications
        notifications[userId] = notifications[userId].slice(0, 50);
        
        this.saveAll(notifications);
    },
    /**
     * Get user's notifications
     * @param {string} userId
     * @returns {Array}
     */
    getUserNotifications(userId) {
        const notifications = this.getAll();
        return notifications[userId] || [];
    },
    /**
     * Mark notification as read
     * @param {string} userId
     * @param {string} notificationId
     */
    markRead(userId, notificationId) {
        const notifications = this.getAll();
        if (!notifications[userId]) return;
        const notif = notifications[userId].find(n => n.id === notificationId);
        if (notif) {
            notif.read = true;
            this.saveAll(notifications);
        }
    },
    /**
     * Mark all notifications as read
     * @param {string} userId
     */
    markAllRead(userId) {
        const notifications = this.getAll();
        if (!notifications[userId]) return;
        notifications[userId].forEach(n => n.read = true);
        this.saveAll(notifications);
    },
    /**
     * Remove a notification
     * @param {string} userId
     * @param {string} notificationId
     */
    remove(userId, notificationId) {
        const notifications = this.getAll();
        if (!notifications[userId]) return;
        notifications[userId] = notifications[userId].filter(n => n.id !== notificationId);
        this.saveAll(notifications);
    },
    /**
     * Get unread count for user
     * @param {string} userId
     * @returns {number}
     */
    getUnreadCount(userId) {
        const user = UsersDB.getById(userId);
        if (!user) return 0;
        // Count friend requests
        const friendRequests = (user.friendRequests || []).length;
        // Count pending group invites
        const groups = GroupsDB.getAll();
        let pendingGroupInvites = 0;
        Object.values(groups).forEach(group => {
            if ((group.pendingInvites || []).includes(userId)) {
                pendingGroupInvites++;
            }
        });
        return friendRequests + pendingGroupInvites;
    }
};
