import packageJson from '../../package.json';

export interface Environment {
    production: boolean;
    appName: string;
    supportContact: string;
    version: string;
    lastChange: string;
    sampleSheetURL: string;
}

export const defaultEnvironment: Environment = {
    production: true,
    appName: 'MiBi-Portal ADV',
    supportContact: 'mibi-portal@bfr.bund.de',
    version: packageJson.version,
    lastChange: packageJson.mibiConfig.lastChange,
    sampleSheetURL: 'https://www.bfr.bund.de/cm/343/Einsendebogen-v16.xlsx'
};
