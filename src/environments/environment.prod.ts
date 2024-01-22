import { Environment, defaultEnvironment } from './default.environment';

export const environment: Environment = {
    ...defaultEnvironment,
    production: true,
    appId: 'MIBI_1'
};
