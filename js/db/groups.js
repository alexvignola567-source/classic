/**
 * FantaLega Classic - Groups (Leagues) Database Module
 */
const GroupsDB = {
    /**
     * Get all groups
     * @returns {Object}
     */
    getAll() {
        return Database.get(CONFIG.STORAGE_KEYS.GROUPS);
    },
    /**
     * Save all groups
     * @param {Object} groups
     */
    saveAll(groups) {
        Database.save(CONFIG.STORAGE_KEYS.GROUPS, groups);
    },
    /**
     * Get group by ID
     * @param {string} groupId
     * @returns {Object|null}
     */
    getById(groupId) {
        const groups = this.getAll();
        return groups[groupId] || null;
    },
    /**
     * Get group by code
     * @param {string} code
     * @returns {Object|null}
     */
    getByCode(code) {
        const groups = this.getAll();
        return Object.values(groups).find(g => 
            g.code.toUpperCase() === code.toUpperCase()
        ) || null;
    },
    /**
     * Create a new group
     * @param {string} creatorEmail
     * @param {Object} groupData
     * @returns {{success: boolean, message?: string, groupId?: string, groupCode?: string}}
     */
    create(creatorEmail, groupData) {
        const users = UsersDB.getAll();
        const groups = this.getAll();
        const creator = users[creatorEmail.toLowerCase()];
        if (!creator) {
            return { success: false, message: 'Allenatore non trovato' };
        }
        // Generate unique group code
        let groupCode;
        do {
            groupCode = Utils.generateAlphanumericCode(CONFIG.VALIDATION.GROUP_CODE_LENGTH);
        } while (this.getByCode(groupCode));
        const groupId = Utils.generateUniqueId('g');
        const group = {
            id: groupId,
            code: groupCode,
            name: groupData.name.trim(),
            description: groupData.description || '',
            avatar: groupData.avatar || null,
            visibility: groupData.visibility || CONFIG.LEAGUE.VISIBILITY.INVITE,
            invitePermission: groupData.invitePermission || CONFIG.LEAGUE.INVITE_PERMISSION.ALL,
            maxMembers: parseInt(groupData.maxMembers) || CONFIG.LEAGUE.DEFAULT_MAX_MEMBERS,
            creator: creator.id,
            owner: creator.id,
            admins: [creator.id],
            members: [creator.id],
            memberTeams: {}, // userId -> teamId mapping
            pendingInvites: [],
            createdAt: new Date().toISOString()
        };
        groups[groupId] = group;
        this.saveAll(groups);
        // Add group to creator
        creator.groups = creator.groups || [];
        creator.groups.push(groupId);
        UsersDB.saveAll(users);
        return { success: true, groupId, groupCode };
    },
    /**
     * Update group data
     * @param {string} groupId
     * @param {Object} data
     * @returns {boolean}
     */
    update(groupId, data) {
        const groups = this.getAll();
        if (!groups[groupId]) return false;
        
        groups[groupId] = { ...groups[groupId], ...data };
        this.saveAll(groups);
        return true;
    },
    /**
     * Invite user to group
     * @param {string} groupId
     * @param {string} userId
     * @param {string} inviterId
     * @returns {{success: boolean, message: string}}
     */
    inviteUser(groupId, userId, inviterId) {
        const groups = this.getAll();
        const group = groups[groupId];
        const invitee = UsersDB.getById(userId);
        const inviter = UsersDB.getById(inviterId);
        if (!group) return { success: false, message: 'Lega non trovata' };
        if (!invitee) return { success: false, message: 'Allenatore non trovato' };
        if (group.members.includes(userId)) {
            return { success: false, message: 'Allenatore già nella lega' };
        }
        if ((group.pendingInvites || []).includes(userId)) {
            return { success: false, message: 'Invito già inviato' };
        }
        if (group.invitePermission === CONFIG.LEAGUE.INVITE_PERMISSION.ADMIN && 
            !group.admins.includes(inviterId)) {
            return { success: false, message: 'Solo gli admin possono invitare' };
        }
        group.pendingInvites = group.pendingInvites || [];
        group.pendingInvites.push(userId);
        this.saveAll(groups);
        // Add notification
        NotificationsDB.add(userId, {
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
    /**
     * Accept group invite
     * @param {string} userId
     * @param {string} groupId
     * @returns {{success: boolean, message: string}}
     */
    acceptInvite(userId, groupId) {
        const groups = this.getAll();
        const users = UsersDB.getAll();
        const group = groups[groupId];
        const user = UsersDB.getById(userId);
        if (!group || !user) return { success: false, message: 'Errore' };
        if (group.maxMembers > 0 && group.members.length >= group.maxMembers) {
            return { success: false, message: 'La lega è piena' };
        }
        group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
        
        if (!group.members.includes(userId)) {
            group.members.push(userId);
        }
        
        this.saveAll(groups);
        // Add group to user
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        if (userEmail) {
            users[userEmail].groups = users[userEmail].groups || [];
            if (!users[userEmail].groups.includes(groupId)) {
                users[userEmail].groups.push(groupId);
            }
            UsersDB.saveAll(users);
        }
        return { success: true, message: `Sei entrato nella lega "${group.name}"` };
    },
    /**
     * Reject group invite
     * @param {string} userId
     * @param {string} groupId
     * @returns {{success: boolean}}
     */
    rejectInvite(userId, groupId) {
        const groups = this.getAll();
        const group = groups[groupId];
        if (!group) return { success: false };
        group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
        this.saveAll(groups);
        return { success: true };
    },
    /**
     * Join group by code
     * @param {string} userId
     * @param {string} code
     * @returns {{success: boolean, message: string, groupId?: string}}
     */
    joinByCode(userId, code) {
        const group = this.getByCode(code);
        const user = UsersDB.getById(userId);
        if (!group) return { success: false, message: 'Codice non valido' };
        if (!user) return { success: false, message: 'Allenatore non trovato' };
        if (group.members.includes(userId)) {
            return { success: false, message: 'Sei già partecipante di questa lega' };
        }
        if (group.maxMembers > 0 && group.members.length >= group.maxMembers) {
            return { success: false, message: 'La lega è piena' };
        }
        const users = UsersDB.getAll();
        const groups = this.getAll();
        group.members.push(userId);
        group.pendingInvites = (group.pendingInvites || []).filter(id => id !== userId);
        groups[group.id] = group;
        this.saveAll(groups);
        // Add group to user
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        if (userEmail) {
            users[userEmail].groups = users[userEmail].groups || [];
            users[userEmail].groups.push(group.id);
            UsersDB.saveAll(users);
        }
        return { success: true, message: `Sei entrato nella lega "${group.name}"!`, groupId: group.id };
    },
    /**
     * Leave group
     * @param {string} userId
     * @param {string} groupId
     * @returns {{success: boolean}}
     */
    leave(userId, groupId) {
        const groups = this.getAll();
        const users = UsersDB.getAll();
        const group = groups[groupId];
        if (!group) return { success: false };
        // Remove user from group
        group.members = group.members.filter(id => id !== userId);
        group.admins = group.admins.filter(id => id !== userId);
        
        // Remove team assignment
        if (group.memberTeams) {
            delete group.memberTeams[userId];
        }
        // Delete group if empty
        if (group.members.length === 0) {
            delete groups[groupId];
        } else {
            // Transfer ownership if owner left
            if (group.owner === userId) {
                group.owner = group.admins[0] || group.members[0];
                if (!group.admins.includes(group.owner)) {
                    group.admins.push(group.owner);
                }
            }
            // Ensure at least one admin
            if (group.admins.length === 0) {
                group.admins.push(group.members[0]);
            }
        }
        this.saveAll(groups);
        // Remove group from user
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        if (userEmail) {
            users[userEmail].groups = (users[userEmail].groups || []).filter(id => id !== groupId);
            UsersDB.saveAll(users);
        }
        return { success: true };
    },
    /**
     * Kick user from group
     * @param {string} groupId
     * @param {string} userId
     * @param {string} kickerId
     * @returns {{success: boolean, message: string}}
     */
    kickUser(groupId, userId, kickerId) {
        const groups = this.getAll();
        const users = UsersDB.getAll();
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
            return { success: false, message: 'Solo il presidente può espellere un admin' };
        }
        // Remove user
        group.members = group.members.filter(id => id !== userId);
        group.admins = group.admins.filter(id => id !== userId);
        
        // Remove team assignment
        if (group.memberTeams) {
            delete group.memberTeams[userId];
        }
        
        this.saveAll(groups);
        // Remove group from user
        const userEmail = Object.keys(users).find(email => users[email].id === userId);
        if (userEmail) {
            users[userEmail].groups = (users[userEmail].groups || []).filter(id => id !== groupId);
            UsersDB.saveAll(users);
        }
        const kickedUser = UsersDB.getById(userId);
        return { success: true, message: `${kickedUser?.name || 'Allenatore'} è stato espulso` };
    },
    /**
     * Promote user to admin
     * @param {string} groupId
     * @param {string} userId
     * @param {string} promoterId
     * @returns {{success: boolean, message: string}}
     */
    promoteToAdmin(groupId, userId, promoterId) {
        const groups = this.getAll();
        const group = groups[groupId];
        if (!group) return { success: false, message: 'Lega non trovata' };
        if (group.owner !== promoterId) {
            return { success: false, message: 'Solo il presidente può promuovere admin' };
        }
        if (group.admins.includes(userId)) {
            return { success: false, message: 'Allenatore già admin' };
        }
        group.admins.push(userId);
        this.saveAll(groups);
        const promotedUser = UsersDB.getById(userId);
        return { success: true, message: `${promotedUser?.name} è ora admin` };
    },
    /**
     * Demote user from admin
     * @param {string} groupId
     * @param {string} userId
     * @param {string} demoterId
     * @returns {{success: boolean, message: string}}
     */
    demoteFromAdmin(groupId, userId, demoterId) {
        const groups = this.getAll();
        const group = groups[groupId];
        if (!group) return { success: false, message: 'Lega non trovata' };
        if (group.owner !== demoterId) {
            return { success: false, message: 'Solo il presidente può rimuovere admin' };
        }
        if (group.owner === userId) {
            return { success: false, message: 'Non puoi rimuovere i privilegi del presidente' };
        }
        group.admins = group.admins.filter(id => id !== userId);
        this.saveAll(groups);
        const demotedUser = UsersDB.getById(userId);
        return { success: true, message: `${demotedUser?.name} non è più admin` };
    },
    /**
     * Transfer ownership
     * @param {string} groupId
     * @param {string} newOwnerId
     * @returns {{success: boolean, message?: string}}
     */
    transferOwnership(groupId, newOwnerId) {
        const groups = this.getAll();
        const group = groups[groupId];
        const user = UsersDB.getCurrentUser();
        if (!group) return { success: false, message: 'Lega non trovata' };
        if (group.owner !== user.id) {
            return { success: false, message: 'Solo il presidente può trasferire la presidenza' };
        }
        if (!group.members.includes(newOwnerId)) {
            return { success: false, message: 'L\'allenatore deve essere partecipante della lega' };
        }
        group.owner = newOwnerId;
        if (!group.admins.includes(newOwnerId)) {
            group.admins.push(newOwnerId);
        }
        this.saveAll(groups);
        return { success: true };
    },
    /**
     * Get user's groups
     * @param {string} userId
     * @returns {Array}
     */
    getUserGroups(userId) {
        const user = UsersDB.getById(userId);
        if (!user) return [];
        const groups = this.getAll();
        return (user.groups || [])
            .map(groupId => groups[groupId])
            .filter(g => g !== undefined);
    },
    /**
     * Check if user can see group code
     * @param {string} groupId
     * @param {string} userId
     * @returns {boolean}
     */
    canSeeCode(groupId, userId) {
        const group = this.getById(groupId);
        if (!group) return false;
        if (group.visibility === CONFIG.LEAGUE.VISIBILITY.CODE) return true;
        return group.owner === userId || group.admins.includes(userId);
    },
    /**
     * Check if user can invite
     * @param {string} groupId
     * @param {string} userId
     * @returns {boolean}
     */
    canInvite(groupId, userId) {
        const group = this.getById(groupId);
        if (!group) return false;
        if (group.invitePermission === CONFIG.LEAGUE.INVITE_PERMISSION.ADMIN) {
            return group.owner === userId || group.admins.includes(userId);
        }
        return true;
    },
    /**
     * Set member's team for a group
     * @param {string} groupId
     * @param {string} userId
     * @param {string} teamId
     * @returns {{success: boolean, message?: string}}
     */
    setMemberTeam(groupId, userId, teamId) {
        const groups = this.getAll();
        const group = groups[groupId];
        if (!group) return { success: false, message: 'Lega non trovata' };
        if (!group.members.includes(userId)) {
            return { success: false, message: 'L\'allenatore non è nella lega' };
        }
        // Verify user owns the team
        const team = TeamsDB.getById(teamId);
        if (!team || team.ownerId !== userId) {
            return { success: false, message: 'Squadra non valida' };
        }
        group.memberTeams = group.memberTeams || {};
        group.memberTeams[userId] = teamId;
        this.saveAll(groups);
        return { success: true };
    },
    /**
     * Get member's team for a group
     * @param {string} groupId
     * @param {string} userId
     * @returns {Object|null}
     */
    getMemberTeam(groupId, userId) {
        const group = this.getById(groupId);
        if (!group || !group.memberTeams) return null;
        const teamId = group.memberTeams[userId];
        if (!teamId) return null;
        return TeamsDB.getById(teamId);
    },
    /**
     * Remove member's team from group
     * @param {string} groupId
     * @param {string} userId
     */
    removeMemberTeam(groupId, userId) {
        const groups = this.getAll();
        const group = groups[groupId];
        if (!group || !group.memberTeams) return;
        delete group.memberTeams[userId];
        this.saveAll(groups);
    }
};
