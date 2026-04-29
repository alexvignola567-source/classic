/**
 * FantaLega Classic - Avatar Components
 */
const Avatars = {
    /**
     * Render user avatar
     * @param {Object} user
     * @param {string} size - 'sm', 'md', 'lg'
     * @returns {string}
     */
    renderUser(user, size = 'md') {
        if (!user) return '';
        
        const sizes = {
            sm: { width: 26, fontSize: 0.5625 },
            md: { width: 44, fontSize: 0.9375 },
            lg: { width: 72, fontSize: 1.75 }
        };
        
        const s = sizes[size] || sizes.md;
        
        if (user.avatar) {
            return `<img src="${user.avatar}" alt="${Utils.escapeHtml(user.name)}">`;
        }
        
        return Utils.getInitials(user.name);
    },
    /**
     * Render team badge
     * @param {Object} team
     * @param {string} size
     * @returns {string}
     */
    renderTeam(team, size = 'md') {
        if (!team) return '';
        
        if (team.badge) {
            return `<img src="${team.badge}" alt="${Utils.escapeHtml(team.name)}">`;
        }
        
        return team.abbreviation || Utils.getInitials(team.name);
    },
    /**
     * Render group avatar
     * @param {Object} group
     * @returns {string}
     */
    renderGroup(group) {
        if (!group) return '';
        
        if (group.avatar) {
            return `<img src="${group.avatar}" alt="${Utils.escapeHtml(group.name)}">`;
        }
        
        return Utils.getInitials(group.name);
    }
};
