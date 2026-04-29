/**
 * FantaLega Classic - Dropdowns Management
 */
const Dropdowns = {
    openMenuId: null,
    navDropdownOpen: false,
    notificationDropdownOpen: false,
    /**
     * Initialize dropdown listeners
     */
    init() {
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-avatar-container') && 
                !e.target.closest('.notification-bell')) {
                this.closeNavDropdown();
                this.closeNotificationDropdown();
            }
            if (!e.target.closest('.friend-menu') && 
                !e.target.closest('.member-actions')) {
                this.closeAllMenus();
            }
        });
        // Nav avatar dropdown
        document.getElementById('nav-avatar')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNavDropdown();
        });
        // Notification bell
        document.getElementById('notification-bell')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationDropdown();
        });
        // Mark all read button
        document.getElementById('mark-all-read')?.addEventListener('click', () => {
            const user = UsersDB.getCurrentUser();
            if (user) {
                NotificationsDB.markAllRead(user.id);
                Navigation.renderNotifications();
                Navigation.updateNotificationBadge();
            }
        });
        // Nav dropdown items
        document.querySelectorAll('.nav-dropdown-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.closeNavDropdown();
                App.showSection(section);
            });
        });
        // Logout button
        document.getElementById('dropdown-logout')?.addEventListener('click', () => {
            this.closeNavDropdown();
            Modal.confirm(
                'Esci dall\'account',
                'Sei sicuro di voler uscire?',
                () => {
                    App.logout();
                }
            );
        });
    },
    /**
     * Toggle nav dropdown
     */
    toggleNavDropdown() {
        const dropdown = document.getElementById('nav-dropdown');
        this.navDropdownOpen = !this.navDropdownOpen;
        dropdown.classList.toggle('show', this.navDropdownOpen);
        if (this.navDropdownOpen) {
            this.closeNotificationDropdown();
            Navigation.updateNavDropdownInfo();
            Navigation.renderNavGroups();
        }
    },
    /**
     * Close nav dropdown
     */
    closeNavDropdown() {
        this.navDropdownOpen = false;
        document.getElementById('nav-dropdown')?.classList.remove('show');
    },
    /**
     * Toggle notification dropdown
     */
    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        this.notificationDropdownOpen = !this.notificationDropdownOpen;
        dropdown.classList.toggle('show', this.notificationDropdownOpen);
        if (this.notificationDropdownOpen) {
            this.closeNavDropdown();
            Navigation.renderNotifications();
        }
    },
    /**
     * Close notification dropdown
     */
    closeNotificationDropdown() {
        this.notificationDropdownOpen = false;
        document.getElementById('notification-dropdown')?.classList.remove('show');
    },
    /**
     * Toggle friend menu
     * @param {string} id
     */
    toggleFriendMenu(id) {
        event.stopPropagation();
        const menuId = `menu-${id}`;
        const menu = document.getElementById(menuId);
        if (this.openMenuId === menuId) {
            this.closeAllMenus();
        } else {
            this.closeAllMenus();
            this.openMenuId = menuId;
            if (menu) menu.classList.add('show');
        }
    },
    /**
     * Toggle member menu
     * @param {string} memberId
     */
    toggleMemberMenu(memberId) {
        event.stopPropagation();
        const menuId = `member-menu-${memberId}`;
        const menu = document.getElementById(menuId);
        if (this.openMenuId === menuId) {
            this.closeAllMenus();
        } else {
            this.closeAllMenus();
            this.openMenuId = menuId;
            if (menu) menu.classList.add('show');
        }
    },
    /**
     * Close all menus
     */
    closeAllMenus() {
        this.openMenuId = null;
        document.querySelectorAll('.friend-dropdown').forEach(m => m.classList.remove('show'));
    }
};
