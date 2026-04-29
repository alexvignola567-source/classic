/**
 * FantaLega Classic - Configuration
 */
const CONFIG = {
    APP_NAME: 'FantaLega Classic',
    APP_VERSION: '1.0.0',
    SEASON: '2025/2026',
    
    // Storage keys
    STORAGE_KEYS: {
        USERS: 'users',
        GROUPS: 'groups',
        TEAMS: 'teams',
        NOTIFICATIONS: 'notifications',
        CURRENT_USER: 'currentUser'
    },
    
    // Validation
    VALIDATION: {
        USER_ID_LENGTH: 6,
        GROUP_CODE_LENGTH: 6,
        MIN_PASSWORD_LENGTH: 6,
        MAX_NAME_LENGTH: 50,
        MAX_DESCRIPTION_LENGTH: 200,
        MAX_BIO_LENGTH: 300,
        MAX_TEAM_NAME_LENGTH: 40,
        MAX_TEAM_ABBR_LENGTH: 4,
        MAX_IMAGE_SIZE: 2 * 1024 * 1024 // 2MB
    },
    
    // League settings
    LEAGUE: {
        DEFAULT_MAX_MEMBERS: 10,
        VISIBILITY: {
            INVITE: 'invite',
            CODE: 'code'
        },
        INVITE_PERMISSION: {
            ALL: 'all',
            ADMIN: 'admin'
        },
        MEMBER_OPTIONS: [8, 10, 12, 14, 16, 20, 0] // 0 = unlimited
    },
    
    // Team settings
    TEAM: {
        DEFAULT_PRIMARY_COLOR: '#1a5f2a',
        DEFAULT_SECONDARY_COLOR: '#c9a227'
    },
    
    // Polling interval (ms)
    POLLING_INTERVAL: 1000,
    
    // Toast duration (ms)
    TOAST_DURATION: 4000
};
// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.VALIDATION);
Object.freeze(CONFIG.LEAGUE);
Object.freeze(CONFIG.LEAGUE.VISIBILITY);
Object.freeze(CONFIG.LEAGUE.INVITE_PERMISSION);
Object.freeze(CONFIG.TEAM);
