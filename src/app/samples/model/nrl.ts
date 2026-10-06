import { NRL } from './sample.enums';

/**
 * Maps an NRL name to the NRL enum. Accepts both the short id (e.g. "NRL-Salm")
 * and the long laboratory name (e.g. "NRL für Salmonella"), mirroring the
 * server's NRLId.mapNRLStringToEnum; anything else is NRL.UNKNOWN.
 */
export function toNrl(nrlString: string): NRL {
    switch (nrlString.trim()) {
        case 'Konsiliarlabor für Vibrionen':
        case 'KL-Vibrio':
            return NRL.KL_Vibrio;
        case 'NRL für Escherichia coli einschließl. verotoxinbildende E. coli':
        case 'NRL-VTEC':
            return NRL.NRL_VTEC;
        case 'Labor für Sporenbildner, Bacillus spp.':
        case 'L-Bacillus':
            return NRL.L_Bacillus;
        case 'Labor für Sporenbildner, Clostridium spp.':
        case 'L-Clostridium':
            return NRL.L_Clostridium;
        case 'NRL für koagulasepositive Staphylokokken einschl. Staphylococcus aureus':
        case 'NRL-Staph':
            return NRL.NRL_Staph;
        case 'NRL für Salmonella':
        case 'NRL-Salm':
            return NRL.NRL_Salm;
        case 'NRL für Listeria monocytogenes':
        case 'NRL-Listeria':
            return NRL.NRL_Listeria;
        case 'NRL für Campylobacter':
        case 'NRL-Campy':
            return NRL.NRL_Campy;
        case 'NRL für Antibiotikaresistenz':
        case 'NRL-AR':
            return NRL.NRL_AR;
        case 'NRL-AR-Kleb':
            return NRL.NRL_AR_Kleb;
        case 'Konsiliarlabor für Yersinia':
        case 'KL-Yersinia':
            return NRL.KL_Yersinia;
        case 'Labor nicht erkannt':
        default:
            return NRL.UNKNOWN;
    }
}
