/**
 * FantaLega Classic - Teams Database Module
 */
const TeamsDB = {
    /**
     * Get all teams
     * @returns {Object}
     */
    getAll() {
        return Database.get(CONFIG.STORAGE_KEYS.TEAMS);
    },
    /**
     * Save all teams
     * @param {Object} teams
     */
    saveAll(teams) {
        Database.save(CONFIG.STORAGE_KEYS.TEAMS, teams);
    },
    /**
     * Get team by ID
     * @param {string} teamId
     * @returns {Object|null}
     */
    getById(teamId) {
        const teams = this.getAll();
        return teams[teamId] || null;
    },
    /**
     * Get teams by owner
     * @param {string} ownerId
     * @returns {Array}
     */
    getByOwner(ownerId) {
        const teams = this.getAll();
        return Object.values(teams).filter(t => t.ownerId === ownerId);
    },
    /**
     * Create a new team
     * @param {string} ownerId
     * @param {Object} teamData
     * @returns {{success: boolean, message?: string, teamId?: string}}
     */
    create(ownerId, teamData) {
        const user = UsersDB.getById(ownerId);
        if (!user) {
            return { success: false, message: 'Allenatore non trovato' };
        }
        if (!teamData.name || teamData.name.trim().length === 0) {
            return { success: false, message: 'Il nome della squadra è obbligatorio' };
        }
        if (teamData.name.length > CONFIG.VALIDATION.MAX_TEAM_NAME_LENGTH) {
            return { success: false, message: `Il nome non può superare ${CONFIG.VALIDATION.MAX_TEAM_NAME_LENGTH} caratteri` };
        }
        const teams = this.getAll();
        const teamId = Utils.generateUniqueId('team');
        // Generate abbreviation if not provided
        let abbreviation = teamData.abbreviation?.toUpperCase().trim();
        if (!abbreviation) {
            abbreviation = teamData.name
                .split(' ')
                .map(w => w[0])
                .join('')
                .toUpperCase()
                .slice(0, CONFIG.VALIDATION.MAX_TEAM_ABBR_LENGTH);
        }
        const team = {
            id: teamId,
            ownerId: ownerId,
            name: teamData.name.trim(),
            abbreviation: abbreviation.slice(0, CONFIG.VALIDATION.MAX_TEAM_ABBR_LENGTH),
            badge: teamData.badge || null,
            primaryColor: teamData.primaryColor || CONFIG.TEAM.DEFAULT_PRIMARY_COLOR,
            secondaryColor: teamData.secondaryColor || CONFIG.TEAM.DEFAULT_SECONDARY_COLOR,
            motto: teamData.motto || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        teams[teamId] = team;
        this.saveAll(teams);
        // Add team to user
        UsersDB.addTeam(ownerId, teamId);
        return { success: true, teamId };
    },
    /**
     * Update team data
     * @param {string} teamId
     * @param {Object} data
     * @param {string} requesterId - ID of user making the request
     * @returns {{success: boolean, message?: string}}
     */
    update(teamId, data, requesterId) {
        const teams = this.getAll();
        const team = teams[teamId];
        if (!team) {
            return { success: false, message: 'Squadra non trovata' };
        }
        if (team.ownerId !== requesterId) {
            return { success: false, message: 'Non hai i permessi per modificare questa squadra' };
        }
        // Validate name if being updated
        if (data.name !== undefined) {
            if (data.name.trim().length === 0) {
                return { success: false, message: 'Il nome della squadra è obbligatorio' };
            }
            if (data.name.length > CONFIG.VALIDATION.MAX_TEAM_NAME_LENGTH) {
                return { success: false, message: `Il nome non può superare ${CONFIG.VALIDATION.MAX_TEAM_NAME_LENGTH} caratteri` };
            }
        }
        // Update abbreviation if being changed
        if (data.abbreviation !== undefined) {
            data.abbreviation = data.abbreviation.toUpperCase().slice(0, CONFIG.VALIDATION.MAX_TEAM_ABBR_LENGTH);
        }
        teams[teamId] = {
            ...team,
            ...data,
            updatedAt: new Date().toISOString()
        };
        this.saveAll(teams);
        return { success: true };
    },
    /**
     * Delete a team
     * @param {string} teamId
     * @param {string} requesterId
     * @returns {{success: boolean, message?: string}}
     */
    delete(teamId, requesterId) {
        const teams = this.getAll();
        const team = teams[teamId];
        if (!team) {
            return { success: false, message: 'Squadra non trovata' };
        }
        if (team.ownerId !== requesterId) {
            return { success: false, message: 'Non hai i permessi per eliminare questa squadra' };
        }
        // Check if team is assigned to any league
        const groups = GroupsDB.getAll();
        const assignedLeagues = Object.values(groups).filter(g => {
            if (!g.memberTeams) return false;
            return Object.values(g.memberTeams).includes(teamId);
        });
        if (assignedLeagues.length > 0) {
            return { 
                success: false, 
                message: `Questa squadra è assegnata a ${assignedLeagues.length} lega/leghe. Rimuovila prima dalle leghe.`
            };
        }
        // Delete team
        delete teams[teamId];
        this.saveAll(teams);
        // Remove from user
        UsersDB.removeTeam(requesterId, teamId);
        return { success: true };
    },
    /**
     * Get leagues where team is assigned
     * @param {string} teamId
     * @returns {Array}
     */
    getAssignedLeagues(teamId) {
        const groups = GroupsDB.getAll();
        return Object.values(groups).filter(g => {
            if (!g.memberTeams) return false;
            return Object.values(g.memberTeams).includes(teamId);
        });
    },
    /**
     * Get team stats
     * @param {string} teamId
     * @returns {Object}
     */
    getStats(teamId) {
        const team = this.getById(teamId);
        if (!team) return null;
        const assignedLeagues = this.getAssignedLeagues(teamId);
        return {
            leaguesCount: assignedLeagues.length,
            createdAt: team.createdAt
        };
    }
};
