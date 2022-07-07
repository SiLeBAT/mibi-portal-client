export const userPathsSegments = {
    users: 'users',
    login: 'login',
    register: 'register',
    recovery: 'recovery',
    profile: 'profile',
    privacyPolicy: 'datenschutzhinweise',
    reset: 'reset',
    activate: 'activate',
    adminActivate: 'adminActivate'
};

export const userPaths = {
    login: '/' + userPathsSegments.users + '/' + userPathsSegments.login,
    register: '/' + userPathsSegments.users + '/' + userPathsSegments.register,
    recovery: '/' + userPathsSegments.users + '/' + userPathsSegments.recovery,
    profile: '/' + userPathsSegments.users + '/' + userPathsSegments.profile,
    privacyPolicy: '/' + userPathsSegments.users + '/' + userPathsSegments.privacyPolicy,
    reset: '/' + userPathsSegments.users + '/' + userPathsSegments.reset,
    activate: '/' + userPathsSegments.users + '/' + userPathsSegments.activate,
    adminActivate: '/' + userPathsSegments.users + '/' + userPathsSegments.adminActivate
};

export const userPathsParams = {
    reset: {
        id: 'id'
    },
    activate: {
        id: 'id'
    },
    adminActivate: {
        id: 'id'
    }
};
