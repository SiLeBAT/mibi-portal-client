// This file will be replaced by environment.*.ts specified by the build (see 'angular.json').

import { defaultEnvironment, Environment } from './default.environment';

export const environment: Environment = {
    ...defaultEnvironment,
    production: false,
    appName: defaultEnvironment.appName + '-Dev'
};
