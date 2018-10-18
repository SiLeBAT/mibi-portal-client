import { Institution } from './institution.model';

export interface IUserData {
    department: string;
    contact: string;
    phone: string;
    email: string;
    _id: any;
}
export interface IUser {
    email: string;
    firstName?: string;
    lastName?: string;
    userData: IUserData[];
    institution: Institution;
    _id: any;
}
export interface ITokenizedUser extends IUser {
    token: string;
}
export interface ICredentials {
    email: string;
    password: string;
}
export interface IUserDetails {
    firstName?: string;
    lastName?: string;
    userData: IUserData[];
    institution: Institution;
}

// TODO: Possibly remove
export class UserData implements IUserData {
    _id: string;
    department: string;
    contact: string;
    phone: string;
    email: string;

    constructor(
        department: string,
        contact: string,
        phone: string,
        email: string
    ) {
        this.department = department;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
    }

}

// TODO: Possibly remove.
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
