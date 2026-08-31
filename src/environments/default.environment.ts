import packageJson from '../../package.json';

export interface Environment {
    production: boolean;
    appName: string;
    supportContact: string;
    version: string;
    lastChange: string;
    sampleSheetURL: string;
    appId: string;
    cmsApiUrl: string;
}

export const defaultEnvironment: Environment = {
    production: true,
    appName: 'MiBi-Portal',
    supportContact: 'mibi-portal@bfr.bund.de',
    // Read from package.json at build time and compiled into the bundle, so a
    // running tab reports the release it was loaded from - not the one that is
    // deployed now. VersionCheckService relies on exactly that to detect a tab
    // left open across a release; bump it in package.json to cut a new client
    // version.
    version: packageJson.version,
    lastChange: packageJson.mibiConfig.lastChange,
    sampleSheetURL: 'https://www.bfr.bund.de/assets/02_Service/01_Einsendeformulare/Untersuchungsauftrag-V18.xlsx',
    appId: 'app_blub',
    cmsApiUrl: 'https://fg43-support.bfr.berlin/cms/api'
};
