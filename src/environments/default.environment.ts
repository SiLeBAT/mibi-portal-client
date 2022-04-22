import packageJson from '../../package.json';

export const environment = {
    production: false,
    appName: 'MiBi-Portal',
    supportContact: 'mibi-portal@bfr.bund.de',
    version: packageJson.version,
    lastChange: packageJson.mibiConfig.lastChange,
    sampleSheetURL: 'https://www.bfr.bund.de/cm/343/Einsendebogen-v15.xlsx'
};
