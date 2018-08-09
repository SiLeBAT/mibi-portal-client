import { UserData } from './userdata.model';

export class User {
    userData: UserData[] = [];
    institution: any;
    _id: any;

    constructor(
        public email: string,
        public password: string,
        public firstName?: string,
        public lastName?: string
    ) { }

    addUserDataEntry(userDataEntry: UserData) {
        this.userData.push(userDataEntry);
    }
}
