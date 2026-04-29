`javascript
/
  FantaLega Classic - Main Application
 /

const App = {
    currentSection: 'home',
    pollingInterval: null,

    /
      Initialize the application
     /
    init() {
        // Initialize auth section
        AuthSection.init();
        
        // Initialize dropdowns
        Dropdowns.init();

        // Check if user is logged in
        if (UsersDB.getCurrentUser()) {
            const user = UsersDB.getCurrentUser();
            UsersDB.cleanupFriends(user.email);
            this.showHome();
        }
    },

    /
      Show home container
     /
    showHome() {
        const user = UsersDB.getCurrentUser();
        if (!user) {
            AuthSection.show();
            return;
        }

        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('home-container').classList.remove('hidden');
        document.getElementById('user-greeting').textContent = Mister ${user.name};
        
        Navigation.updateNavAvatar();
        Navigation.updateNotificationBadge();

        this.showSection('home');
        this.startPolling();
    },

    /
      Show a section
     /
    showSection(section) {
        this.currentSection = section;

        // Hide all sections
        document.getElementById('section-home').classList.add('hidden');
        document.getElementById('section-profile').classList.add('hidden');
        document.getElementById('section-friends').classList.add('hidden');
        document.getElementById('section-teams').classList.add('hidden');
        document.getElementById('section-group').classList.add('hidden');

        // Update nav dropdown active state
        document.querySelectorAll('.nav-dropdown-item[data-section]').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Show the appropriate section
        switch (section) {
            case 'home':
                document.getElementById('section-home').classList.remove('hidden');
                HomeSection.render();
                Navigation.returnToGroupId = null;
                break;
            case 'profile':
                document.getElementById('section-profile').classList.remove('hidden');
                ProfileSection.render();
                break;
            case 'friends':
                document.getElementById('section-friends').classList.remove('hidden');
                FriendsSection.render();
                break;
            case 'teams':
                document.getElementById('section-teams').classList.remove('hidden');
                TeamsSection.render();
                break;
            case 'group':
                document.getElementById('section-group').classList.remove('hidden');
                break;
        }
    },

    /
      Logout
     /
    logout() {
        this.stopPolling();
        UsersDB.logout();
        AuthSection.show();
    },

    /
      Start polling for updates
     /
    startPolling() {
        this.checkForUpdates();
        this.pollingInterval = setInterval(() => this.checkForUpdates(), CONFIG.POLLING_INTERVAL);
    },

    /
      Stop polling
     /
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    /
      Check for updates
     */
    checkForUpdates() {
        const user = UsersDB.getCurrentUser();
        if (!user) return;

        // Update notification badge
        Navigation.updateNotificationBadge();

        // Refresh friends section if visible
        if (this.currentSection === 'friends') {
            FriendsSection.renderLists();
        }

        // Check for group updates if viewing a group
        if (this.currentSection === 'group' && GroupsSection.currentGroupId) {
            const group = GroupsDB.getById(GroupsSection.currentGroupId);
            if (group) {
                const currentVersion = JSON.stringify(group);
                if (GroupsSection.lastGroupVersion[GroupsSection.currentGroupId] !== currentVersion) {
                    GroupsSection.show(GroupsSection.currentGroupId);
                }
            } else {
                Toast.info('Lega eliminata', 'La lega non esiste più');
                this.showSection('home');
            }
        }

        // Refresh home section if visible
        if (this.currentSection === 'home') {
            HomeSection.renderGroups();
            HomeSection.renderTeamsPreview();
            Navigation.renderNavGroups();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
``

This completes the modular codebase. The structure now includes:

• config.js - Configuration constants
• utils.js - Utility functions
• db/ - Database modules (database.js, users.js, friends.js, groups.js, teams.js, notifications.js)
• ui/ - UI components (toast.js, modal.js, dropdowns.js, navigation.js)
• components/ - Reusable components (avatars.js, cards.js, forms.js)
• sections/ - Section handlers (auth.js, home.js, profile.js, friends.js, groups.js, teams.js)
• app.js - Main application controller
