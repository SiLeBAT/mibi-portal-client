import { defaultEnvironment, Environment } from './default.environment';

export const environment: Environment = {
    ...defaultEnvironment,
    production: false,
    appName: defaultEnvironment.appName + '-QA',
    appId: 'MIBI_QA'
};
