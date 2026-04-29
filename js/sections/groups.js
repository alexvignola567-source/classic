/**
 * FantaLega Classic - Groups (Leagues) Section
 */
const GroupsSection = {
    currentGroupId: null,
    newGroupAvatarData: null,
    lastGroupVersion: {},
    /**
     * Show group detail
     * @param {string} groupId
     */
    show(groupId) {
        const group = GroupsDB.getById(groupId);
        if (!group) return;
        this.currentGroupId = groupId;
        const user = UsersDB.getCurrentUser();
        const isOwner = group.owner === user.id;
        const isAdmin = group.admins.includes(user.id);
        const canSeeCode = GroupsDB.canSeeCode(groupId, user.id);
        const canInvite = GroupsDB.canInvite(groupId, user.id);
        // Get user's team in this league
        const userTeam = GroupsDB.getMemberTeam(groupId, user.id);
        const section = document.getElementById('section-group');
        section.innerHTML = this.renderGroupDetail(group, user, isOwner, isAdmin, canSeeCode, canInvite, userTeam);
        this.setupEventListeners(group, user, isOwner, isAdmin);
        this.lastGroupVersion[groupId] = JSON.stringify(group);
        App.showSection('group');
    },
    /**
     * Render group detail
     */
    renderGroupDetail(group, user, isOwner, isAdmin, canSeeCode, canInvite, userTeam) {
        const avatarContent = Avatars.renderGroup(group);
        const createdDate = new Date(group.createdAt);
        return `
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-trophy"></i> ${Utils.escapeHtml(group.name)}</h1>
                    <p>Gestisci la tua lega</p>
                </div>
                <button class="btn btn-secondary" onclick="App.showSection('home')">
                    <i class="fas fa-arrow-left"></i> Torna alla Bacheca
                </button>
            </div>
            <div class="league-container">
                <div class="league-detail-card">
                    <div class="league-detail-header">
                        <div class="league-detail-top">
                            <div class="league-detail-avatar-container">
                                <div class="league-detail-avatar">${avatarContent}</div>
                                ${isAdmin ? `
                                    <label class="league-avatar-edit" title="Cambia immagine">
                                        <i class="fas fa-camera"></i>
                                        <input type="file" id="group-avatar-upload" accept="image/*">
                                    </label>
                                ` : ''}
                            </div>
                            <div class="league-detail-info">
                                <h2>${Utils.escapeHtml(group.name)}</h2>
                                ${canSeeCode ? `
                                    <div class="league-code-badge">
                                        <i class="fas fa-ticket-alt"></i> Codice: <span id="group-code-display">${group.code}</span>
                                        <button type="button" class="copy-btn" onclick="GroupsSection.copyCode()" title="Copia codice">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="league-stats">
                            <div class="league-stat">
                                <div class="league-stat-value">${group.members.length}</div>
                                <div class="league-stat-label">Partecipanti</div>
                            </div>
                            <div class="league-stat">
                                <div class="league-stat-value">${Utils.formatShortDate(group.createdAt)}</div>
                                <div class="league-stat-label">Fondata</div>
                            </div>
                        </div>
                    </div>
                    <div class="league-detail-body">
                        <!-- My Team Section -->
                        <div class="my-team-section">
                            <h3><i class="fas fa-shield-alt"></i> La tua Squadra</h3>
                            ${userTeam ? this.renderMyTeam(userTeam, group.id) : this.renderNoTeam(group.id)}
                        </div>
                        ${canInvite ? this.renderInviteSection(group, user) : ''}
                        ${canSeeCode ? `
                            <div class="league-section">
                                <h3><i class="fas fa-share-alt"></i> Condividi Codice</h3>
                                <div class="invite-card">
                                    <div class="invite-card-icon"><i class="fas fa-qrcode"></i></div>
                                    <div class="invite-card-content">
                                        <h4>Condividi il codice lega</h4>
                                        <p>Chiunque con questo codice può partecipare</p>
                                    </div>
                                    <button class="btn btn-primary btn-sm" onclick="GroupsSection.copyCode()">
                                        <i class="fas fa-copy"></i> Copia
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                        <div class="league-section">
                            <h3><i class="fas fa-users"></i> Partecipanti (${group.members.length})</h3>
                            <div class="member-list">
                                ${this.renderMembers(group, user, isOwner, isAdmin)}
                            </div>
                        </div>
                        ${(isAdmin || isOwner) ? this.renderSettingsSection(group, isOwner) : ''}
                        <div class="danger-zone">
                            <h3><i class="fas fa-exclamation-triangle"></i> Zona Pericolosa</h3>
                            <p>${isOwner && group.members.length === 1 
                                ? 'Eliminando la lega, essa sarà rimossa definitivamente.'
                                : 'Abbandonando la lega, non potrai più accedere ai suoi contenuti.'
                            }</p>
                            <button type="button" class="btn btn-danger" onclick="GroupsSection.leave()">
                                <i class="fas fa-${isOwner && group.members.length === 1 ? 'trash' : 'door-open'}"></i>
                                ${isOwner && group.members.length === 1 ? 'Elimina lega' : 'Abbandona lega'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    /**
     * Render my team display
     */
    renderMyTeam(team, groupId) {
        const badgeContent = Avatars.renderTeam(team, 'md');
        
        return `
            <div class="my-team-display">
                <div class="my-team-info">
                    <div class="my-team-badge" style="background: linear-gradient(180deg, ${team.secondaryColor} 0%, ${team.primaryColor} 100%);">
                        ${badgeContent}
                    </div>
                    <div class="my-team-details">
                        <h4>${Utils.escapeHtml(team.name)}</h4>
                        <p>${Utils.escapeHtml(team.abbreviation)}</p>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="TeamsSection.openAssignModal('${groupId}')">
                    <i class="fas fa-exchange-alt"></i> Cambia
                </button>
            </div>
        `;
    },
    /**
     * Render no team message
     */
    renderNoTeam(groupId) {
        return `
            <div class="no-team-assigned">
                <div class="no-team-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <h4>Nessuna squadra assegnata</h4>
                        <p>Devi assegnare una squadra per partecipare alla lega</p>
                    </div>
                </div>
                <button class="btn btn-warning" onclick="TeamsSection.openAssignModal('${groupId}')">
                    <i class="fas fa-plus"></i> Assegna Squadra
                </button>
            </div>
        `;
    },
    /**
     * Render invite section
     */
    renderInviteSection(group, user) {
        const friends = user.friends || [];
        
        if (friends.length === 0) {
            return `
                <div class="league-section">
                    <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-users"></i></div>
                        <div class="invite-card-content">
                            <h4>Aggiungi compagni</h4>
                            <p>Per invitare allenatori, prima aggiungili come compagni</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="Navigation.navigateToFriendsFromGroup('${group.id}')">
                            <i class="fas fa-user-plus"></i> Vai
                        </button>
                    </div>
                </div>
            `;
        }
        const availableFriends = friends.filter(fId => !group.members.includes(fId));
        
        if (availableFriends.length === 0) {
            return `
                <div class="league-section">
                    <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="invite-card-content">
                            <h4>Tutti invitati!</h4>
                            <p>Tutti i tuoi compagni sono già nella lega</p>
                        </div>
                    </div>
                </div>
            `;
        }
        return `
            <div class="league-section">
                <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                <div class="invite-card">
                    <div class="invite-card-icon"><i class="fas fa-user-friends"></i></div>
                    <div class="invite-card-content">
                        <h4>${availableFriends.length} compagni disponibili</h4>
                        <p>Invita i tuoi compagni a partecipare</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="GroupsSection.openInviteModal()">
                        <i class="fas fa-paper-plane"></i> Invita
                    </button>
                </div>
            </div>
        `;
    },
    /**
     * Render members list
     */
    renderMembers(group, user, isOwner, isAdmin) {
        return group.members.map(memberId => {
            const member = UsersDB.getById(memberId);
            if (!member) return '';
            const avatarContent = Avatars.renderUser(member);
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
            }
            // Get member's team in this league
            const memberTeam = GroupsDB.getMemberTeam(group.id, memberId);
            const teamInfo = memberTeam 
                ? `<span class="member-team"><i class="fas fa-shield-alt"></i> ${Utils.escapeHtml(memberTeam.name)}</span>`
                : '';
            let actionsHtml = '';
            if (!isCurrentUser) {
                let menuItems = `
                    <button class="dropdown-item" onclick="ProfileModal.show('${memberId}'); Dropdowns.closeAllMenus();">
                        <i class="fas fa-user"></i> Vedi scheda
                    </button>
                `;
                if (isOwner && !memberIsOwner) {
                    if (memberIsAdmin) {
                        menuItems += `
                            <button class="dropdown-item warning" onclick="GroupsSection.demoteMember('${memberId}')">
                                <i class="fas fa-level-down-alt"></i> Rimuovi admin
                            </button>
                        `;
                    } else {
                        menuItems += `
                            <button class="dropdown-item" onclick="GroupsSection.promoteMember('${memberId}')">
                                <i class="fas fa-level-up-alt"></i> Promuovi admin
                            </button>
                        `;
                    }
                }
                if ((isOwner && !memberIsOwner) || (isAdmin && !memberIsAdmin && !memberIsOwner)) {
                    menuItems += `
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item danger" onclick="GroupsSection.kickMember('${memberId}')">
                            <i class="fas fa-ban"></i> Espelli
                        </button>
                    `;
                }
                actionsHtml = `
                    <div class="member-actions" onclick="event.stopPropagation();">
                        <button class="friend-menu-btn" onclick="Dropdowns.toggleMemberMenu('${memberId}')">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="friend-dropdown" id="member-menu-${memberId}">
                            ${menuItems}
                        </div>
                    </div>
                `;
            }
            return `
                <div class="member-item" onclick="ProfileModal.show('${memberId}')">
                    <div class="member-info">
                        <div class="member-avatar">${avatarContent}</div>
                        <div class="member-details">
                            <div class="member-name">${Utils.escapeHtml(member.name)}${isCurrentUser ? ' (tu)' : ''}</div>
                            ${roleText ? `<div class="member-role ${roleClass}">${roleText}</div>` : ''}
                            ${teamInfo}
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        }).join('');
    },
    /**
     * Render settings section
     */
    renderSettingsSection(group, isOwner) {
        const visibilityText = group.visibility === CONFIG.LEAGUE.VISIBILITY.INVITE 
            ? 'Solo su invito' : 'Chiunque con codice';
        const invitePermissionText = group.invitePermission === CONFIG.LEAGUE.INVITE_PERMISSION.ALL 
            ? 'Tutti i partecipanti' : 'Solo amministratori';
        const maxMembersText = group.maxMembers > 0 ? `${group.maxMembers} allenatori` : 'Illimitato';
        return `
            <div class="league-section">
                <h3><i class="fas fa-cog"></i> Impostazioni Lega</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-eye"></i> Visibilità</strong>
                        <p>${visibilityText}</p>
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-user-shield"></i> Chi può invitare</strong>
                        <p>${invitePermissionText}</p>
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-users-cog"></i> Limite partecipanti</strong>
                        <p>${maxMembersText}</p>
                    </div>
                </div>
                <button class="btn btn-secondary" style="margin-top: 0.875rem;" onclick="GroupsSection.openEditModal()">
                    <i class="fas fa-edit"></i> Modifica impostazioni
                </button>
                ${isOwner ? `
                    <button class="btn btn-warning" style="margin-top: 0.375rem;" onclick="GroupsSection.openTransferModal()">
                        <i class="fas fa-crown"></i> Trasferisci presidenza
                    </button>
                ` : ''}
            </div>
        `;
    },
    /**
     * Setup event listeners
     */
    setupEventListeners(group, user, isOwner, isAdmin) {
        // Group avatar upload
        document.getElementById('group-avatar-upload')?.addEventListener('change', (e) => {
            Forms.handleImageUpload(e, (base64) => {
                GroupsDB.update(this.currentGroupId, { avatar: base64 });
                Toast.success('Stemma aggiornato!', 'Lo stemma della lega è stato cambiato');
                this.show(this.currentGroupId);
                HomeSection.renderGroups();
                Navigation.renderNavGroups();
            });
        });
    },
    /**
     * Copy group code
     */
    copyCode() {
        const code = document.getElementById('group-code-display')?.textContent;
        if (code) {
            Utils.copyToClipboard(code).then(() => {
                Toast.success('Copiato!', `Codice ${code} copiato negli appunti`);
            }).catch(() => {
                Toast.error('Errore', 'Impossibile copiare');
            });
        }
    },
    /**
     * Leave group
     */
    leave() {
        const group = GroupsDB.getById(this.currentGroupId);
        const user = UsersDB.getCurrentUser();
        if (!group) return;
        const isOwner = group.owner === user.id;
        const isOnlyMember = group.members.length === 1;
        const title = isOwner && isOnlyMember ? 'Elimina lega' : 'Abbandona lega';
        const message = isOwner && isOnlyMember
            ? `Sei sicuro di voler eliminare "${group.name}"? Questa azione è irreversibile.`
            : `Sei sicuro di voler abbandonare "${group.name}"?`;
        Modal.confirm(title, message, () => {
            GroupsDB.leave(user.id, this.currentGroupId);
            Toast.info(isOwner && isOnlyMember ? 'Lega eliminata' : 'Hai lasciato la lega');
            App.showSection('home');
            HomeSection.renderGroups();
            Navigation.renderNavGroups();
        });
    },
    /**
     * Promote member to admin
     */
    promoteMember(memberId) {
        event.stopPropagation();
        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.promoteToAdmin(this.currentGroupId, memberId, user.id);
        Dropdowns.closeAllMenus();
        if (result.success) {
            Toast.success('Admin promosso!', result.message);
            this.show(this.currentGroupId);
        } else {
            Toast.error('Errore', result.message);
        }
    },
    /**
     * Demote member from admin
     */
    demoteMember(memberId) {
        event.stopPropagation();
        const member = UsersDB.getById(memberId);
        Dropdowns.closeAllMenus();
        Modal.confirm(
            'Rimuovi privilegi admin',
            `Sei sicuro di voler rimuovere i privilegi admin di ${member?.name}?`,
            () => {
                const user = UsersDB.getCurrentUser();
                const result = GroupsDB.demoteFromAdmin(this.currentGroupId, memberId, user.id);
                if (result.success) {
                    Toast.success('Admin rimosso', result.message);
                    this.show(this.currentGroupId);
                } else {
                    Toast.error('Errore', result.message);
                }
            }
        );
    },
    /**
     * Kick member from group
     */
    kickMember(memberId) {
        event.stopPropagation();
        const member = UsersDB.getById(memberId);
        Dropdowns.closeAllMenus();
        Modal.confirm(
            'Espelli partecipante',
            `Sei sicuro di voler espellere ${member?.name} dalla lega?`,
            () => {
                const user = UsersDB.getCurrentUser();
                const result = GroupsDB.kickUser(this.currentGroupId, memberId, user.id);
                if (result.success) {
                    Toast.success('Partecipante espulso', result.message);
                    this.show(this.currentGroupId);
                } else {
                    Toast


THIS IS HERE THE SECOND PART START, TIE THIS SPECIFIC CODE BLOCK TOGHETER

I'll complete the sectioned version of the codebase. Here are the remaining files:

js/sections/groups.js (continued)

``javascript
/*
  FantaLega Classic - Groups (Leagues) Section
 /

const GroupsSection = {
    currentGroupId: null,
    newGroupAvatarData: null,
    lastGroupVersion: {},

    /
      Show group detail
      @param {string} groupId
     /
    show(groupId) {
        const group = GroupsDB.getById(groupId);
        if (!group) return;

        this.currentGroupId = groupId;
        const user = UsersDB.getCurrentUser();
        const isOwner = group.owner === user.id;
        const isAdmin = group.admins.includes(user.id);
        const canSeeCode = GroupsDB.canSeeCode(groupId, user.id);
        const canInvite = GroupsDB.canInvite(groupId, user.id);

        // Get user's team in this league
        const userTeam = GroupsDB.getMemberTeam(groupId, user.id);

        const section = document.getElementById('section-group');
        section.innerHTML = this.renderGroupDetail(group, user, isOwner, isAdmin, canSeeCode, canInvite, userTeam);

        this.setupEventListeners(group, user, isOwner, isAdmin);
        this.lastGroupVersion[groupId] = JSON.stringify(group);

        App.showSection('group');
    },

    /*
      Render group detail
     /
    renderGroupDetail(group, user, isOwner, isAdmin, canSeeCode, canInvite, userTeam) {
        const avatarContent = Avatars.renderGroup(group);

        return 
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-trophy"></i> ${Utils.escapeHtml(group.name)}</h1>
                    <p>Gestisci la tua lega</p>
                </div>
                <button class="btn btn-secondary" onclick="App.showSection('home')">
                    <i class="fas fa-arrow-left"></i> Torna alla Bacheca
                </button>
            </div>

            <div class="league-container">
                <div class="league-detail-card">
                    <div class="league-detail-header">
                        <div class="league-detail-top">
                            <div class="league-detail-avatar-container">
                                <div class="league-detail-avatar">${avatarContent}</div>
                                ${isAdmin ? 
                                    <label class="league-avatar-edit" title="Cambia immagine">
                                        <i class="fas fa-camera"></i>
                                        <input type="file" id="group-avatar-upload" accept="image/">
                                    </label>
                                 : ''}
                            </div>
                            <div class="league-detail-info">
                                <h2>${Utils.escapeHtml(group.name)}</h2>
                                ${canSeeCode ? 
                                    <div class="league-code-badge">
                                        <i class="fas fa-ticket-alt"></i> Codice: <span id="group-code-display">${group.code}</span>
                                        <button type="button" class="copy-btn" onclick="GroupsSection.copyCode()" title="Copia codice">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                 : ''}
                            </div>
                        </div>
                        <div class="league-stats">
                            <div class="league-stat">
                                <div class="league-stat-value">${group.members.length}</div>
                                <div class="league-stat-label">Partecipanti</div>
                            </div>
                            <div class="league-stat">
                                <div class="league-stat-value">${Utils.formatShortDate(group.createdAt)}</div>
                                <div class="league-stat-label">Fondata</div>
                            </div>
                        </div>
                    </div>

                    <div class="league-detail-body">
                        <!-- My Team Section -->
                        <div class="my-team-section">
                            <h3><i class="fas fa-shield-alt"></i> La tua Squadra</h3>
                            ${userTeam ? this.renderMyTeam(userTeam, group.id) : this.renderNoTeam(group.id)}
                        </div>

                        ${canInvite ? this.renderInviteSection(group, user) : ''}

                        ${canSeeCode ? 
                            <div class="league-section">
                                <h3><i class="fas fa-share-alt"></i> Condividi Codice</h3>
                                <div class="invite-card">
                                    <div class="invite-card-icon"><i class="fas fa-qrcode"></i></div>
                                    <div class="invite-card-content">
                                        <h4>Condividi il codice lega</h4>
                                        <p>Chiunque con questo codice può partecipare</p>
                                    </div>
                                    <button class="btn btn-primary btn-sm" onclick="GroupsSection.copyCode()">
                                        <i class="fas fa-copy"></i> Copia
                                    </button>
                                </div>
                            </div>
                         : ''}

                        <div class="league-section">
                            <h3><i class="fas fa-users"></i> Partecipanti (${group.members.length})</h3>
                            <div class="member-list">
                                ${this.renderMembers(group, user, isOwner, isAdmin)}
                            </div>
                        </div>

                        ${(isAdmin || isOwner) ? this.renderSettingsSection(group, isOwner) : ''}

                        <div class="danger-zone">
                            <h3><i class="fas fa-exclamation-triangle"></i> Zona Pericolosa</h3>
                            <p>${isOwner && group.members.length === 1 
                                ? 'Eliminando la lega, essa sarà rimossa definitivamente.'
                                : 'Abbandonando la lega, non potrai più accedere ai suoi contenuti.'
                            }</p>
                            <button type="button" class="btn btn-danger" onclick="GroupsSection.leave()">
                                <i class="fas fa-${isOwner && group.members.length === 1 ? 'trash' : 'door-open'}"></i>
                                ${isOwner && group.members.length === 1 ? 'Elimina lega' : 'Abbandona lega'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ;
    },

    /*
      Render my team display
     /
    renderMyTeam(team, groupId) {
        const badgeContent = Avatars.renderTeam(team, 'md');
        
        return 
            <div class="my-team-display">
                <div class="my-team-info">
                    <div class="my-team-badge" style="background: linear-gradient(180deg, ${team.secondaryColor} 0%, ${team.primaryColor} 100%);">
                        ${badgeContent}
                    </div>
                    <div class="my-team-details">
                        <h4>${Utils.escapeHtml(team.name)}</h4>
                        <p>${Utils.escapeHtml(team.abbreviation)}</p>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="TeamsSection.openAssignModal('${groupId}')">
                    <i class="fas fa-exchange-alt"></i> Cambia
                </button>
            </div>
        ;
    },

    /
      Render no team message
     /
    renderNoTeam(groupId) {
        return 
            <div class="no-team-assigned">
                <div class="no-team-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <h4>Nessuna squadra assegnata</h4>
                        <p>Devi assegnare una squadra per partecipare alla lega</p>
                    </div>
                </div>
                <button class="btn btn-warning" onclick="TeamsSection.openAssignModal('${groupId}')">
                    <i class="fas fa-plus"></i> Assegna Squadra
                </button>
            </div>
        ;
    },

    /
      Render invite section
     /
    renderInviteSection(group, user) {
        const friends = user.friends || [];
        
        if (friends.length === 0) {
            return 
                <div class="league-section">
                    <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-users"></i></div>
                        <div class="invite-card-content">
                            <h4>Aggiungi compagni</h4>
                            <p>Per invitare allenatori, prima aggiungili come compagni</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="Navigation.navigateToFriendsFromGroup('${group.id}')">
                            <i class="fas fa-user-plus"></i> Vai
                        </button>
                    </div>
                </div>
            ;
        }

        const availableFriends = friends.filter(fId => !group.members.includes(fId));
        
        if (availableFriends.length === 0) {
            return 
                <div class="league-section">
                    <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                    <div class="invite-card">
                        <div class="invite-card-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="invite-card-content">
                            <h4>Tutti invitati!</h4>
                            <p>Tutti i tuoi compagni sono già nella lega</p>
                        </div>
                    </div>
                </div>
            ;
        }

        return 
            <div class="league-section">
                <h3><i class="fas fa-user-plus"></i> Invita Allenatori</h3>
                <div class="invite-card">
                    <div class="invite-card-icon"><i class="fas fa-user-friends"></i></div>
                    <div class="invite-card-content">
                        <h4>${availableFriends.length} compagni disponibili</h4>
                        <p>Invita i tuoi compagni a partecipare</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="GroupsSection.openInviteModal()">
                        <i class="fas fa-paper-plane"></i> Invita
                    </button>
                </div>
            </div>
        ;
    },

    /
      Render members list
     /
    renderMembers(group, user, isOwner, isAdmin) {
        return group.members.map(memberId => {
            const member = UsersDB.getById(memberId);
            if (!member) return '';

            const avatarContent = Avatars.renderUser(member);
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
            }

            // Get member's team in this league
            const memberTeam = GroupsDB.getMemberTeam(group.id, memberId);
            const teamInfo = memberTeam 
                ? <span class="member-team"><i class="fas fa-shield-alt"></i> ${Utils.escapeHtml(memberTeam.name)}</span>
                : '';

            let actionsHtml = '';
            if (!isCurrentUser) {
                let menuItems = 
                    <button class="dropdown-item" onclick="ProfileModal.show('${memberId}'); Dropdowns.closeAllMenus();">
                        <i class="fas fa-user"></i> Vedi scheda
                    </button>
                ;

                if (isOwner && !memberIsOwner) {
                    if (memberIsAdmin) {
                        menuItems += 
                            <button class="dropdown-item warning" onclick="GroupsSection.demoteMember('${memberId}')">
                                <i class="fas fa-level-down-alt"></i> Rimuovi admin
                            </button>
                        ;
                    } else {
                        menuItems += 
                            <button class="dropdown-item" onclick="GroupsSection.promoteMember('${memberId}')">
                                <i class="fas fa-level-up-alt"></i> Promuovi admin
                            </button>
                        ;
                    }
                }

                if ((isOwner && !memberIsOwner) || (isAdmin && !memberIsAdmin && !memberIsOwner)) {
                    menuItems += 
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item danger" onclick="GroupsSection.kickMember('${memberId}')">
                            <i class="fas fa-ban"></i> Espelli
                        </button>
                    ;
                }

                actionsHtml = 
                    <div class="member-actions" onclick="event.stopPropagation();">
                        <button class="friend-menu-btn" onclick="Dropdowns.toggleMemberMenu('${memberId}')">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="friend-dropdown" id="member-menu-${memberId}">
                            ${menuItems}
                        </div>
                    </div>
                ;
            }

            return 
                <div class="member-item" onclick="ProfileModal.show('${memberId}')">
                    <div class="member-info">
                        <div class="member-avatar">${avatarContent}</div>
                        <div class="member-details">
                            <div class="member-name">${Utils.escapeHtml(member.name)}${isCurrentUser ? ' (tu)' : ''}</div>
                            ${roleText ? <div class="member-role ${roleClass}">${roleText}</div> : ''}
                            ${teamInfo}
                        </div>
                    </div>
                    ${actionsHtml}
                </div>
            ;
        }).join('');
    },

    /
      Render settings section
     /
    renderSettingsSection(group, isOwner) {
        const visibilityText = group.visibility === CONFIG.LEAGUE.VISIBILITY.INVITE 
            ? 'Solo su invito' : 'Chiunque con codice';
        const invitePermissionText = group.invitePermission === CONFIG.LEAGUE.INVITEPERMISSION.ALL 
            ? 'Tutti i partecipanti' : 'Solo amministratori';
        const maxMembersText = group.maxMembers > 0 ? ${group.maxMembers} allenatori : 'Illimitato';

        return 
            <div class="league-section">
                <h3><i class="fas fa-cog"></i> Impostazioni Lega</h3>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-eye"></i> Visibilità</strong>
                        <p>${visibilityText}</p>
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-user-shield"></i> Chi può invitare</strong>
                        <p>${invitePermissionText}</p>
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-item-info">
                        <strong><i class="fas fa-users-cog"></i> Limite partecipanti</strong>
                        <p>${maxMembersText}</p>
                    </div>
                </div>
                <button class="btn btn-secondary" style="margin-top: 0.875rem;" onclick="GroupsSection.openEditModal()">
                    <i class="fas fa-edit"></i> Modifica impostazioni
                </button>
                ${isOwner ? 
                    <button class="btn btn-warning" style="margin-top: 0.375rem;" onclick="GroupsSection.openTransferModal()">
                        <i class="fas fa-crown"></i> Trasferisci presidenza
                    </button>
                 : ''}
            </div>
        ;
    },

    /
      Setup event listeners
     /
    setupEventListeners(group, user, isOwner, isAdmin) {
        // Group avatar upload
        document.getElementById('group-avatar-upload')?.addEventListener('change', (e) => {
            Forms.handleImageUpload(e, (base64) => {
                GroupsDB.update(this.currentGroupId, { avatar: base64 });
                Toast.success('Stemma aggiornato!', 'Lo stemma della lega è stato cambiato');
                this.show(this.currentGroupId);
                HomeSection.renderGroups();
                Navigation.renderNavGroups();
            });
        });
    },

    /
      Copy group code
     /
    copyCode() {
        const code = document.getElementById('group-code-display')?.textContent;
        if (code) {
            Utils.copyToClipboard(code).then(() => {
                Toast.success('Copiato!', Codice ${code} copiato negli appunti);
            }).catch(() => {
                Toast.error('Errore', 'Impossibile copiare');
            });
        }
    },

    /
      Leave group
     /
    leave() {
        const group = GroupsDB.getById(this.currentGroupId);
        const user = UsersDB.getCurrentUser();

        if (!group) return;

        const isOwner = group.owner === user.id;
        const isOnlyMember = group.members.length === 1;

        const title = isOwner && isOnlyMember ? 'Elimina lega' : 'Abbandona lega';
        const message = isOwner && isOnlyMember
            ? Sei sicuro di voler eliminare "${group.name}"? Questa azione è irreversibile.
            : Sei sicuro di voler abbandonare "${group.name}"?;

        Modal.confirm(title, message, () => {
            GroupsDB.leave(user.id, this.currentGroupId);
            Toast.info(isOwner && isOnlyMember ? 'Lega eliminata' : 'Hai lasciato la lega');
            App.showSection('home');
            HomeSection.renderGroups();
            Navigation.renderNavGroups();
        });
    },

    /
      Promote member to admin
     /
    promoteMember(memberId) {
        event.stopPropagation();
        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.promoteToAdmin(this.currentGroupId, memberId, user.id);

        Dropdowns.closeAllMenus();

        if (result.success) {
            Toast.success('Admin promosso!', result.message);
            this.show(this.currentGroupId);
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Demote member from admin
     /
    demoteMember(memberId) {
        event.stopPropagation();
        const member = UsersDB.getById(memberId);

        Dropdowns.closeAllMenus();

        Modal.confirm(
            'Rimuovi privilegi admin',
            Sei sicuro di voler rimuovere i privilegi admin di ${member?.name}?,
            () => {
                const user = UsersDB.getCurrentUser();
                const result = GroupsDB.demoteFromAdmin(this.currentGroupId, memberId, user.id);

                if (result.success) {
                    Toast.success('Admin rimosso', result.message);
                    this.show(this.currentGroupId);
                } else {
                    Toast.error('Errore', result.message);
                }
            }
        );
    },

    /
      Kick member from group
     /
    kickMember(memberId) {
        event.stopPropagation();
        const member = UsersDB.getById(memberId);

        Dropdowns.closeAllMenus();

        Modal.confirm(
            'Espelli partecipante',
            Sei sicuro di voler espellere ${member?.name} dalla lega?,
            () => {
                const user = UsersDB.getCurrentUser();
                const result = GroupsDB.kickUser(this.currentGroupId, memberId, user.id);

                if (result.success) {
                    Toast.success('Partecipante espulso', result.message);
                    this.show(this.currentGroupId);
                } else {
                    Toast.error('Errore', result.message);
                }
            }
        );
    },

    /
      Open create group modal
     /
    openCreateModal() {
        this.newGroupAvatarData = null;

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-trophy"></i> Crea una Nuova Lega</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 1rem;">Crea una lega per sfidare i tuoi amici allenatori.</p>
                    
                    <form id="create-group-form">
                        <div class="league-avatar-upload">
                            <div class="league-avatar-preview" id="new-group-avatar-preview">L</div>
                            <div class="league-avatar-upload-content">
                                <h4>Stemma Lega</h4>
                                <p>JPG, PNG. Max 2MB</p>
                                <label class="league-avatar-upload-btn">
                                    <i class="fas fa-upload"></i> Carica stemma
                                    <input type="file" id="new-group-avatar" accept="image/">
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="group-name"><i class="fas fa-signature"></i> Nome Lega </label>
                            <input type="text" id="group-name" required placeholder="Es. Lega dei Campioni" maxlength="50">
                            <div class="form-hint">Scegli un nome memorabile per la tua lega</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="group-description"><i class="fas fa-align-left"></i> Descrizione (opzionale)</label>
                            <textarea id="group-description" rows="2" placeholder="Descrivi la tua lega..." maxlength="200"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="group-visibility"><i class="fas fa-eye"></i> Visibilità</label>
                                <select id="group-visibility">
                                    <option value="invite">Solo su invito</option>
                                    <option value="code">Chiunque con codice</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="group-invite-permission"><i class="fas fa-user-shield"></i> Chi può invitare</label>
                                <select id="group-invite-permission">
                                    <option value="all">Tutti i partecipanti</option>
                                    <option value="admin">Solo amministratori</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="group-max-members"><i class="fas fa-users-cog"></i> Numero partecipanti</label>
                            <select id="group-max-members">
                                <option value="8">8 allenatori</option>
                                <option value="10" selected>10 allenatori</option>
                                <option value="12">12 allenatori</option>
                                <option value="14">14 allenatori</option>
                                <option value="16">16 allenatori</option>
                                <option value="20">20 allenatori</option>
                                <option value="0">Illimitato</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.closeCustom('create-group-modal')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                    <button type="submit" form="create-group-form" class="btn btn-gold">
                        <i class="fas fa-plus"></i> Crea Lega
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('create-group-modal', modalHtml);

        // Setup form handlers
        document.getElementById('new-group-avatar')?.addEventListener('change', (e) => {
            Forms.handleImageUpload(e, (base64) => {
                this.newGroupAvatarData = base64;
                document.getElementById('new-group-avatar-preview').innerHTML = <img src="${base64}" alt="Preview">;
            });
        });

        document.getElementById('group-name')?.addEventListener('input', (e) => {
            if (!this.newGroupAvatarData) {
                const name = e.target.value.trim();
                document.getElementById('new-group-avatar-preview').innerHTML = name ? Utils.getInitials(name) : 'L';
            }
        });

        document.getElementById('create-group-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreate();
        });
    },

    /
      Handle group creation
     /
    handleCreate() {
        const name = document.getElementById('group-name').value.trim();
        if (!name) {
            Toast.error('Errore', 'Inserisci un nome per la lega');
            return;
        }

        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.create(user.email, {
            name,
            description: document.getElementById('group-description').value,
            avatar: this.newGroupAvatarData,
            visibility: document.getElementById('group-visibility').value,
            invitePermission: document.getElementById('group-invite-permission').value,
            maxMembers: document.getElementById('group-max-members').value
        });

        if (result.success) {
            Modal.closeCustom('create-group-modal');
            Toast.success('Lega creata!', Codice: ${result.groupCode});
            HomeSection.renderGroups();
            Navigation.renderNavGroups();
            this.show(result.groupId);
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Open edit group modal
     /
    openEditModal() {
        const group = GroupsDB.getById(this.currentGroupId);
        if (!group) return;

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Modifica Impostazioni Lega</h3>
                </div>
                <div class="modal-body">
                    <form id="edit-group-form">
                        <div class="form-group">
                            <label for="edit-group-name"><i class="fas fa-signature"></i> Nome Lega</label>
                            <input type="text" id="edit-group-name" required maxlength="50" value="${Utils.escapeHtml(group.name)}">
                        </div>

                        <div class="form-group">
                            <label for="edit-group-description"><i class="fas fa-align-left"></i> Descrizione</label>
                            <textarea id="edit-group-description" rows="2" maxlength="200">${Utils.escapeHtml(group.description || '')}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-group-visibility"><i class="fas fa-eye"></i> Visibilità</label>
                                <select id="edit-group-visibility">
                                    <option value="invite" ${group.visibility === 'invite' ? 'selected' : ''}>Solo su invito</option>
                                    <option value="code" ${group.visibility === 'code' ? 'selected' : ''}>Chiunque con codice</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-group-invite-permission"><i class="fas fa-user-shield"></i> Chi può invitare</label>
                                <select id="edit-group-invite-permission">
                                    <option value="all" ${group.invitePermission === 'all' ? 'selected' : ''}>Tutti i partecipanti</option>
                                    <option value="admin" ${group.invitePermission === 'admin' ? 'selected' : ''}>Solo amministratori</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-group-max-members"><i class="fas fa-users-cog"></i> Numero partecipanti</label>
                            <select id="edit-group-max-members">
                                ${CONFIG.LEAGUE.MEMBEROPTIONS.map(opt => 
                                    <option value="${opt}" ${group.maxMembers === opt ? 'selected' : ''}>
                                        ${opt === 0 ? 'Illimitato' : ${opt} allenatori}
                                    </option>
                                ).join('')}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.closeCustom('edit-group-modal')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                    <button type="submit" form="edit-group-form" class="btn btn-primary">
                        <i class="fas fa-save"></i> Salva
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('edit-group-modal', modalHtml);

        document.getElementById('edit-group-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEdit();
        });
    },

    /
      Handle group edit
     /
    handleEdit() {
        const name = document.getElementById('edit-group-name').value.trim();
        if (!name) {
            Toast.error('Errore', 'Il nome non può essere vuoto');
            return;
        }

        GroupsDB.update(this.currentGroupId, {
            name,
            description: document.getElementById('edit-group-description').value,
            visibility: document.getElementById('edit-group-visibility').value,
            invitePermission: document.getElementById('edit-group-invite-permission').value,
            maxMembers: parseInt(document.getElementById('edit-group-max-members').value)
        });

        Modal.closeCustom('edit-group-modal');
        Toast.success('Salvato!', 'Impostazioni aggiornate');
        this.show(this.currentGroupId);
        HomeSection.renderGroups();
        Navigation.renderNavGroups();
    },

    /
      Open invite modal
     /
    openInviteModal() {
        const user = UsersDB.getCurrentUser();
        const friends = user.friends || [];
        const group = GroupsDB.getById(this.currentGroupId);
        
        if (!group) return;

        let listHtml = '';
        
        if (friends.length === 0) {
            listHtml = 
                <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <p>Non hai ancora compagni da invitare</p>
                    <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="Modal.closeCustom('invite-group-modal'); Navigation.navigateToFriendsFromGroup('${group.id}');">
                        <i class="fas fa-user-plus"></i> Aggiungi compagni
                    </button>
                </div>
            ;
        } else {
            listHtml = friends.map(friendId => {
                const friend = UsersDB.getById(friendId);
                if (!friend) return '';
                
                const isInGroup = group.members.includes(friendId);
                const isPending = (group.pendingInvites || []).includes(friendId);
                
                const avatarContent = Avatars.renderUser(friend);
                
                let actionBtn = '';
                if (isInGroup) {
                    actionBtn = <span style="color: var(--success); font-size: 0.75rem; font-weight: 600;"><i class="fas fa-check"></i> Già in lega</span>;
                } else if (isPending) {
                    actionBtn = <span style="color: var(--warning); font-size: 0.75rem; font-weight: 600;"><i class="fas fa-clock"></i> Invito inviato</span>;
                } else {
                    actionBtn = <button class="btn btn-primary btn-sm" onclick="GroupsSection.sendInvite('${friendId}')"><i class="fas fa-paper-plane"></i> Invita</button>;
                }
                
                return 
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="friend-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">${avatarContent}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--gray-900);">${Utils.escapeHtml(friend.name)}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500); font-family: 'Courier New', monospace;">#${friend.id}</div>
                            </div>
                        </div>
                        ${actionBtn}
                    </div>
                ;
            }).join('');
        }

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Invita alla Lega</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 1rem;">Seleziona i compagni da invitare</p>
                    <div id="invite-friends-modal-list" style="max-height: 280px; overflow-y: auto;">
                        ${listHtml}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="Modal.closeCustom('invite-group-modal')">
                        <i class="fas fa-times"></i> Chiudi
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('invite-group-modal', modalHtml);
    },

    /
      Send group invite
     /
    sendInvite(friendId) {
        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.inviteUser(this.currentGroupId, friendId, user.id);
        
        if (result.success) {
            Toast.success('Invito inviato!', result.message);
            this.openInviteModal(); // Refresh the modal
            Navigation.renderNotifications();
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Open transfer ownership modal
     /
    openTransferModal() {
        const group = GroupsDB.getById(this.currentGroupId);
        const user = UsersDB.getCurrentUser();
        if (!group) return;

        const otherMembers = group.members.filter(id => id !== user.id);
        
        let listHtml = '';
        if (otherMembers.length === 0) {
            listHtml = 
                <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <p>Non ci sono altri partecipanti a cui trasferire la presidenza</p>
                </div>
            ;
        } else {
            listHtml = otherMembers.map(memberId => {
                const member = UsersDB.getById(memberId);
                if (!member) return '';
                
                const avatarContent = Avatars.renderUser(member);
                
                return 
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="friend-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">${avatarContent}</div>
                            <div>
                                <div style="font-weight: 600; color: var(--gray-900);">${Utils.escapeHtml(member.name)}</div>
                                <div style="font-size: 0.6875rem; color: var(--gray-500); font-family: 'Courier New', monospace;">#${member.id}</div>
                            </div>
                        </div>
                        <button class="btn btn-warning btn-sm" onclick="GroupsSection.confirmTransfer('${memberId}')">
                            <i class="fas fa-crown"></i> Trasferisci
                        </button>
                    </div>
                ;
            }).join('');
        }

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-crown"></i> Trasferisci Presidenza</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 1rem;">Seleziona il nuovo presidente della lega. Questa azione è irreversibile.</p>
                    <div id="transfer-members-list" style="max-height: 280px; overflow-y: auto;">
                        ${listHtml}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="Modal.closeCustom('transfer-ownership-modal')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('transfer-ownership-modal', modalHtml);
    },

    /
      Confirm transfer ownership
     /
    confirmTransfer(newOwnerId) {
        const member = UsersDB.getById(newOwnerId);
        Modal.closeCustom('transfer-ownership-modal');
        
        Modal.confirm(
            'Conferma trasferimento',
            Sei sicuro di voler trasferire la presidenza della lega a ${member?.name}? Questa azione è irreversibile.,
            () => {
                const result = GroupsDB.transferOwnership(this.currentGroupId, newOwnerId);
                if (result.success) {
                    Toast.success('Presidenza trasferita!', ${member?.name} è ora il presidente);
                    this.show(this.currentGroupId);
                } else {
                    Toast.error('Errore', result.message);
                }
            }
        );
    },

    /
      Join group by code
     /
    joinByCode() {
        const code = document.getElementById('join-group-code').value.trim().toUpperCase();
        const messageEl = document.getElementById('join-group-message');

        if (!code || code.length !== 6) {
            Forms.showMessage(messageEl, 'Inserisci un codice valido di 6 caratteri', 'error');
            return;
        }

        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.joinByCode(user.id, code);

        if (result.success) {
            document.getElementById('join-group-code').value = '';
            Toast.success('Benvenuto in lega!', result.message);
            HomeSection.renderGroups();
            Navigation.renderNavGroups();
            this.show(result.groupId);
        } else {
            Forms.showMessage(messageEl, result.message, 'error');
        }
    },

    /
      Accept invite from notification
     /
    acceptInviteFromNotif(groupId) {
        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.acceptInvite(user.id, groupId);
        
        if (result.success) {
            Toast.success('Benvenuto nella lega!', result.message);
            Navigation.renderNotifications();
            Navigation.updateNotificationBadge();
            HomeSection.renderGroups();
            Navigation.renderNavGroups();
        }
    },

    /
      Reject invite from notification
     /
    rejectInviteFromNotif(groupId) {
        const user = UsersDB.getCurrentUser();
        GroupsDB.rejectInvite(user.id, groupId);
        Toast.info('Invito rifiutato');
        Navigation.renderNotifications();
        Navigation.updateNotificationBadge();
    }
};
`
