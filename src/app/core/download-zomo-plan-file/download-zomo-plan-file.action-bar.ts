import { ActionBarItem } from '../../main/action-bar/action-bar.model';
import { ZomoPlanFileInfo } from '../model/response.model';

/**
 * The action bar item offering the available ZoMo-plan files for download, and
 * the id this feature recognises. A page decides whether to offer the item; the
 * entries and the handling belong here, with the download itself.
 *
 * Each entry's id is the file's id, so the effect can act on it directly.
 */
export const downloadZomoPlanFileItemId = 'core/downloadZomoPlanFile';

export function downloadZomoPlanFileActionBarItem(
    zomoPlanFiles: ZomoPlanFileInfo[]
): ActionBarItem {
    return {
        kind: 'menu',
        id: downloadZomoPlanFileItemId,
        label: 'ZoMo-Plan',
        icon: 'assignment_returned',
        entries: zomoPlanFiles.map(file => ({
            entryId: file.id,
            label: `ZoMo-Plan ${file.year}`
        }))
    };
}
