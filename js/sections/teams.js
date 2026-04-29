`javascript
/
  FantaLega Classic - Teams Section
 /

const TeamsSection = {
    newTeamBadgeData: null,
    editTeamBadgeData: null,
    currentEditTeamId: null,

    /
      Render teams section
     /
    render() {
        const section = document.getElementById('section-teams');
        const user = UsersDB.getCurrentUser();
        
        if (!user) return;

        const teams = TeamsDB.getByOwner(user.id);

        section.innerHTML = 
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-shield-alt"></i> Le mie Squadre</h1>
                    <p>Gestisci le tue squadre per partecipare alle leghe</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="App.showSection('home')">
                        <i class="fas fa-arrow-left"></i> Indietro
                    </button>
                    <button class="btn btn-primary" onclick="TeamsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Nuova Squadra
                    </button>
                </div>
            </div>

            <div id="teams-list-container">
                ${this.renderTeamsList(teams)}
            </div>
        ;
    },

    /
      Render teams list
     /
    renderTeamsList(teams) {
        if (teams.length === 0) {
            return 
                <div class="no-teams">
                    <div class="no-teams-icon"><i class="fas fa-shield-alt"></i></div>
                    <h3>Nessuna squadra ancora</h3>
                    <p>Crea la tua prima squadra per partecipare alle leghe!</p>
                    <button class="btn btn-primary" onclick="TeamsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Crea la tua prima squadra
                    </button>
                </div>
            ;
        }

        return 
            <div class="teams-grid">
                ${teams.map(team => Cards.renderTeam(team)).join('')}
            </div>
        ;
    },

    /
      Open create team modal
     /
    openCreateModal() {
        this.newTeamBadgeData = null;

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-shield-alt"></i> Crea Nuova Squadra</h3>
                </div>
                <div class="modal-body">
                    <form id="create-team-form">
                        <div class="team-badge-upload">
                            <div class="team-badge-preview" id="new-team-badge-preview">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="team-badge-upload-content">
                                <h4>Stemma Squadra</h4>
                                <p>JPG, PNG. Max 2MB</p>
                                <label class="team-badge-upload-btn">
                                    <i class="fas fa-upload"></i> Carica stemma
                                    <input type="file" id="new-team-badge" accept="image/">
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="team-name"><i class="fas fa-signature"></i> Nome Squadra </label>
                            <input type="text" id="team-name" required placeholder="Es. FC Campioni" maxlength="40">
                        </div>

                        <div class="form-group">
                            <label for="team-abbreviation"><i class="fas fa-font"></i> Abbreviazione</label>
                            <input type="text" id="team-abbreviation" placeholder="Es. FCC" maxlength="4" style="text-transform: uppercase;">
                            <div class="form-hint">Max 4 caratteri. Se vuoto, sarà generata automaticamente.</div>
                        </div>

                        <div class="team-colors-picker">
                            <div class="color-picker-group">
                                <label>Colore Primario</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" id="team-primary-color" value="${CONFIG.TEAM.DEFAULTPRIMARYCOLOR}">
                                    <input type="text" id="team-primary-color-text" value="${CONFIG.TEAM.DEFAULTPRIMARYCOLOR}" maxlength="7">
                                </div>
                            </div>
                            <div class="color-picker-group">
                                <label>Colore Secondario</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" id="team-secondary-color" value="${CONFIG.TEAM.DEFAULTSECONDARYCOLOR}">
                                    <input type="text" id="team-secondary-color-text" value="${CONFIG.TEAM.DEFAULTSECONDARYCOLOR}" maxlength="7">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="team-motto"><i class="fas fa-quote-left"></i> Motto (opzionale)</label>
                            <input type="text" id="team-motto" placeholder="Es. Vincere è l'unica cosa che conta" maxlength="100">
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.closeCustom('create-team-modal')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                    <button type="submit" form="create-team-form" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Crea Squadra
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('create-team-modal', modalHtml);
        this.setupColorPickers('team');
        this.setupBadgeUpload('new-team-badge', 'new-team-badge-preview', 'newTeamBadgeData');

        document.getElementById('create-team-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreate();
        });
    },

    /
      Handle team creation
     /
    handleCreate() {
        const name = document.getElementById('team-name').value.trim();
        if (!name) {
            Toast.error('Errore', 'Inserisci un nome per la squadra');
            return;
        }

        const user = UsersDB.getCurrentUser();
        const result = TeamsDB.create(user.id, {
            name,
            abbreviation: document.getElementById('team-abbreviation').value,
            badge: this.newTeamBadgeData,
            primaryColor: document.getElementById('team-primary-color').value,
            secondaryColor: document.getElementById('team-secondary-color').value,
            motto: document.getElementById('team-motto').value
        });

        if (result.success) {
            Modal.closeCustom('create-team-modal');
            Toast.success('Squadra creata!', ${name} è pronta per le sfide);
            this.render();
            HomeSection.renderTeamsPreview();
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Edit team
     /
    edit(teamId) {
        const team = TeamsDB.getById(teamId);
        if (!team) return;

        this.currentEditTeamId = teamId;
        this.editTeamBadgeData = team.badge;

        const badgeContent = team.badge 
            ? <img src="${team.badge}" alt="${Utils.escapeHtml(team.name)}">
            : Utils.getInitials(team.name);

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Modifica Squadra</h3>
                </div>
                <div class="modal-body">
                    <form id="edit-team-form">
                        <div class="team-badge-upload">
                            <div class="team-badge-preview" id="edit-team-badge-preview" style="background: linear-gradient(180deg, ${team.secondaryColor} 0%, ${team.primaryColor} 100%);">
                                ${badgeContent}
                            </div>
                            <div class="team-badge-upload-content">
                                <h4>Stemma Squadra</h4>
                                <p>JPG, PNG. Max 2MB</p>
                                <label class="team-badge-upload-btn">
                                    <i class="fas fa-upload"></i> Carica stemma
                                    <input type="file" id="edit-team-badge" accept="image/">
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-team-name"><i class="fas fa-signature"></i> Nome Squadra </label>
                            <input type="text" id="edit-team-name" required maxlength="40" value="${Utils.escapeHtml(team.name)}">
                        </div>

                        <div class="form-group">
                            <label for="edit-team-abbreviation"><i class="fas fa-font"></i> Abbreviazione</label>
                            <input type="text" id="edit-team-abbreviation" maxlength="4" style="text-transform: uppercase;" value="${Utils.escapeHtml(team.abbreviation)}">
                        </div>

                        <div class="team-colors-picker">
                            <div class="color-picker-group">
                                <label>Colore Primario</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" id="edit-team-primary-color" value="${team.primaryColor}">
                                    <input type="text" id="edit-team-primary-color-text" value="${team.primaryColor}" maxlength="7">
                                </div>
                            </div>
                            <div class="color-picker-group">
                                <label>Colore Secondario</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" id="edit-team-secondary-color" value="${team.secondaryColor}">
                                    <input type="text" id="edit-team-secondary-color-text" value="${team.secondaryColor}" maxlength="7">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-team-motto"><i class="fas fa-quote-left"></i> Motto</label>
                            <input type="text" id="edit-team-motto" maxlength="100" value="${Utils.escapeHtml(team.motto || '')}">
                        </div>
                    </form>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.closeCustom('edit-team-modal')">
                        <i class="fas fa-times"></i> Annulla
                    </button>
                    <button type="submit" form="edit-team-form" class="btn btn-primary">
                        <i class="fas fa-save"></i> Salva
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('edit-team-modal', modalHtml);
        this.setupColorPickers('edit-team');
        this.setupBadgeUpload('edit-team-badge', 'edit-team-badge-preview', 'editTeamBadgeData');

        document.getElementById('edit-team-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEdit();
        });
    },

    /
      Handle team edit
     /
    handleEdit() {
        const name = document.getElementById('edit-team-name').value.trim();
        if (!name) {
            Toast.error('Errore', 'Il nome non può essere vuoto');
            return;
        }

        const user = UsersDB.getCurrentUser();
        const result = TeamsDB.update(this.currentEditTeamId, {
            name,
            abbreviation: document.getElementById('edit-team-abbreviation').value,
            badge: this.editTeamBadgeData,
            primaryColor: document.getElementById('edit-team-primary-color').value,
            secondaryColor: document.getElementById('edit-team-secondary-color').value,
            motto: document.getElementById('edit-team-motto').value
        }, user.id);

        if (result.success) {
            Modal.closeCustom('edit-team-modal');
            Toast.success('Salvato!', 'Squadra aggiornata');
            this.render();
            HomeSection.renderTeamsPreview();
            HomeSection.renderGroups();
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Confirm delete team
     /
    confirmDelete(teamId) {
        const team = TeamsDB.getById(teamId);
        if (!team) return;

        Modal.confirm(
            'Elimina squadra',
            Sei sicuro di voler eliminare "${team.name}"? Questa azione è irreversibile.,
            () => {
                const user = UsersDB.getCurrentUser();
                const result = TeamsDB.delete(teamId, user.id);
                
                if (result.success) {
                    Toast.success('Squadra eliminata');
                    this.render();
                    HomeSection.renderTeamsPreview();
                } else {
                    Toast.error('Errore', result.message);
                }
            }
        );
    },

    /
      Open assign team modal
     /
    openAssignModal(groupId) {
        const user = UsersDB.getCurrentUser();
        const teams = TeamsDB.getByOwner(user.id);
        const group = GroupsDB.getById(groupId);
        
        if (!group) return;

        const currentTeamId = group.memberTeams?.[user.id];

        let listHtml = '';
        if (teams.length === 0) {
            listHtml = 
                <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                    <div style="font-size: 2rem; margin-bottom: 1rem; color: var(--gray-300);">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <p>Non hai ancora squadre</p>
                    <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="Modal.closeCustom('assign-team-modal'); TeamsSection.openCreateModal();">
                        <i class="fas fa-plus"></i> Crea squadra
                    </button>
                </div>
            ;
        } else {
            listHtml = 
                <div class="team-selection-list">
                    ${teams.map(team => {
                        const isSelected = team.id === currentTeamId;
                        const badgeContent = Avatars.renderTeam(team, 'sm');
                        
                        return 
                            <div class="team-selection-item ${isSelected ? 'selected' : ''}" 
                                 onclick="TeamsSection.selectTeamForGroup('${groupId}', '${team.id}')">
                                <div class="team-selection-info">
                                    <div class="team-selection-badge" style="background: linear-gradient(180deg, ${team.secondaryColor} 0%, ${team.primaryColor} 100%);">
                                        ${badgeContent}
                                    </div>
                                    <span class="team-selection-name">${Utils.escapeHtml(team.name)}</span>
                                </div>
                                <div class="team-selection-check">
                                    <i class="fas fa-check"></i>
                                </div>
                            </div>
                        ;
                    }).join('')}
                </div>
            ;
        }

        const modalHtml = 
            <div class="modal">
                <div class="modal-header">
                    <h3><i class="fas fa-shield-alt"></i> Assegna Squadra</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 1rem;">
                        Seleziona la squadra da usare nella lega "${Utils.escapeHtml(group.name)}"
                    </p>
                    ${listHtml}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="Modal.closeCustom('assign-team-modal')">
                        <i class="fas fa-times"></i> Chiudi
                    </button>
                </div>
            </div>
        ;

        Modal.showCustom('assign-team-modal', modalHtml);
    },

    /
      Select team for group
     /
    selectTeamForGroup(groupId, teamId) {
        const user = UsersDB.getCurrentUser();
        const result = GroupsDB.setMemberTeam(groupId, user.id, teamId);
        
        if (result.success) {
            const team = TeamsDB.getById(teamId);
            Toast.success('Squadra assegnata!', ${team?.name} parteciperà alla lega);
            Modal.closeCustom('assign-team-modal');
            
            // Refresh views
            if (GroupsSection.currentGroupId === groupId) {
                GroupsSection.show(groupId);
            }
            HomeSection.renderGroups();
        } else {
            Toast.error('Errore', result.message);
        }
    },

    /
      Setup color pickers
     /
    setupColorPickers(prefix) {
        const primaryColor = document.getElementById(${prefix}-primary-color);
        const primaryColorText = document.getElementById(${prefix}-primary-color-text);
        const secondaryColor = document.getElementById(${prefix}-secondary-color);
        const secondaryColorText = document.getElementById(${prefix}-secondary-color-text);

        primaryColor?.addEventListener('input', (e) => {
            primaryColorText.value = e.target.value;
        });

        primaryColorText?.addEventListener('input', (e) => {
            if (Utils.isValidHexColor(e.target.value)) {
                primaryColor.value = e.target.value;
            }
        });

        secondaryColor?.addEventListener('input', (e) => {
            secondaryColorText.value = e.target.value;
        });

        secondaryColorText?.addEventListener('input', (e) => {
            if (Utils.isValidHexColor(e.target.value)) {
                secondaryColor.value = e.target.value;
            }
        });
    },

    /
      Setup badge upload
     /
    setupBadgeUpload(inputId, previewId, dataProperty) {
        document.getElementById(inputId)?.addEventListener('change', (e) => {
            Forms.handleImageUpload(e, (base64) => {
                this[dataProperty] = base64;
                document.getElementById(previewId).innerHTML = <img src="${base64}" alt="Preview">;
            });
        });
    }
};
`
