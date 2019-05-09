import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { User } from '../../../user/model/user.model';

export enum SendSamplesFromStoreActionTypes {
    SendSamplesFromStore = '[Samples/SendSamplesFromStore] Send samples from store',
    SendSamplesFromStoreSuccess = '[Samples/SendSamplesFromStore] Samples sent successfully from store',
    SendSamplesFromStoreNoUser = '[Samples/SendSamplesFromStore] Failed to get current user',
    SendSamplesFromStoreFailure = '[Samples/SendSamplesFromStore] Sending samples from store failed'
}

export class SendSamplesFromStore implements CommandAction {
    readonly type = SendSamplesFromStoreActionTypes.SendSamplesFromStore;

    constructor(public source: string, public payload: {comment: string}) { }
}

export class SendSamplesFromStoreSuccess implements ResponseAction {
    readonly type = SendSamplesFromStoreActionTypes.SendSamplesFromStoreSuccess;
    readonly command = SendSamplesFromStoreActionTypes.SendSamplesFromStore;
}

export class SendSamplesFromStoreNoUser implements ResponseAction {
    readonly type = SendSamplesFromStoreActionTypes.SendSamplesFromStoreNoUser;
    readonly command = SendSamplesFromStoreActionTypes.SendSamplesFromStore;
}

export class SendSamplesFromStoreFailure implements ResponseAction {
    readonly type = SendSamplesFromStoreActionTypes.SendSamplesFromStoreFailure;
    readonly command = SendSamplesFromStoreActionTypes.SendSamplesFromStore;
}

export type SendSamplesFromStoreAction =
    SendSamplesFromStore
    | SendSamplesFromStoreSuccess
    | SendSamplesFromStoreNoUser
    | SendSamplesFromStoreFailure;
