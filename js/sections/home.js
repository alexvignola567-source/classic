/**
 * FantaLega Classic - Home Section
 */
const HomeSection = {
    /**
     * Render home section
     */
    render() {
        const section = document.getElementById('section-home');
        const user = UsersDB.getCurrentUser();
        
        section.innerHTML = `
            <div class="section-header">
                <div class="section-header-text">
                    <h1><i class="fas fa-home"></i> Bacheca Allenatore</h1>
                    <p>Benvenuto Mister! Gestisci le tue leghe e i tuoi contatti.</p>
                </div>
            </div>
            <div class="cards-grid">
                <div class="card" onclick="App.showSection('teams')">
                    <div class="card-header">
                        <h3><i class="fas fa-shield-alt"></i> Le mie Squadre</h3>
                    </div>
                    <div class="card-body">
                        <p>Crea e gestisci le tue squadre per partecipare alle leghe.</p>
                    </div>
                </div>
                <div class="card" onclick="App.showSection('friends')">
                    <div class="card-header">
                        <h3><i class="fas fa-users"></i> Compagni di Lega</h3>
                    </div>
                    <div class="card-body">
                        <p>Aggiungi altri allenatori alla tua lista contatti per sfidarli nelle leghe.</p>
                    </div>
                </div>
                <div class="card" onclick="App.showSection('profile')">
                    <div class="card-header">
                        <h3><i class="fas fa-id-card"></i> Scheda Allenatore</h3>
                    </div>
                    <div class="card-body">
                        <p>Modifica il tuo profilo allenatore, il nickname e la tua foto.</p>
                    </div>
                </div>
            </div>
            <!-- Teams Preview -->
            <div class="teams-section">
                <div class="teams-section-header">
                    <h2><i class="fas fa-shield-alt"></i> Le tue Squadre</h2>
                    <button class="btn btn-primary" onclick="TeamsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Nuova Squadra
                    </button>
                </div>
                <div id="home-teams-preview"></div>
            </div>
            <!-- Leagues Section -->
            <div class="leagues-section">
                <div class="leagues-section-header">
                    <h2><i class="fas fa-trophy"></i> Le tue Leghe</h2>
                    <button class="btn btn-gold" onclick="GroupsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Crea Lega
                    </button>
                </div>
                <div id="groups-list"></div>
                <!-- Join League -->
                <div class="retro-panel" style="margin-top: 1.25rem;">
                    <div class="retro-panel-header">
                        <i class="fas fa-ticket-alt"></i> Unisciti a una Lega
                    </div>
                    <div class="retro-panel-body">
                        <p style="color: var(--gray-500); font-size: 0.8125rem; margin-bottom: 0.875rem;">
                            Hai ricevuto un codice lega? Inseriscilo qui per entrare a far parte della competizione.
                        </p>
                        <div class="join-league-form">
                            <input type="text" id="join-group-code" placeholder="ABC123" maxlength="6">
                            <button class="btn btn-primary" onclick="GroupsSection.joinByCode()">
                                <i class="fas fa-sign-in-alt"></i> Unisciti
                            </button>
                        </div>
                        <div id="join-group-message" class="message"></div>
                    </div>
                </div>
            </div>
        `;
        this.renderTeamsPreview();
        this.renderGroups();
        this.setupJoinCodeInput();
    },
    /**
     * Render teams preview
     */
    renderTeamsPreview() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const teams = TeamsDB.getByOwner(user.id);
        const container = document.getElementById('home-teams-preview');
        if (teams.length === 0) {
            container.innerHTML = `
                <div class="no-teams">
                    <div class="no-teams-icon"><i class="fas fa-shield-alt"></i></div>
                    <h3>Nessuna squadra ancora</h3>
                    <p>Crea la tua prima squadra per partecipare alle leghe!</p>
                    <button class="btn btn-primary" onclick="TeamsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Crea la tua prima squadra
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="teams-grid">
                    ${teams.slice(0, 3).map(team => Cards.renderTeam(team)).join('')}
                </div>
                ${teams.length > 3 ? `
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="btn btn-secondary" onclick="App.showSection('teams')">
                            <i class="fas fa-list"></i> Vedi tutte le squadre (${teams.length})
                        </button>
                    </div>
                ` : ''}
            `;
        }
    },
    /**
     * Render groups list
     */
    renderGroups() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;
        const groups = GroupsDB.getUserGroups(user.id);
        const listEl = document.getElementById('groups-list');
        if (groups.length === 0) {
            listEl.innerHTML = `
                <div class="no-leagues">
                    <div class="no-leagues-icon"><i class="fas fa-trophy"></i></div>
                    <h3>Nessuna lega ancora</h3>
                    <p>Le leghe ti permettono di sfidare altri allenatori. Crea la tua prima lega per iniziare la competizione!</p>
                    <button class="btn btn-gold" onclick="GroupsSection.openCreateModal()">
                        <i class="fas fa-plus"></i> Crea la tua prima lega
                    </button>
                </div>
            `;
        } else {
            listEl.innerHTML = `
                <div class="leagues-grid">
                    ${groups.map(group => Cards.renderLeague(group, user.id)).join('')}
                </div>
            `;
        }
    },
    /**
     * Setup join code input
     */
    setupJoinCodeInput() {
        const input = document.getElementById('join-group-code');
        
        input?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                GroupsSection.joinByCode();
            }
        });
    }
};
