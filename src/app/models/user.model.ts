import { IUser, IUserData } from './models';

export class User implements IUser {
    userData: IUserData[] = [];
    institution: any;
    _id: any;

    constructor(
        public email: string,
        public firstName?: string,
        public lastName?: string
    ) { }

    addUserDataEntry(userDataEntry: IUserData) {
        this.userData.push(userDataEntry);
    }
}
