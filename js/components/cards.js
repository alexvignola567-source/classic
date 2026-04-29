/**
 * FantaLega Classic - Card Components
 */
const Cards = {
    /**
     * Render league card
     * @param {Object} group
     * @param {string} userId
     * @returns {string}
     */
    renderLeague(group, userId) {
        const memberAvatars = group.members.slice(0, 3).map(memberId => {
            const member = UsersDB.getById(memberId);
            if (!member) return '';
            const avatarContent = Avatars.renderUser(member, 'sm');
            return `<div class="mini-avatar">${avatarContent}</div>`;
        }).join('');
        const groupAvatarContent = Avatars.renderGroup(group);
        // Get user's team for this league
        const userTeam = GroupsDB.getMemberTeam(group.id, userId);
        let teamInfo = '';
        
        if (userTeam) {
            const badgeContent = Avatars.renderTeam(userTeam, 'sm');
            teamInfo = `
                <div class="league-card-team">
                    <div class="league-card-team-info">
                        <div class="league-card-team-badge has-team">${badgeContent}</div>
                        <span class="league-card-team-name">${Utils.escapeHtml(userTeam.name)}</span>
                    </div>
                </div>
            `;
        } else {
            teamInfo = `
                <div class="league-card-team">
                    <div class="league-card-team-info">
                        <div class="league-card-team-badge no-team"><i class="fas fa-exclamation"></i></div>
                        <span class="league-card-team-name" style="color: var(--warning);">Nessuna squadra</span>
                    </div>
                    <button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); TeamsSection.openAssignModal('${group.id}');">
                        <i class="fas fa-plus"></i> Assegna
                    </button>
                </div>
            `;
        }
        return `
            <div class="league-card" onclick="GroupsSection.show('${group.id}')">
                <div class="league-card-header">
                    <div class="league-avatar">${groupAvatarContent}</div>
                    <div class="league-info">
                        <h3>${Utils.escapeHtml(group.name)}</h3>
                        <p>${Utils.escapeHtml(group.description || 'Nessuna descrizione')}</p>
                    </div>
                </div>
                <div class="league-card-body">
                    <div class="league-members">
                        <div class="league-members-avatars">
                            ${memberAvatars}
                        </div>
                        <span class="league-members-count">${group.members.length} partecipanti</span>
                    </div>
                    ${teamInfo}
                </div>
            </div>
        `;
    },
    /**
     * Render team card
     * @param {Object} team
     * @returns {string}
     */
    renderTeam(team) {
        const badgeContent = Avatars.renderTeam(team, 'lg');
        const assignedLeagues = TeamsDB.getAssignedLeagues(team.id);
        
        const leaguesTags = assignedLeagues.map(league => `
            <span class="team-league-tag">
                <i class="fas fa-trophy"></i>
                ${Utils.escapeHtml(league.name)}
            </span>
        `).join('');
        return `
            <div class="team-card">
                <div class="team-card-header">
                    <div class="team-badge" style="background: linear-gradient(180deg, ${team.secondaryColor} 0%, ${team.primaryColor} 100%);">
                        ${badgeContent}
                    </div>
                    <div class="team-card-info">
                        <div class="team-card-name">${Utils.escapeHtml(team.name)}</div>
                        <div class="team-card-abbr">${Utils.escapeHtml(team.abbreviation)}</div>
                        <div class="team-colors">
                            <div class="team-color-swatch" style="background: ${team.primaryColor};"></div>
                            <div class="team-color-swatch" style="background: ${team.secondaryColor};"></div>
                        </div>
                    </div>
                </div>
                <div class="team-card-body">
                    <div class="team-stats">
                        <div class="team-stat">
                            <div class="team-stat-value">${assignedLeagues.length}</div>
                            <div class="team-stat-label">Leghe</div>
                        </div>
                        <div class="team-stat">
                            <div class="team-stat-value">${Utils.formatShortDate(team.createdAt)}</div>
                            <div class="team-stat-label">Creata</div>
                        </div>
                    </div>
                    ${assignedLeagues.length > 0 ? `
                        <div class="team-leagues">
                            <div class="team-leagues-title">Partecipa a:</div>
                            <div class="team-leagues-list">${leaguesTags}</div>
                        </div>
                    ` : ''}
                    <div class="team-card-actions">
                        <button class="btn btn-secondary btn-sm" onclick="TeamsSection.edit('${team.id}')">
                            <i class="fas fa-edit"></i> Modifica
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="TeamsSection.confirmDelete('${team.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    /**
     * Render friend item
     * @param {Object} friend
     * @returns {string}
     */
    renderFriend(friend) {
        const avatarContent = Avatars.renderUser(friend);
        return `
            <div class="friend-item" data-id="${friend.id}">
                <div class="friend-info">
                    <div class="friend-avatar">${avatarContent}</div>
                    <div class="friend-details">
                        <span class="friend-name">${Utils.escapeHtml(friend.name)}</span>
                        <span class="friend-id">#${friend.id}</span>
                        <span class="friend-status"><span class="status-dot"></span> In panchina</span>
                    </div>
                </div>
                <div class="friend-menu" onclick="event.stopPropagation();">
                    <button class="friend-menu-btn" onclick="Dropdowns.toggleFriendMenu('${friend.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="friend-dropdown" id="menu-${friend.id}">
                        <button class="dropdown-item" onclick="ProfileModal.show('${friend.id}'); Dropdowns.closeAllMenus();">
                            <i class="fas fa-user"></i> Vedi scheda
                        </button>
                        <button class="dropdown-item" onclick="FriendsSection.sendPoke('${friend.id}'); Dropdowns.closeAllMenus();">
                            <i class="fas fa-hand-paper"></i> Saluta
                        </button>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item danger" onclick="FriendsSection.confirmRemove('${friend.id}'); Dropdowns.closeAllMenus();">
                            <i class="fas fa-user-minus"></i> Rimuovi
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    /**
     * Render friend request item
     * @param {Object} requester
     * @returns {string}
     */
    renderFriendRequest(requester) {
        const avatarContent = Avatars.renderUser(requester);
        return `
            <div class="request-item" data-id="${requester.id}">
                <div class="friend-info">
                    <div class="friend-avatar">${avatarContent}</div>
                    <div class="friend-details">
                        <span class="friend-name">${Utils.escapeHtml(requester.name)}</span>
                        <span class="friend-id">#${requester.id}</span>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-success btn-sm" onclick="FriendsSection.accept('${requester.id}')">
                        <i class="fas fa-check"></i> Accetta
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="FriendsSection.reject('${requester.id}')">
                        <i class="fas fa-times"></i> Rifiuta
                    </button>
                </div>
            </div>
        `;
    },
    /**
     * Render sent request item
     * @param {Object} target
     * @returns {string}
     */
    renderSentRequest(target) {
        const avatarContent = Avatars.renderUser(target);
        return `
            <div class="request-item" data-id="${target.id}">
                <div class="friend-info">
                    <div class="friend-avatar">${avatarContent}</div>
                    <div class="friend-details">
                        <span class="friend-name">${Utils.escapeHtml(target.name)}</span>
                        <span class="friend-id">#${target.id}</span>
                        <span style="font-size: 0.6875rem; color: var(--warning); font-weight: 600;">
                            <i class="fas fa-clock"></i> In attesa
                        </span>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-secondary btn-sm" onclick="FriendsSection.cancel('${target.id}')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                </div>
            </div>
        `;
    }
};
