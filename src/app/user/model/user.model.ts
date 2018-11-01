import { Institution } from './institution.model';

export interface UserData {
    department: string;
    contact: string;
    phone: string;
    email: string;
    _id: any;
}
export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    userData: UserData[];
    institution: Institution;
    _id: any;
}
export interface TokenizedUser extends User {
    token: string;
}
export interface Credentials {
    email: string;
    password: string;
}
export interface UserDetails {
    firstName?: string;
    lastName?: string;
    userData: UserData[];
    institution: Institution;
}

// TODO: Possibly remove
export class DefaultUserData implements UserData {
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

export class DefaultUser implements User {
    userData: UserData[] = [];
    institution: any;
    _id: any;

    constructor(
        public email: string,
        public firstName: string = '',
        public lastName: string = ''
    ) { }

    addUserDataEntry(userDataEntry: UserData) {
        this.userData.push(userDataEntry);
    }
}
