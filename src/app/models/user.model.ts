import { UserData } from './userdata.model';

export class User {
  constructor(
    public email: string,
    public password: string,
    public firstName?: string,
    public lastName?: string,
    public _id?: string,
    public userData?: UserData[],
    public institution?: string
  ) {
    this.userData = [];
  }

  addUserDataEntry(userDataEntry: UserData) {
    this.userData.push(userDataEntry);
  }
}
