/**
 * FantaLega Classic - Friends Database Module
 */
const FriendsDB = {
    /**
     * Send a friend request
     * @param {string} fromEmail
     * @param {string} toId
     * @returns {{success: boolean, message: string, targetName?: string}}
     */
    sendRequest(fromEmail, toId) {
        const users = UsersDB.getAll();
        const fromUser = users[fromEmail.toLowerCase()];
        const toUser = Object.values(users).find(u => u.id === toId);
        if (!toUser) {
            return { success: false, message: 'Allenatore non trovato. Verifica l\'ID inserito.' };
        }
        if (fromUser.id === toId) {
            return { success: false, message: 'Non puoi aggiungere te stesso!' };
        }
        // Initialize arrays if needed
        fromUser.friends = fromUser.friends || [];
        fromUser.sentRequests = fromUser.sentRequests || [];
        fromUser.friendRequests = fromUser.friendRequests || [];
        toUser.friends = toUser.friends || [];
        toUser.sentRequests = toUser.sentRequests || [];
        toUser.friendRequests = toUser.friendRequests || [];
        if (fromUser.friends.includes(toId)) {
            return { success: false, message: 'Siete già compagni!' };
        }
        if (fromUser.sentRequests.includes(toId)) {
            return { success: false, message: 'Hai già inviato una richiesta a questo allenatore.' };
        }
        if (fromUser.friendRequests.includes(toId)) {
            return { success: false, message: 'Questo allenatore ti ha già inviato una richiesta! Vai su "Richieste" per accettarla.' };
        }
        // Add request
        fromUser.sentRequests.push(toId);
        toUser.friendRequests.push(fromUser.id);
        // Add notification
        NotificationsDB.add(toUser.id, {
            type: 'friend_request',
            fromId: fromUser.id,
            fromName: fromUser.name,
            message: `${fromUser.name} ti ha inviato una richiesta di amicizia`,
            timestamp: new Date().toISOString(),
            read: false
        });
        UsersDB.saveAll(users);
        return { success: true, message: `Richiesta inviata a ${toUser.name}!`, targetName: toUser.name };
    },
    /**
     * Accept a friend request
     * @param {string} userEmail
     * @param {string} fromId
     * @returns {{success: boolean, message: string, friendName?: string}}
     */
    acceptRequest(userEmail, fromId) {
        const users = UsersDB.getAll();
        const user = users[userEmail.toLowerCase()];
        const fromUser = Object.values(users).find(u => u.id === fromId);
        if (!fromUser) {
            return { success: false, message: 'Allenatore non trovato' };
        }
        // Initialize arrays
        user.friendRequests = user.friendRequests || [];
        user.friends = user.friends || [];
        fromUser.sentRequests = fromUser.sentRequests || [];
        fromUser.friends = fromUser.friends || [];
        // Remove from requests
        user.friendRequests = user.friendRequests.filter(id => id !== fromId);
        fromUser.sentRequests = fromUser.sentRequests.filter(id => id !== user.id);
        // Add to friends
        if (!user.friends.includes(fromId)) {
            user.friends.push(fromId);
        }
        if (!fromUser.friends.includes(user.id)) {
            fromUser.friends.push(user.id);
        }
        UsersDB.saveAll(users);
        return { success: true, message: `${fromUser.name} è ora tuo compagno!`, friendName: fromUser.name };
    },
    /**
     * Reject a friend request
     * @param {string} userEmail
     * @param {string} fromId
     * @returns {{success: boolean}}
     */
    rejectRequest(userEmail, fromId) {
        const users = UsersDB.getAll();
        const user = users[userEmail.toLowerCase()];
        const fromUser = Object.values(users).find(u => u.id === fromId);
        user.friendRequests = (user.friendRequests || []).filter(id => id !== fromId);
        
        if (fromUser) {
            fromUser.sentRequests = (fromUser.sentRequests || []).filter(id => id !== user.id);
        }
        UsersDB.saveAll(users);
        return { success: true };
    },
    /**
     * Cancel a sent friend request
     * @param {string} userEmail
     * @param {string} toId
     * @returns {{success: boolean}}
     */
    cancelRequest(userEmail, toId) {
        const users = UsersDB.getAll();
        const user = users[userEmail.toLowerCase()];
        const toUser = Object.values(users).find(u => u.id === toId);
        user.sentRequests = (user.sentRequests || []).filter(id => id !== toId);
        
        if (toUser) {
            toUser.friendRequests = (toUser.friendRequests || []).filter(id => id !== user.id);
        }
        UsersDB.saveAll(users);
        return { success: true };
    },
    /**
     * Remove a friend
     * @param {string} userEmail
     * @param {string} friendId
     * @returns {{success: boolean}}
     */
    remove(userEmail, friendId) {
        const users = UsersDB.getAll();
        const user = users[userEmail.toLowerCase()];
        const friend = Object.values(users).find(u => u.id === friendId);
        user.friends = (user.friends || []).filter(id => id !== friendId);
        
        if (friend) {
            friend.friends = (friend.friends || []).filter(id => id !== user.id);
        }
        UsersDB.saveAll(users);
        return { success: true };
    }
};
