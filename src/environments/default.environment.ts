import packageJson from '../../package.json';

export interface Environment {
    production: boolean;
    appName: string;
    supportContact: string;
    version: string;
    lastChange: string;
    sampleSheetV17URL: string;
    sampleSheetV18URL: string;
    appId: string;

}

export const defaultEnvironment: Environment = {
    production: true,
    appName: 'MiBi-Portal',
    supportContact: 'mibi-portal@bfr.bund.de',
    version: packageJson.version,
    lastChange: packageJson.mibiConfig.lastChange,
    sampleSheetV17URL: 'https://www.bfr.bund.de/cm/343/Einsendebogen-v17.xlsx',
    sampleSheetV18URL: 'https://www.bfr.bund.de/assets/02_Service/01_Einsendeformulare/Untersuchungsauftrag-V18.xlsx',
    appId: 'app_blub'


};
