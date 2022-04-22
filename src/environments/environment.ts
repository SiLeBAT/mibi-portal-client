// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.qa.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.
import { environment as defaultEnv } from './default.environment';

export const environment = {
    ...defaultEnv,
    production: false
};
